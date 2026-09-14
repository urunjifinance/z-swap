"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRegistrationStore, TOTAL_STEPS, STEP_LABELS } from "@/lib/stores/registration-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { Step1Personal } from "./steps/step1-personal";
import { Step2Department } from "./steps/step2-department";
import { Step3JobDetails } from "./steps/step3-job-details";
import { Step4CurrentLocation } from "./steps/step4-current-location";
import { Step5PreferredLocations } from "./steps/step5-preferred-locations";
import { Step6Incentive } from "./steps/step6-incentive";
import { Step7Contacts } from "./steps/step7-contacts";
import { Step8Verification } from "./steps/step8-verification";
import { Step9Review } from "./steps/step9-review";

const STEPS = [
  Step1Personal,
  Step2Department,
  Step3JobDetails,
  Step4CurrentLocation,
  Step5PreferredLocations,
  Step6Incentive,
  Step7Contacts,
  Step8Verification,
  Step9Review,
];

export function RegistrationWizard() {
  const { step } = useRegistrationStore();
  const StepComponent = STEPS[step - 1];
  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-primary-600">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-slate-500">{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={progressPct} />

        <div className="hidden md:flex items-center justify-between mt-4">
          {STEP_LABELS.map((label, i) => {
            const idx = i + 1;
            const done = idx < step;
            const active = idx === step;
            return (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done && "bg-secondary-600 text-white",
                    active && "bg-z-gradient text-white ring-4 ring-primary-100",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
