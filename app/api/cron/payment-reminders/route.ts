import { NextRequest, NextResponse } from "next/server";
import { sendDuePaymentReminders } from "@/lib/payment-reminders";

// GET /api/cron/payment-reminders — invoked hourly by Vercel Cron (see
// vercel.json). Finds registered-but-unpaid users past the 24h/4-day
// thresholds and emails them a reminder, once each, with a direct link
// back to /payment.
//
// Protected by CRON_SECRET: Vercel Cron sends this as a Bearer token
// automatically for cron-triggered requests when the env var is set
// (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
// Without CRON_SECRET configured, the route is left open — set it in
// Vercel's env vars before relying on this in production.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await sendDuePaymentReminders();
  return NextResponse.json({ ok: true, ...result });
}
