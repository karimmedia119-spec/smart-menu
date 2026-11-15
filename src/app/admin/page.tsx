"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { RoleGuard } from "../../components/RoleGuard";
import { OnboardingGuide } from "../../components/OnboardingGuide";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sliders,
  Check,
  Utensils,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Boxes,
  QrCode,
  Printer,
  Users,
  Zap,
  Calendar,
  Phone,
  Building,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { PRICING_PLANS } from "../../lib/data";

export default function AdminPage() {
  const {
    tenants,
    activeTenant,
    setActiveTenantId,
    updateActiveTenantSettings,
    updateTenantLicense,
    subscriptions,
    verifySubscriptionPayment,
    products,
    categories,
    tables,
    addProduct,
    deleteProduct,
    toggleProductAvailability,
    updateStockQuantity,
    addTable,
    loadSampleMenuForTenant,
    clearTenantMenu,
  } = useApp();

  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "super_admin_hub" | "menu_manager" | "tables_qr" | "inventory" | "subscriptions" | "tenant_settings" | "plans"
  >(currentRole === "SUPER_ADMIN" ? "super_admin_hub" : "menu_manager");

  // Tenant customization form state
  const [stationLabel, setStationLabel] = useState(activeTenant.stationLabel);
  const [orderPointLabel, setOrderPointLabel] = useState(activeTenant.orderPointLabel);
  const [primaryColor, setPrimaryColor] = useState(activeTenant.branding.primaryColor);
  const [taxPercentage, setTaxPercentage] = useState(activeTenant.branding.taxPercentage);
  const [serviceFeePercentage, setServiceFeePercentage] = useState(
    activeTenant.branding.serviceFeePercentage
  );
  const [requireCashierApproval, setRequireCashierApproval] = useState(
    activeTenant.requireCashierApproval
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Product Modal/Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || "cat-1");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdStock, setNewProdStock] = useState("25");
  const [newProdSpicy, setNewProdSpicy] = useState(false);
  const [newProdVegetarian, setNewProdVegetarian] = useState(false);
  const [newProdBestSeller, setNewProdBestSeller] = useState(false);

  // New Table State
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  React.useEffect(() => {
    setStationLabel(activeTenant.stationLabel);
    setOrderPointLabel(activeTenant.orderPointLabel);
    setPrimaryColor(activeTenant.branding.primaryColor);
    setTaxPercentage(activeTenant.branding.taxPercentage);
    setServiceFeePercentage(activeTenant.branding.serviceFeePercentage);
    setRequireCashierApproval(activeTenant.requireCashierApproval);
  }, [activeTenant]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveTenantSettings({
      stationLabel,
      orderPointLabel,
      requireCashierApproval,
      branding: {
        ...activeTenant.branding,
        primaryColor,
        taxPercentage: Number(taxPercentage),
        serviceFeePercentage: Number(serviceFeePercentage),
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    addProduct({
      name: newProdName,
      description: newProdDesc || "وجبة مميزة ومجهزة بعناية من أفضل المكونات الطازجة.",
      price: parseFloat(newProdPrice),
      categoryId: newProdCategory,
      stockQuantity: parseInt(newProdStock) || 20,
      image:
        newProdImage.trim() ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      isAvailable: true,
      isSpicy: newProdSpicy,
      isVegetarian: newProdVegetarian,
      isBestSeller: newProdBestSeller,
      prepTimeMinutes: 10,
    });

    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice("");
    setNewProdImage("");
    setIsAddingProduct(false);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    addTable(newTableNumber.trim(), parseInt(newTableCapacity) || 4);
    setNewTableNumber("");
  };

  const pendingSubs = subscriptions.filter((s) => s.status === "pending");
  const processedSubs = subscriptions.filter((s) => s.status !== "pending");

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "TENANT_ADMIN"]}
      pageTitle="لوحة التحكم المركزية وإدارة المنيو"
    >
      <div className="min-h-screen bg-warm-bg text-warm-text pb-12">
        <Navbar />

        {/* Admin Top Banner */}
        <div className="bg-white border-b border-warm-border px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-warm-text flex items-center gap-2">
                  <span>لوحة التحكم المركزية وإدارة المنيو</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-warm-surface border border-warm-border font-bold text-warm-muted">
                    {activeTenant.name}
                  </span>
                </h1>
                <p className="text-xs text-warm-muted mt-0.5">
                  إدارة الأصناف، الطاولات ورموز QR، المخزون، الاشتراكات، وهوية المنشأة.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-warm-surface p-1 rounded-2xl border border-warm-border overflow-x-auto">
              {currentRole === "SUPER_ADMIN" && (
                <button
                  onClick={() => setActiveTab("super_admin_hub")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "super_admin_hub"
                      ? "bg-purple-700 text-white shadow-sm"
                      : "text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>تراخيص المنصة (Super Admin)</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("menu_manager")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "menu_manager"
                    ? "bg-white text-warm-text shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                إدارة المنيو
              </button>
            <button
              onClick={() => setActiveTab("tables_qr")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "tables_qr"
                  ? "bg-white text-warm-text shadow-sm border border-warm-border"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              الطاولات والـ QR
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "inventory"
                  ? "bg-white text-warm-text shadow-sm border border-warm-border"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              مراقبة المخزون
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                activeTab === "subscriptions"
                  ? "bg-white text-warm-text shadow-sm border border-warm-border"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              <span>الاشتراكات</span>
              {pendingSubs.length > 0 && (
                <span className="mr-1.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
                  {pendingSubs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tenant_settings")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "tenant_settings"
                  ? "bg-white text-warm-text shadow-sm border border-warm-border"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              تخصيص الهوية
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "plans"
                  ? "bg-white text-warm-text shadow-sm border border-warm-border"
                  : "text-warm-muted hover:text-warm-text"
              }`}
            >
              الباقات
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* TAB 0: SUPER ADMIN SUBSCRIPTION & TENANT CONTROLLER */}
        {activeTab === "super_admin_hub" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Box */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600 text-purple-200 text-xs font-bold mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>لوحة صاحب المنصة المركزية (Master License Engine)</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  التحكم الذكي في اشتراكات وتراخيص الأنشطة
                </h2>
                <p className="text-xs md:text-sm text-purple-200/80 mt-1.5 max-w-2xl leading-relaxed">
                  بصفتك مالك النظام، يمكنك تفعيل أو تعليق أي نشاط تجاري بضغطة زر واحدة، مد الفترات التجريبية، ومتابعة التحويلات المالية عبر فودافون كاش وإنستاباي لحظياً.
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/onboarding"
                  className="px-4 py-2.5 rounded-2xl bg-white text-purple-950 hover:bg-stone-100 font-extrabold text-xs transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-purple-900" />
                  <span>تسجيل مشترك جديد</span>
                </Link>
              </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-warm-border shadow-warm">
                <div className="text-xs text-warm-muted font-bold">إجمالي الأنشطة المسجلة</div>
                <div className="text-2xl font-black text-warm-text mt-1">{tenants.length}</div>
                <div className="text-[10px] text-warm-muted mt-1">مشترك في النظام</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-warm bg-emerald-50/20">
                <div className="text-xs text-emerald-800 font-bold">الاشتراكات النشطة</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {tenants.filter((t) => t.subscriptionStatus === "active").length}
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">مفعلة وتعمل بكامل طاقتها</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-warm bg-blue-50/20">
                <div className="text-xs text-blue-800 font-bold">فترات تجريبية (Trials)</div>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {tenants.filter((t) => t.subscriptionStatus === "trial").length}
                </div>
                <div className="text-[10px] text-blue-600 mt-1">تجربة مجانية مؤقتة</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-warm bg-rose-50/20">
                <div className="text-xs text-rose-800 font-bold">منتهية أو معلقة</div>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {
                    tenants.filter(
                      (t) =>
                        t.subscriptionStatus === "expired" ||
                        t.subscriptionStatus === "suspended" ||
                        new Date(t.subscriptionExpiry).getTime() < Date.now()
                    ).length
                  }
                </div>
                <div className="text-[10px] text-rose-600 mt-1">محجوبة بشاشة الـ Paywall</div>
              </div>
            </div>

            {/* Tenants Cards & Actions */}
            <div className="bg-white p-6 rounded-3xl border border-warm-border shadow-warm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-warm-text">سجل المشتركين والتراخيص السحابية</h3>
                  <p className="text-xs text-warm-muted">تحكم فوري بحالة كل نشاط تجاري وصلاحية الترخيص</p>
                </div>
              </div>

              <div className="space-y-4">
                {tenants.map((t) => {
                  const now = Date.now();
                  const expTime = new Date(t.subscriptionExpiry).getTime();
                  const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
                  const isExpired = t.subscriptionStatus === "expired" || diffDays <= 0;
                  const isSuspended = t.subscriptionStatus === "suspended";

                  return (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                        isSuspended
                          ? "bg-stone-50 border-stone-300"
                          : isExpired
                          ? "bg-rose-50/40 border-rose-200"
                          : t.subscriptionStatus === "trial"
                          ? "bg-blue-50/30 border-blue-200"
                          : "bg-white border-warm-border"
                      }`}
                    >
                      {/* Tenant Identity */}
                      <div className="flex items-center gap-4">
                        <img
                          src={t.branding.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120"}
                          alt={t.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-warm-border shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-warm-text">{t.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-warm-surface border border-warm-border text-warm-muted">
                              {t.businessType}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              باقة {t.planTier}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-warm-muted mt-1">
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-stone-400" />
                              <span>{t.ownerName}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-mono">{t.ownerPhone}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                تاريخ الانتهاء:{" "}
                                <strong className="text-warm-text font-mono">
                                  {new Date(t.subscriptionExpiry).toLocaleDateString("ar-EG")}
                                </strong>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Quick Action Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-end">
                        {/* Status Badge */}
                        <div className="text-right sm:text-left">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-stone-500" />
                              <span>معلق يدوياً</span>
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                              <span>منتهي ({Math.abs(diffDays)} يوم مضت)</span>
                            </span>
                          ) : t.subscriptionStatus === "trial" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                              <span>تجريبي (باقي {diffDays} يوم)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span>نشط (باقي {diffDays} يوم)</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => updateTenantLicense(t.id, "extend_30")}
                            title="تمديد الاشتراك شهراً إضافياً (+30 يوم)"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+30 يوم</span>
                          </button>

                          <button
                            onClick={() => updateTenantLicense(t.id, "extend_365")}
                            title="ترقية وتجديد سنوي (+365 يوم)"
                            className="px-2.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>+سنة</span>
                          </button>

                          <button
                            onClick={() => updateTenantLicense(t.id, "trial_14")}
                            title="منح فترة تجريبية 14 يوماً"
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>+14 يوم</span>
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => updateTenantLicense(t.id, "activate")}
                              title="إلغاء التعليق وتفعيل الحساب"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>تنشيط</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTenantLicense(t.id, "suspend")}
                              title="تعليق الحساب وقفله فوراً"
                              className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-rose-100 hover:text-rose-800 text-stone-700 font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>تعليق</span>
                            </button>
                          )}

                          <Link
                            href={`/m/${t.slug}`}
                            target="_blank"
                            title="عرض قائمة العميل لهذا النشاط"
                            className="p-1.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-text transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MENU MANAGER */}
        {activeTab === "menu_manager" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-warm-border shadow-warm">
              <div>
                <h2 className="text-base font-black text-warm-text flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-warm-accent" />
                  <span>قائمة أصناف {activeTenant.name} ({products.length} صنف)</span>
                </h2>
                <p className="text-xs text-warm-muted mt-0.5">
                  أضف أطباقاً جديدة، عدّل الأسعار، أو عطل الأصناف المنتهية بضغطة زر وتنعكس فوراً في الصالة.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {products.length === 0 ? (
                  <button
                    onClick={() => loadSampleMenuForTenant(activeTenant.id)}
                    className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>تحميل قائمة تجريبية جاهزة</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm("هل أنت متأكد من مسح جميع الأصناف والبدء من الصفر بنظام نظيف؟")) {
                        clearTenantMenu(activeTenant.id);
                      }
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-warm-border transition-colors"
                    title="مسح القائمة والبدء بنظام فارغ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح القائمة للبدء من الصفر</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="py-2.5 px-4 rounded-2xl bg-warm-text text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-stone-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف جديد للمنيو</span>
                </button>
              </div>
            </div>

            {isAddingProduct && (
              <div className="bg-white p-6 rounded-3xl border border-warm-border shadow-warmLg space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-warm-border pb-3">
                  <h3 className="font-extrabold text-sm text-warm-text">
                    إضافة صنف جديد إلى القائمة
                  </h3>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    إلغاء
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-text block">اسم الصنف:</label>
                      <input
                        type="text"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="مثال: شاورما لحم عربي دبل"
                        className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-text block">السعر (ج.م):</label>
                      <input
                        type="number"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="120"
                        className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-text block">التصنيف:</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-warm-text block">الكمية بالمخزن:</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="25"
                        className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-warm-text block">الوصف والمكونات:</label>
                    <input
                      type="text"
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="قطع لحم متبلة مع خبز الصاج والثومية المجهزة يومياً..."
                      className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-warm-text block">رابط صورة الصنف (اختياري):</label>
                    <input
                      type="url"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-warm-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdBestSeller}
                        onChange={(e) => setNewProdBestSeller(e.target.checked)}
                        className="rounded"
                      />
                      <span>الأكثر طلباً ⭐</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-warm-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdSpicy}
                        onChange={(e) => setNewProdSpicy(e.target.checked)}
                        className="rounded"
                      />
                      <span>حار 🌶️</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-warm-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdVegetarian}
                        onChange={(e) => setNewProdVegetarian(e.target.checked)}
                        className="rounded"
                      />
                      <span>نباتي 🌱</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs font-bold text-stone-600"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-sm"
                    >
                      حفظ ونشر في المنيو فوراً
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List Table or Educational Onboarding Guide */}
            {products.length === 0 ? (
              <OnboardingGuide
                tenant={activeTenant}
                categoriesCount={categories.length}
                productsCount={products.length}
                tablesCount={tables.length}
                onLoadSampleMenu={() => loadSampleMenuForTenant(activeTenant.id)}
                onOpenAddProduct={() => setIsAddingProduct(true)}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-warm-border overflow-hidden shadow-warm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-warm-surface border-b border-warm-border text-warm-muted font-bold">
                        <th className="py-3 px-4">الصورة</th>
                        <th className="py-3 px-4">اسم الصنف</th>
                        <th className="py-3 px-4">التصنيف</th>
                        <th className="py-3 px-4">السعر</th>
                        <th className="py-3 px-4">المخزون المتاح</th>
                        <th className="py-3 px-4">الحالة (التوفر)</th>
                        <th className="py-3 px-4">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-border/60">
                      {products.map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        return (
                          <tr key={p.id} className="hover:bg-warm-surface/40 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-warm-border shadow-xs"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-warm-text">{p.name}</div>
                              <div className="text-[11px] text-warm-muted line-clamp-1">
                                {p.description}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-warm-muted">
                              {cat?.name || "عام"}
                            </td>
                            <td className="py-3 px-4 font-black text-warm-accent">
                              {p.price} ج.م
                            </td>
                            <td className="py-3 px-4 font-bold text-warm-text">
                              {p.stockQuantity ?? 25} وجبة
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleProductAvailability(p.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                                  p.isAvailable
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                {p.isAvailable ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                    <span>متوفر للطلب</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-rose-600" />
                                    <span>غير متوفر (نافذ)</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                                title="حذف من المنيو"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLES & BATCH QR PRINTING */}
        {activeTab === "tables_qr" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-warm-border shadow-warm">
              <div>
                <h2 className="text-base font-black text-warm-text flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-warm-accent" />
                  <span>إدارة الطاولات وطباعة رموز QR ({tables.length} طاولات)</span>
                </h2>
                <p className="text-xs text-warm-muted mt-0.5">
                  أضف طاولات جديدة أو اطبع جميع رموز الـ QR في صفحة واحدة جاهزة للقص واللصق على الطاولات.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-warm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة جميع كروت الـ QR دفعة واحدة</span>
              </button>
            </div>

            {/* Add Table Form */}
            <form onSubmit={handleAddTable} className="bg-white p-4 rounded-3xl border border-warm-border flex flex-wrap items-center gap-3 shadow-warm">
              <span className="text-xs font-bold text-warm-text">إضافة طاولة جديدة:</span>
              <input
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="رقم الطاولة (مثلاً 9 أو شرفة-1)"
                className="px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                required
              />
              <input
                type="number"
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(e.target.value)}
                placeholder="السعة (أفراد)"
                className="w-24 px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-warm-text text-white font-bold text-xs"
              >
                + إضافة
              </button>
            </form>

            {/* Printable Grid of All Table QR Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-3xl border-2 border-dashed border-warm-border text-center space-y-2 shadow-sm"
                >
                  <div className="font-black text-sm text-warm-text">{t.name}</div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/?table=${t.number}`}
                    alt={t.name}
                    className="w-32 h-32 mx-auto rounded-xl p-1 bg-white border border-warm-border shadow-xs"
                  />
                  <div className="text-[10px] text-warm-muted font-bold">
                    {activeTenant.name} • امسح للطلب
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY TRACKER */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-warm-border shadow-warm">
              <h2 className="text-base font-black text-warm-text flex items-center gap-2">
                <Boxes className="w-5 h-5 text-warm-accent" />
                <span>مراقبة المخزون ونواقص المكونات</span>
              </h2>
              <p className="text-xs text-warm-muted mt-0.5">
                تتبع الكميات المتبقية لكل وجبة بالمخزن وتعديلها فورياً.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => {
                const stock = p.stockQuantity ?? 20;
                const isLow = stock <= 15;
                return (
                  <div
                    key={p.id}
                    className={`bg-white p-4 rounded-3xl border shadow-warm flex items-center justify-between gap-3 ${
                      isLow ? "border-amber-400 bg-amber-50/20" : "border-warm-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-warm-border"
                      />
                      <div>
                        <div className="font-extrabold text-xs text-warm-text">{p.name}</div>
                        <div className="text-[11px] text-warm-muted">
                          {p.price} ج.م •{" "}
                          <span className={isLow ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                            {stock} متبقي
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-warm-surface p-1 rounded-xl border border-warm-border">
                      <button
                        onClick={() => updateStockQuantity(p.id, -5)}
                        className="w-6 h-6 rounded-lg bg-white text-stone-700 font-bold text-xs shadow-xs"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateStockQuantity(p.id, 5)}
                        className="w-6 h-6 rounded-lg bg-white text-stone-700 font-bold text-xs shadow-xs"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-warm-border space-y-4 shadow-warm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-warm-text flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warm-accent" />
                  <span>طابور المراجعة والتفعيل الفوري (Pending Receipts)</span>
                </h3>
              </div>

              {pendingSubs.length === 0 ? (
                <div className="py-12 text-center text-warm-muted text-xs">
                  لا توجد طلبات اشتراك معلقة حالياً. جميع المشتركين مفعلين!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl bg-warm-surface border border-amber-300 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-warm-text">{sub.tenantName}</span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                            {sub.amount} ج.م
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-warm-border text-xs space-y-1 shadow-xs">
                          <div className="flex justify-between">
                            <span className="text-warm-muted">طريقة التحويل:</span>
                            <span className="font-bold text-warm-text uppercase">{sub.method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-warm-muted">الحساب:</span>
                            <span className="font-mono text-warm-accent font-bold">{sub.senderAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-warm-muted">المرجع:</span>
                            <span className="font-mono text-stone-700">{sub.transactionRef}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-warm-border">
                        <button
                          onClick={() => verifySubscriptionPayment(sub.id, "verified")}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تأكيد وتفعيل الحساب فوراً</span>
                        </button>
                        <button
                          onClick={() => verifySubscriptionPayment(sub.id, "rejected")}
                          className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TENANT CUSTOMIZATION SETTINGS */}
        {activeTab === "tenant_settings" && (
          <div className="max-w-2xl mx-auto bg-white p-7 rounded-3xl border border-warm-border shadow-warm space-y-6">
            <div>
              <h2 className="text-lg font-black text-warm-text flex items-center gap-2">
                <Sliders className="w-5 h-5 text-warm-accent" />
                <span>محرك التخصيص الديناميكي: {activeTenant.name}</span>
              </h2>
              <p className="text-xs text-warm-muted mt-1">
                حدد مسميات الشاشات ونقاط الطلب والهوية البصرية لتنعكس فوراً في النظام.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم حفظ التعديلات وتحديث الشاشات فوراً!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-warm-text block">
                  مسمى محطة التجهيز (KDS Station Label):
                </label>
                <input
                  type="text"
                  value={stationLabel}
                  onChange={(e) => setStationLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-warm-text block">
                  مسمى نقطة الطلب (Order Point Label):
                </label>
                <input
                  type="text"
                  value={orderPointLabel}
                  onChange={(e) => setOrderPointLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-warm-text block">
                  لون الهوية الأساسي (Primary Color):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex items-center gap-2">
                    {["#D97706", "#B45309", "#059669", "#0071E3", "#E11D48"].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setPrimaryColor(col)}
                        className="w-7 h-7 rounded-full border border-warm-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-warm-text block">
                    ضريبة القيمة المضافة (%):
                  </label>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-warm-text block">
                    رسوم الخدمة (%):
                  </label>
                  <input
                    type="number"
                    value={serviceFeePercentage}
                    onChange={(e) => setServiceFeePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm transition-transform active:scale-98"
              >
                حفظ التعديلات وتطبيقها فوراً
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: PLANS */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 bg-white flex flex-col justify-between border shadow-warm ${
                    plan.recommended ? "border-amber-400 bg-amber-50/20" : "border-warm-border"
                  }`}
                >
                  <div className="space-y-4">
                    {plan.recommended && (
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                        الأكثر طلباً
                      </span>
                    )}
                    <div>
                      <h3 className="text-lg font-black text-warm-text">{plan.name}</h3>
                      <p className="text-xs text-warm-muted mt-1">{plan.description}</p>
                    </div>
                    <div className="pt-2 border-t border-warm-border">
                      <span className="text-3xl font-black text-warm-text">{plan.priceMonthly}</span>
                      <span className="text-xs text-warm-muted font-semibold mr-1">ج.م / شهرياً</span>
                    </div>
                    <ul className="space-y-2.5 pt-4 border-t border-warm-border text-xs text-stone-700">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </RoleGuard>
  );
}
