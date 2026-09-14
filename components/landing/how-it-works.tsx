"use client";

import { motion } from "framer-motion";
import { UserPlus, Sparkles, MessagesSquare, CreditCard, FileCheck2 } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "Post your details", desc: "Tell us your current station and where you'd like to move." },
  { icon: Sparkles, title: "Get matched instantly", desc: "Our matching engine finds workers with reciprocal moves." },
  { icon: MessagesSquare, title: "Chat and verify", desc: "Message your match, share documents, and agree on terms." },
  { icon: CreditCard, title: "Pay request fee", desc: "A small non-refundable fee confirms your swap request." },
  { icon: FileCheck2, title: "Begin official transfer", desc: "Take your agreement through the official transfer process." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-sm font-bold text-primary-600 uppercase tracking-wide">How it works</span>
        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-ink">Five simple steps to your next station</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative glass rounded-2xl p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-z-gradient text-white shadow-glow">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="absolute top-3 right-4 text-3xl font-black text-primary-100">{i + 1}</div>
            <h3 className="font-bold text-ink mb-1.5">{s.title}</h3>
            <p className="text-sm text-slate-600">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
