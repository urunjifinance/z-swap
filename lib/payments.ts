import { prisma } from "@/lib/prisma";
import { getTransaction } from "@/lib/lipila";

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
    }
  } else if (["failed", "cancelled", "canceled", "rejected", "declined"].includes(state)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return prisma.payment.findUnique({ where: { txnId } });
}
