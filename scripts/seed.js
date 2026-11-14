// Smart Menu Database Seeder
// Seeds PostgreSQL database (Supabase / Neon) with realistic initial data

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Smart Menu Cloud Database Seeding...");

  // 1. Seed Tenants
  const elPrince = await prisma.tenant.upsert({
    where: { slug: "el-prince" },
    update: {},
    create: {
      name: "مطعم البرنس كوزين",
      slug: "el-prince",
      businessType: "restaurant",
      stationLabel: "المطبخ الرئيسي",
      orderPointLabel: "طاولة",
      ownerName: "ناصر البرنس",
      ownerPhone: "01012345678",
      primaryColor: "#D97706",
      themeMode: "warm",
      currency: "ج.م",
      taxPercentage: 14,
      serviceFeePercentage: 12,
      planTier: "pro",
      subscriptionStatus: "active",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160",
    },
  });

  const aromaCafe = await prisma.tenant.upsert({
    where: { slug: "aroma-cafe" },
    update: {},
    create: {
      name: "أروما سبيشالتي كافيه",
      slug: "aroma-cafe",
      businessType: "cafe",
      stationLabel: "البار وقسم القهوة",
      orderPointLabel: "شباك استلام",
      ownerName: "كريم السعيد",
      ownerPhone: "01198765432",
      primaryColor: "#B45309",
      themeMode: "warm",
      currency: "ج.م",
      taxPercentage: 14,
      serviceFeePercentage: 0,
      planTier: "starter",
      subscriptionStatus: "trial",
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      logoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=160",
    },
  });

  console.log("Seeded Tenants:", elPrince.name, ",", aromaCafe.name);

  // 2. Seed Users
  await prisma.user.upsert({
    where: { email: "superadmin@smartmenu.app" },
    update: {},
    create: {
      name: "م. أحمد الشناوي",
      email: "superadmin@smartmenu.app",
      role: "SUPER_ADMIN",
      phone: "01000000001",
    },
  });

  await prisma.user.upsert({
    where: { email: "prince@smartmenu.app" },
    update: {},
    create: {
      name: "ناصر البرنس",
      email: "prince@smartmenu.app",
      role: "TENANT_ADMIN",
      tenantId: elPrince.id,
      phone: "01012345678",
    },
  });

  console.log("Seeded Super Admin and Tenant Admins.");
  console.log("Database Seeding Completed Successfully! 🚀");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
