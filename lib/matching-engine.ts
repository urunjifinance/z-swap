import { SampleUser } from "./data/sample-users";

/**
 * Z-Swap matching score (0-100).
 * Weighted on:
 *  - Reciprocal province/district match (40 pts) — does A want B's current area, and B want A's?
 *  - Same/compatible ministry & cadre (25 pts)
 *  - Incentive compatibility (15 pts) — e.g. one "wants", other "offers"
 *  - Most Wanted status alignment (10 pts)
 *  - Urgency alignment (10 pts)
 */
export function computeMatchScore(a: SampleUser, b: SampleUser): number {
  let score = 0;

  // Reciprocity: does A's desired province include B's current province, and vice versa?
  const aWantsB = a.desiredProvinces.includes(b.currentProvince) || a.desiredDistricts.includes(b.currentDistrict);
  const bWantsA = b.desiredProvinces.includes(a.currentProvince) || b.desiredDistricts.includes(a.currentDistrict);
  if (aWantsB && bWantsA) score += 40;
  else if (aWantsB || bWantsA) score += 18;

  // Same department = compatible cadre
  if (a.departmentId === b.departmentId) score += 25;
  else score += 5; // cross-department swaps are rarer but not impossible for generalist roles

  // Incentive compatibility
  const incentiveCompatible =
    (a.incentivePreference === "want" && b.incentivePreference === "offer") ||
    (a.incentivePreference === "offer" && b.incentivePreference === "want") ||
    a.incentivePreference === "none" ||
    b.incentivePreference === "none" ||
    a.incentivePreference === "negotiate" ||
    b.incentivePreference === "negotiate";
  if (incentiveCompatible) score += 15;

  // Most wanted alignment — a most-wanted-station holder swapping out is valuable
  if (a.mostWanted || b.mostWanted) score += 10;

  // Urgency
  const urgencyWeight: Record<string, number> = { Low: 2, Medium: 5, High: 8, "Very High": 10 };
  score += Math.round(((urgencyWeight[a.urgency] ?? 0) + (urgencyWeight[b.urgency] ?? 0)) / 2);

  return Math.min(100, score);
}

export function findMatchesFor(user: SampleUser, pool: SampleUser[]): (SampleUser & { matchScore: number })[] {
  return pool
    .filter((u) => u.id !== user.id)
    .map((u) => ({ ...u, matchScore: computeMatchScore(user, u) }))
    .filter((u) => u.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore);
}
