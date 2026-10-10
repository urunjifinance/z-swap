import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/promo-status/[code] — public, read-only stats for one promoter.
// No login required; the code itself is the access key. Returns only
// non-sensitive fields (name, code, paid/total referral counts, and a
// trimmed-down referral list) — never phone, NRC, address, payout rate,
// or any other promoter's data. The referral list is deliberately kept to
// first name + last initial, signup date, and verification/payment status
// so a promoter can recognize who came through them without this
// unauthenticated URL leaking anyone's full personal details.
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

  const referralUsers = await prisma.user.findMany({
    where: { referredByCode: code },
    select: {
      fullName: true,
      createdAt: true,
      verificationStatus: true,
      registrationFeePaid: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const referrals = referralUsers.map((u: { fullName: string; createdAt: Date; verificationStatus: string; registrationFeePaid: boolean }) => ({
    displayName: toFirstNameLastInitial(u.fullName),
    signedUpAt: u.createdAt,
    verificationStatus: u.verificationStatus,
    paid: u.registrationFeePaid,
  }));

  return NextResponse.json({
    name: promoter.name,
    code: promoter.code,
    status: promoter.status,
    paidReferrals,
    totalReferrals,
    referrals,
  });
}

// "Chipo Mwansa Banda" -> "Chipo M.B." — keeps a promoter's referral list
// recognizable without exposing a referred user's full name on a public,
// unauthenticated link.
function toFirstNameLastInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Unnamed";
  if (parts.length === 1) return parts[0];
  const [first, ...rest] = parts;
  const initials = rest.map((p) => `${p[0].toUpperCase()}.`).join("");
  return `${first} ${initials}`;
}
