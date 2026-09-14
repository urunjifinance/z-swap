"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#most-wanted", label: "Most Wanted" },
  { href: "#incentives", label: "Incentives" },
  { href: "#testimonials", label: "Testimonials" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span className="text-ink">
            Z-<span className="text-gradient">Swap</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm font-medium text-slate-600" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
