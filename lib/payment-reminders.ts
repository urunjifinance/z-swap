import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout, escapeHtml, appUrl } from "@/lib/email";
import { REGISTRATION_FEE_ZMW } from "@/lib/lipila";

// Two reminders for a registered-but-unpaid user: a gentle nudge at 24h,
// and a final one at day 4. After that we stop — more than two tends to
// just annoy people rather than convert them.
const REMINDER_1_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const REMINDER_2_AFTER_MS = 4 * 24 * 60 * 60 * 1000; // 4 days

const payLink = () => appUrl("/payment");
const first = (name: string) => escapeHtml(name.trim().split(/\s+/)[0] || "there");

// Finds unpaid users past each threshold who haven't already had that
// reminder sent, emails them, and stamps paymentReminder{1,2}SentAt so a
// re-run (the cron fires hourly) never double-sends. Returns counts for
// logging/observability — callers decide what, if anything, to do with them.
export async function sendDuePaymentReminders() {
  const now = Date.now();
  const sent = { reminder1: 0, reminder2: 0, failed: 0 };

  const dueForFirst = await prisma.user.findMany({
    where: {
      registrationFeePaid: false,
      paymentReminder1SentAt: null,
      createdAt: { lte: new Date(now - REMINDER_1_AFTER_MS) },
    },
    select: { id: true, fullName: true, email: true },
  });

  const dueForSecond = await prisma.user.findMany({
    where: {
      registrationFeePaid: false,
      paymentReminder1SentAt: { not: null },
      paymentReminder2SentAt: null,
      createdAt: { lte: new Date(now - REMINDER_2_AFTER_MS) },
    },
    select: { id: true, fullName: true, email: true },
  });

  const link = payLink();

  for (const u of dueForFirst) {
    try {
      await sendEmail({
        to: u.email,
        subject: "Finish setting up your Z-Swap account",
        text: `Hi ${u.fullName.split(" ")[0]},\n\nYou're almost there! You registered on Z-Swap but haven't completed the one-time registration fee (K${REGISTRATION_FEE_ZMW}) yet — it's what unlocks matching with other teachers and civil servants looking to swap.\n\nFinish up here: ${link}\n\nZ-Swap`,
        html: emailLayout(
          "You're almost there",
          `<p style="line-height:1.6">Hi ${first(u.fullName)},</p>
<p style="line-height:1.6">You registered on Z-Swap but haven't completed the one-time registration fee (K${REGISTRATION_FEE_ZMW}) yet — it's what unlocks matching with other teachers and civil servants looking to swap postings.</p>
<p style="line-height:1.6">It only takes a minute to finish up.</p>`,
          { label: "Complete my registration", href: link }
        ),
      });
      await prisma.user.update({ where: { id: u.id }, data: { paymentReminder1SentAt: new Date() } });
      sent.reminder1++;
    } catch (e) {
      console.error(`[payment-reminders] reminder1 failed for user ${u.id}:`, e);
      sent.failed++;
    }
  }

  for (const u of dueForSecond) {
    try {
      await sendEmail({
        to: u.email,
        subject: "Last reminder: your Z-Swap registration is still pending",
        text: `Hi ${u.fullName.split(" ")[0]},\n\nThis is a final reminder that your Z-Swap registration fee (K${REGISTRATION_FEE_ZMW}) is still pending. Without it, we can't match you with other teachers and civil servants looking to swap.\n\nFinish up here: ${link}\n\nIf you've changed your mind, no action is needed — this is the last reminder you'll get.\n\nZ-Swap`,
        html: emailLayout(
          "Last reminder",
          `<p style="line-height:1.6">Hi ${first(u.fullName)},</p>
<p style="line-height:1.6">This is a final reminder that your Z-Swap registration fee (K${REGISTRATION_FEE_ZMW}) is still pending. Without it, we can't match you with other teachers and civil servants looking to swap postings.</p>
<p style="line-height:1.6">If you've changed your mind, no action is needed — this is the last reminder you'll get.</p>`,
          { label: "Complete my registration", href: link }
        ),
      });
      await prisma.user.update({ where: { id: u.id }, data: { paymentReminder2SentAt: new Date() } });
      sent.reminder2++;
    } catch (e) {
      console.error(`[payment-reminders] reminder2 failed for user ${u.id}:`, e);
      sent.failed++;
    }
  }

  return sent;
}
