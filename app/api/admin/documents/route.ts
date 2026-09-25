import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { get } from "@vercel/blob";

// GET /api/admin/documents?url=<blob-url>
// Streams a private document (NRC/selfie) to an authenticated admin only.
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
