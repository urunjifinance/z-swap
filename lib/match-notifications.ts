import { prisma } from "@/lib/prisma";
import { findMatchesFor } from "@/lib/matching-engine";
import { dbUserToSampleUser } from "@/lib/user-mapper";
import { sendEmail, emailLayout, escapeHtml, appUrl } from "@/lib/email";

// Called when a user becomes VERIFIED — the moment new matches appear.
// Tells both sides by email and in-app notification. Emails never include
// the other person's name, phone or station: users log in to see details.
export async function notifyNewMatchesForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.verificationStatus !== "VERIFIED") return;

  const others = await prisma.user.findMany({
    where: { id: { not: user.id }, verificationStatus: "VERIFIED" },
  });
  const matches = findMatchesFor(dbUserToSampleUser(user), others.map(dbUserToSampleUser));
  if (matches.length === 0) return;

  const byId = new Map(others.map((o) => [o.id, o]));
  const matchedUsers = matches.map((m) => byId.get(m.id)!).filter(Boolean);
  const link = appUrl("/matches");
  const first = (name: string) => escapeHtml(name.trim().split(/\s+/)[0] || "there");

  // In-app notifications for everyone involved
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "match",
        title: matches.length === 1 ? "You have a swap match" : `You have ${matches.length} swap matches`,
        body: "Colleagues whose details fit your swap preferences are on Z-Swap. Open Matches to view them.",
      },
      ...matchedUsers.map((m) => ({
        userId: m.id,
        type: "match",
        title: "New swap match",
        body: `A new colleague in ${user.currentDistrict}, ${user.currentProvince} matches your swap preferences.`,
      })),
    ],
  });

  const emails: Promise<unknown>[] = [];

  // 1) The newly verified user: one summary email
  const count = matches.length;
  emails.push(
    sendEmail({
      to: user.email,
      subject: count === 1 ? "You have a swap match on Z-Swap" : `You have ${count} swap matches on Z-Swap`,
      text: `Hi ${user.fullName.split(" ")[0]},\n\nYour Z-Swap account is verified and we found ${count} colleague${count === 1 ? "" : "s"} whose details fit your swap preferences.\n\nLog in to view your matches: ${link}\n\nNever pay an incentive to another user before your swap is officially confirmed on Z-Swap.\n\nZ-Swap`,
      html: emailLayout(
        count === 1 ? "You have a swap match" : `You have ${count} swap matches`,
        `<p style="line-height:1.6">Hi ${first(user.fullName)},</p>
<p style="line-height:1.6">Your Z-Swap account is verified and we found <strong>${count} colleague${count === 1 ? "" : "s"}</strong> whose details fit your swap preferences.</p>
<p style="line-height:1.6">Log in to see who they are and start a conversation.</p>`,
        { label: "View my matches", href: link }
      ),
    })
  );

  // 2) Each existing user who matches: a "new match" email
  for (const m of matchedUsers) {
    const where = `${escapeHtml(user.currentDistrict)}, ${escapeHtml(user.currentProvince)}`;
    emails.push(
      sendEmail({
        to: m.email,
        subject: "New swap match on Z-Swap",
        text: `Hi ${m.fullName.split(" ")[0]},\n\nGood news: a colleague currently in ${user.currentDistrict}, ${user.currentProvince} has just joined Z-Swap and matches your swap preferences.\n\nLog in to view the match: ${link}\n\nNever pay an incentive to another user before your swap is officially confirmed on Z-Swap.\n\nZ-Swap`,
        html: emailLayout(
          "You have a new swap match",
          `<p style="line-height:1.6">Hi ${first(m.fullName)},</p>
<p style="line-height:1.6">Good news: a colleague currently in <strong>${where}</strong> has just joined Z-Swap and matches your swap preferences.</p>
<p style="line-height:1.6">Log in to see their details and start a conversation.</p>`,
          { label: "View the match", href: link }
        ),
      })
    );
  }

  const results = await Promise.allSettled(emails);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) console.error(`[match-notify] ${failed.length}/${results.length} emails failed`, failed.map((f: any) => String(f.reason)));
}
