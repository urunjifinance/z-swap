"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

// Hidden when printing. "Download PDF" opens the browser's print dialog,
// where the user picks "Save as PDF" (works on phones and computers).
export function ReceiptToolbar({ receiptNo }: { receiptNo: string }) {
  const download = () => {
    const previous = document.title;
    document.title = `Z-Swap-Receipt-${receiptNo}`; // becomes the PDF file name
    window.print();
    setTimeout(() => { document.title = previous; }, 1000);
  };

  return (
    <div className="zr-toolbar">
      <Link href="/dashboard" className="zr-btn zr-btn-ghost">
        <ArrowLeft size={16} /> Dashboard
      </Link>
      <button type="button" onClick={download} className="zr-btn">
        <Download size={16} /> Download PDF
      </button>
    </div>
  );
}
