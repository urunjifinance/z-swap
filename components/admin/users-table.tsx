"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEPARTMENTS } from "@/lib/data/departments";
import { PROVINCES } from "@/lib/data/locations";
import { SAMPLE_USERS } from "@/lib/data/sample-users";
import { initials, maskNRC } from "@/lib/utils";

export function AdminUsers() {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");

  const filtered = SAMPLE_USERS.filter((u) => {
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (province && u.currentProvince !== province) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search by name..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select className="w-48" value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">Any province</option>
          {PROVINCES.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Department</th>
                <th className="text-left px-4 py-3 font-semibold">Salary scale</th>
                <th className="text-left px-4 py-3 font-semibold">Province</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const dept = DEPARTMENTS.find((d) => d.id === u.departmentId);
                return (
                  <tr key={u.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.photo} />
                          <AvatarFallback>{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-ink">{u.name}</p>
                          <p className="text-xs text-slate-400">NRC {maskNRC(u.nrc)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{dept?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.salaryScale}</td>
                    <td className="px-4 py-3 text-slate-600">{u.currentProvince}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.verified ? "success" : "pending"}>{u.verified ? "Verified" : "Pending"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
