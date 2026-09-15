"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { PROVINCES, getDistrictsByProvinceCode } from "@/lib/data/locations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StepNav } from "../step-nav";

export function Step4CurrentLocation() {
  const { data, update } = useRegistrationStore();
  const provinceCode = PROVINCES.find((p) => p.name === data.currentProvince)?.code;
  const districts = provinceCode ? getDistrictsByProvinceCode(provinceCode) : [];

  useEffect(() => {
    if (!provinceCode) {
      const p = PROVINCES.find((p) => p.name === data.currentProvince);
      if (!p && data.currentProvince) update({ currentProvince: "" });
    }
  }, []); // eslint-disable-line

  const validate = () => {
    if (!data.currentProvince) return toast.error("Select your current province"), false;
    if (!data.currentDistrict) return toast.error("Select your current district"), false;
    if (!data.currentStationName?.trim()) return toast.error("Enter your station / facility name"), false;
    if (!data.areaClassification) return toast.error("Select an area classification"), false;
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Current Location</h2>
      <p className="text-sm text-slate-500 mb-6">Where are you currently stationed?</p>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>Current Province</Label>
          <Select
            className="mt-1.5"
            value={data.currentProvince}
            onChange={(e) => update({ currentProvince: e.target.value, currentDistrict: "" })}
          >
            <option value="">Select province</option>
            {PROVINCES.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
          </Select>
        </div>

        <div>
          <Label>Current District</Label>
          <Select
            className="mt-1.5"
            value={data.currentDistrict}
            onChange={(e) => update({ currentDistrict: e.target.value })}
            disabled={!data.currentProvince}
          >
            <option value="">{data.currentProvince ? "Select district" : "Select a province first"}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label>Current station / school / office / facility name</Label>
          <Input
            className="mt-1.5"
            value={data.currentStationName}
            onChange={(e) => update({ currentStationName: e.target.value })}
            placeholder="e.g. Mongu Girls Secondary School"
          />
        </div>

        <div>
          <Label>Area classification</Label>
          <Select className="mt-1.5" value={data.areaClassification} onChange={(e) => update({ areaClassification: e.target.value })}>
            <option value="">Select</option>
            <option>Rural</option>
            <option>Peri-urban</option>
            <option>Urban</option>
          </Select>
        </div>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
