"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Building2,
  ChefHat,
  ReceiptText,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { users, switchUser, switchRole } = useAuth();
  const { addNewTenant, setActiveTenantId } = useApp();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registration Form State (7-day free trial)
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [businessType, setBusinessType] = useState<"restaurant" | "cafe" | "retail" | "pharmacy">("restaurant");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleRoleQuickLogin = (role: UserRole) => {
    switchRole(role);
    // Redirect logically based on role
    if (role === "SUPER_ADMIN" || role === "TENANT_ADMIN") {
      router.push("/admin");
    } else if (role === "CASHIER") {
      router.push("/cashier");
    } else if (role === "KITCHEN") {
      router.push("/kitchen");
    } else {
      router.push("/");
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (foundUser) {
      switchUser(foundUser.id);
      if (foundUser.role === "SUPER_ADMIN" || foundUser.role === "TENANT_ADMIN") {
        router.push("/admin");
      } else if (foundUser.role === "CASHIER") {
        router.push("/cashier");
      } else if (foundUser.role === "KITCHEN") {
        router.push("/kitchen");
      } else {
        router.push("/");
      }
    } else {
      // Allow flexible demo login
      setErrorMsg("البريد الإلكتروني غير مسجل، أو يمكنك استخدام أزرار الدخول السريع بالأدوار أدناه.");
    }
  };

  const handleRegisterNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim()) return;

    const slug =
      businessName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-") || `tenant-${Date.now()}`;

    // Provision new clean empty tenant with 7-day free trial
    const newTenant = addNewTenant({
      name: businessName,
      slug,
      businessType,
      stationLabel: businessType === "cafe" ? "البار وقسم القهوة" : "المطبخ الرئيسي",
      orderPointLabel: businessType === "cafe" ? "شباك استلام" : "طاولة",
      branding: {
        primaryColor: "#D97706",
        themeMode: "warm",
        fontFamily: "Cairo",
        currency: "ج.م",
        taxPercentage: 14,
        serviceFeePercentage: 0,
        logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80",
      },
      planTier: "pro",
      planStatus: "active",
      subscriptionStatus: "trial", // 7-day trial
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requireCashierApproval: false,
      enableSmartUpselling: true,
      ownerName,
      ownerPhone: ownerPhone || "01000000000",
      onboardingCompleted: false, // Brand new empty state
    });

    setActiveTenantId(newTenant.id);
    switchRole("TENANT_ADMIN");
    setRegSuccess(true);

    setTimeout(() => {
      router.push("/admin");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text flex flex-col justify-between py-8 px-4 selection:bg-warm-accent selection:text-white">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-10 h-10 rounded-2xl bg-warm-accent flex items-center justify-center text-white font-black text-xl shadow-warm transition-transform group-hover:scale-105">
            S
          </div>
          <span className="font-black text-xl tracking-tight text-warm-text flex items-center gap-1.5">
            Smart Menu
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-warm-surface border border-warm-border text-warm-muted">
              SaaS
            </span>
          </span>
        </Link>
        <p className="text-xs text-warm-muted">
          المنظومة السحابية المتكاملة للطلب اللحظي وإدارة المنشآت بتصميم دافئ فاخر
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 md:p-8 border border-warm-border shadow-warm animate-fadeIn">
        {/* Tabs: Login vs Register */}
        <div className="flex items-center bg-warm-surface p-1 rounded-2xl border border-warm-border mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "login"
                ? "bg-white text-warm-text shadow-sm border border-warm-border"
                : "text-warm-muted hover:text-warm-text"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "register"
                ? "bg-white text-warm-text shadow-sm border border-warm-border"
                : "text-warm-muted hover:text-warm-text"
            }`}
          >
            <span>حساب جديد</span>
            <span className="mr-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black">
              تجربة 7 أيام
            </span>
          </button>
        </div>

        {activeTab === "login" ? (
          <div>
            {/* Quick 1-Click Role Login (Seamless testing & isolated demo) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-warm-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-warm-accent" />
                  <span>دخول مباشر وسريع حسب الدور (RBAC):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin("SUPER_ADMIN")}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-100 text-right transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-purple-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                      <span>مالك المنصة</span>
                    </div>
                    <div className="text-[10px] text-purple-700">تراخيص المشتركين والحسابات</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-mono font-bold">
                    Super Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin("TENANT_ADMIN")}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100 text-right transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-blue-950 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>مدير المطعم</span>
                    </div>
                    <div className="text-[10px] text-blue-700">المنيو، الأسعار، والإعدادات</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 font-mono font-bold">
                    Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin("CASHIER")}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100 text-right transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-emerald-950 flex items-center gap-1">
                      <ReceiptText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>الكاشير (POS)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700">نقاط البيع والفواتير والوردية</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold">
                    Cashier
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleQuickLogin("KITCHEN")}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100 text-right transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-amber-950 flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                      <span>شاشة التجهيز</span>
                    </div>
                    <div className="text-[10px] text-amber-700">طلبات التحضير اللحظية KDS</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold">
                    Kitchen
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin("CUSTOMER")}
                className="w-full mt-2 p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-right transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-warm-accent" />
                  <span>دخول كعميل الصالة (تصفح القائمة والطلب من الطاولة)</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                  Guest
                </span>
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-warm-muted font-bold">أو تسجيل الدخول ببريدك</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4">
                {errorMsg}
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-warm-muted absolute right-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">كلمة المرور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-warm-muted absolute right-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-warm-muted hover:text-warm-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-warm-muted">
                  <input type="checkbox" defaultChecked className="rounded border-warm-border text-warm-accent" />
                  <span>تذكر بيانات دخولي</span>
                </label>
                <a href="#" className="text-warm-accent hover:underline font-bold">
                  نسيت كلمة المرور؟
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-warm-text hover:bg-stone-800 text-white font-black text-xs transition-colors shadow-warm flex items-center justify-center gap-2"
              >
                <span>دخول إلى لوحة العمل</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* 7-Day Free Trial Registration */}
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-right flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-warm-accent shrink-0" />
              <div>
                <div className="text-xs font-black text-amber-950">
                  فترة تجربة مجانية كاملة لمدة 7 أيام!
                </div>
                <div className="text-[11px] text-amber-800">
                  ابدأ فوراً بنظام نظيف تماماً مع إرشادات تشغيلية خطوة بخطوة، بدون طلب بطاقة بنكية.
                </div>
              </div>
            </div>

            {regSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold mb-4 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم إنشاء نشاطك التجاري بنجاح! جاري توجيهك إلى لوحة التحكم...</span>
              </div>
            )}

            <form onSubmit={handleRegisterNewTenant} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">
                  اسم النشاط التجاري (المطعم / الكافيه):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطعم شاورما كينج"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">نوع النشاط:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "restaurant", label: "مطعم مأكولات" },
                    { id: "cafe", label: "كافيه / مقهى" },
                    { id: "retail", label: "محل تجزئة / حلويات" },
                    { id: "pharmacy", label: "صيدلية / معمل" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBusinessType(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        businessType === item.id
                          ? "bg-amber-50 border-warm-accent text-warm-text shadow-xs"
                          : "bg-warm-surface border-warm-border text-warm-muted"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">اسم المسؤول / المالك:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ. محمد عبد الله"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">رقم الهاتف للتواصل:</label>
                <input
                  type="tel"
                  placeholder="مثال: 010xxxxxxxx"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={regSuccess}
                className="w-full py-3.5 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-black text-xs transition-all shadow-warm flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>بدء التجربة المجانية الآن (7 أيام)</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Return Home */}
      <div className="max-w-md w-full mx-auto text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text font-bold transition-colors"
        >
          <span>العودة للصفحة الرئيسية للعملاء</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
