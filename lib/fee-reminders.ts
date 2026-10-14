import { prisma } from "@/lib/prisma";
import { findMatchesFor } from "@/lib/matching-engine";
import { dbUserToSampleUser } from "@/lib/user-mapper";
import { sendEmail, emailLayout, escapeHtml, appUrl } from "@/lib/email";
import { REGISTRATION_FEE_ZMW } from "@/lib/lipila";

// Registration-fee reminders for users who signed up but haven't paid.
//
// Schedule (max 3 reminders, then we stop for good):
//   #1  at least 1 day after registering
//   #2  at least 2 days after reminder #1   (≈ day 3)
//   #3  at least 4 days after reminder #2   (≈ day 7, marked as the last one)
//
// Sent reminders are recorded as Notification rows (type "fee_reminder"),
// so no database change is needed and the user also sees them in-app.

const DAY = 24 * 60 * 60 * 1000;
const MAX_REMINDERS = 3;
const GAP_BEFORE: number[] = [1 * DAY, 2 * DAY, 4 * DAY]; // wait before reminder #1, #2, #3
// Keep well under Brevo's free 300 emails/day so match emails still go out.
const MAX_PER_RUN = 100;

export async function sendFeeReminders(now = new Date()) {
  const unpaid = await prisma.user.findMany({
    where: {
      role: "WORKER",
      registrationFeePaid: false,
      verificationStatus: { not: "REJECTED" },
    },
    orderBy: { createdAt: "asc" },
  });

  const reminders = await prisma.notification.findMany({
    where: { type: "fee_reminder", userId: { in: unpaid.map((u: (typeof unpaid)[number]) => u.id) } },
    select: { userId: true, createdAt: true },
  });
  const history = new Map<string, { count: number; last: Date }>();
  for (const r of reminders) {
    const h = history.get(r.userId);
    if (!h) history.set(r.userId, { count: 1, last: r.createdAt });
    else {
      h.count++;
      if (r.createdAt > h.last) h.last = r.createdAt;
    }
  }

  // Who is due today?
  const due = unpaid.filter((u: (typeof unpaid)[number]) => {
    const h = history.get(u.id);
    const count = h?.count ?? 0;
    if (count >= MAX_REMINDERS) return false;
    const since = h ? h.last : u.createdAt;
    // 2h slack: Vercel runs daily crons at a slightly different minute each day.
    return now.getTime() - since.getTime() >= GAP_BEFORE[count] - 2 * 60 * 60 * 1000;
  });
  const batch = due.slice(0, MAX_PER_RUN);
  if (batch.length === 0) return { due: 0, sent: 0, failed: 0 };

  // Matches are the strongest reason to pay, so mention how many are waiting.
  const verified = await prisma.user.findMany({ where: { verificationStatus: "VERIFIED", registrationFeePaid: true } });
  const pool = verified.map(dbUserToSampleUser);

  const link = appUrl("/payment?context=registration");
  let sent = 0;
  let failed = 0;

  for (const u of batch) {
    const number = (history.get(u.id)?.count ?? 0) + 1;
    const isLast = number === MAX_REMINDERS;
    const matchCount = findMatchesFor(dbUserToSampleUser(u), pool).length;
    const first = u.fullName.trim().split(/\s+/)[0] || "there";

    const matchLine =
      matchCount > 0
        ? `${matchCount} colleague${matchCount === 1 ? " is" : "s are"} already on Z-Swap whose details fit your swap preferences.`
        : "New colleagues join Z-Swap every day, and we'll email you as soon as someone matches your swap preferences.";

    const subject = isLast
      ? "Last reminder: complete your Z-Swap registration"
      : matchCount > 0
        ? `${matchCount} possible swap match${matchCount === 1 ? "" : "es"} waiting for you on Z-Swap`
        : "Complete your Z-Swap registration";

    const lastNote = isLast ? "This is our last reminder. After this we won't email you about the registration fee again." : "";

    try {
      await sendEmail({
        to: u.email,
        subject,
        text:
          `Hi ${first},\n\nYou started registering on Z-Swap but your K${REGISTRATION_FEE_ZMW} registration fee hasn't been paid yet, so your profile isn't active.\n\n` +
          `${matchLine}\n\nPay with Airtel Money, MTN or Zamtel to activate your account: ${link}\n\n` +
          (lastNote ? lastNote + "\n\n" : "") +
          `Need help? Reply to this email or write to support@z-swap.com.\n\nZ-Swap`,
        html: emailLayout(
          isLast ? "Last reminder: activate your account" : "Your Z-Swap account is almost ready",
          `<p style="line-height:1.6">Hi ${escapeHtml(first)},</p>
<p style="line-height:1.6">You started registering on Z-Swap, but your <strong>K${REGISTRATION_FEE_ZMW} registration fee</strong> hasn't been paid yet, so your profile isn't active and colleagues can't find you.</p>
<p style="line-height:1.6">${matchCount > 0 ? `<strong>${escapeHtml(matchLine)}</strong>` : escapeHtml(matchLine)}</p>
<p style="line-height:1.6">You can pay with Airtel Money, MTN or Zamtel in under a minute.</p>
${lastNote ? `<p style="line-height:1.6;color:#6b7280">${escapeHtml(lastNote)}</p>` : ""}`,
          { label: `Pay K${REGISTRATION_FEE_ZMW} and activate`, href: link }
        ),
      });
      await prisma.notification.create({
        data: {
          userId: u.id,
          type: "fee_reminder",
          title: "Registration fee pending",
          body: `Reminder ${number} of ${MAX_REMINDERS}: pay the K${REGISTRATION_FEE_ZMW} registration fee to activate your account.`,
        },
      });
      sent++;
    } catch (e) {
      failed++;
      console.error(`[fee-reminders] failed for user ${u.id}`, String(e));
    }
  }

  console.log(`[fee-reminders] due=${due.length} sent=${sent} failed=${failed} (cap ${MAX_PER_RUN}/run)`);
  return { due: due.length, sent, failed };
}
