import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  fullName: z.string().min(2),
  nrcNumber: z.string().regex(/^\d{6}\/\d{2}\/\d$/),
  dateOfBirth: z.string(),
  gender: z.string(),
  phone: z.string().regex(/^0\d{9}$/),
  email: z.string().email(),
  password: z.string().min(8),
  departmentId: z.string(),
  jobTitle: z.string(),
  salaryScale: z.string(),
  currentStationName: z.string(),
  currentProvince: z.string(),
  currentDistrict: z.string(),
  desiredProvinces: z.array(z.string()).min(1),
  desiredDistricts: z.array(z.string()).default([]),
  incentivePreference: z.enum(["WANT", "OFFER", "NONE", "NEGOTIATE"]).default("NONE"),
  agreedToTerms: z.literal(true),
  consentSharedProfile: z.literal(true),
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

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        nrcNumber: data.nrcNumber,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        passwordHash,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle,
        salaryScale: data.salaryScale,
        currentStationName: data.currentStationName,
        currentProvince: data.currentProvince,
        currentDistrict: data.currentDistrict,
        desiredProvinces: JSON.stringify(data.desiredProvinces),
        desiredDistricts: JSON.stringify(data.desiredDistricts),
        incentivePreference: data.incentivePreference,
        agreedToTerms: data.agreedToTerms,
        consentSharedProfile: data.consentSharedProfile,
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
