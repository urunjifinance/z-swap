import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  currentStation: z.string(),
  currentDistrict: z.string(),
  currentProvince: z.string(),
  desiredStation: z.string().optional(),
  desiredDistrict: z.string(),
  desiredProvince: z.string(),
  ministry: z.string(),
  cadre: z.string(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  reason: z.string(),
  incentivePreference: z.enum(["WANT", "OFFER", "NONE", "NEGOTIATE"]),
  incentiveAmount: z.number().optional(),
  incentiveTerms: z.string().optional(),
});

// GET /api/swap-requests — returns the logged-in worker's own swap requests.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.swapRequest.findMany({
    where: { userId: (session.user as any).id },
    include: { payment: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

// POST /api/swap-requests — creates a new swap request. The request is only
// visible to the matching engine / other users once its linked Payment
// (the non-refundable request fee) is confirmed SUCCESS — see /api/payments.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.registrationFeePaid) {
    return NextResponse.json({ error: "Your registration fee must be paid first." }, { status: 403 });
  }
  if (user.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "Your profile must be verified before posting a swap request." }, { status: 403 });
  }

  try {
    const data = createSchema.parse(await req.json());
    const request = await prisma.swapRequest.create({
      data: { ...data, userId: user.id },
    });
    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not create swap request" }, { status: 500 });
  }
}
