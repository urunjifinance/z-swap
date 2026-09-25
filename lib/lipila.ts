export const REGISTRATION_FEE_ZMW = 100;

const BASE = process.env.LIPILA_BASE_URL!; // e.g. https://api.lipila.dev/api/v1
const KEY = process.env.LIPILA_API_KEY!;

export async function collectMobileMoney(p: {
  referenceId: string;
  amount: number;
  accountNumber: string;
  narration: string;
  callbackUrl: string;
}) {
  const res = await fetch(`${BASE}/collections/mobile-money`, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": KEY,
      callbackUrl: p.callbackUrl, // Lipila expects this as a HEADER, not a body field
    },
    body: JSON.stringify({
      referenceId: p.referenceId,
      amount: p.amount,
      narration: p.narration,
      accountNumber: p.accountNumber,
      currency: "ZMW",
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

export async function getTransaction(referenceId: string) {
  const res = await fetch(
    `${BASE}/collections/check-status?referenceId=${encodeURIComponent(referenceId)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: { accept: "application/json", "x-api-key": KEY },
    }
  );
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}
