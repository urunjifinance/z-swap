import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

// NOTE: Using the system font stack (defined in tailwind.config.ts) instead
// of next/font/google so the build never depends on reaching Google Fonts —
// safer for CI/offline builds. Swap in next/font/google's Inter here if you
// want a bundled webfont instead.

export const metadata: Metadata = {
  title: "Z-Swap | Swap. Move. Serve.",
  description:
    "Z-Swap helps Zambian government workers — teachers, health workers, civil servants, police, defence and council workers — find mutual transfer swaps across all 10 provinces.",
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
