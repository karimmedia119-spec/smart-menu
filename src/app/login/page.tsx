"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, registerUser } = useAuth();
  const { addNewTenant, setActiveTenantId } = useApp();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State (7-day free trial)
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [businessType, setBusinessType] = useState<"restaurant" | "cafe" | "retail" | "pharmacy">("restaurant");
  const [regSuccess, setRegSuccess] = useState(false);

  // Manual Login Handler (NO auto login)
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const result = login(email, password);

    if (result.success && result.user) {
      // If user is tied to a specific tenant, activate it
      if (result.user.tenantId) {
        setActiveTenantId(result.user.tenantId);
      }

      // Redirect strictly by role
      setTimeout(() => {
        setIsLoading(false);
        if (result.user?.role === "SUPER_ADMIN" || result.user?.role === "TENANT_ADMIN") {
          router.push("/admin");
        } else if (result.user?.role === "CASHIER") {
          router.push("/cashier");
        } else if (result.user?.role === "KITCHEN") {
          router.push("/kitchen");
        } else {
          router.push("/");
        }
      }, 500);
    } else {
      setIsLoading(false);
      setErrorMsg(result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const handleRegisterNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg("يرجى ملء كافة الحقول الإلزامية");
      return;
    }

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

    // Register User with their entered credentials
    registerUser({
      name: ownerName,
      email: regEmail,
      password: regPassword,
      phone: ownerPhone,
      role: "TENANT_ADMIN",
      tenantId: newTenant.id,
    });

    setActiveTenantId(newTenant.id);
    setRegSuccess(true);

    setTimeout(() => {
      router.push("/admin");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text flex flex-col justify-between py-10 px-4 selection:bg-warm-accent selection:text-white">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-11 h-11 rounded-2xl bg-warm-accent flex items-center justify-center text-white font-black text-2xl shadow-warm transition-transform group-hover:scale-105">
            S
          </div>
          <span className="font-black text-2xl tracking-tight text-warm-text flex items-center gap-1.5">
            Smart Menu
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-warm-surface border border-warm-border text-warm-muted">
              SaaS
            </span>
          </span>
        </Link>
        <p className="text-xs text-warm-muted">
          بوابة تسجيل الدخول الآمنة للمنظومة السحابية لإدارة المطاعم والمنشآت
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 md:p-8 border border-warm-border shadow-warm animate-fadeIn">
        {/* Tabs: Login vs Register */}
        <div className="flex items-center bg-warm-surface p-1 rounded-2xl border border-warm-border mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "login"
                ? "bg-white text-warm-text shadow-sm border border-warm-border"
                : "text-warm-muted hover:text-warm-text"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "register"
                ? "bg-white text-warm-text shadow-sm border border-warm-border"
                : "text-warm-muted hover:text-warm-text"
            }`}
          >
            <span>حساب جديد</span>
            <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
              تجربة 7 أيام
            </span>
          </button>
        </div>

        {activeTab === "login" ? (
          <div>
            <div className="mb-5 text-right">
              <h2 className="text-base font-black text-warm-text">تسجيل الدخول إلى حسابك</h2>
              <p className="text-xs text-warm-muted mt-0.5">
                أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى لوحة التحكم الخاصة بك
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email & Password Pure Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1.5">
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-warm-muted absolute right-3.5 top-3.5" />
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
                <label className="block text-xs font-bold text-warm-text mb-1.5">كلمة المرور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-warm-muted absolute right-3.5 top-3.5" />
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
                    className="absolute left-3.5 top-3.5 text-warm-muted hover:text-warm-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-warm-muted">
                  <input type="checkbox" defaultChecked className="rounded border-warm-border text-warm-accent" />
                  <span>تذكر بيانات دخولي</span>
                </label>
                <span className="text-[11px] text-warm-muted">حماية وتشفير SSL</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-warm-accent hover:bg-amber-600 active:scale-[0.99] text-white font-black text-xs transition-all shadow-warm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>جاري التحقق من البيانات...</span>
                ) : (
                  <>
                    <span>تسجيل الدخول الآن</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
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
                  أنشئ حسابك الآن وسجل الدخول بنظام نظيف تماماً مع إرشادات تشغيلية خطوة بخطوة.
                </div>
              </div>
            </div>

            {regSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold mb-4 flex items-center gap-2 animate-fadeIn text-right">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم إنشاء حسابك ونشاطك بنجاح! جاري تحويلك إلى لوحة التحكم...</span>
              </div>
            )}

            <form onSubmit={handleRegisterNewTenant} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">
                  اسم النشاط التجاري (المطعم / الكافيه): *
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
                <label className="block text-xs font-bold text-warm-text mb-1">اسم المسؤول / المالك: *</label>
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
                <label className="block text-xs font-bold text-warm-text mb-1">
                  البريد الإلكتروني لتسجيل الدخول: *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@myrestaurant.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">كلمة المرور للحساب: *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
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
                <span>إنشاء الحساب وبدء التجربة المجانية (7 أيام)</span>
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
