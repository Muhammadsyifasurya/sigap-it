import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai proses seeding data master...");

  // 1. Tanam Data Master Roles (Pakai angka Int)
  const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "IT Governance" },
    { id: 3, name: "Staff" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log("✅ Data Master Roles sukses ditanam!");

  // 2. Tanam Data Master Departments (Pakai angka Int)
  const departments = [
    { id: 1, name: "SDM & TI" },
    { id: 2, name: "Keuangan" },
    { id: 3, name: "Business Support" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: {},
      create: dept,
    });
  }
  console.log("✅ Data Master Departments sukses ditanam!");
}

main()
  .catch((e) => {
    console.error("❌ Proses seeding gagal total, bre:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
