import Link from "next/link";
import { ArrowLeftRight, ShieldAlert } from "lucide-react";

export function ComplianceDisclaimer() {
  return (
    <section className="container pb-4">
      <div className="rounded-2xl border border-border bg-slate-50 p-6 flex gap-4">
        <ShieldAlert className="h-6 w-6 text-slate-500 shrink-0" />
        <p className="text-sm text-slate-600">
          <strong className="text-ink">Compliance notice:</strong> Z-Swap is a private platform that
          connects government workers who wish to arrange mutual transfers. Z-Swap only connects
          users and does not guarantee transfer approval. All swaps and any private incentives must
          comply with Zambian law and applicable public service regulations. Final transfer approval
          rests solely with the relevant government authority.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-12">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-z-gradient text-white">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            Z-<span className="text-gradient">Swap</span>
          </Link>
          <p className="text-sm text-slate-500">Swap. Move. Serve.</p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-ink mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/register" className="hover:text-primary-600">Sign up</Link></li>
            <li><Link href="/matches" className="hover:text-primary-600">Find a match</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm text-ink mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-primary-600">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-600">Refund Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm text-ink mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>support@zswap.zm</li>
            <li>+260 21 1 234 567</li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 pt-6 border-t border-border text-xs text-slate-400">
        © {new Date().getFullYear()} Z-Swap. Not a government agency. All rights reserved.
      </div>
    </footer>
  );
}
