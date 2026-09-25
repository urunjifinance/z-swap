import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { NewSwapRequestForm } from "@/components/swap/new-swap-request-form";

// Server component: loads the real logged-in worker's own current-station
// details (no more hardcoded SAMPLE_USERS[0]) and hands them to the client
// form, which now actually POSTs to /api/swap-requests instead of just
// toasting "success" and redirecting without saving anything.
export default async function NewSwapRequestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardTopbar
          title="New Swap Request"
          verified={user.verificationStatus === "VERIFIED"}
          avatarUrl={user.photoUrl ?? undefined}
          avatarInitials={user.fullName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("")}
        />

        <div className="p-4 lg:p-8 max-w-3xl">
          <NewSwapRequestForm
            currentStation={user.currentStationName}
            currentDistrict={user.currentDistrict}
            currentProvince={user.currentProvince}
            departmentId={user.departmentId}
            cadre={user.jobTitle}
            canSubmit={user.registrationFeePaid && user.verificationStatus === "VERIFIED"}
          />
        </div>
      </div>
    </div>
  );
}
