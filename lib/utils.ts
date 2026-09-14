import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZMW(amount: number) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-ZM", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function maskNRC(nrc: string) {
  // e.g. 123456/78/1 -> 1234**/**/1
  if (!nrc) return "";
  const parts = nrc.split("/");
  if (parts.length !== 3) return nrc.slice(0, 4) + "*".repeat(Math.max(nrc.length - 4, 0));
  const [a, b, c] = parts;
  return `${a.slice(0, 4)}${"*".repeat(Math.max(a.length - 4, 0))}/**/${c}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function generateTxnId() {
  return "ZSW-" + Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-5);
}
