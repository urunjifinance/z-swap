"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminOverview } from "@/components/admin/overview";
import { AdminVerifications } from "@/components/admin/verifications";
import { AdminUsers } from "@/components/admin/users-table";
import { AdminPayments, AdminDisputes } from "@/components/admin/payments-disputes";

const TITLES: Record<string, string> = {
  overview: "Analytics",
  verifications: "Verification Approvals",
  users: "Users",
  payments: "Payments & Revenue",
  disputes: "Disputes & Reports",
};

export default function AdminPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex">
      <AdminSidebar active={tab} onChange={setTab} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 border-b border-border bg-white px-4 lg:px-8 py-4 sticky top-0 z-20">
          <button className="lg:hidden p-1"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold text-ink">{TITLES[tab]}</h1>
        </div>

        <div className="p-4 lg:p-8">
          {tab === "overview" && <AdminOverview />}
          {tab === "verifications" && <AdminVerifications />}
          {tab === "users" && <AdminUsers />}
          {tab === "payments" && <AdminPayments />}
          {tab === "disputes" && <AdminDisputes />}
        </div>
      </div>
    </div>
  );
}
