"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MatchCard } from "@/components/dashboard/match-card";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PROVINCES } from "@/lib/data/locations";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SAMPLE_USERS } from "@/lib/data/sample-users";
import { findMatchesFor } from "@/lib/matching-engine";

const CURRENT_USER = SAMPLE_USERS[0];

export default function MatchesPage() {
  const [province, setProvince] = useState("");
  const [dept, setDept] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const allMatches = useMemo(() => findMatchesFor(CURRENT_USER, SAMPLE_USERS), []);

  const filtered = allMatches.filter((m) => {
    if (province && m.currentProvince !== province) return false;
    if (dept && m.departmentId !== dept) return false;
    if (verifiedOnly && !m.verified) return false;
    return true;
  });

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar title="Find a Match" verified={CURRENT_USER.verified} />

        <div className="p-4 lg:p-8 space-y-6">
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
              <p className="text-sm text-slate-500 col-span-full text-center py-12">No matches found with these filters. Try widening your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
