"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftRight, Loader2, Gift } from "lucide-react";

interface Stats {
  name: string;
  code: string;
  status: string;
  paidReferrals: number;
  totalReferrals: number;
}

export default function PromoStatusPage() {
  const params = useParams();
  const code = (params.code as string) || "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/promo-status/${code}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not load stats.");
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach the server.");
        setLoading(false);
      });
  }, [code]);

  return (
    <main className="min-h-screen bg-z-gradient-soft py-10">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 font-extrabold text-lg mb-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-gradient text-white">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          Z-<span className="text-gradient">Swap</span>
        </div>

        <div className="glass rounded-3xl p-8 text-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              <p className="text-sm text-slate-500">Loading your stats...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-8">
              <p className="font-semibold text-destructive">{error}</p>
              <p className="text-sm text-slate-500 mt-2">
                Double check the link, or contact Z-Swap if you think this is a mistake.
              </p>
            </div>
          )}

          {!loading && stats && (
            <>
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary-50 mx-auto mb-4">
                <Gift className="h-6 w-6 text-primary-600" />
              </div>
              <h1 className="text-xl font-bold text-ink mb-1">{stats.name}</h1>
              <p className="text-sm text-slate-500 mb-6">
                Your code: <span className="font-mono font-semibold text-primary-700">{stats.code}</span>
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-3xl font-extrabold text-ink">{stats.paidReferrals}</p>
                  <p className="text-xs text-slate-500 mt-1">Paid referrals</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-3xl font-extrabold text-ink">{stats.totalReferrals}</p>
                  <p className="text-xs text-slate-500 mt-1">Total signups</p>
                </div>
              </div>

              {stats.status !== "ACTIVE" && (
                <p className="text-xs text-amber-600 mt-4">
                  Note: your code is currently inactive.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
