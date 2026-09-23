"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Edit2, Loader2 } from "lucide-react";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { DEPARTMENTS } from "@/lib/data/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-ink text-right">{value}</span>
    </div>
  );
}

function Section({ title, step, setStep, children }: { title: string; step: number; setStep: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-ink">{title}</h3>
        <button onClick={() => setStep(step)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
          <Edit2 className="h-3 w-3" /> Edit
        </button>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

export function Step9Review() {
  const { data, setStep, update } = useRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dept = DEPARTMENTS.find((d) => d.id === data.departmentId);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          nrcNumber: data.nrcNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          password: data.password,
          departmentId: data.departmentId,
          jobTitle: data.jobTitle === "Other (specify)" ? data.jobTitleOther : data.jobTitle,
          salaryScale: data.salaryScale,
          currentStationName: data.currentStationName,
          currentProvince: data.currentProvince,
          currentDistrict: data.currentDistrict,
          desiredProvinces: data.desiredProvinces,
          desiredDistricts: data.desiredDistricts,
          incentivePreference: data.incentivePreference.toUpperCase(),
          agreedToTerms: data.agreedToTerms,
          consentSharedProfile: data.consentSharedProfile,
          promoCode: data.promoCode || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong. Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      // Account created — sign them in immediately so the registration fee
      // can be charged to an authenticated session, then send them to pay
      // it before verification even begins.
      const signInResult = await signIn("credentials", {
        identifier: data.email,
        password: data.password,
        redirect: false,
      });

      setSubmitting(false);

      if (signInResult?.error) {
        // Account exists, but auto-login failed for some reason — send them
        // to log in manually rather than losing the created account.
        toast.success("Account created. Please log in to pay your registration fee.");
        router.push("/login");
        return;
      }

      toast.success("Account created — one more step");
      router.push("/payment?context=registration");
    } catch (err) {
      setSubmitting(false);
      setError("Could not reach the server. Make sure the app is running and try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Review & Submit</h2>
      <p className="text-sm text-slate-500 mb-6">Check your details, then pay your registration fee. Admin verification happens after that.</p>

      <div className="space-y-4">
        <Section title="Personal Details" step={1} setStep={setStep}>
          <Row label="Full name" value={data.fullName} />
          <Row label="NRC number" value={data.nrcNumber} />
          <Row label="Date of birth" value={data.dateOfBirth} />
          <Row label="Gender" value={data.gender} />
          <Row label="Phone" value={data.phone} />
          <Row label="Email" value={data.email} />
        </Section>

        <Section title="Department" step={2} setStep={setStep}>
          <Row label="Ministry / Department" value={dept?.name} />
        </Section>

        <Section title="Job Details" step={3} setStep={setStep}>
          <Row label="Salary scale / Rank" value={data.salaryScale} />
          <Row label="Job title" value={data.jobTitle} />
          <Row label="Current station" value={data.currentStationName} />
          <Row label="Years of service" value={data.yearsOfService} />
        </Section>

        <Section title="Current Location" step={4} setStep={setStep}>
          <Row label="Province" value={data.currentProvince} />
          <Row label="District" value={data.currentDistrict} />
          <Row label="Classification" value={data.areaClassification} />
        </Section>

        <Section title="Preferred Swap Locations" step={5} setStep={setStep}>
          <Row label="Desired provinces" value={data.desiredProvinces.join(", ")} />
          <Row label="Desired districts" value={data.desiredDistricts.join(", ")} />
          <Row label="Willing to move to" value={data.willingToMove} />
          <Row label="Reason" value={data.swapReason} />
          <Row label="Urgency" value={data.urgency} />
        </Section>

        <Section title="Incentive" step={6} setStep={setStep}>
          <Row label="Preference" value={data.incentivePreference} />
          {data.incentiveAmountMin && (
            <Row label="Range (ZMW)" value={`${data.incentiveAmountMin} - ${data.incentiveAmountMax || "?"}`} />
          )}
        </Section>

        <Section title="Contacts & Documents" step={7} setStep={setStep}>
          <Row label="Emergency contact" value={data.emergencyName} />
          <Row label="Documents uploaded" value={[data.nrcDocName, data.selfieName].filter(Boolean).length + " files"} />
        </Section>
      </div>

      <div className="mt-6 rounded-2xl border border-border p-5">
        <Label htmlFor="promoCode" className="font-bold text-ink">
          Promo code <span className="font-normal text-slate-500">(optional)</span>
        </Label>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Were you referred by someone? Enter their code here.
        </p>
        <Input
          id="promoCode"
          value={data.promoCode}
          onChange={(e) => update({ promoCode: e.target.value.toUpperCase() })}
          placeholder="e.g. MERON10"
          className="uppercase"
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => setStep(8)}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating account..." : "Continue to payment"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-right text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
