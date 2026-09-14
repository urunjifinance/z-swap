"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZambiaMap } from "./zambia-map";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-z-gradient-soft">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary-200/40 blur-3xl" />

      <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-primary-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Built for Zambian public service workers
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.05]">
            Swap. Move. <span className="text-gradient">Serve.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Z-Swap connects teachers, health workers, civil servants, police,
            defence and council workers across all 10 provinces to find
            mutual transfer partners — fast, transparent, and built around
            how public service transfers actually work.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Post a Swap Request <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/matches">
                <Search className="h-4 w-4" /> Find a Match
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[12, 32, 44, 51].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/64?img=${i}`}
                  alt=""
                  className="h-10 w-10 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-bold text-ink flex items-center gap-1">
                <Users className="h-4 w-4 text-primary-600" /> 12,400+ workers
              </span>
              already on Z-Swap across Zambia
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="glass rounded-3xl p-6 animate-float">
            <ZambiaMap className="w-full h-auto" />
          </div>
          <div className="absolute -bottom-6 -left-6 glass rounded-2xl px-5 py-3 shadow-glass-lg">
            <p className="text-xs text-slate-500">Match found</p>
            <p className="text-sm font-bold text-ink">Mongu ⇄ Lusaka · 94% match</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
