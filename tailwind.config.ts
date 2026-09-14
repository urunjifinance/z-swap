import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#EA580C", // z-orange
          foreground: "#FFFFFF",
          50: "#FFF7ED",
          100: "#FFEDD5",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        secondary: {
          DEFAULT: "#15803D", // z-green
          foreground: "#FFFFFF",
          50: "#F0FDF4",
          100: "#DCFCE7",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: "#0F172A",
      },
      backgroundImage: {
        "z-gradient": "linear-gradient(135deg, #F97316 0%, #16A34A 100%)",
        "z-gradient-soft": "linear-gradient(135deg, #FFF7ED 0%, #F0FDF4 100%)",
        "z-gradient-reverse": "linear-gradient(135deg, #16A34A 0%, #F97316 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.08)",
        "glass-lg": "0 20px 60px -10px rgba(15, 23, 42, 0.15)",
        glow: "0 0 40px -5px rgba(249, 115, 22, 0.35)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "pulse-ring": { "0%": { transform: "scale(0.9)", opacity: "1" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
        "gradient-shift": { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "swap-arrow": { "0%": { transform: "translateX(-6px)", opacity: "0.4" }, "50%": { transform: "translateX(6px)", opacity: "1" }, "100%": { transform: "translateX(-6px)", opacity: "0.4" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "swap-arrow": "swap-arrow 2.5s ease-in-out infinite",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
