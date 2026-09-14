import Link from "next/link";
import { MessageSquare, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SampleUser } from "@/lib/data/sample-users";
import { initials } from "@/lib/utils";

export function MatchCard({ user }: { user: SampleUser & { matchScore?: number } }) {
  const dept = DEPARTMENTS.find((d) => d.id === user.departmentId);

  return (
    <Card className="hover:shadow-glass-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photo} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-ink text-sm">{user.name}</p>
              <p className="text-xs text-slate-500">{user.jobTitle} · {dept?.name}</p>
            </div>
          </div>
          {user.mostWanted && <Badge variant="mostWanted">Most Wanted</Badge>}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
          <MapPin className="h-3.5 w-3.5 text-primary-600 shrink-0" />
          <span className="font-medium">{user.currentDistrict}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-medium">{user.desiredDistricts[0] ?? user.desiredProvinces[0]}</span>
        </div>

        {user.incentivePreference !== "none" && (
          <p className="text-xs text-secondary-700 bg-secondary-50 rounded-lg px-2.5 py-1 inline-block mt-1">
            {user.incentivePreference === "want" && "Requesting incentive"}
            {user.incentivePreference === "offer" && "Offering incentive"}
            {user.incentivePreference === "negotiate" && "Open to negotiate incentive"}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-z-gradient" style={{ width: `${user.matchScore ?? 0}%` }} />
            </div>
            <span className="text-xs font-bold text-primary-700">{user.matchScore ?? 0}% match</span>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/chat/${user.id}`}>
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
