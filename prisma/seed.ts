import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEPARTMENTS } from "../lib/data/departments";
import { SAMPLE_USERS } from "../lib/data/sample-users";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding departments...");
  for (const d of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, icon: d.icon, color: d.color, category: d.category },
    });
  }

  console.log("Seeding demo admin...");
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@zswap.zm" },
    update: {},
    create: {
      role: "ADMIN",
      fullName: "Z-Swap Admin",
      nrcNumber: "000000/00/0",
      dateOfBirth: new Date("1990-01-01"),
      gender: "Prefer not to say",
      phone: "0977000000",
      email: "admin@zswap.zm",
      passwordHash: adminPassword,
      departmentId: "other",
      jobTitle: "Administrator",
      salaryScale: "N/A",
      currentStationName: "Z-Swap HQ",
      currentProvince: "Lusaka",
      currentDistrict: "Lusaka",
      desiredProvinces: "[]",
      desiredDistricts: "[]",
      verificationStatus: "VERIFIED",
      agreedToTerms: true,
      consentSharedProfile: true,
    },
  });

  console.log("Seeding demo workers...");
  for (const u of SAMPLE_USERS) {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    await prisma.user.upsert({
      where: { email: `${u.id}@zswap.demo` },
      update: {},
      create: {
        fullName: u.name,
        nrcNumber: u.nrc,
        dateOfBirth: new Date("1992-05-14"),
        gender: "Prefer not to say",
        phone: `09${u.id.padStart(8, "0")}`.slice(0, 10),
        email: `${u.id}@zswap.demo`,
        passwordHash,
        departmentId: u.departmentId,
        jobTitle: u.jobTitle,
        salaryScale: u.salaryScale,
        yearsOfService: u.yearsOfService,
        currentStationName: u.currentStation,
        currentProvince: u.currentProvince,
        currentDistrict: u.currentDistrict,
        desiredProvinces: JSON.stringify(u.desiredProvinces),
        desiredDistricts: JSON.stringify(u.desiredDistricts),
        incentivePreference: u.incentivePreference.toUpperCase() as any,
        incentiveAmountMin: u.incentiveAmount,
        urgency: u.urgency.toUpperCase().replace(" ", "_") as any,
        swapReason: u.reason,
        verificationStatus: u.verified ? "VERIFIED" : "PENDING",
        mostWanted: u.mostWanted,
        agreedToTerms: true,
        consentSharedProfile: true,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
