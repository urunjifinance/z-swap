"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Promoter {
  id: string;
  name: string;
  phone: string | null;
  code: string;
  payoutRate: number;
  status: string;
  createdAt: string;
  paidReferrals: number;
  totalReferrals: number;
}

export function AdminPromoters() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [payoutRate, setPayoutRate] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/promoters");
    if (res.ok) setPromoters(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/admin/promoters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || undefined,
        code: code.toUpperCase(),
        payoutRate: payoutRate ? Number(payoutRate) : 0,
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(result.error || "Failed to create promoter.");
      return;
    }

    setName("");
    setPhone("");
    setCode("");
    setPayoutRate("");
    setShowForm(false);
    load();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

    const res = await fetch(`/api/admin/promoters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setTogglingId(null);

    if (res.ok) {
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Marketers with a unique code that tracks which paid users they referred.
        </p>
        <Button type="button" onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" /> Add promoter
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meron Banda" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Phone (optional)</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0977123456" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MERON10"
                  className="uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Payout rate (ZMW per paid referral)</label>
                <Input
                  type="number"
                  value={payoutRate}
                  onChange={(e) => setPayoutRate(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate} disabled={submitting || !name || !code}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Saving..." : "Save promoter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Payout rate</th>
                <th className="text-left px-4 py-3 font-semibold">Paid referrals</th>
                <th className="text-left px-4 py-3 font-semibold">Total signups</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && promoters.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                    No promoters yet.
                  </td>
                </tr>
              )}
              {promoters.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-primary-700">{p.code}</td>
                  <td className="px-4 py-3 text-slate-600">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">K{p.payoutRate}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{p.paidReferrals}</td>
                  <td className="px-4 py-3 text-slate-600">{p.totalReferrals}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "ACTIVE" ? "success" : "pending"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      disabled={togglingId === p.id}
                    >
                      {togglingId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : p.status === "ACTIVE" ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </Button>
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
