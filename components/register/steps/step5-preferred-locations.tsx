"use client";

import { toast } from "sonner";
import { X } from "lucide-react";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { PROVINCES, getDistrictsByProvinceCode } from "@/lib/data/locations";
import { SWAP_REASONS, URGENCY_LEVELS } from "@/lib/data/departments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StepNav } from "../step-nav";
import { cn } from "@/lib/utils";

export function Step5PreferredLocations() {
  const { data, update } = useRegistrationStore();

  const availableDistricts = data.desiredProvinces.flatMap((provName) => {
    const code = PROVINCES.find((p) => p.name === provName)?.code;
    return code ? getDistrictsByProvinceCode(code) : [];
  });

  const toggleProvince = (name: string) => {
    if (data.desiredProvinces.includes(name)) {
      update({
        desiredProvinces: data.desiredProvinces.filter((p) => p !== name),
        desiredDistricts: data.desiredDistricts.filter((d) => availableDistricts.includes(d)),
      });
    } else {
      if (data.desiredProvinces.length >= 3) {
        toast.error("You can select up to 3 provinces");
        return;
      }
      update({ desiredProvinces: [...data.desiredProvinces, name] });
    }
  };

  const toggleDistrict = (name: string) => {
    if (data.desiredDistricts.includes(name)) {
      update({ desiredDistricts: data.desiredDistricts.filter((d) => d !== name) });
    } else {
      if (data.desiredDistricts.length >= 5) {
        toast.error("You can select up to 5 districts");
        return;
      }
      update({ desiredDistricts: [...data.desiredDistricts, name] });
    }
  };

  const validate = () => {
    if (data.desiredProvinces.length === 0) return toast.error("Select at least 1 desired province"), false;
    if (!data.willingToMove) return toast.error("Select where you're willing to move"), false;
    if (!data.swapReason) return toast.error("Select a reason for swap"), false;
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Preferred Swap Locations</h2>
      <p className="text-sm text-slate-500 mb-6">Where would you like to move to?</p>

      <div className="space-y-6">
        <div>
          <Label>Desired Province(s) — up to 3</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROVINCES.map((p) => {
              const active = data.desiredProvinces.includes(p.name);
              return (
                <button
                  type="button"
                  key={p.code}
                  onClick={() => toggleProvince(p.name)}
                  className={cn(
                    "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors",
                    active ? "border-primary-500 bg-primary-500 text-white" : "border-border text-slate-600 hover:border-primary-300"
                  )}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {data.desiredProvinces.length > 0 && (
          <div>
            <Label>Desired District(s) — up to 5</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableDistricts.map((d) => {
                const active = data.desiredDistricts.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDistrict(d)}
                    className={cn(
                      "rounded-full border-2 px-3.5 py-1 text-xs font-semibold transition-colors",
                      active ? "border-secondary-600 bg-secondary-600 text-white" : "border-border text-slate-600 hover:border-secondary-300"
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            {data.desiredDistricts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.desiredDistricts.map((d) => (
                  <Badge key={d} variant="secondary" className="gap-1">
                    {d}
                    <button onClick={() => toggleDistrict(d)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Desired station / school / office (optional)</Label>
            <Input className="mt-1.5" value={data.desiredStation} onChange={(e) => update({ desiredStation: e.target.value })} />
          </div>

          <div>
            <Label>Willing to move to</Label>
            <Select className="mt-1.5" value={data.willingToMove} onChange={(e) => update({ willingToMove: e.target.value })}>
              <option value="">Select</option>
              <option>Rural only</option>
              <option>Urban only</option>
              <option>Anywhere</option>
            </Select>
          </div>

          <div>
            <Label>Reason for swap</Label>
            <Select className="mt-1.5" value={data.swapReason} onChange={(e) => update({ swapReason: e.target.value })}>
              <option value="">Select</option>
              {SWAP_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>

          {data.swapReason === "Other (specify)" && (
            <div>
              <Label>Specify reason</Label>
              <Input className="mt-1.5" value={data.swapReasonOther} onChange={(e) => update({ swapReasonOther: e.target.value })} />
            </div>
          )}

          <div>
            <Label>Urgency level</Label>
            <Select className="mt-1.5" value={data.urgency} onChange={(e) => update({ urgency: e.target.value })}>
              {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>

          <div>
            <Label>Earliest date available to swap</Label>
            <Input type="date" className="mt-1.5" value={data.earliestAvailable} onChange={(e) => update({ earliestAvailable: e.target.value })} />
          </div>
        </div>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
