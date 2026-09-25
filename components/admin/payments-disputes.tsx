"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatZMW, formatDate } from "@/lib/utils";

type AdminPayment = {
  id: string;
  txnId: string;
  amount: number;
  method: string;
  createdAt: string;
  user: { id: string; fullName: string };
};

export function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setTotalRevenue(data.totalRevenue);
      } else {
        toast.error("Could not load payments");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total reconciled revenue</span>
          <span className="text-2xl font-extrabold text-secondary-700">{formatZMW(totalRevenue)}</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Transaction</th>
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading && payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No reconciled payments yet.</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.txnId}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{p.user.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatZMW(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3"><Badge variant="success">Reconciled</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

type AdminReport = {
  id: string;
  reason: string;
  details: string | null;
  resolved: boolean;
  createdAt: string;
  reporter: { id: string; fullName: string };
  reported: { id: string; fullName: string };
};

export function AdminDisputes() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/reports");
    if (res.ok) {
      setReports(await res.json());
    } else {
      toast.error("Could not load reports");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (reportId: string) => {
    setBusyId(reportId);
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, resolved: true } : r)));
      toast.success("Report marked resolved");
    } else {
      toast.error("Could not update report");
    }
    setBusyId(null);
  };

  if (!loading && reports.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-12">No reports have been filed.</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink">{r.reporter.fullName} reported {r.reported.fullName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.reason}</p>
              {r.details && <p className="text-xs text-slate-400 mt-0.5">{r.details}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={r.resolved ? "success" : "warning"}>{r.resolved ? "resolved" : "open"}</Badge>
              {!r.resolved && (
                <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => resolve(r.id)}>
                  Mark resolved
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
