import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — aggregate figures for the admin analytics tab.
// Restricted to users with role ADMIN.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, verifiedUsers, completedSwaps, payments, usersByProvince] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.swapRequest.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    prisma.user.groupBy({ by: ["currentProvince"], _count: true }),
  ]);

  return NextResponse.json({
    totalUsers,
    verifiedUsers,
    completedSwaps,
    totalRevenue: payments._sum.amount ?? 0,
    totalPayments: payments._count,
    usersByProvince: usersByProvince.map((p: { currentProvince: string; _count: number }) => ({
      province: p.currentProvince,
      count: p._count,
    })),
  });
}
