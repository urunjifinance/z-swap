"use client";

import { useEffect, useState } from "react";
import { Search, Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  registrationFeePaid: boolean;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    } else {
      toast.error("Could not load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (q && !u.fullName.toLowerCase().includes(q.toLowerCase())) return false;
    if (province && u.currentProvince !== province) return false;
    return true;
  });

  const updateUser = async (id: string, body: Partial<Pick<AdminUser, "verificationStatus" | "registrationFeePaid">>) => {
    setBusyId(id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    setBusyId(null);

    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    toast.success("Updated");
    load();
  };

  const approve = (u: AdminUser) => updateUser(u.id, { verificationStatus: "VERIFIED" });
  const reject = (u: AdminUser) => updateUser(u.id, { verificationStatus: "REJECTED" });
  // Waives the registration fee AND verifies in one action — for test accounts
  // or explicitly agreed special cases only. See app/api/admin/users/route.ts.
  const waiveAndVerify = (u: AdminUser) =>
    updateUser(u.id, { verificationStatus: "VERIFIED", registrationFeePaid: true });

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
                <th className="text-left px-4 py-3 font-semibold">Paid</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>
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
                    <Badge variant={u.registrationFeePaid ? "success" : "pending"}>
                      {u.registrationFeePaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.verificationStatus === "VERIFIED" ? "success" : "pending"}>
                      {u.verificationStatus === "VERIFIED" ? "Verified" : u.verificationStatus === "REJECTED" ? "Rejected" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {u.verificationStatus !== "VERIFIED" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => approve(u)} disabled={busyId === u.id}>
                          {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                      )}
                      {u.verificationStatus !== "REJECTED" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => reject(u)} disabled={busyId === u.id}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                      {!(u.verificationStatus === "VERIFIED" && u.registrationFeePaid) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Marks the account verified AND the registration fee as paid, without the user actually paying. Use only for test accounts or agreed special cases."
                          onClick={() => waiveAndVerify(u)}
                          disabled={busyId === u.id}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" /> Waive fee & verify
                        </Button>
                      )}
                    </div>
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
