// All Zambian government departments/ministries with icon key (Lucide icon name) + accent color

export interface Department {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  color: string; // tailwind-ish hex accent
  category: "education" | "health" | "security" | "civil" | "local-gov" | "other";
}

export const DEPARTMENTS: Department[] = [
  { id: "moe", name: "Ministry of Education", icon: "GraduationCap", color: "#EA580C", category: "education" },
  { id: "moh", name: "Ministry of Health", icon: "HeartPulse", color: "#16A34A", category: "health" },
  { id: "mofnp", name: "Ministry of Finance and National Planning", icon: "Landmark", color: "#0EA5E9", category: "civil" },
  { id: "mohais", name: "Ministry of Home Affairs and Internal Security", icon: "ShieldAlert", color: "#DC2626", category: "security" },
  { id: "mod", name: "Ministry of Defence", icon: "Shield", color: "#334155", category: "security" },
  { id: "moa", name: "Ministry of Agriculture", icon: "Wheat", color: "#65A30D", category: "civil" },
  { id: "mofl", name: "Ministry of Fisheries and Livestock", icon: "Fish", color: "#0891B2", category: "civil" },
  { id: "mommd", name: "Ministry of Mines and Minerals Development", icon: "Pickaxe", color: "#78716C", category: "civil" },
  { id: "moe2", name: "Ministry of Energy", icon: "Zap", color: "#F59E0B", category: "civil" },
  { id: "mowds", name: "Ministry of Water Development and Sanitation", icon: "Droplets", color: "#0284C7", category: "civil" },
  { id: "motl", name: "Ministry of Transport and Logistics", icon: "Truck", color: "#7C3AED", category: "civil" },
  { id: "mihud", name: "Ministry of Infrastructure, Housing and Urban Development", icon: "Building2", color: "#B45309", category: "civil" },
  { id: "molgrd", name: "Ministry of Local Government and Rural Development", icon: "Landmark", color: "#15803D", category: "local-gov" },
  { id: "mocdss", name: "Ministry of Community Development and Social Services", icon: "HandHeart", color: "#DB2777", category: "civil" },
  { id: "mysa", name: "Ministry of Youth, Sport and Arts", icon: "Trophy", color: "#EA580C", category: "civil" },
  { id: "molss", name: "Ministry of Labour and Social Security", icon: "Briefcase", color: "#4338CA", category: "civil" },
  { id: "molnr", name: "Ministry of Lands and Natural Resources", icon: "Map", color: "#166534", category: "civil" },
  { id: "mogee", name: "Ministry of Green Economy and Environment", icon: "Leaf", color: "#16A34A", category: "civil" },
  { id: "mot", name: "Ministry of Tourism", icon: "Compass", color: "#0D9488", category: "civil" },
  { id: "motci", name: "Ministry of Trade, Commerce and Industry", icon: "Store", color: "#C2410C", category: "civil" },
  { id: "mosmed", name: "Ministry of Small and Medium Enterprise Development", icon: "Rocket", color: "#DB2777", category: "civil" },
  { id: "mots", name: "Ministry of Technology and Science", icon: "Cpu", color: "#4F46E5", category: "civil" },
  { id: "mofaic", name: "Ministry of Foreign Affairs and International Cooperation", icon: "Globe2", color: "#0369A1", category: "civil" },
  { id: "moj", name: "Ministry of Justice", icon: "Gavel", color: "#334155", category: "civil" },
  { id: "moim", name: "Ministry of Information and Media", icon: "Radio", color: "#EA580C", category: "civil" },
  { id: "zra", name: "Zambia Revenue Authority (ZRA)", icon: "Receipt", color: "#065F46", category: "civil" },
  { id: "zps", name: "Zambia Police Service", icon: "Siren", color: "#1D4ED8", category: "security" },
  { id: "zcs", name: "Zambia Correctional Service", icon: "Lock", color: "#57534E", category: "security" },
  { id: "zdf", name: "Zambia Defence Force", icon: "Shield", color: "#166534", category: "security" },
  { id: "immigration", name: "Immigration Department", icon: "Stamp", color: "#7C2D12", category: "security" },
  { id: "dec", name: "Drug Enforcement Commission (DEC)", icon: "ShieldCheck", color: "#991B1B", category: "security" },
  { id: "acc", name: "Anti-Corruption Commission (ACC)", icon: "ScanEye", color: "#92400E", category: "security" },
  { id: "tsc", name: "Teaching Service Commission", icon: "BookOpen", color: "#EA580C", category: "education" },
  { id: "zppa", name: "Zambia Public Procurement Authority", icon: "ClipboardList", color: "#475569", category: "civil" },
  { id: "other", name: "Other (specify)", icon: "MoreHorizontal", color: "#64748B", category: "other" },
];

export const SALARY_SCALES: Record<string, string[]> = {
  moe: ["TSS-1", "TSS-2", "TSS-3", "TSS-4", "TSS-5", "TSS-6", "TSS-7", "TSS-8"],
  tsc: ["TSS-1", "TSS-2", "TSS-3", "TSS-4", "TSS-5", "TSS-6", "TSS-7", "TSS-8"],
  moh: Array.from({ length: 12 }, (_, i) => `HSS-${i + 1}`),
  zps: ["Constable", "Sergeant", "Inspector", "Chief Inspector", "Assistant Superintendent", "Superintendent", "Senior Superintendent", "Commissioner"],
  zdf: ["Private", "Corporal", "Sergeant", "Warrant Officer", "Lieutenant", "Captain", "Major", "Colonel", "Brigadier General"],
  molgrd: Array.from({ length: 12 }, (_, i) => `LGS-${i + 1}`),
  default: Array.from({ length: 15 }, (_, i) => `CS-${i + 1}`),
};

export function getSalaryScales(deptId: string): string[] {
  return SALARY_SCALES[deptId] ?? SALARY_SCALES.default;
}

export const JOB_TITLES: Record<string, string[]> = {
  moe: [
    "Teacher",
    "Head Teacher",
    "Deputy Head Teacher",
    "Senior Teacher",
    "Education Standards Officer",
    "District Education Officer",
    "Provincial Education Officer",
    "Lecturer",
    "Other (specify)",
  ],
  tsc: [
    "Teacher",
    "Head Teacher",
    "Deputy Head Teacher",
    "Senior Teacher",
    "Education Standards Officer",
    "Other (specify)",
  ],
  moh: [
    "Clinical Officer",
    "Registered Nurse",
    "Midwife",
    "Doctor / Medical Officer",
    "Pharmacist",
    "Laboratory Technician",
    "Environmental Health Officer",
    "Radiographer",
    "Physiotherapist",
    "Health Inspector",
    "Other (specify)",
  ],
  default: [
    "Clerical Officer",
    "Administrative Officer",
    "Accountant",
    "Human Resource Officer",
    "Records Officer",
    "Planning Officer",
    "Executive Officer",
    "Other (specify)",
  ],
};

export function getJobTitles(deptId: string): string[] {
  return JOB_TITLES[deptId] ?? JOB_TITLES.default;
}

export const SCHOOL_TYPES = ["Primary", "Secondary", "Combined", "Special", "College"];
export const FACILITY_TYPES = ["Clinic", "Level 1 Hospital", "General Hospital", "Tertiary Hospital", "Health Post"];
export const QUALIFICATIONS = ["Certificate", "Diploma", "Degree", "Masters", "PhD"];

export const SWAP_REASONS = [
  "Family reunion",
  "Health reasons",
  "Further studies",
  "Career progression",
  "Hardship / remoteness",
  "Marriage / spouse relocation",
  "Other (specify)",
];

export const URGENCY_LEVELS = ["Low", "Medium", "High", "Very High"] as const;

export const INCENTIVE_PREFERENCES = [
  { id: "want", label: "I want an incentive to give up my current station" },
  { id: "offer", label: "I am willing to offer an incentive to move to my desired station" },
  { id: "none", label: "Straight swap, no incentive" },
  { id: "negotiate", label: "Open to negotiation" },
] as const;
