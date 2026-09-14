export interface SampleUser {
  id: string;
  name: string;
  photo: string;
  nrc: string;
  employeeId: string;
  departmentId: string;
  jobTitle: string;
  salaryScale: string;
  yearsOfService: number;
  currentStation: string;
  currentDistrict: string;
  currentProvince: string;
  desiredDistricts: string[];
  desiredProvinces: string[];
  verified: boolean;
  mostWanted: boolean;
  incentivePreference: "want" | "offer" | "none" | "negotiate";
  incentiveAmount?: number;
  matchScore?: number;
  urgency: "Low" | "Medium" | "High" | "Very High";
  reason: string;
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    id: "u1",
    name: "Mutinta Hamweene",
    photo: "https://i.pravatar.cc/150?img=47",
    nrc: "123456/10/1",
    employeeId: "TSC-88213",
    departmentId: "moe",
    jobTitle: "Teacher",
    salaryScale: "TSS-4",
    yearsOfService: 6,
    currentStation: "Mongu Girls Secondary School",
    currentDistrict: "Mongu",
    currentProvince: "Western",
    desiredDistricts: ["Lusaka", "Kafue"],
    desiredProvinces: ["Lusaka"],
    verified: true,
    mostWanted: false,
    incentivePreference: "offer",
    incentiveAmount: 3500,
    matchScore: 94,
    urgency: "High",
    reason: "Family reunion",
  },
  {
    id: "u2",
    name: "Chola Mwansa",
    photo: "https://i.pravatar.cc/150?img=12",
    nrc: "234567/20/1",
    employeeId: "TSC-77104",
    departmentId: "moe",
    jobTitle: "Senior Teacher",
    salaryScale: "TSS-6",
    yearsOfService: 11,
    currentStation: "Kabulonga Boys Secondary School",
    currentDistrict: "Lusaka",
    currentProvince: "Lusaka",
    desiredDistricts: ["Mongu", "Senanga"],
    desiredProvinces: ["Western"],
    verified: true,
    mostWanted: true,
    incentivePreference: "want",
    incentiveAmount: 4000,
    matchScore: 94,
    urgency: "Medium",
    reason: "Hardship / remoteness",
  },
  {
    id: "u3",
    name: "Bwalya Chishimba",
    photo: "https://i.pravatar.cc/150?img=33",
    nrc: "345678/30/1",
    employeeId: "MOH-55219",
    departmentId: "moh",
    jobTitle: "Registered Nurse",
    salaryScale: "HSS-6",
    yearsOfService: 4,
    currentStation: "Mansa General Hospital",
    currentDistrict: "Mansa",
    currentProvince: "Luapula",
    desiredDistricts: ["Ndola", "Kitwe"],
    desiredProvinces: ["Copperbelt"],
    verified: true,
    mostWanted: false,
    incentivePreference: "offer",
    incentiveAmount: 2500,
    matchScore: 87,
    urgency: "Very High",
    reason: "Health reasons",
  },
  {
    id: "u4",
    name: "Natasha Zulu",
    photo: "https://i.pravatar.cc/150?img=25",
    nrc: "456789/40/1",
    employeeId: "MOH-91002",
    departmentId: "moh",
    jobTitle: "Registered Nurse",
    salaryScale: "HSS-5",
    yearsOfService: 7,
    currentStation: "Ndola Central Hospital",
    currentDistrict: "Ndola",
    currentProvince: "Copperbelt",
    desiredDistricts: ["Mansa", "Samfya"],
    desiredProvinces: ["Luapula"],
    verified: true,
    mostWanted: true,
    incentivePreference: "want",
    incentiveAmount: 3000,
    matchScore: 87,
    urgency: "Low",
    reason: "Marriage / spouse relocation",
  },
  {
    id: "u5",
    name: "Kelvin Banda",
    photo: "https://i.pravatar.cc/150?img=51",
    nrc: "567890/50/1",
    employeeId: "ZPS-40021",
    departmentId: "zps",
    jobTitle: "Sergeant",
    salaryScale: "Sergeant",
    yearsOfService: 9,
    currentStation: "Kasama Central Police Station",
    currentDistrict: "Kasama",
    currentProvince: "Northern",
    desiredDistricts: ["Lusaka", "Chongwe"],
    desiredProvinces: ["Lusaka"],
    verified: false,
    mostWanted: false,
    incentivePreference: "negotiate",
    matchScore: 71,
    urgency: "Medium",
    reason: "Career progression",
  },
  {
    id: "u6",
    name: "Precious Mumba",
    photo: "https://i.pravatar.cc/150?img=44",
    nrc: "678901/60/1",
    employeeId: "MOLGRD-30044",
    departmentId: "molgrd",
    jobTitle: "Council Clerical Officer",
    salaryScale: "LGS-4",
    yearsOfService: 3,
    currentStation: "Lusaka City Council",
    currentDistrict: "Lusaka",
    currentProvince: "Lusaka",
    desiredDistricts: ["Choma", "Livingstone"],
    desiredProvinces: ["Southern"],
    verified: true,
    mostWanted: true,
    incentivePreference: "none",
    matchScore: 65,
    urgency: "Low",
    reason: "Further studies",
  },
];

export interface SwapRequestSample {
  id: string;
  userId: string;
  status: "pending" | "matched" | "in-negotiation" | "completed" | "cancelled";
  createdAt: string;
  feePaid: boolean;
  txnId?: string;
}

export const SAMPLE_SWAP_REQUESTS: SwapRequestSample[] = [
  { id: "sr1", userId: "u1", status: "matched", createdAt: "2026-08-02", feePaid: true, txnId: "ZSW-8K2N1-88231" },
  { id: "sr2", userId: "u2", status: "matched", createdAt: "2026-08-03", feePaid: true, txnId: "ZSW-9L3P2-88240" },
  { id: "sr3", userId: "u3", status: "in-negotiation", createdAt: "2026-08-10", feePaid: true, txnId: "ZSW-4M9Q7-88301" },
  { id: "sr4", userId: "u5", status: "pending", createdAt: "2026-09-01", feePaid: true, txnId: "ZSW-1A7B3-88450" },
];

export const REQUEST_FEE_ZMW = 150;
