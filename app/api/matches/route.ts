import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/matches?requestId=xxx
// Computes and returns candidate matches for a given swap request: other
// PENDING/MATCHED requests where the province/district preferences are
// reciprocal. Score weighting mirrors lib/matching-engine.ts on the client.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId is required" }, { status: 400 });

  const myRequest = await prisma.swapRequest.findUnique({ where: { id: requestId }, include: { user: true } });
  if (!myRequest) return NextResponse.json({ error: "Swap request not found" }, { status: 404 });

  const candidates = await prisma.swapRequest.findMany({
    where: {
      id: { not: requestId },
      status: { in: ["PENDING", "MATCHED"] },
      desiredProvince: myRequest.currentProvince,
      currentProvince: myRequest.desiredProvince,
    },
    include: { user: true },
  });

  const scored = candidates.map((c: (typeof candidates)[number]) => {
    let score = 40; // base reciprocity match, since the query already filters for it
    if (c.ministry === myRequest.ministry) score += 25;
    if (
      (myRequest.incentivePreference === "WANT" && c.incentivePreference === "OFFER") ||
      (myRequest.incentivePreference === "OFFER" && c.incentivePreference === "WANT") ||
      myRequest.incentivePreference === "NONE" ||
      c.incentivePreference === "NONE"
    ) {
      score += 15;
    }
    if (c.user.mostWanted || myRequest.user.mostWanted) score += 10;
    return { ...c, matchScore: Math.min(100, score) };
  });

  scored.sort((a: (typeof scored)[number], b: (typeof scored)[number]) => b.matchScore - a.matchScore);

  return NextResponse.json(scored);
}
