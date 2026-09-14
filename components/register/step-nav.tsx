"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegistrationStore, TOTAL_STEPS } from "@/lib/stores/registration-store";

export function StepNav({
  onNext,
  nextLabel = "Continue",
  loading = false,
  disableNext = false,
}: {
  onNext?: () => boolean | void; // return false to block advancing
  nextLabel?: string;
  loading?: boolean;
  disableNext?: boolean;
}) {
  const { step, setStep } = useRegistrationStore();

  const handleNext = () => {
    const result = onNext?.();
    if (result === false) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <Button type="button" variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Button type="button" onClick={handleNext} disabled={disableNext || loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {nextLabel} {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}
