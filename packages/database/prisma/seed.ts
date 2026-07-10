import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai proses seeding data master...");

  // 1. Tanam Data Master Roles (Pakai angka Int)
  const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Karyawan" },
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

  // 3. Tanam Data Users
  const users = [
    {
      id: 1,
      name: "Super Admin (Bos IT)",
      email: "superadmin@bumn.co.id",
      password: "$2b$10$yPE8sJDbWQngUWeZ5Nh2..5PLSfhf4yNmr6FD2SEvJwPj/jv.SCVK", // password123
      roleId: 1,
      departmentId: 1, // SDM & TI
      isActive: true,
    },
    {
      id: 2,
      name: "Admin Helpdesk",
      email: "admin@bumn.co.id",
      password: "$2b$10$yPE8sJDbWQngUWeZ5Nh2..5PLSfhf4yNmr6FD2SEvJwPj/jv.SCVK", // password123
      roleId: 2,
      departmentId: 1, // SDM & TI
      isActive: true,
    },
    {
      id: 3,
      name: "Karyawan Keuangan",
      email: "karyawan@bumn.co.id",
      password: "$2b$10$yPE8sJDbWQngUWeZ5Nh2..5PLSfhf4yNmr6FD2SEvJwPj/jv.SCVK", // password123
      roleId: 3,
      departmentId: 2, // Keuangan
      isActive: true,
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log("✅ Data Users sukses ditanam!");
}

main()
  .catch((e) => {
    console.error("❌ Proses seeding gagal total, bre:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
