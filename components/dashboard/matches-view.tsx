"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { MatchCard } from "@/components/dashboard/match-card";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PROVINCES } from "@/lib/data/locations";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SampleUser } from "@/lib/data/sample-users";

// Renders the filter controls and the (already-scored, real) match list
// handed down from the server component. No mock/sample data here — the
// list passed in comes from real verified users in the database.
export function MatchesView({ matches }: { matches: (SampleUser & { matchScore: number })[] }) {
  const [province, setProvince] = useState("");
  const [dept, setDept] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = matches.filter((m) => {
    if (province && m.currentProvince !== province) return false;
    if (dept && m.departmentId !== dept) return false;
    if (verifiedOnly && !m.verified) return false;
    return true;
  });

  return (
    <>
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Filter className="h-4 w-4" /> Filters
          </span>
          <Select className="w-44" value={province} onChange={(e) => setProvince(e.target.value)}>
            <option value="">Any province</option>
            {PROVINCES.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
          </Select>
          <Select className="w-56" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Any ministry / department</option>
            {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 ml-auto">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded" />
            Verified only
          </label>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500">{filtered.length} match{filtered.length !== 1 ? "es" : ""} found for your desired locations</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <MatchCard key={m.id} user={m} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full text-center py-12">
            {matches.length === 0
              ? "No matches yet — they'll appear here once another verified worker's desired location matches yours."
              : "No matches found with these filters. Try widening your search."}
          </p>
        )}
      </div>
    </>
  );
}
