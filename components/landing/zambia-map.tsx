"use client";

import { PROVINCES } from "@/lib/data/locations";

// Stylised (non-geographic-accurate) Zambia outline with province pins,
// positioned proportionally rather than by true lat/lng for a clean hero graphic.

const PIN_POSITIONS: Record<string, { x: number; y: number }> = {
  LSK: { x: 300, y: 300 },
  CB: { x: 260, y: 150 },
  SO: { x: 230, y: 340 },
  CE: { x: 280, y: 230 },
  EA: { x: 420, y: 220 },
  NW: { x: 140, y: 190 },
  WE: { x: 120, y: 310 },
  NO: { x: 330, y: 90 },
  MU: { x: 400, y: 130 },
  LP: { x: 330, y: 60 },
};

export function ZambiaMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 420" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>

      {/* Stylised Zambia silhouette (simplified blob approximating the shape) */}
      <path
        d="M120 90 L220 60 L330 50 L420 100 L460 170 L440 250 L400 320 L340 380 L260 390 L180 360 L130 310 L100 230 L90 160 Z"
        fill="url(#mapFill)"
        stroke="#EA580C"
        strokeOpacity="0.25"
        strokeWidth="2"
      />

      {/* Swap arrows between a few provinces to suggest movement */}
      <g opacity="0.85">
        <path d="M260 150 Q280 230 300 300" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 5" className="animate-swap-arrow" />
        <path d="M300 300 Q265 320 230 340" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 5" className="animate-swap-arrow" />
      </g>

      {PROVINCES.map((p) => {
        const pos = PIN_POSITIONS[p.code];
        if (!pos) return null;
        return (
          <g key={p.code} transform={`translate(${pos.x}, ${pos.y})`}>
            {p.mostWanted && (
              <circle r="14" fill="#F97316" opacity="0.25" className="animate-pulse-ring" />
            )}
            <circle r="7" fill={p.mostWanted ? "#EA580C" : "#16A34A"} stroke="white" strokeWidth="2" />
            <text y="-14" textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="700">
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
