"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Edit2, Loader2 } from "lucide-react";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { DEPARTMENTS } from "@/lib/data/departments";
import { Button } from "@/components/ui/button";

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
  const { data, setStep, reset } = useRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong. Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
      toast.success("Registration submitted for review");
    } catch (err) {
      setSubmitting(false);
      setError("Could not reach the server. Make sure the app is running and try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">Your profile is under review</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          You will be notified once verified. You can browse matches now, but you&apos;ll need
          to be verified before requesting a swap.
        </p>
        <Button
          size="lg"
          onClick={() => {
            reset();
            router.push("/dashboard");
          }}
        >
          Go to my dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Review & Submit</h2>
      <p className="text-sm text-slate-500 mb-6">Check your details before submitting for admin verification.</p>

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

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => setStep(8)}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit for verification"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-right text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
