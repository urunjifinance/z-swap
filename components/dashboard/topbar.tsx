"use client";

import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardTopbar({
  title,
  verified = false,
  avatarUrl,
  avatarInitials = "?",
}: {
  title: string;
  verified?: boolean;
  avatarUrl?: string;
  avatarInitials?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-white px-4 lg:px-8 py-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-1"><Menu className="h-5 w-5" /></button>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <Badge variant={verified ? "success" : "pending"}>
          {verified ? "Verified" : "Pending Verification"}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-muted">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary-600" />
        </button>
        <Avatar>
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback>{avatarInitials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
