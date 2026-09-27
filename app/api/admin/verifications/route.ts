import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/verifications — real pending + recently decided users.
// POST/PATCH — admin approves or rejects a user, with a reason if rejected,
// and can optionally waive the registration fee at the same time.
// Restricted to users with role ADMIN.

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [pending, recent] = await Promise.all([
    prisma.user.findMany({
      where: { verificationStatus: "PENDING" },
      select: {
        id: true,
        fullName: true,
        nrcNumber: true,
        photoUrl: true,
        nrcDocUrl: true,
        selfieUrl: true,
        jobTitle: true,
        currentStationName: true,
        currentDistrict: true,
        currentProvince: true,
        department: { select: { name: true } },
        createdAt: true,
        registrationFeePaid: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { verificationStatus: { in: ["VERIFIED", "REJECTED"] } },
      select: {
        id: true,
        fullName: true,
        photoUrl: true,
        verificationStatus: true,
        rejectionReason: true,
        registrationFeePaid: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ pending, recent });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, decision, reason, waiveFee } = body as {
    userId?: string;
    decision?: "VERIFIED" | "REJECTED";
    reason?: string;
    // When true (only ever sent alongside decision: "VERIFIED"), marks the
    // registration fee as paid without the user actually paying. Use only
    // for test accounts or explicitly agreed special cases — every waived
    // user still earns the referring promoter their normal payout, with no
    // fee revenue behind it, so this bypasses money collection, not just a
    // formality.
    waiveFee?: boolean;
  };

  if (!userId || (decision !== "VERIFIED" && decision !== "REJECTED")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (decision === "REJECTED" && !reason?.trim()) {
    return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: decision,
      rejectionReason: decision === "REJECTED" ? reason!.trim() : null,
      ...(decision === "VERIFIED" && waiveFee ? { registrationFeePaid: true } : {}),
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "verification",
      title: decision === "VERIFIED" ? "Account verified" : "Registration rejected",
      body:
        decision === "VERIFIED"
          ? "Your account has been verified. You can now use Z-Swap."
          : `Your registration was rejected. Reason: ${reason!.trim()}`,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
