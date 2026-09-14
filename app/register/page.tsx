import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { RegistrationWizard } from "@/components/register/wizard";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-z-gradient-soft py-10">
      <div className="container">
        <Link href="/" className="flex items-center justify-center gap-2 font-extrabold text-lg mb-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          Z-<span className="text-gradient">Swap</span>
        </Link>
        <RegistrationWizard />
      </div>
    </main>
  );
}
