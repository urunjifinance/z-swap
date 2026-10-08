import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isBlobUrl } from "@/lib/photo";
import { yearsSince } from "@/lib/service-years";

  const registerSchema = z.object({
  fullName: z.string().min(2),
  nrcNumber: z.string().regex(/^\d{6}\/\d{2}\/\d$/),
  photoUrl: z.string().url().refine(isBlobUrl).optional(),
  nrcDocUrl: z.string().url(),
  selfieUrl: z.string().url(),
  dateOfBirth: z.string(),
  gender: z.string(),
  phone: z.string().regex(/^0\d{9}$/),
  email: z.string().email(),
  password: z.string().min(8),
  departmentId: z.string(),
  jobTitle: z.string(),
  salaryScale: z.string(),
  dateFirstAppointed: z.string().optional(),
  yearsOfService: z.number().int().min(0).max(60).optional(),
  currentStationName: z.string(),
  currentProvince: z.string(),
  currentDistrict: z.string(),
  desiredProvinces: z.array(z.string()).min(1),
  desiredDistricts: z.array(z.string()).default([]),
  incentivePreference: z.enum(["WANT", "OFFER", "NONE", "NEGOTIATE"]).default("NONE"),
  agreedToTerms: z.literal(true),
  consentSharedProfile: z.literal(true),
  promoCode: z.string().trim().toUpperCase().optional(),
});

// POST /api/users — creates a new worker registration (Step 9 submit).
// Verification status starts PENDING; an admin must approve via
// /api/admin/verifications before the user can post swap requests.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }, { nrcNumber: data.nrcNumber }] },
    });
    if (existing) {
      return NextResponse.json({ error: "An account with this email, phone or NRC already exists." }, { status: 409 });
    }

    // An invalid or inactive promo code (including one pre-filled from a
    // promoter's referral link) never blocks registration — it's silently
    // dropped so the user can still proceed with their signup.
    let referredByCode: string | null = null;
    if (data.promoCode) {
      const promoter = await prisma.promoter.findUnique({
        where: { code: data.promoCode },
      });
      if (promoter && promoter.status === "ACTIVE") {
        referredByCode = promoter.code;
      }
    }

    // The date is the source of truth; years are only typed in when no date is given.
    const appointed = data.dateFirstAppointed ? new Date(data.dateFirstAppointed) : null;
    const appointedYears = yearsSince(appointed);
    if (appointed && appointedYears === null) {
      return NextResponse.json({ error: "Date of first appointment is invalid." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        nrcNumber: data.nrcNumber,
        photoUrl: data.photoUrl ?? null,
        nrcDocUrl: data.nrcDocUrl,
        selfieUrl: data.selfieUrl,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        passwordHash,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle,
        salaryScale: data.salaryScale,
        dateFirstAppointed: appointed,
        yearsOfService: appointedYears ?? data.yearsOfService ?? 0,
        currentStationName: data.currentStationName,
        currentProvince: data.currentProvince,
        currentDistrict: data.currentDistrict,
        desiredProvinces: JSON.stringify(data.desiredProvinces),
        desiredDistricts: JSON.stringify(data.desiredDistricts),
        incentivePreference: data.incentivePreference,
        agreedToTerms: data.agreedToTerms,
        consentSharedProfile: data.consentSharedProfile,
        referredByCode,
      },
    });

    return NextResponse.json({ id: user.id, verificationStatus: user.verificationStatus }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
