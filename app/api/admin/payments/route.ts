import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments — reconciled (SUCCESS) payments + total revenue,
// for the admin Payments & Revenue tab. Restricted to ADMIN.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [payments, revenue] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      select: {
        id: true,
        txnId: true,
        amount: true,
        method: true,
        createdAt: true,
        user: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({ payments, totalRevenue: revenue._sum.amount ?? 0 });
}
