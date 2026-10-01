// Full years between a date of first appointment and today (or `now`).
// Returns null for an empty, invalid or future date.
export function yearsSince(date: string | Date | null | undefined, now: Date = new Date()): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime()) || d > now) return null;
  let years = now.getFullYear() - d.getFullYear();
  const beforeAnniversary =
    now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
}
