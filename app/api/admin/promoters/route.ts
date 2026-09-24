import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REQUEST_FEE_ZMW } from "@/lib/data/sample-users";

const createPromoterSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only"),
  payoutRate: z.number().min(0).max(100).default(0), // % of the registration fee, not a flat ZMW amount
});

// GET /api/admin/promoters — list all promoters with referral stats.
// Restricted to users with role ADMIN.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [promoters, referralCounts] = await Promise.all([
    prisma.promoter.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.groupBy({
      by: ["referredByCode", "registrationFeePaid"],
      where: { referredByCode: { not: null } },
      _count: true,
    }),
  ]);

  const withStats = promoters.map((p: { code: string; payoutRate: number; [key: string]: any }) => {
    const paid = referralCounts.find(
      (r: any) => r.referredByCode === p.code && r.registrationFeePaid === true
    )?._count ?? 0;
    const total = referralCounts
      .filter((r: any) => r.referredByCode === p.code)
      .reduce((sum: number, r: any) => sum + r._count, 0);
    // Amount per referral is derived live from the current fee — never stored,
    // so it stays correct automatically if the fee changes later.
    const amountPerReferral = Math.round((p.payoutRate / 100) * REQUEST_FEE_ZMW * 100) / 100;
    return {
      ...p,
      paidReferrals: paid,
      totalReferrals: total,
      amountPerReferral,
      amountOwed: Math.round(amountPerReferral * paid * 100) / 100,
    };
  });

  return NextResponse.json(withStats);
}

// POST /api/admin/promoters — create a new promoter code.
// Restricted to users with role ADMIN.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = createPromoterSchema.parse(await req.json());

    const existing = await prisma.promoter.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json({ error: "This code is already in use." }, { status: 409 });
    }

    const promoter = await prisma.promoter.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        code: data.code,
        payoutRate: data.payoutRate,
      },
    });

    return NextResponse.json(promoter, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create promoter" }, { status: 500 });
  }
}
