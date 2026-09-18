import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeftRight, Users, MessageSquare, Receipt, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { MatchCard } from "@/components/dashboard/match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { findMatchesFor } from "@/lib/matching-engine";
import { dbUserToSampleUser } from "@/lib/user-mapper";
import { formatDate, formatZMW } from "@/lib/utils";

const statusColor: Record<string, "pending" | "success" | "warning" | "secondary"> = {
  PENDING: "pending",
  MATCHED: "secondary",
  IN_NEGOTIATION: "warning",
  COMPLETED: "success",
  CANCELLED: "pending",
};

// PROFILE_FIELDS drives the completion percentage — one point per filled field.
function profileCompletion(user: {
  photoUrl: string | null;
  physicalAddress: string | null;
  whatsapp: string | null;
  emergencyName: string | null;
}) {
  const fields = [user.photoUrl, user.physicalAddress, user.whatsapp, user.emergencyName];
  const filled = fields.filter(Boolean).length;
  return Math.round(20 + (filled / fields.length) * 80); // base 20% for having an account at all
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { swapRequests: { include: { payment: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!user) redirect("/login");

  const verified = user.verificationStatus === "VERIFIED";

  // Real matches: other verified users whose current province/district is
  // among this user's desired ones (and vice versa), scored client-side by
  // the same matching engine used elsewhere in the app.
  const others = await prisma.user.findMany({
    where: { id: { not: user.id }, verificationStatus: "VERIFIED" },
    take: 50,
  });
  const meAsSample = dbUserToSampleUser(user);
  const matches = findMatchesFor(meAsSample, others.map(dbUserToSampleUser)).slice(0, 2);

  const revenuePaid = await prisma.payment.aggregate({
    where: { userId: user.id, status: "SUCCESS" },
    _sum: { amount: true },
  });

  const activeRequests = user.swapRequests.filter((r: (typeof user.swapRequests)[number]) => r.status !== "CANCELLED" && r.status !== "COMPLETED");
  const completion = profileCompletion(user);

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar
          title={`Welcome back, ${user.fullName.split(" ")[0]}`}
          verified={verified}
          avatarUrl={user.photoUrl ?? undefined}
          avatarInitials={user.fullName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("")}
        />

        <div className="p-4 lg:p-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ArrowLeftRight} label="Active swap requests" value={activeRequests.length} />
            <StatCard icon={Users} label="Matches found" value={matches.length} accent="green" />
            <StatCard icon={MessageSquare} label="Unread messages" value={0} />
            <StatCard icon={Receipt} label="Fees paid" value={formatZMW(revenuePaid._sum.amount ?? 0)} accent="green" />
          </div>

          {!user.registrationFeePaid && (
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800 flex items-center justify-between gap-4 flex-wrap">
              <span>Your registration fee hasn&apos;t been paid yet — your account can&apos;t be verified until it is.</span>
              <Link href="/payment?context=registration" className="font-bold text-primary-700 hover:underline shrink-0">
                Pay now →
              </Link>
            </div>
          )}

          {user.registrationFeePaid && !verified && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your profile is pending admin verification. You can browse matches, but you&apos;ll need to be verified before posting a swap request.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>My Swap Requests</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/swap/new"><Plus className="h-4 w-4" /> New request</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.swapRequests.length === 0 && (
                    <p className="text-sm text-slate-500 py-6 text-center">No swap requests yet. Create one to start matching.</p>
                  )}
                  {user.swapRequests.map((r: (typeof user.swapRequests)[number]) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {r.currentDistrict} → {r.desiredDistrict}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Posted {formatDate(r.createdAt)} · {r.payment?.status === "SUCCESS" ? `Fee paid (${r.payment.txnId})` : "Fee pending"}
                        </p>
                      </div>
                      <Badge variant={statusColor[r.status] ?? "pending"}>{r.status.replace("_", " ").toLowerCase()}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card id="profile">
                <CardHeader>
                  <CardTitle>Profile completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-slate-500">{completion}% complete</span>
                    {completion < 100 && <span className="font-semibold text-primary-600">Add missing details in your profile</span>}
                  </div>
                  <Progress value={completion} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matches.length === 0 && (
                    <p className="text-sm text-slate-500 py-6 text-center">No matches yet — they'll appear here once another verified worker's desired location matches yours.</p>
                  )}
                  {matches.map((m) => (
                    <MatchCard key={m.id} user={m} />
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/matches">View all matches</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
