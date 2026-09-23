import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/promo-status/[code] — public, read-only stats for one promoter.
// No login required; the code itself is the access key. Returns only
// non-sensitive fields (name, code, paid/total referral counts) — never
// phone, payout rate, or any other promoter's data.
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  const promoter = await prisma.promoter.findUnique({ where: { code } });
  if (!promoter) {
    return NextResponse.json({ error: "No promoter found with this code." }, { status: 404 });
  }

  const referralCounts = await prisma.user.groupBy({
    by: ["registrationFeePaid"],
    where: { referredByCode: code },
    _count: true,
  });

  const paidReferrals = referralCounts.find((r: any) => r.registrationFeePaid === true)?._count ?? 0;
  const totalReferrals = referralCounts.reduce((sum: number, r: any) => sum + r._count, 0);

  return NextResponse.json({
    name: promoter.name,
    code: promoter.code,
    status: promoter.status,
    paidReferrals,
    totalReferrals,
  });
}
