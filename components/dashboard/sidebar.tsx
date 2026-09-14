"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  MessageSquare,
  CreditCard,
  UserCircle,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/swap/new", label: "My Swap Requests", icon: ArrowLeftRight },
  { href: "/matches", label: "My Matches", icon: Users },
  { href: "/chat/1", label: "Chats", icon: MessageSquare },
  { href: "/payment", label: "Payments & Receipts", icon: CreditCard },
  { href: "/dashboard#profile", label: "Profile", icon: UserCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-white h-screen sticky top-0 py-6 px-4">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-lg mb-8 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
          <ArrowLeftRight className="h-5 w-5" />
        </span>
        Z-<span className="text-gradient">Swap</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href.split("#")[0];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-muted"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 space-y-1">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-muted">
          <Bell className="h-4.5 w-4.5" /> Notifications
        </button>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-red-50">
          <LogOut className="h-4.5 w-4.5" /> Log out
        </Link>
      </div>
    </aside>
  );
}
