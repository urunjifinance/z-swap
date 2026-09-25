import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/reports — real user-submitted reports for the admin
// Disputes & Reports tab. Restricted to ADMIN.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    select: {
      id: true,
      reason: true,
      details: true,
      resolved: true,
      createdAt: true,
      reporter: { select: { id: true, fullName: true } },
      reported: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

// PATCH /api/admin/reports — marks a report resolved. Restricted to ADMIN.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId } = (await req.json().catch(() => ({}))) as { reportId?: string };
  if (!reportId) return NextResponse.json({ error: "reportId is required" }, { status: 400 });

  const updated = await prisma.report.update({ where: { id: reportId }, data: { resolved: true } });
  return NextResponse.json(updated);
}
