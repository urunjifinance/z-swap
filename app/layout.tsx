import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

// NOTE: Using the system font stack (defined in tailwind.config.ts) instead
// of next/font/google so the build never depends on reaching Google Fonts —
// safer for CI/offline builds. Swap in next/font/google's Inter here if you
// want a bundled webfont instead.

const siteDescription =
  "Z-Swap helps Zambian government workers — teachers, health workers, civil servants, police, defence and council workers — find mutual transfer swaps across all 10 provinces.";

export const metadata: Metadata = {
  // Absolute base so og:image / og:url resolve to https://www.z-swap.com/...
  metadataBase: new URL("https://www.z-swap.com"),
  title: "Z-Swap | Swap. Move. Serve.",
  description: siteDescription,
  openGraph: {
    type: "website",
    url: "https://www.z-swap.com",
    siteName: "Z-Swap",
    title: "Z-Swap | Swap. Move. Serve.",
    description:
      "Find a mutual transfer partner across all 10 provinces of Zambia — teachers, health workers, civil servants, police, defence and council workers.",
    locale: "en_ZM",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z-Swap | Swap. Move. Serve.",
    description: "Find a mutual transfer partner across all 10 provinces of Zambia.",
  },
  keywords: [
    "Zambia government transfer swap",
    "teacher transfer swap Zambia",
    "civil service swap",
    "Z-Swap",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
