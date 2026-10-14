import { NextRequest, NextResponse } from "next/server";
import { sendFeeReminders } from "@/lib/fee-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called once a day by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>"; anything else is rejected so
// outsiders can't trigger emails.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const result = await sendFeeReminders();
  return NextResponse.json(result);
}
