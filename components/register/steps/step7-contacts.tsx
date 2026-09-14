"use client";

import { toast } from "sonner";
import { useRegistrationStore } from "@/lib/stores/registration-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StepNav } from "../step-nav";

export function Step7Contacts() {
  const { data, update } = useRegistrationStore();

  const validate = () => {
    if (!/^0\d{9}$/.test(data.phone)) return toast.error("A valid primary phone is required (set in Step 1)"), false;
    if (!data.emergencyName.trim()) return toast.error("Enter an emergency contact name"), false;
    if (!/^0\d{9}$/.test(data.emergencyPhone)) return toast.error("Enter a valid emergency contact phone"), false;
    if (!data.emergencyRelation.trim()) return toast.error("Enter emergency contact relationship"), false;
    return true;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink mb-1">Contacts & Emergency</h2>
      <p className="text-sm text-slate-500 mb-6">Used for verification and safety — never shown publicly.</p>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>Primary phone number</Label>
          <Input className="mt-1.5" value={data.phone} onChange={(e) => update({ phone: e.target.value })} />
        </div>
        <div>
          <Label>Alternative phone number</Label>
          <Input className="mt-1.5" value={data.altPhone} onChange={(e) => update({ altPhone: e.target.value })} />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <Checkbox
            id="wa-same"
            checked={data.whatsappSameAsPrimary}
            onCheckedChange={(v) => update({ whatsappSameAsPrimary: Boolean(v), whatsapp: v ? data.phone : data.whatsapp })}
          />
          <Label htmlFor="wa-same" className="font-normal">Same as primary phone</Label>
        </div>

        {!data.whatsappSameAsPrimary && (
          <div className="md:col-span-2">
            <Label>WhatsApp number</Label>
            <Input className="mt-1.5" value={data.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} />
          </div>
        )}

        <div className="md:col-span-2">
          <Label>Email address</Label>
          <Input type="email" className="mt-1.5" value={data.email} onChange={(e) => update({ email: e.target.value })} />
        </div>

        <div className="md:col-span-2 border-t border-border pt-5 mt-1">
          <p className="text-sm font-bold text-ink mb-3">Emergency contact</p>
        </div>

        <div>
          <Label>Emergency contact name</Label>
          <Input className="mt-1.5" value={data.emergencyName} onChange={(e) => update({ emergencyName: e.target.value })} />
        </div>
        <div>
          <Label>Emergency contact phone</Label>
          <Input className="mt-1.5" value={data.emergencyPhone} onChange={(e) => update({ emergencyPhone: e.target.value })} />
        </div>
        <div>
          <Label>Relationship</Label>
          <Input className="mt-1.5" value={data.emergencyRelation} onChange={(e) => update({ emergencyRelation: e.target.value })} placeholder="e.g. Spouse, Parent, Sibling" />
        </div>
      </div>

      <StepNav onNext={validate} />
    </div>
  );
}
