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

  const [
    totalUsers,
    verifiedUsers,
    completedSwaps,
    payments,
    usersByProvince,
    swapsByStatus,
    successfulPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.swapRequest.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    prisma.user.groupBy({ by: ["currentProvince"], _count: true }),
    prisma.swapRequest.groupBy({ by: ["status"], _count: true }),
    // Raw rows (not just the aggregate) so we can bucket revenue by month
    // in JS below — avoids a DB-specific date_trunc/strftime query.
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      select: { amount: true, createdAt: true },
    }),
  ]);

  // Last 6 calendar months (oldest first), zero-filled so a quiet month
  // still shows up as 0 rather than disappearing from the chart.
  const now = new Date();
  const months: { key: string; label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
    });
  }
  for (const p of successfulPayments as { amount: number; createdAt: Date }[]) {
    const key = `${p.createdAt.getFullYear()}-${p.createdAt.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.revenue += p.amount;
  }

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
    swapsByStatus: swapsByStatus.map((s: { status: string; _count: number }) => ({
      status: s.status,
      count: s._count,
    })),
    revenueByMonth: months.map(({ label, revenue }) => ({ month: label, revenue })),
  });
}
