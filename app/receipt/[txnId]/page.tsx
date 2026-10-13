import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadReceipt } from "@/lib/receipt";
import { ReceiptView } from "./view";
import "./receipt.css";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payment Receipt | Z-Swap", robots: { index: false } };

export default async function ReceiptPage({ params }: { params: { txnId: string } }) {
  const session = await getServerSession(authOptions);
  const txnId = decodeURIComponent(params.txnId);
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(`/receipt/${txnId}`)}`);

  const viewer = { id: (session.user as any).id as string, role: (session.user as any).role as string | undefined };
  const result = await loadReceipt(txnId, viewer);

  if (!result.ok) {
    return (
      <main className="zr-shell">
        <div className="zr-empty">
          <h1>{result.reason === "not-paid" ? "Receipt not available yet" : "Receipt not found"}</h1>
          <p>
            {result.reason === "not-paid"
              ? "This payment hasn't been confirmed. A receipt appears here once the payment succeeds."
              : "We couldn't find this receipt on your account."}
          </p>
          <Link href="/dashboard">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return <ReceiptView r={result.receipt} />;
}
