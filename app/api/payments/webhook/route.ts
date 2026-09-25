import { NextRequest, NextResponse } from "next/server";
import { finalizePayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

// The message body is never trusted. We only read the reference,
// then confirm the payment directly with Lipila.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ref = typeof body?.referenceId === "string" ? body.referenceId : null;
  if (ref) await finalizePayment(ref).catch((e) => console.error("webhook error", e));
  return NextResponse.json({ received: true });
}
