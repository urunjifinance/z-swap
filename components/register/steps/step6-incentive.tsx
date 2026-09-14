"use client";

import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { INCENTIVE_PREFERENCES } from "@/lib/data/departments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepNav } from "../step-nav";
import { cn } from "@/lib/utils";

export function Step6Incentive() {
  const { data, update } = useRegistrationStore();

  const validate = () => {
    if (!data.incentivePreference) return toast.error("Select an incentive preference"), false;
    return true;
  };

  const showAmount = data.incentivePreference === "want" || data.incentivePreference === "offer" || data.incentivePreference === "negotiate";

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Incentive Preference</h2>
      <p className="text-sm text-slate-500 mb-6">Incentives are optional, private arrangements between users.</p>

      <div className="space-y-3">
        {INCENTIVE_PREFERENCES.map((opt) => {
          const active = data.incentivePreference === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => update({ incentivePreference: opt.id })}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-colors",
                active ? "border-primary-500 bg-primary-50" : "border-border bg-white hover:border-primary-200"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("h-4 w-4 rounded-full border-2 shrink-0", active ? "border-primary-600 bg-primary-600" : "border-slate-300")} />
                <span className="text-sm font-semibold text-ink">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showAmount && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <Label>Incentive amount range — min (ZMW)</Label>
            <Input type="number" className="mt-1.5" value={data.incentiveAmountMin} onChange={(e) => update({ incentiveAmountMin: e.target.value })} placeholder="Optional" />
          </div>
          <div>
            <Label>Incentive amount range — max (ZMW)</Label>
            <Input type="number" className="mt-1.5" value={data.incentiveAmountMax} onChange={(e) => update({ incentiveAmountMax: e.target.value })} placeholder="Optional" />
          </div>
          <div className="md:col-span-2">
            <Label>Incentive terms</Label>
            <Textarea className="mt-1.5" value={data.incentiveTerms} onChange={(e) => update({ incentiveTerms: e.target.value })} placeholder="Describe any conditions for the incentive arrangement" />
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Incentives are private arrangements between users. All swaps and incentives must comply with
          Zambian law and public service regulations. Z-Swap only connects users.
        </p>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
