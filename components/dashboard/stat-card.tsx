import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "orange",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: "orange" | "green";
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-white shrink-0",
            accent === "orange" ? "bg-primary-600" : "bg-secondary-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-extrabold text-ink leading-none">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
