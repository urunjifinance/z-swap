import { prisma } from "@/lib/prisma";
import { getTransaction } from "@/lib/lipila";
import { sendEmail, emailLayout, escapeHtml, appUrl } from "@/lib/email";

export async function finalizePayment(txnId: string) {
  const payment = await prisma.payment.findUnique({ where: { txnId } });
  if (!payment || payment.status !== "PENDING") return payment;

  const { ok, body } = await getTransaction(txnId);
  if (!ok) return payment;

  // Temporary: shows Lipila's real reply in the Vercel logs during testing
  console.log("Lipila status response:", JSON.stringify(body));

  const state = String(body?.status ?? "").toLowerCase();

  if (state === "successful" || state === "success") {
    const paid = Number(body?.amount);
    if (Number.isFinite(paid) && paid < payment.amount) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
      return prisma.payment.findUnique({ where: { txnId } });
    }

    const done = await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCESS" },
    });

    if (done.count === 1) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { registrationFeePaid: true },
      });
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: "payment",
          title: "Payment received",
          body: "Your registration fee was received. Your account is now pending admin verification.",
        },
      });
      // Email the receipt link. A failed email must never undo a confirmed payment.
      await sendReceiptEmail(payment.userId, payment.txnId, payment.amount).catch((e) =>
        console.error("receipt email failed", e)
      );
    }
  } else if (["failed", "cancelled", "canceled", "rejected", "declined"].includes(state)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return prisma.payment.findUnique({ where: { txnId } });
}

async function sendReceiptEmail(userId: string, txnId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true } });
  if (!user?.email) return;
  const first = escapeHtml(user.fullName.trim().split(/\s+/)[0] || "there");
  const link = appUrl(`/receipt/${encodeURIComponent(txnId)}`);
  const kwacha = `ZMW ${amount.toFixed(2)}`;
  await sendEmail({
    to: user.email,
    subject: `Payment received: Z-Swap receipt ${txnId}`,
    html: emailLayout(
      "Payment received",
      `<p style="margin:0 0 12px;line-height:1.6">Hi ${first}, we received your Z-Swap registration fee of <b>${kwacha}</b>.</p>
<p style="margin:0 0 12px;line-height:1.6">Receipt number: <b>${escapeHtml(txnId)}</b></p>
<p style="margin:0;line-height:1.6">Your account is now pending admin verification. You can view or download your receipt any time from your dashboard.</p>`,
      { label: "View receipt", href: link }
    ),
    text: `Hi ${user.fullName.split(" ")[0]}, we received your Z-Swap registration fee of ${kwacha}. Receipt number: ${txnId}. View or download your receipt: ${link}`,
  });
}
