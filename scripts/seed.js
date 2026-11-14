// Smart Menu Database Seeder
// Seeds PostgreSQL database (Supabase / Neon) with realistic initial data

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Smart Menu Cloud Database Seeding on Supabase...");

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

  const cairoGrill = await prisma.tenant.upsert({
    where: { slug: "cairo-grill" },
    update: {},
    create: {
      name: "مشويات كايرو جريل (منتهي)",
      slug: "cairo-grill",
      businessType: "restaurant",
      stationLabel: "مطبخ الشواية",
      orderPointLabel: "طاولة",
      ownerName: "محمود زهران",
      ownerPhone: "01099887766",
      primaryColor: "#DC2626",
      themeMode: "warm",
      currency: "ج.م",
      taxPercentage: 14,
      serviceFeePercentage: 10,
      planTier: "starter",
      subscriptionStatus: "expired",
      subscriptionExpiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      logoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=160",
    },
  });

  console.log("Seeded Tenants:", elPrince.name, ",", aromaCafe.name, ",", cairoGrill.name);

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

  await prisma.user.upsert({
    where: { email: "cashier@smartmenu.app" },
    update: {},
    create: {
      name: "سعيد النجار (كاشير)",
      email: "cashier@smartmenu.app",
      role: "CASHIER",
      tenantId: elPrince.id,
      phone: "01122334455",
    },
  });

  await prisma.user.upsert({
    where: { email: "chef@smartmenu.app" },
    update: {},
    create: {
      name: "الشيف رمزي (محطة التجهيز)",
      email: "chef@smartmenu.app",
      role: "KITCHEN",
      tenantId: elPrince.id,
      phone: "01233445566",
    },
  });

  console.log("Seeded Users across all roles (SUPER_ADMIN, TENANT_ADMIN, CASHIER, KITCHEN).");

  // 3. Seed Categories & Products for El Prince
  const catMeats = await prisma.category.create({
    data: {
      tenantId: elPrince.id,
      name: "الأطباق الرئيسية واللحوم",
      sortOrder: 1,
    },
  });

  const catTajin = await prisma.category.create({
    data: {
      tenantId: elPrince.id,
      name: "الطواجن الفخارية",
      sortOrder: 2,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        tenantId: elPrince.id,
        categoryId: catMeats.id,
        name: "كبدة إسكندراني باللية الضاني",
        description: "كبدة طازجة متبلة بالثوم والفلفل الحار والخلطة السرية مع شرائح الفلفل والليمون الساخن.",
        price: 185,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
        isAvailable: true,
        stockQuantity: 24,
        isBestSeller: true,
        isSpicy: true,
        prepTimeMinutes: 12,
        calories: 520,
      },
      {
        tenantId: elPrince.id,
        categoryId: catTajin.id,
        name: "طاجن عكاوي بالبصل القاورما",
        description: "عكاوي بلدي مطهوة ببطء في الفرن الحجري داخل فخارة مغطاة بالعجين ومتبلة ببهارات البرنس.",
        price: 295,
        image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
        isAvailable: true,
        stockQuantity: 18,
        isBestSeller: true,
        prepTimeMinutes: 20,
        calories: 680,
      },
    ],
  });

  // 4. Seed Tables
  await prisma.tableInfo.createMany({
    data: [
      { tenantId: elPrince.id, number: "1", name: "طاولة 1", capacity: 4, status: "available" },
      { tenantId: elPrince.id, number: "2", name: "طاولة 2", capacity: 2, status: "available" },
      { tenantId: elPrince.id, number: "3", name: "طاولة 3", capacity: 4, status: "available" },
      { tenantId: elPrince.id, number: "4", name: "طاولة 4", capacity: 6, status: "available" },
      { tenantId: elPrince.id, number: "VIP", name: "صالة VIP", capacity: 12, status: "available" },
    ],
  });

  console.log("Seeded Categories, Products, and Tables on Supabase.");
  console.log("All data successfully seeded into live Supabase PostgreSQL! 🚀");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
