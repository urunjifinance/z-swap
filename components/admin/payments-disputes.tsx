"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_SWAP_REQUESTS, SAMPLE_USERS, REQUEST_FEE_ZMW } from "@/lib/data/sample-users";
import { formatZMW, formatDate } from "@/lib/utils";

export function AdminPayments() {
  const paid = SAMPLE_SWAP_REQUESTS.filter((r) => r.feePaid);
  const totalRevenue = paid.length * REQUEST_FEE_ZMW;

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
              {paid.map((r) => {
                const user = SAMPLE_USERS.find((u) => u.id === r.userId);
                return (
                  <tr key={r.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.txnId}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{user?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{formatZMW(REQUEST_FEE_ZMW)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3"><Badge variant="success">Reconciled</Badge></td>
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

const SAMPLE_REPORTS = [
  { id: "r1", reporter: "Chola Mwansa", reported: "Unknown user", reason: "Requested payment outside the platform", status: "open" },
  { id: "r2", reporter: "Bwalya Chishimba", reported: "Natasha Zulu", reason: "Unresponsive after fee payment", status: "reviewing" },
  { id: "r3", reporter: "Kelvin Banda", reported: "Precious Mumba", reason: "Suspected duplicate account", status: "resolved" },
];

export function AdminDisputes() {
  const statusVariant: Record<string, "warning" | "pending" | "success"> = {
    open: "warning",
    reviewing: "pending",
    resolved: "success",
  };

  return (
    <div className="space-y-3">
      {SAMPLE_REPORTS.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink">{r.reporter} reported {r.reported}</p>
              <p className="text-xs text-slate-500 mt-0.5">{r.reason}</p>
            </div>
            <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
