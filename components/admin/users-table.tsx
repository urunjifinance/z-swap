"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PROVINCES } from "@/lib/data/locations";
import { initials, maskNRC } from "@/lib/utils";

type AdminUser = {
  id: string;
  fullName: string;
  nrcNumber: string;
  photoUrl: string | null;
  department: { name: string } | null;
  salaryScale: string;
  currentProvince: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error("Could not load users");
      }
      setLoading(false);
    })();
  }, []);

  const filtered = users.filter((u) => {
    if (q && !u.fullName.toLowerCase().includes(q.toLowerCase())) return false;
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
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        {u.photoUrl && <AvatarImage src={u.photoUrl} />}
                        <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-ink">{u.fullName}</p>
                        <p className="text-xs text-slate-400">NRC {maskNRC(u.nrcNumber)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.department?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.salaryScale}</td>
                  <td className="px-4 py-3 text-slate-600">{u.currentProvince}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.verificationStatus === "VERIFIED" ? "success" : "pending"}>
                      {u.verificationStatus === "VERIFIED" ? "Verified" : u.verificationStatus === "REJECTED" ? "Rejected" : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
