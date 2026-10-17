import { ImageResponse } from "next/og";

// Share preview shown by Facebook, WhatsApp, X, LinkedIn etc. when someone
// posts a z-swap.com link. Without this, Facebook grabbed the first <img>
// on the page (a small stock avatar) and stretched it.

export const runtime = "edge";
export const alt = "Z-Swap — Swap. Move. Serve. Mutual transfer swaps for Zambian public service workers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const provinces = [
  "Lusaka",
  "Copperbelt",
  "Southern",
  "Central",
  "Eastern",
  "North-Western",
  "Western",
  "Northern",
  "Muchinga",
  "Luapula",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #FFF7ED 0%, #F0FDF4 100%)",
          fontFamily: "sans-serif",
          color: "#0F172A",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "linear-gradient(135deg, #F97316 0%, #16A34A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            {/* Same arrow-left-right icon as the site logo */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>
            <span>Z-</span>
            <span style={{ color: "#EA580C" }}>Sw</span>
            <span style={{ color: "#16A34A" }}>ap</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>
            Swap. Move. Serve.
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#334155", maxWidth: 1000, lineHeight: 1.3 }}>
            Find a mutual transfer partner — teachers, health workers, civil servants, police,
            defence and council workers.
          </div>
        </div>

        {/* Provinces strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {provinces.map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                background: "white",
                border: "2px solid #FED7AA",
                fontSize: 22,
                fontWeight: 600,
                color: "#9A3412",
              }}
            >
              {p}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              background: "#15803D",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
            }}
          >
            www.z-swap.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
