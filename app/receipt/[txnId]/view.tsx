import { type ReceiptData, formatReceiptDate, formatReceiptTime } from "@/lib/receipt-format";
import { ReceiptToolbar } from "./toolbar";
import "./receipt.css";

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ReceiptView({ r }: { r: ReceiptData }) {
  return (
    <main className="zr-shell">
      <ReceiptToolbar receiptNo={r.receiptNo} />

      <article className="zr-page" aria-label={`Payment receipt ${r.receiptNo}`}>
        <div className="zr-accent" />

        <header className="zr-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="zr-logo" src="/receipt/logo.png" alt="Z-Swap: Transfer smarter and quicker" />
          <div className="zr-title-block">
            <h1 className="zr-title"><span className="a">PAYMENT</span><span className="b">RECEIPT</span></h1>
            <p className="zr-receipt-no">Receipt no. <strong>{r.receiptNo}</strong></p>
            <p className="zr-badge">
              <span className="tick" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              Payment successful
            </p>
          </div>
        </header>

        <p className="zr-issuer">Issued by <strong>Urunji Zambia</strong>, operator of Z-Swap · Lusaka, Zambia</p>

        <section className="zr-facts">
          <div className="zr-fact">
            <span className="zr-icon" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg></span>
            <div><p className="zr-label">Customer name</p><p className="zr-value">{r.customerName}</p></div>
          </div>
          <div className="zr-fact">
            <span className="zr-icon" aria-hidden><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg></span>
            <div>
              <p className="zr-label">Date paid</p>
              <p className="zr-value">{formatReceiptDate(r.paidAt)}<small>{formatReceiptTime(r.paidAt)} (Lusaka time)</small></p>
            </div>
          </div>
          <div className="zr-fact">
            <span className="zr-icon" aria-hidden><svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></svg></span>
            <div>
              <p className="zr-label">Payment method</p>
              <p className="zr-value">{r.methodLabel}{r.payerNumber && <small>From {r.payerNumber}</small>}</p>
            </div>
          </div>
          {(r.networkTransactionId || r.lipilaReference) && (
            <div className="zr-row2">
              <div className="zr-fact">
                <span className="zr-icon" aria-hidden><svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg></span>
                <div><p className="zr-label">{r.networkLabel} transaction ID</p><p className="zr-value zr-mono">{r.networkTransactionId ?? "—"}</p></div>
              </div>
              <div className="zr-fact">
                <span className="zr-icon" aria-hidden><svg viewBox="0 0 24 24"><path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17" /></svg></span>
                <div><p className="zr-label">Lipila reference</p><p className="zr-value zr-mono">{r.lipilaReference ?? "—"}</p></div>
              </div>
            </div>
          )}
        </section>

        <section className="zr-details">
          <h2>PAYMENT DETAILS</h2>
          <table>
            <thead><tr><th className="num">#</th><th>Description</th><th className="amt">Amount (ZMW)</th></tr></thead>
            <tbody>
              <tr><td className="num">1</td><td>{r.description}</td><td className="amt">{money(r.amount)}</td></tr>
              <tr className="total"><td className="num" /><td>Total paid</td><td className="amt">ZMW {money(r.amount)}</td></tr>
            </tbody>
          </table>
        </section>

        <p className="zr-note">
          <span className="i" aria-hidden>i</span>
          <span>This is a computer-generated receipt and does not require a signature. For any questions about this payment, contact support@z-swap.com and quote your receipt number.</span>
        </p>

        <div className="zr-bottom">
          <div className="zr-thanks">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/receipt/thanks.png" alt="Thank you" />
            <p>for choosing <b>Z-Swap</b></p>
          </div>
          <div className="zr-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/receipt/qr-z-swap.svg" alt="QR code linking to z-swap.com" />
            <p><b>Scan to visit Z-Swap</b>z-swap.com</p>
          </div>
        </div>

        <footer className="zr-footer">
          <span>+260 979 423 178</span>
          <span className="sep" />
          <span>support@z-swap.com</span>
          <span className="sep" />
          <span>www.z-swap.com</span>
        </footer>
      </article>
    </main>
  );
}
