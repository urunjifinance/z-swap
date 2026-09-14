"use client";

import { toast } from "sonner";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { getSalaryScales, getJobTitles, SCHOOL_TYPES, FACILITY_TYPES, QUALIFICATIONS, DEPARTMENTS } from "@/lib/data/departments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StepNav } from "../step-nav";

export function Step3JobDetails() {
  const { data, update } = useRegistrationStore();
  const deptId = data.departmentId;
  const dept = DEPARTMENTS.find((d) => d.id === deptId);
  const salaryScales = getSalaryScales(deptId);
  const jobTitles = getJobTitles(deptId);

  const isEducation = deptId === "moe" || deptId === "tsc";
  const isHealth = deptId === "moh";
  const isPolice = deptId === "zps";
  const isDefence = deptId === "zdf";
  const isCouncil = deptId === "molgrd";

  const validate = () => {
    if (!data.salaryScale) return toast.error("Select a salary scale / rank"), false;
    if (!data.jobTitle) return toast.error("Select a job title"), false;
    if (!data.currentStationName.trim()) return toast.error("Enter your current station"), false;
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Job Details</h2>
      <p className="text-sm text-slate-500 mb-6">
        Fields are tailored for <span className="font-semibold text-ink">{dept?.name ?? "your department"}</span>.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>{isPolice || isDefence ? "Rank" : "Salary scale"}</Label>
          <Select className="mt-1.5" value={data.salaryScale} onChange={(e) => update({ salaryScale: e.target.value })}>
            <option value="">Select</option>
            {salaryScales.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Job title</Label>
          <Select className="mt-1.5" value={data.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })}>
            <option value="">Select</option>
            {jobTitles.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </Select>
        </div>

        {data.jobTitle === "Other (specify)" && (
          <div>
            <Label>Specify job title</Label>
            <Input className="mt-1.5" value={data.jobTitleOther} onChange={(e) => update({ jobTitleOther: e.target.value })} />
          </div>
        )}

        <div>
          <Label>{isPolice ? "Force number" : isDefence ? "Service number" : "Employment / Payroll number"}</Label>
          <Input className="mt-1.5" value={data.employmentNumber} onChange={(e) => update({ employmentNumber: e.target.value })} />
        </div>

        {!isPolice && !isDefence && (
          <div>
            <Label>Date of first appointment</Label>
            <Input type="date" className="mt-1.5" value={data.dateFirstAppointed} onChange={(e) => update({ dateFirstAppointed: e.target.value })} />
          </div>
        )}

        <div>
          <Label>
            {isEducation ? "Current station / school" : isHealth ? "Current health facility" : isPolice ? "Current station / unit" : isDefence ? "Current unit / barracks" : isCouncil ? "Current council / station" : "Current station / office"}
          </Label>
          <Input className="mt-1.5" value={data.currentStationName} onChange={(e) => update({ currentStationName: e.target.value })} />
        </div>

        {isEducation && (
          <div>
            <Label>School type</Label>
            <Select className="mt-1.5" value={data.stationType} onChange={(e) => update({ stationType: e.target.value })}>
              <option value="">Select</option>
              {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
        )}

        {isHealth && (
          <div>
            <Label>Facility type</Label>
            <Select className="mt-1.5" value={data.stationType} onChange={(e) => update({ stationType: e.target.value })}>
              <option value="">Select</option>
              {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
        )}

        <div>
          <Label>Years of service</Label>
          <Input type="number" min={0} className="mt-1.5" value={data.yearsOfService} onChange={(e) => update({ yearsOfService: e.target.value })} />
        </div>

        {isEducation && (
          <>
            <div>
              <Label>Professional qualification</Label>
              <Select className="mt-1.5" value={data.qualification} onChange={(e) => update({ qualification: e.target.value })}>
                <option value="">Select</option>
                {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </Select>
            </div>
            <div>
              <Label>Teaching subjects (if applicable)</Label>
              <Input className="mt-1.5" value={data.teachingSubjects} onChange={(e) => update({ teachingSubjects: e.target.value })} placeholder="e.g. Mathematics, Physics" />
            </div>
          </>
        )}
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
