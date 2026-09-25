"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, CheckCircle2, XCircle, Eye, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { initials, maskNRC } from "@/lib/utils";

type PendingUser = {
  id: string;
  fullName: string;
  nrcNumber: string;
  photoUrl: string | null;
  nrcDocUrl: string | null;
  selfieUrl: string | null;
  jobTitle: string;
  currentStationName: string;
  currentDistrict: string;
  currentProvince: string;
  department: { name: string } | null;
  createdAt: string;
};

type RecentUser = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  verificationStatus: "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
};

export function AdminVerifications() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [recent, setRecent] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingUser | null>(null);
  const [reason, setReason] = useState("");
  const [docsTarget, setDocsTarget] = useState<PendingUser | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/verifications");
    if (res.ok) {
      const data = await res.json();
      setPending(data.pending);
      setRecent(data.recent);
    } else {
      toast.error("Could not load pending verifications");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (user: PendingUser) => {
    setBusyId(user.id);
    const res = await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, decision: "VERIFIED" }),
    });
    setBusyId(null);
    if (res.ok) {
      toast.success("User verified");
      load();
    } else {
      toast.error("Could not verify user");
    }
  };

  const openReject = (user: PendingUser) => {
    setRejectTarget(user);
    setReason("");
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    setBusyId(rejectTarget.id);
    const res = await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: rejectTarget.id, decision: "REJECTED", reason: reason.trim() }),
    });
    setBusyId(null);
    if (res.ok) {
      toast.success("Registration rejected");
      setRejectTarget(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not reject user");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink">Pending verification ({pending.length})</h2>
      {pending.length === 0 && (
        <p className="text-sm text-slate-500">No pending registrations right now.</p>
      )}
      {pending.map((u) => (
        <Card key={u.id}>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={u.photoUrl ?? undefined} />
                <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm">{u.fullName}</p>
                <p className="text-xs text-slate-500">{u.department?.name} · {u.jobTitle} · NRC {maskNRC(u.nrcNumber)}</p>
                <p className="text-xs text-slate-500">{u.currentStationName}, {u.currentDistrict}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => setDocsTarget(u)}>
                <FileText className="h-3.5 w-3.5" /> Documents
              </Button>
              <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Profile</Button>
              <Button size="sm" variant="secondary" disabled={busyId === u.id} onClick={() => approve(u)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" disabled={busyId === u.id} onClick={() => openReject(u)}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <h2 className="text-lg font-bold text-ink pt-4">Recently decided</h2>
      {recent.length === 0 && (
        <p className="text-sm text-slate-500">No decisions made yet.</p>
      )}
      {recent.map((u) => (
        <Card key={u.id}>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={u.photoUrl ?? undefined} />
              <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">{u.fullName}</p>
              {u.verificationStatus === "REJECTED" && u.rejectionReason && (
                <p className="text-xs text-slate-500 truncate">Reason: {u.rejectionReason}</p>
              )}
            </div>
            <Badge variant={u.verificationStatus === "VERIFIED" ? "success" : "destructive"}>
              {u.verificationStatus === "VERIFIED" ? "Verified" : "Rejected"}
            </Badge>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.fullName}'s registration</DialogTitle>
            <DialogDescription>
              This reason will be shown to the applicant so they understand why, and can correct it if they reapply.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. NRC number doesn't match the name provided. Please resubmit with correct details."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busyId === rejectTarget?.id} onClick={submitReject}>
              Confirm rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docsTarget} onOpenChange={(open) => !open && setDocsTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{docsTarget?.fullName}'s documents</DialogTitle>
            <DialogDescription>
              Review the submitted NRC and selfie before approving or rejecting this registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {docsTarget?.nrcDocUrl ? (
              <a
                href={docsTarget.nrcDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                National ID (NRC) <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm text-slate-500">No NRC document uploaded.</p>
            )}
            {docsTarget?.selfieUrl ? (
            <a
                href={docsTarget.selfieUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                Selfie <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm text-slate-500">No selfie uploaded.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
