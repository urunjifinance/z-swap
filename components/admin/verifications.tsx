"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SAMPLE_USERS } from "@/lib/data/sample-users";
import { initials, maskNRC } from "@/lib/utils";

export function AdminVerifications() {
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  const pending = SAMPLE_USERS.filter((u) => !u.verified);
  const rest = SAMPLE_USERS.filter((u) => u.verified);

  const decide = (id: string, decision: "approved" | "rejected") => {
    setDecided((d) => ({ ...d, [id]: decision }));
    toast.success(decision === "approved" ? "User verified" : "Registration rejected");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink">Pending verification ({pending.filter((u) => !decided[u.id]).length})</h2>
      {pending.map((u) => {
        const dept = DEPARTMENTS.find((d) => d.id === u.departmentId);
        const decision = decided[u.id];
        return (
          <Card key={u.id}>
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={u.photo} />
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm">{u.name}</p>
                  <p className="text-xs text-slate-500">{dept?.name} · {u.jobTitle} · NRC {maskNRC(u.nrc)}</p>
                  <p className="text-xs text-slate-500">{u.currentStation}, {u.currentDistrict}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm"><FileText className="h-3.5 w-3.5" /> Documents</Button>
                <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Profile</Button>
                {decision ? (
                  <Badge variant={decision === "approved" ? "success" : "destructive"}>
                    {decision === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => decide(u.id, "approved")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => decide(u.id, "rejected")}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <h2 className="text-lg font-bold text-ink pt-4">Recently verified</h2>
      {rest.map((u) => (
        <Card key={u.id}>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={u.photo} />
              <AvatarFallback>{initials(u.name)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-ink flex-1">{u.name}</p>
            <Badge variant="success">Verified</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
