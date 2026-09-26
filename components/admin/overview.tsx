"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { Users, ArrowLeftRight, Landmark, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVINCES } from "@/lib/data/locations";
import { formatZMW } from "@/lib/utils";

type Stats = {
  totalUsers: number;
  verifiedUsers: number;
  completedSwaps: number;
  totalRevenue: number;
  totalPayments: number;
  usersByProvince: { province: string; count: number }[];
  swapsByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Completed",
  MATCHED: "Matched",
  IN_NEGOTIATION: "In negotiation",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#16A34A",
  MATCHED: "#22C55E",
  IN_NEGOTIATION: "#F97316",
  PENDING: "#FDBA74",
  CANCELLED: "#94A3B8",
};

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      } else {
        toast.error("Could not load analytics");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500 text-center py-16">Loading analytics...</p>;
  }
  if (!stats) {
    return <p className="text-sm text-slate-500 text-center py-16">Could not load analytics.</p>;
  }

  const provincesCovered = stats.usersByProvince.filter((p) => p.count > 0).length;
  // Chart wants every province listed even at 0, so a thin province isn't
  // silently missing from the axis.
  const usersByProvinceChart = PROVINCES.map((p) => ({
    name: p.name,
    users: stats.usersByProvince.find((u) => u.province === p.name)?.count ?? 0,
  }));

  const swapStatusData = stats.swapsByStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: STATUS_LABEL[s.status] ?? s.status,
      value: s.count,
      color: STATUS_COLOR[s.status] ?? "#94A3B8",
    }));

  const statCards = [
    { icon: Users, label: "Total users", value: stats.totalUsers.toLocaleString(), accent: "orange" as const },
    { icon: ArrowLeftRight, label: "Successful swaps", value: stats.completedSwaps.toLocaleString(), accent: "green" as const },
    { icon: Landmark, label: "Revenue (request fees)", value: formatZMW(stats.totalRevenue), accent: "green" as const },
    { icon: MapPin, label: "Provinces covered", value: `${provincesCovered} / ${PROVINCES.length}`, accent: "orange" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shrink-0 ${c.accent === "orange" ? "bg-primary-600" : "bg-secondary-600"}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-ink leading-none">{c.value}</p>
                <p className="text-xs text-slate-500 mt-1">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Users by Province</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersByProvinceChart} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={60} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#FFF7ED" }} />
                <Bar dataKey="users" fill="#EA580C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Request Fee Revenue (ZMW)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByMonth} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={3} dot={{ fill: "#16A34A" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Swap Requests by Status</CardTitle></CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            {swapStatusData.length === 0 ? (
              <p className="text-sm text-slate-500">No swap requests yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={swapStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {swapStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
