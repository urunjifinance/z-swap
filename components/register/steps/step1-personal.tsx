"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud, User } from "lucide-react";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StepNav } from "../step-nav";

export function Step1Personal() {
  const { data, update } = useRegistrationStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{6}\/\d{2}\/\d$/.test(data.nrcNumber)) e.nrcNumber = "Format: 123456/78/1";
    if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!data.gender) e.gender = "Select a gender";
    if (!/^0\d{9}$/.test(data.phone)) e.phone = "Enter a valid 10-digit phone e.g. 0977123456";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Enter a valid email";
    if (data.password.length < 8) e.password = "Minimum 8 characters";
    if (data.password !== data.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return false;
    }
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Personal Details</h2>
      <p className="text-sm text-slate-500 mb-6">Tell us who you are. This information is kept confidential.</p>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted border-2 border-dashed border-border text-muted-foreground">
            <User className="h-8 w-8" />
          </div>
          <label className="cursor-pointer">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors">
              <UploadCloud className="h-4 w-4" />
              {data.photoFileName || "Upload profile photo"}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => update({ photoFileName: e.target.files?.[0]?.name ?? "" })}
            />
          </label>
        </div>

        <div>
          <Label>Full name</Label>
          <Input className="mt-1.5" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="e.g. Mutinta Hamweene" />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <Label>National ID (NRC) number</Label>
          <Input className="mt-1.5" value={data.nrcNumber} onChange={(e) => update({ nrcNumber: e.target.value })} placeholder="123456/78/1" />
          {errors.nrcNumber && <p className="text-xs text-destructive mt-1">{errors.nrcNumber}</p>}
        </div>

        <div>
          <Label>Date of birth</Label>
          <Input type="date" className="mt-1.5" value={data.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} />
          {errors.dateOfBirth && <p className="text-xs text-destructive mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <Label>Gender</Label>
          <Select className="mt-1.5" value={data.gender} onChange={(e) => update({ gender: e.target.value })}>
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
          </Select>
          {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
        </div>

        <div>
          <Label>Phone number</Label>
          <Input className="mt-1.5" value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="0977123456" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label>Email address</Label>
          <Input type="email" className="mt-1.5" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label>Alternative contact number</Label>
          <Input className="mt-1.5" value={data.altPhone} onChange={(e) => update({ altPhone: e.target.value })} placeholder="Optional" />
        </div>

        <div className="md:col-span-2">
          <Label>Physical address</Label>
          <Input className="mt-1.5" value={data.physicalAddress} onChange={(e) => update({ physicalAddress: e.target.value })} placeholder="Plot / house no., area, town" />
        </div>

        <div>
          <Label>Password</Label>
          <Input type="password" className="mt-1.5" value={data.password} onChange={(e) => update({ password: e.target.value })} />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <div>
          <Label>Confirm password</Label>
          <Input type="password" className="mt-1.5" value={data.confirmPassword} onChange={(e) => update({ confirmPassword: e.target.value })} />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
