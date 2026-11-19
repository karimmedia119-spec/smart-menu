"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { ShieldAlert, ArrowRight, LogIn, Key, Sparkles, CheckCircle2 } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  pageTitle: string;
  children: React.ReactNode;
}

const ROLE_LABELS: Record<UserRole, { title: string; color: string; desc: string }> = {
  SUPER_ADMIN: {
    title: "صاحب المنصة المركزية (Super Admin)",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    desc: "التحكم بكافة الأنشطة التجارية والتراخيص وتفعيل الاشتراكات",
  },
  TENANT_ADMIN: {
    title: "مدير النشاط التجاري (Tenant Admin)",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    desc: "إدارة المنيو، الأسعار، الطاولات، المخزون وإعدادات الهوية",
  },
  CASHIER: {
    title: "الكاشير ونقاط البيع (Cashier / POS)",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    desc: "استقبال الطلبات، تحصيل الفواتير، طباعة الإيصالات، تقفيل الوردية",
  },
  KITCHEN: {
    title: "محطة التجهيز الذكية (KDS Prep Station)",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    desc: "عرض وتوقيت طلبات التحضير والتنبيهات المباشرة",
  },
  CUSTOMER: {
    title: "العميل في الصالة (Customer / Dine-in)",
    color: "bg-stone-100 text-stone-800 border-stone-300",
    desc: "تصفح القائمة بالباركود وإرسال وتتبع الطلبات",
  },
};

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  pageTitle,
  children,
}) => {
  const { currentUser, currentRole, hasRole, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthorized = hasRole(allowedRoles);

  if (isAuthorized) {
    return <>{children}</>;
  }

  const handleQuickUnlock = (role: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);

    let defaultEmail = "superadmin@smartmenu.app";
    if (role === "TENANT_ADMIN") defaultEmail = "prince@smartmenu.app";
    if (role === "KITCHEN") defaultEmail = "chef@smartmenu.app";
    if (role === "CASHIER") defaultEmail = "cashier@smartmenu.app";

    const res = login(defaultEmail, "password123");
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "تعذر تفعيل الدخول المباشر.");
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("يرجى ملء البريد وكلمة المرور.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "بيانات الدخول غير صحيحة.");
    }
  };

  const isKitchenTarget = allowedRoles.includes("KITCHEN");
  const isCashierTarget = allowedRoles.includes("CASHIER");
  const isAdminTarget = allowedRoles.includes("SUPER_ADMIN") || allowedRoles.includes("TENANT_ADMIN");

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-warm-border shadow-warm text-center animate-fadeIn">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-warm-accent shadow-xs">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>

        <h2 className="text-xl font-black text-warm-text mb-1 tracking-tight">
          منطقة محمية بنظام الصلاحيات (RBAC)
        </h2>
        <p className="text-xs text-warm-muted leading-relaxed mb-5">
          للوصول إلى شاشة <span className="font-bold text-warm-text font-sans">[{pageTitle}]</span>، يرجى تفعيل الدخول بالصلاحية المخوّلة:
        </p>

        {/* 1-Click Fast Unlock Button */}
        <div className="space-y-2.5 mb-5">
          {isAdminTarget && (
            <>
              <button
                type="button"
                onClick={() => handleQuickUnlock("SUPER_ADMIN")}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <Key className="w-4 h-4" />
                <span>🔑 الدخول الفوري كمالك المنصة (Super Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickUnlock("TENANT_ADMIN")}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <Key className="w-4 h-4" />
                <span>🏢 الدخول كمدير المطعم (Tenant Admin)</span>
              </button>
            </>
          )}

          {isKitchenTarget && (
            <button
              type="button"
              onClick={() => handleQuickUnlock("KITCHEN")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>👨‍🍳 تفعيل محطة المطبخ والبار الآن (Kitchen KDS)</span>
            </button>
          )}

          {isCashierTarget && (
            <button
              type="button"
              onClick={() => handleQuickUnlock("CASHIER")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🧾 تفعيل شاشة الكاشير ونقاط البيع (POS)</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-warm-border"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-warm-muted font-bold">أو تسجيل الدخول بحساب مخصص</span>
          </div>
        </div>

        {/* Inline Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-3 text-right">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-warm-muted block mb-1">البريد الإلكتروني:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smartmenu.app"
              className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text outline-none focus:border-warm-accent"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-warm-muted block mb-1">كلمة المرور:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text outline-none focus:border-warm-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول ومتابعة</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-warm-border flex justify-between items-center text-xs">
          <Link href="/" className="text-warm-muted hover:text-warm-text flex items-center gap-1 font-bold">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>العودة لقائمة الصالة</span>
          </Link>
          <Link href="/login" className="text-warm-accent hover:underline font-bold">
            صفحة تسجيل المشتركين الجدد ↗
          </Link>
        </div>
      </div>
    </div>
  );
};
