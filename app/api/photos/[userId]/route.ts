import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { get } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/photos/<userId>
// Streams a user's private profile photo to any logged-in user.
export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { photoUrl: true },
  });
  if (!user?.photoUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await get(user.photoUrl, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const type = result.blob.contentType || "";
  if (!type.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 415 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
