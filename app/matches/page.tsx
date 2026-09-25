import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MatchesView } from "@/components/dashboard/matches-view";
import { findMatchesFor } from "@/lib/matching-engine";
import { dbUserToSampleUser } from "@/lib/user-mapper";

// Server component: computes matches against real, verified users in the
// database (mirrors the dashboard's "Top Matches" logic). No sample/dummy
// data — the filter UI itself lives in the client MatchesView component.
export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) redirect("/login");

  const others = await prisma.user.findMany({
    where: { id: { not: user.id }, verificationStatus: "VERIFIED" },
  });

  const meAsSample = dbUserToSampleUser(user);
  const matches = findMatchesFor(meAsSample, others.map(dbUserToSampleUser));

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar
          title="Find a Match"
          verified={user.verificationStatus === "VERIFIED"}
          avatarUrl={user.photoUrl ?? undefined}
          avatarInitials={user.fullName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("")}
        />

        <div className="p-4 lg:p-8 space-y-6">
          <MatchesView matches={matches} />
        </div>
      </div>
    </div>
  );
}
