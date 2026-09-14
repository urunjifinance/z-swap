"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    name: "Mutinta H.",
    role: "Teacher, Western Province",
    quote: "I had been trying to transfer closer to my family for three years. Z-Swap matched me with a teacher in Lusaka within two weeks.",
    img: 47,
  },
  {
    name: "Bwalya C.",
    role: "Registered Nurse, Luapula Province",
    quote: "The chat feature let me verify my match's documents before we even applied officially. It gave me real confidence in the process.",
    img: 33,
  },
  {
    name: "Kelvin B.",
    role: "Zambia Police Service",
    quote: "Straightforward and transparent. I knew exactly what the request fee covered, and there were no surprise costs.",
    img: 51,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-z-gradient-soft py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-bold text-primary-600 uppercase tracking-wide">Testimonials</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-ink">Trusted by workers across Zambia</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="glass">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4 text-primary-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/64?img=${t.img}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
