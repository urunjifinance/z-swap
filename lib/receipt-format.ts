// Everything a receipt shows. Built only from the saved payment, the user's
// account and Lipila's own record of the transaction, never from anything the
// browser sends, so a receipt always matches what was really paid.
export interface ReceiptData {
  receiptNo: string;
  customerName: string;
  amount: number;
  paidAt: Date;
  methodLabel: string;
  payerNumber: string | null; // masked, e.g. 097•••4178
  lipilaReference: string | null; // Lipila's transaction identifier
  networkTransactionId: string | null; // MTN/Airtel/Zamtel's own ID
  networkLabel: string; // "MTN" / "Airtel" / "Zamtel" / "Network"
  description: string;
}

export function formatReceiptDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatReceiptTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}
