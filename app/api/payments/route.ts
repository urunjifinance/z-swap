import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const paySchema = z.object({
  swapRequestId: z.string(),
  method: z.enum(["AIRTEL_MONEY", "MTN_MONEY", "ZAMTEL_MONEY", "CARD", "BANK_TRANSFER"]),
  amount: z.number().default(150),
});

function generateTxnId() {
  return "ZSW-" + nanoid(6).toUpperCase() + "-" + Date.now().toString().slice(-5);
}

// POST /api/payments — charges the non-refundable request fee for a swap
// request.
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

    const swapRequest = await prisma.swapRequest.findUnique({ where: { id: data.swapRequestId } });
    if (!swapRequest || swapRequest.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    const txnId = generateTxnId();

    // --- mock gateway charge (replace in production) ---
    const simulateCharge = async () => ({ success: true });
    const result = await simulateCharge();
    // -----------------------------------------------------

    const payment = await prisma.payment.create({
      data: {
        userId: (session.user as any).id,
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
