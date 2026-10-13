import { prisma } from "@/lib/prisma";
import { getTransaction } from "@/lib/lipila";
import type { ReceiptData } from "@/lib/receipt-format";
export { formatReceiptDate, formatReceiptTime } from "@/lib/receipt-format";
export type { ReceiptData } from "@/lib/receipt-format";


const METHOD_LABELS: Record<string, { label: string; network: string }> = {
  MTN_MONEY: { label: "MTN Mobile Money", network: "MTN" },
  AIRTEL_MONEY: { label: "Airtel Money", network: "Airtel" },
  ZAMTEL_MONEY: { label: "Zamtel Kwacha", network: "Zamtel" },
  MTNMONEY: { label: "MTN Mobile Money", network: "MTN" },
  AIRTELMONEY: { label: "Airtel Money", network: "Airtel" },
  ZAMTELKWACHA: { label: "Zamtel Kwacha", network: "Zamtel" },
  CARD: { label: "Card", network: "Card" },
  BANK_TRANSFER: { label: "Bank transfer", network: "Bank" },
};

function methodInfo(method: string | null | undefined) {
  const key = String(method ?? "").replace(/[^a-z]/gi, "").toUpperCase();
  const withUnderscore = String(method ?? "").toUpperCase();
  return METHOD_LABELS[withUnderscore] ?? METHOD_LABELS[key] ?? { label: method || "Mobile money", network: "Network" };
}

// 260977123456 -> 097•••3456
export function maskNumber(n: string | null | undefined): string | null {
  const digits = String(n ?? "").replace(/\D/g, "");
  if (digits.length < 9) return null;
  const local = digits.startsWith("260") ? "0" + digits.slice(3) : digits;
  return local.slice(0, 3) + "•••" + local.slice(-4);
}

function clean(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
  return s ? s.slice(0, 80) : null;
}

type LoadResult =
  | { ok: true; receipt: ReceiptData }
  | { ok: false; reason: "not-found" | "not-paid" };

// Returns the receipt only to the person who paid, or to an admin.
export async function loadReceipt(txnId: string, viewer: { id: string; role?: string }): Promise<LoadResult> {
  const payment = await prisma.payment.findUnique({
    where: { txnId },
    include: { user: { select: { id: true, fullName: true } } },
  });
  if (!payment) return { ok: false, reason: "not-found" };
  if (payment.userId !== viewer.id && viewer.role !== "ADMIN") return { ok: false, reason: "not-found" };
  if (payment.status !== "SUCCESS") return { ok: false, reason: "not-paid" };

  // Extra details from Lipila. If Lipila is slow or down, the receipt still
  // shows everything we hold ourselves.
  let lipila: any = null;
  try {
    const res = await Promise.race([
      getTransaction(txnId),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);
    if (res && res.ok) lipila = res.body;
  } catch {
    lipila = null;
  }

  const info = methodInfo(lipila?.paymentType ?? payment.method);
  const lipilaDate = lipila?.createdAt ? new Date(lipila.createdAt) : null;

  return {
    ok: true,
    receipt: {
      receiptNo: payment.txnId,
      customerName: payment.user.fullName,
      amount: payment.amount,
      paidAt: lipilaDate && !isNaN(lipilaDate.getTime()) ? lipilaDate : payment.createdAt,
      methodLabel: info.label,
      payerNumber: maskNumber(lipila?.accountNumber),
      lipilaReference: clean(lipila?.identifier),
      networkTransactionId: clean(lipila?.externalId),
      networkLabel: info.network,
      description: payment.swapRequestId ? "Z-Swap swap request fee" : "Z-Swap registration fee (one-off)",
    },
  };
}
