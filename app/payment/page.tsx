"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Smartphone, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatZMW, formatDate, cn } from "@/lib/utils";

// Display only. The real amount is set on the server (lib/lipila.ts).
const FEE_ZMW = 100;

const METHODS = [
  { id: "airtel", label: "Airtel Money", apiValue: "AIRTEL_MONEY" },
  { id: "mtn", label: "MTN Money", apiValue: "MTN_MONEY" },
  { id: "zamtel", label: "Zamtel Money", apiValue: "ZAMTEL_MONEY" },
] as const;

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("airtel");
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<"form" | "starting" | "waiting">("form");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ txnId: string; date: string; method: string } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  // Already paid: go straight to the dashboard
  useEffect(() => {
    if (!receipt && (session?.user as any)?.registrationFeePaid === true) router.replace("/dashboard");
  }, [session, receipt, router]);

  const stop = () => { if (timer.current) clearInterval(timer.current); };

  const startPolling = (txnId: string, m: string) => {
    let tries = 0;
    timer.current = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/payments/status?txnId=${encodeURIComponent(txnId)}`, { cache: "no-store" });
        const r = await res.json();
        if (r.status === "SUCCESS") {
          stop();
          await update(); // refresh the session so the app unlocks
          setReceipt({ txnId, date: r.createdAt ?? new Date().toISOString(), method: m });
          toast.success("Payment received");
        } else if (r.status === "FAILED") {
          stop();
          setError("The payment was not completed. Please try again.");
          setPhase("form");
        } else if (tries >= 45) {
          stop();
          setError("We have not received confirmation yet. If money left your account, wait a few minutes and refresh this page.");
          setPhase("form");
        }
      } catch {
        /* network blip: keep polling */
      }
    }, 4000);
  };

  const handlePay = async () => {
    if (!/^0\d{9}$/.test(phone)) {
      toast.error("Enter a valid mobile money number");
      return;
    }
    setPhase("starting");
    setError("");
    try {
      const apiMethod = METHODS.find((m) => m.id === method)!.apiValue;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: apiMethod, phone }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Could not start the payment. Please try again.");
        setPhase("form");
        return;
      }
      setPhase("waiting");
      startPolling(result.txnId, method);
    } catch {
      setError("Could not reach the server. Please try again.");
      setPhase("form");
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
                  Thanks{firstName ? `, ${firstName}` : ""}. Your account is now pending admin verification, and you&apos;ll be notified once it&apos;s approved.
                </p>
                <div className="text-left rounded-xl border border-border divide-y divide-border">
                  <div className="flex justify-between p-4 text-sm"><span className="text-slate-500">Transaction ID</span><span className="font-mono font-semibold text-ink">{receipt.txnId}</span></div>
                  <div className="flex justify-between p-4 text-sm"><span className="text-slate-500">Amount</span><span className="font-semibold text-ink">{formatZMW(FEE_ZMW)} (non-refundable)</span></div>
                  <div className="flex justify-between p-4 text-sm"><span className="text-slate-500">Date</span><span className="font-semibold text-ink">{formatDate(receipt.date)}</span></div>
                  <div className="flex justify-between p-4 text-sm"><span className="text-slate-500">Method</span><span className="font-semibold text-ink">{METHODS.find((m) => m.id === receipt.method)?.label}</span></div>
                </div>
                <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const busy = phase !== "form";

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar title="Registration Fee Payment" verified={verified} />
        <div className="p-4 lg:p-8 max-w-xl mx-auto">
          <Card>
            <CardHeader><CardTitle>Pay your registration fee</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 flex items-center justify-between">
                <span className="text-sm text-primary-800">Non-refundable registration fee</span>
                <span className="text-xl font-extrabold text-primary-700">{formatZMW(FEE_ZMW)}</span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This fee covers account registration and processing. It is non-refundable regardless of the outcome of admin verification, including if your account is rejected.
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Mobile money network</Label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={busy}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-colors",
                        method === m.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-border text-slate-600"
                      )}
                    >
                      <Smartphone className="h-4 w-4" /> {m.label.replace(" Money", "")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Mobile money number</Label>
                <Input className="mt-1.5" value={phone} disabled={busy} onChange={(e) => setPhone(e.target.value)} placeholder="0977123456" />
              </div>

              {phase === "waiting" && (
                <div className="rounded-xl bg-muted p-4 text-sm text-slate-700">
                  Check your phone and approve the payment request. This page updates automatically once we receive confirmation. Please don&apos;t close it.
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button size="lg" className="w-full" onClick={handlePay} disabled={busy || status !== "authenticated"}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {phase === "starting" ? "Starting payment..." : phase === "waiting" ? "Waiting for approval..." : `Pay ${formatZMW(FEE_ZMW)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
