import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updatePromoterSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  payoutRate: z.number().min(0).max(100).optional(), // % of the registration fee
}).refine((data) => data.status !== undefined || data.payoutRate !== undefined, {
  message: "Provide at least one field to update.",
});

// PATCH /api/admin/promoters/[id] — update a promoter's status and/or payout rate.
// Restricted to users with role ADMIN.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = updatePromoterSchema.parse(await req.json());

    const promoter = await prisma.promoter.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(promoter);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update promoter" }, { status: 500 });
  }
}
