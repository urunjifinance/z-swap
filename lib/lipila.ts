export const REGISTRATION_FEE_ZMW = 100;

const BASE = process.env.LIPILA_BASE_URL!;
const KEY = process.env.LIPILA_API_KEY!;

async function lipila(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", "x-api-key": KEY },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

export function collectMobileMoney(p: {
  referenceId: string;
  amount: number;
  accountNumber: string;
  callbackUrl: string;
}) {
  return lipila("/collections/mobile-money", {
    method: "POST",
    body: JSON.stringify({ ...p, currency: "ZMW", narration: "Z-Swap registration fee" }),
  });
}

export function getTransaction(referenceId: string) {
  return lipila(`/transactions/${encodeURIComponent(referenceId)}`);
}
