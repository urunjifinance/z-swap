"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOST_WANTED_STATIONS } from "@/lib/data/locations";

export function MostWanted() {
  return (
    <section id="most-wanted" className="bg-z-gradient-soft py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 uppercase tracking-wide">
            <Flame className="h-4 w-4" /> Most Wanted Places
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-ink">
            High-demand stations across Zambia
          </h2>
          <p className="mt-3 text-slate-600">
            These locations see the most swap requests. Workers currently stationed here are in a strong position to negotiate.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOST_WANTED_STATIONS.map((s, i) => (
            <motion.div
              key={s.station}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass hover:shadow-glass-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="mostWanted">Most Wanted</Badge>
                    <span className="flex items-center gap-1 text-xs font-bold text-secondary-700">
                      <TrendingUp className="h-3.5 w-3.5" /> {s.demandIndex}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-ink">{s.station}</h3>
                  <p className="text-sm text-slate-500">{s.province} Province</p>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full bg-z-gradient rounded-full" style={{ width: `${s.demandIndex}%` }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
