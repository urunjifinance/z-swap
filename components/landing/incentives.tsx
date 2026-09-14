"use client";

import { HandCoins, MapPinned, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Incentives() {
  return (
    <section id="incentives" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-sm font-bold text-primary-600 uppercase tracking-wide">Swap Incentives</span>
        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-ink">Private arrangements, your choice</h2>
        <p className="mt-3 text-slate-600">
          Workers in most-wanted places may request a private incentive to give up their station.
          Workers in rural or remote areas may offer one to secure a preferred move.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card className="border-2 border-primary-100">
          <CardContent className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
              <MapPinned className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-ink mb-2">In a most-wanted place?</h3>
            <p className="text-sm text-slate-600">
              You can request a private incentive from a worker who wants to move into your station,
              in exchange for agreeing to the swap.
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-secondary-100">
          <CardContent className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700 mb-4">
              <HandCoins className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-ink mb-2">In a rural or remote area?</h3>
            <p className="text-sm text-slate-600">
              You can offer an incentive to a worker in your desired station to encourage them
              to accept a swap into your current area.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 max-w-4xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Incentives are private arrangements between users. All swaps and incentives must comply
          with Zambian law and public service regulations. Z-Swap only connects users and is not a
          party to any incentive agreement.
        </p>
      </div>
    </section>
  );
}
