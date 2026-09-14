"use client";

import Link from "next/link";
import { ArrowLeftRight, LayoutDashboard, Users, ShieldCheck, CreditCard, Flag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "overview", label: "Analytics", icon: LayoutDashboard },
  { id: "verifications", label: "Verification Approvals", icon: ShieldCheck },
  { id: "users", label: "Users", icon: Users },
  { id: "payments", label: "Payments & Revenue", icon: CreditCard },
  { id: "disputes", label: "Disputes & Reports", icon: Flag },
];

export function AdminSidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-white h-screen sticky top-0 py-6 px-4">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-lg mb-8 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
          <ArrowLeftRight className="h-5 w-5" />
        </span>
        Z-<span className="text-gradient">Swap</span>
        <span className="text-xs font-bold text-slate-400 ml-auto">ADMIN</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors text-left",
              active === item.id ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-muted"
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </button>
        ))}
      </nav>

      <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-red-50 border-t border-border pt-4 mt-4">
        <LogOut className="h-4.5 w-4.5" /> Log out
      </Link>
    </aside>
  );
}
