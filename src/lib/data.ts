import { TenantSettings, Category, Product, Order, SubscriptionPayment, TableInfo, User } from "../types";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-super-admin",
    name: "مدير المنصة العام (Super Admin)",
    email: "admin@smartmenu.app",
    password: "admin123456",
    role: "SUPER_ADMIN",
    phone: "01000000000",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "usr-tenant-admin",
    name: "مدير الفرع (Admin)",
    email: "manager@smartmenu.app",
    password: "admin123456",
    role: "TENANT_ADMIN",
    tenantId: "tenant-first",
    phone: "01011111111",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export const DEMO_USERS = INITIAL_USERS;

export const INITIAL_TENANTS: TenantSettings[] = [
  {
    id: "tenant-first",
    name: "الفرع الرئيسي",
    slug: "main-branch",
    businessType: "restaurant",
    stationLabel: "المطبخ الرئيسي",
    orderPointLabel: "طاولة",
    branding: {
      primaryColor: "#D97706",
      themeMode: "warm",
      fontFamily: "Cairo",
      currency: "ج.م",
      taxPercentage: 14,
      serviceFeePercentage: 0,
    },
    planTier: "pro",
    planStatus: "active",
    subscriptionStatus: "active",
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requireCashierApproval: false,
    enableSmartUpselling: true,
    ownerName: "مدير الفرع",
    ownerPhone: "01000000000",
    createdAt: new Date().toISOString(),
    onboardingCompleted: false,
    isSampleDataLoaded: false,
  },
];

// Clean Zero State - No fake demo items
export const INITIAL_TABLES: TableInfo[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_SUBSCRIPTIONS: SubscriptionPayment[] = [];

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "الباقة الأساسية (Starter)",
    description: "مثالية للمشاريع الناشئة، الكافيهات الصغيرة، وعربات الطعام.",
    priceMonthly: 350,
    priceAnnual: 3500,
    features: [
      "إدارة المنيو والتصنيفات غير المحدودة",
      "محطة تجهيز واحدة (مطبخ أو بار)",
      "نقطة كاشير واحدة",
      "تزامن لحظي Sub-100ms",
      "رموز QR غير محدودة للطاولات مع طباعة فورية",
      "دعم الدفع عبر إنستاباي وفودافون كاش",
    ],
    recommended: false,
  },
  {
    id: "pro",
    name: "باقة الأعمال المتقدمة (Pro)",
    description: "الخيار الأفضل للمطاعم النشطة، الفروع الكبرى، ومراكز الخدمة.",
    priceMonthly: 650,
    priceAnnual: 6500,
    features: [
      "إدارة كاملة للمنتجات والمخزون المباشر",
      "مخطط الصالة وإدارة الطاولات التفاعلية (Floor Plan)",
      "نقطة بيع سريعة (POS) للطلبات المباشرة والسفري",
      "محطات تجهيز متعددة (مطبخ + بار + معمل)",
      "كاشير متعدد مع إدارة الورديات وتصدير الإكسل",
      "تخصيص كامل للهوية البصرية والمسميات والضرائب",
      "محرك البيع الذكي ونظام الكوبونات",
      "طباعة حرارية إيصالات 80mm",
      "وضع العمل في حالة انقطاع الإنترنت (Offline Sync)",
      "دعم فني مخصص على مدار الساعة",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "باقة الفروع والمؤسسات (Enterprise)",
    description: "للسلاسل التجارية، الفنادق، والأنشطة متعددة الفروع.",
    priceMonthly: 1400,
    priceAnnual: 14000,
    features: [
      "إدارة فروع متعددة من لوحة واحدة (Multi-Branch)",
      "نطاق مخصص خاص بك بالكامل (Custom Domain)",
      "ربط مع أنظمة المحاسبة والـ ERP الخارجية",
      "تخزين غير متصل بالإنترنت فائق الأمان (Offline Resilience)",
      "إدارة المخزون المتقدمة مع تنبيهات النواقص",
      "مدير حساب شخصي وتدريب كامل لفريق العمل",
      "تعديلات برمجية وتكاملات حصرية",
    ],
    recommended: false,
  },
];

export const PAYMENT_CREDENTIALS = {
  instapay: {
    ipa: "smartmenu@instapay",
    accountName: "Smart Menu SaaS Co.",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=instapay://pay?ipa=smartmenu@instapay",
  },
  vodafoneCash: {
    walletNumber: "01023456789",
    ussdCode: "*9*7*01023456789*المبلغ#",
    accountName: "حساب تحصيل الاشتراكات المركزي",
  },
};
