import { SampleUser } from "./data/sample-users";

// Bridges a real Prisma User row (flat strings, JSON-encoded arrays) into
// the SampleUser shape that the dashboard/match UI components already know
// how to render. Keeps the existing UI components reusable against real
// database rows instead of only the seed mock data.

const URGENCY_DISPLAY: Record<string, SampleUser["urgency"]> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  VERY_HIGH: "Very High",
};

const INCENTIVE_DISPLAY: Record<string, SampleUser["incentivePreference"]> = {
  WANT: "want",
  OFFER: "offer",
  NONE: "none",
  NEGOTIATE: "negotiate",
};

function safeParseArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface DbUserLike {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  nrcNumber: string;
  employmentNumber?: string | null;
  departmentId: string;
  jobTitle: string;
  salaryScale: string;
  yearsOfService: number;
  currentStationName: string;
  currentDistrict: string;
  currentProvince: string;
  desiredDistricts: string;
  desiredProvinces: string;
  verificationStatus: string;
  mostWanted: boolean;
  incentivePreference: string;
  incentiveAmountMin?: number | null;
  urgency: string;
  swapReason?: string | null;
}

export function dbUserToSampleUser(u: DbUserLike): SampleUser {
  return {
    id: u.id,
    name: u.fullName,
    photo: u.photoUrl || `https://i.pravatar.cc/150?u=${u.id}`,
    nrc: u.nrcNumber,
    employeeId: u.employmentNumber || "",
    departmentId: u.departmentId,
    jobTitle: u.jobTitle,
    salaryScale: u.salaryScale,
    yearsOfService: u.yearsOfService,
    currentStation: u.currentStationName,
    currentDistrict: u.currentDistrict,
    currentProvince: u.currentProvince,
    desiredDistricts: safeParseArray(u.desiredDistricts),
    desiredProvinces: safeParseArray(u.desiredProvinces),
    verified: u.verificationStatus === "VERIFIED",
    mostWanted: u.mostWanted,
    incentivePreference: INCENTIVE_DISPLAY[u.incentivePreference] ?? "none",
    incentiveAmount: u.incentiveAmountMin ?? undefined,
    urgency: URGENCY_DISPLAY[u.urgency] ?? "Medium",
    reason: u.swapReason || "",
  };
}
