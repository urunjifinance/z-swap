"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, ArrowLeftRight, Landmark, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVINCES } from "@/lib/data/locations";

const usersByProvince = PROVINCES.map((p, i) => ({
  name: p.name,
  users: [2140, 1870, 1320, 980, 890, 640, 610, 540, 480, 430][i] ?? 300,
}));

const revenueByMonth = [
  { month: "Apr", revenue: 42000 },
  { month: "May", revenue: 51500 },
  { month: "Jun", revenue: 58200 },
  { month: "Jul", revenue: 64800 },
  { month: "Aug", revenue: 71300 },
  { month: "Sep", revenue: 68900 },
];

const swapStatusData = [
  { name: "Completed", value: 412, color: "#16A34A" },
  { name: "Matched", value: 268, color: "#22C55E" },
  { name: "In negotiation", value: 154, color: "#F97316" },
  { name: "Pending", value: 96, color: "#FDBA74" },
];

const statCards = [
  { icon: Users, label: "Total users", value: "12,438", accent: "orange" as const },
  { icon: ArrowLeftRight, label: "Successful swaps", value: "412", accent: "green" as const },
  { icon: Landmark, label: "Revenue (request fees)", value: "ZMW 356,900", accent: "green" as const },
  { icon: MapPin, label: "Provinces covered", value: "10 / 10", accent: "orange" as const },
];

export function AdminOverview() {
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
              <BarChart data={usersByProvince} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={60} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
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
              <LineChart data={revenueByMonth} margin={{ left: -10 }}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
