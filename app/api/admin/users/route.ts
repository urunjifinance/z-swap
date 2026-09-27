import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users — every registered worker, for the admin Users table.
// Restricted to ADMIN. Filtering (name search, province) happens client-side
// against this list, same as the old SAMPLE_USERS-backed table did.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      nrcNumber: true,
      photoUrl: true,
      departmentId: true,
      department: { select: { name: true } },
      salaryScale: true,
      currentProvince: true,
      verificationStatus: true,
      registrationFeePaid: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

const patchSchema = z.object({
  id: z.string().min(1),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  registrationFeePaid: z.boolean().optional(),
}).refine(
  (data) => data.verificationStatus !== undefined || data.registrationFeePaid !== undefined,
  { message: "Provide at least one field to update." }
);

// PATCH /api/admin/users — approve, reject, or waive the registration fee
// for a user. Restricted to ADMIN.
//
// Body examples:
//   { id, verificationStatus: "VERIFIED" }                       — normal approve
//   { id, verificationStatus: "REJECTED" }                       — reject
//   { id, verificationStatus: "VERIFIED", registrationFeePaid: true }  — "Waive fee & verify":
//     approves the account AND marks the registration fee as paid without the
//     user actually going through the payment flow. Use this only for test
//     accounts or explicitly agreed special cases (e.g. an early real tester) —
//     it bypasses revenue collection for that user.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = patchSchema.parse(await req.json());

    const user = await prisma.user.update({
      where: { id: data.id },
      data: {
        ...(data.verificationStatus !== undefined && { verificationStatus: data.verificationStatus }),
        ...(data.registrationFeePaid !== undefined && { registrationFeePaid: data.registrationFeePaid }),
      },
      select: {
        id: true,
        fullName: true,
        verificationStatus: true,
        registrationFeePaid: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
