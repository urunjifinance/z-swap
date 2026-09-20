import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { collectMobileMoney, REGISTRATION_FEE_ZMW } from "@/lib/lipila";

// The amount is NOT accepted from the browser.
const paySchema = z.object({
  method: z.enum(["AIRTEL_MONEY", "MTN_MONEY", "ZAMTEL_MONEY"]),
  phone: z.string().regex(/^0\d{9}$/, "Enter a valid mobile money number"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  try {
    const data = paySchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { registrationFeePaid: true },
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.registrationFeePaid) return NextResponse.json({ error: "Already paid" }, { status: 409 });

    // Avoid double-charging: reuse a pending payment from the last 3 minutes
    const recent = await prisma.payment.findFirst({
      where: {
        userId,
        status: "PENDING",
        swapRequestId: null,
        createdAt: { gt: new Date(Date.now() - 3 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent) return NextResponse.json({ txnId: recent.txnId, status: "PENDING" }, { status: 202 });

    const txnId = "ZSW-" + nanoid(8).toUpperCase();
    await prisma.payment.create({
      data: { userId, amount: REGISTRATION_FEE_ZMW, method: data.method, status: "PENDING", txnId },
    });

    const res = await collectMobileMoney({
      referenceId: txnId,
      amount: REGISTRATION_FEE_ZMW,
      accountNumber: "260" + data.phone.slice(1),
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/webhook`,
    });

    if (!res.ok) {
      console.error("Lipila collect failed:", res.status, JSON.stringify(res.body));
      await prisma.payment.update({ where: { txnId }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ txnId, status: "PENDING" }, { status: 202 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
