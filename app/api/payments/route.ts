import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const paySchema = z.object({
  // Omit swapRequestId entirely for a registration-fee payment (paid right
  // after signup, before admin verification). Include it only for the
  // legacy per-swap-request fee flow.
  swapRequestId: z.string().optional(),
  method: z.enum(["AIRTEL_MONEY", "MTN_MONEY", "ZAMTEL_MONEY", "CARD", "BANK_TRANSFER"]),
  amount: z.number().default(150),
});

function generateTxnId() {
  return "ZSW-" + nanoid(6).toUpperCase() + "-" + Date.now().toString().slice(-5);
}

// POST /api/payments — charges either:
//   (a) the non-refundable registration fee, right after signup and before
//       admin verification (no swapRequestId in the request body), or
//   (b) the legacy per-swap-request fee (swapRequestId included) — kept for
//       backward compatibility, though the registration-fee flow is now the
//       primary path.
//
// PRODUCTION INTEGRATION NOTES:
// Replace the mock `simulateCharge` block below with a real call to your
// payment gateway's charge endpoint, e.g.:
//   Flutterwave: POST https://api.flutterwave.com/v3/charges?type=mobile_money_zambia
//   Paystack:    POST https://api.paystack.co/charge
//   DPO:         POST https://secure.3gdirectpay.com/API/v6/
// Store the gateway's own reference alongside our internal txnId, and verify
// the charge via the gateway's webhook/verify endpoint before marking the
// Payment row SUCCESS — never trust the client-side response alone.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = paySchema.parse(await req.json());
    const userId = (session.user as any).id;

    // --- REGISTRATION FEE (no swapRequestId) ---
    // Paid immediately after signup, before admin verification. Marks the
    // account as fee-paid; verification is a separate, independent gate.
    if (!data.swapRequestId) {
      const txnId = generateTxnId();

      const simulateCharge = async () => ({ success: true });
      const result = await simulateCharge();

      const payment = await prisma.payment.create({
        data: {
          userId,
          amount: data.amount,
          method: data.method,
          status: result.success ? "SUCCESS" : "FAILED",
          txnId,
        },
      });

      if (result.success) {
        await prisma.user.update({ where: { id: userId }, data: { registrationFeePaid: true } });
      }

      return NextResponse.json(payment, { status: 201 });
    }

    // --- LEGACY: per-swap-request fee ---
    const swapRequest = await prisma.swapRequest.findUnique({ where: { id: data.swapRequestId } });
    if (!swapRequest || swapRequest.userId !== userId) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    const txnId = generateTxnId();

    // --- mock gateway charge (replace in production) ---
    const simulateCharge = async () => ({ success: true });
    const result = await simulateCharge();
    // -----------------------------------------------------

    const payment = await prisma.payment.create({
      data: {
        userId,
        swapRequestId: data.swapRequestId,
        amount: data.amount,
        method: data.method,
        status: result.success ? "SUCCESS" : "FAILED",
        txnId,
      },
    });

    if (result.success) {
      await prisma.swapRequest.update({
        where: { id: data.swapRequestId },
        data: { status: "PENDING" }, // becomes visible to the matching engine
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
