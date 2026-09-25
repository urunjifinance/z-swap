import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEPARTMENTS = [
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

async function main() {
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: dept,
      create: dept,
    });
  }
  console.log(`Seeded ${DEPARTMENTS.length} departments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });