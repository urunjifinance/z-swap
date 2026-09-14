"use client";

import * as Icons from "lucide-react";
import { toast } from "sonner";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { DEPARTMENTS } from "@/lib/data/departments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepNav } from "../step-nav";
import { cn } from "@/lib/utils";

export function Step2Department() {
  const { data, update } = useRegistrationStore();

  const validate = () => {
    if (!data.departmentId) {
      toast.error("Please select your department or ministry");
      return false;
    }
    if (data.departmentId === "other" && !data.departmentOther.trim()) {
      toast.error("Please specify your department");
      return false;
    }
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Department / Ministry</h2>
      <p className="text-sm text-slate-500 mb-6">Select the ministry, department or agency you currently work for.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {DEPARTMENTS.map((d) => {
          const Icon = (Icons as any)[d.icon] ?? Icons.Building2;
          const selected = data.departmentId === d.id;
          return (
            <button
              type="button"
              key={d.id}
              onClick={() => update({ departmentId: d.id })}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
                selected ? "border-primary-500 bg-primary-50" : "border-border bg-white"
              )}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white shrink-0"
                style={{ backgroundColor: d.color }}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-semibold text-ink leading-tight">{d.name}</span>
            </button>
          );
        })}
      </div>

      {data.departmentId === "other" && (
        <div className="mt-4">
          <Label>Please specify</Label>
          <Input className="mt-1.5" value={data.departmentOther} onChange={(e) => update({ departmentOther: e.target.value })} />
        </div>
      )}

      <StepNav onNext={validate} />
    </div>
  );
}
