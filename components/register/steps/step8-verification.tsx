"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { UploadCloud, FileCheck2, ShieldAlert, Loader2 } from "lucide-react";
import { useRegistrationStore, RegistrationData } from "@/lib/stores/registration-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StepNav } from "../step-nav";

const DOCS: { key: keyof RegistrationData; label: string; required: boolean }[] = [
  { key: "nrcDocUrl", label: "National ID (NRC)", required: true },
  { key: "selfieUrl", label: "Selfie for identity verification", required: true },
];

function UploadRow({ docKey, label, required }: { docKey: keyof RegistrationData; label: string; required: boolean }) {
  const { data, update } = useRegistrationStore();
  const fileUrl = data[docKey] as string;
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(`registration/${docKey}-${Date.now()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
      });
      update({ [docKey]: blob.url } as Partial<RegistrationData>);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(`Could not upload ${label}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
          <FileCheck2 className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">
            {label} {required && <span className="text-destructive">*</span>}
          </p>
          {fileUrl && <p className="text-xs text-secondary-600">Uploaded</p>}
        </div>
      </div>
      <label className="cursor-pointer">
        <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : fileUrl ? "Replace" : "Upload"}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

export function Step8Verification() {
  const { data, update } = useRegistrationStore();

  const validate = () => {
    if (!data.nrcDocUrl) return toast.error("Upload your NRC document"), false;
    if (!data.selfieUrl) return toast.error("Upload a selfie for identity verification"), false;
    if (!data.agreedToTerms) return toast.error("You must agree to the Terms of Service"), false;
    if (!data.consentSharedProfile) return toast.error("Consent is required to share your profile with matched users"), false;
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Verification & Documents</h2>
      <p className="text-sm text-slate-500 mb-6">These are reviewed by our admin team before your profile is verified.</p>

      <div className="space-y-3">
        {DOCS.map((d) => (
          <UploadRow key={d.key} docKey={d.key} label={d.label} required={d.required} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex gap-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Protect yourself from scams:</strong> Never pay an incentive to another user before your
          swap is officially confirmed and completed on the platform. Z-Swap is not responsible for money
          paid directly to another user outside the platform before a swap is finalized.
        </p>
      </div>

      <div className="mt-4 space-y-3 border-t border-border pt-5">
        <div className="flex items-start gap-2">
          <Checkbox id="terms" checked={data.agreedToTerms} onCheckedChange={(v) => update({ agreedToTerms: Boolean(v) })} className="mt-0.5" />
          <Label htmlFor="terms" className="font-normal text-sm">
            I agree to the Terms of Service, Privacy Policy, and Refund Policy.
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="consent" checked={data.consentSharedProfile} onCheckedChange={(v) => update({ consentSharedProfile: Boolean(v) })} className="mt-0.5" />
          <Label htmlFor="consent" className="font-normal text-sm">
            I consent to sharing my profile details with potential swap partners once matched.
          </Label>
        </div>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
