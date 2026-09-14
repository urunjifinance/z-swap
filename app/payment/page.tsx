"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Smartphone, CreditCard, Landmark, Loader2, CheckCircle2, Download } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { REQUEST_FEE_ZMW, SAMPLE_USERS } from "@/lib/data/sample-users";
import { formatZMW, generateTxnId, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CURRENT_USER = SAMPLE_USERS[0];

const METHODS = [
  { id: "airtel", label: "Airtel Money", icon: Smartphone },
  { id: "mtn", label: "MTN Money", icon: Smartphone },
  { id: "zamtel", label: "Zamtel Money", icon: Smartphone },
  { id: "card", label: "Visa / Mastercard", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Landmark },
] as const;

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("airtel");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ txnId: string; date: string } | null>(null);

  const handlePay = async () => {
    if ((method === "airtel" || method === "mtn" || method === "zamtel") && !/^0\d{9}$/.test(phone)) {
      toast.error("Enter a valid mobile money number");
      return;
    }
    setProcessing(true);
    // Structured to swap in Flutterwave / Paystack / DPO's charge + verify
    // endpoints here. This demo simulates the async confirmation step.
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    setReceipt({ txnId: generateTxnId(), date: new Date().toISOString() });
    toast.success("Payment successful");
  };

  if (receipt) {
    return (
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <DashboardTopbar title="Payment Receipt" verified={CURRENT_USER.verified} />
          <div className="p-4 lg:p-8 max-w-xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-ink mb-1">Payment successful</h2>
                <p className="text-sm text-slate-500 mb-6">Your swap request is now live and visible to matches.</p>

                <div className="text-left rounded-xl border border-border divide-y divide-border">
                  <div className="flex justify-between p-4 text-sm">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono font-semibold text-ink">{receipt.txnId}</span>
                  </div>
                  <div className="flex justify-between p-4 text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-semibold text-ink">{formatZMW(REQUEST_FEE_ZMW)} (non-refundable)</span>
                  </div>
                  <div className="flex justify-between p-4 text-sm">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-ink">{formatDate(receipt.date)}</span>
                  </div>
                  <div className="flex justify-between p-4 text-sm">
                    <span className="text-slate-500">Method</span>
                    <span className="font-semibold text-ink">{METHODS.find((m) => m.id === method)?.label}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4" /> Download receipt
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                    Go to dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar title="Request Fee Payment" verified={CURRENT_USER.verified} />

        <div className="p-4 lg:p-8 max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Pay request fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 flex items-center justify-between">
                <span className="text-sm text-primary-800">Non-refundable request fee</span>
                <span className="text-xl font-extrabold text-primary-700">{formatZMW(REQUEST_FEE_ZMW)}</span>
              </div>

              <div>
                <Label className="mb-2 block">Payment method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-colors",
                        method === m.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-border text-slate-600"
                      )}
                    >
                      <m.icon className="h-4 w-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {(method === "airtel" || method === "mtn" || method === "zamtel") && (
                <div>
                  <Label>Mobile money number</Label>
                  <Input className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0977123456" />
                </div>
              )}

              {method === "card" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Card number</Label>
                    <Input className="mt-1.5" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div>
                    <Label>Expiry</Label>
                    <Input className="mt-1.5" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label>CVC</Label>
                    <Input className="mt-1.5" placeholder="123" />
                  </div>
                </div>
              )}

              {method === "bank" && (
                <div className="rounded-xl bg-muted p-4 text-sm text-slate-600">
                  Transfer to Z-Swap Ltd — Account 0123456789, Zanaco. Use your NRC number as reference. Confirmation is automatic within a few minutes.
                </div>
              )}

              <p className="text-xs text-slate-500">
                By paying, you acknowledge this fee is non-refundable whether or not the swap is successful.
              </p>

              <Button size="lg" className="w-full" onClick={handlePay} disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                {processing ? "Processing payment..." : `Pay ${formatZMW(REQUEST_FEE_ZMW)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
