"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PROVINCES, getDistrictsByProvinceCode } from "@/lib/data/locations";
import { DEPARTMENTS, SWAP_REASONS, URGENCY_LEVELS, INCENTIVE_PREFERENCES } from "@/lib/data/departments";
import { SAMPLE_USERS } from "@/lib/data/sample-users";

const CURRENT_USER = SAMPLE_USERS[0];

export default function NewSwapRequestPage() {
  const router = useRouter();
  const [desiredProvince, setDesiredProvince] = useState("");
  const [desiredDistrict, setDesiredDistrict] = useState("");
  const [ministry, setMinistry] = useState(CURRENT_USER.departmentId);
  const [urgency, setUrgency] = useState("Medium");
  const [reason, setReason] = useState("");
  const [incentive, setIncentive] = useState<"want" | "offer" | "none" | "negotiate">("negotiate");
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");

  const districts = desiredProvince
    ? getDistrictsByProvinceCode(PROVINCES.find((p) => p.name === desiredProvince)?.code ?? "")
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desiredProvince || !desiredDistrict || !reason) {
      toast.error("Please complete all required fields");
      return;
    }
    // In production: POST /api/swap-requests, then redirect using the
    // returned id. No payment step here anymore — the registration fee
    // (paid at signup) covers this; posting a request itself is free.
    toast.success("Swap request posted");
    router.push("/dashboard");
  };

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar title="New Swap Request" verified={CURRENT_USER.verified} />

        <div className="p-4 lg:p-8 max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Swap details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-muted p-4">
                  <div>
                    <Label className="text-xs text-slate-500">Current station</Label>
                    <p className="text-sm font-semibold text-ink">{CURRENT_USER.currentStation}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Current district / province</Label>
                    <p className="text-sm font-semibold text-ink">{CURRENT_USER.currentDistrict}, {CURRENT_USER.currentProvince}</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Desired province</Label>
                    <Select className="mt-1.5" value={desiredProvince} onChange={(e) => { setDesiredProvince(e.target.value); setDesiredDistrict(""); }}>
                      <option value="">Select province</option>
                      {PROVINCES.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Desired district</Label>
                    <Select className="mt-1.5" value={desiredDistrict} onChange={(e) => setDesiredDistrict(e.target.value)} disabled={!desiredProvince}>
                      <option value="">Select district</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Ministry / Department</Label>
                    <Select className="mt-1.5" value={ministry} onChange={(e) => setMinistry(e.target.value)}>
                      {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Urgency level</Label>
                    <Select className="mt-1.5" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                      {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Reason for transfer</Label>
                    <Select className="mt-1.5" value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="">Select reason</option>
                      {SWAP_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <Label className="mb-2 block">Incentive preference</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INCENTIVE_PREFERENCES.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setIncentive(opt.id)}
                        className={`text-left rounded-xl border-2 p-3 text-xs font-semibold transition-colors ${
                          incentive === opt.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-border text-slate-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {incentive !== "none" && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                      <div>
                        <Label>Incentive amount (ZMW, private)</Label>
                        <Input type="number" className="mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Incentive terms</Label>
                        <Textarea className="mt-1.5" value={terms} onChange={(e) => setTerms(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Incentives are private arrangements between users. All swaps and incentives must
                      comply with Zambian law and public service regulations. Z-Swap only connects users.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 text-sm text-secondary-800">
                  No fee to post this request — your one-time registration fee already covers it.
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button size="lg" type="submit">
                Post swap request <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
