import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in, an admin, or already paid: let them through
  if (!token || token.role === "ADMIN" || token.registrationFeePaid === true) {
    return NextResponse.next();
  }

  // Unpaid: block the data routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Registration fee required" }, { status: 402 });
  }

  // Unpaid: send pages to the payment screen
  const url = req.nextUrl.clone();
  url.pathname = "/payment";
  url.search = "?context=registration";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/chat/:path*",
    "/swap/:path*",
    "/api/matches/:path*",
    "/api/swap-requests/:path*",
    "/api/chat/:path*",
  ],
};
