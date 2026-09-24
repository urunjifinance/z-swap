"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Smartphone, CreditCard, Landmark, Loader2, CheckCircle2, Download, ShieldAlert } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { REQUEST_FEE_ZMW } from "@/lib/data/sample-users";
import { formatZMW, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "airtel", label: "Airtel Money", apiValue: "AIRTEL_MONEY", icon: Smartphone },
  { id: "mtn", label: "MTN Money", apiValue: "MTN_MONEY", icon: Smartphone },
  { id: "zamtel", label: "Zamtel Money", apiValue: "ZAMTEL_MONEY", icon: Smartphone },
  { id: "card", label: "Visa / Mastercard", apiValue: "CARD", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", apiValue: "BANK_TRANSFER", icon: Landmark },
] as const;

// This page is the registration-fee payment step: it runs right after
// account creation (see components/register/steps/step9-review.tsx), before
// admin verification. There is no per-swap-request fee anymore — posting a
// swap request is free once the account is paid + verified.
export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("airtel");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ txnId: string; date: string; method: string } | null>(null);

  const handlePay = async () => {
    if ((method === "airtel" || method === "mtn" || method === "zamtel") && !/^0\d{9}$/.test(phone)) {
      toast.error("Enter a valid mobile money number");
      return;
    }
    setProcessing(true);
    setError("");

    try {
      const apiMethod = METHODS.find((m) => m.id === method)!.apiValue;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No swapRequestId — this charges the registration fee, not a
        // per-request fee. See app/api/payments/route.ts.
        body: JSON.stringify({ method: apiMethod, amount: REQUEST_FEE_ZMW }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Payment failed. Please try again.");
        setProcessing(false);
        return;
      }

      setProcessing(false);
      setReceipt({ txnId: result.txnId, date: result.createdAt ?? new Date().toISOString(), method });
      toast.success("Payment successful");
    } catch (err) {
      setProcessing(false);
      setError("Could not reach the server. Please try again.");
    }
  };

  const verified = (session?.user as any)?.verificationStatus === "VERIFIED";
  const firstName = session?.user?.name?.split(" ")[0];

  if (receipt) {
    return (
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <DashboardTopbar title="Payment Receipt" verified={verified} />
          <div className="p-4 lg:p-8 max-w-xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-ink mb-1">Payment successful</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Thanks{firstName ? `, ${firstName}` : ""} — your account is now pending admin verification. You&apos;ll be notified once it&apos;s approved, and can post swap requests immediately after.
                </p>

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
                    <span className="font-semibold text-ink">{METHODS.find((m) => m.id === receipt.method)?.label}</span>
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
        <DashboardTopbar title="Registration Fee Payment" verified={verified} />

        <div className="p-4 lg:p-8 max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Pay your registration fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 flex items-center justify-between">
                <span className="text-sm text-primary-800">Non-refundable registration fee</span>
                <span className="text-xl font-extrabold text-primary-700">{formatZMW(REQUEST_FEE_ZMW)}</span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This fee covers account registration and verification processing. It is non-refundable,
                  regardless of the outcome of verification — including if your account is not approved.
                </p>
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
                  Transfer to Urunji Zambia Ltd — Account 0123456789, Zanaco. Use your NRC number as reference. Confirmation is automatic within a few minutes.
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button size="lg" className="w-full" onClick={handlePay} disabled={processing || status !== "authenticated"}>
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
