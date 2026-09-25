import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
