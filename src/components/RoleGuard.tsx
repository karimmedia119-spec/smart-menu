"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { ShieldAlert, ArrowRight, LogIn, Lock } from "lucide-react";

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
  const { currentUser, currentRole, hasRole } = useAuth();

  const isAuthorized = hasRole(allowedRoles);

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-warm-border shadow-warm text-center animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 text-warm-accent shadow-sm">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="text-2xl font-black text-warm-text mb-2 tracking-tight">
          منطقة محمية بنظام الصلاحيات (RBAC)
        </h2>
        <p className="text-sm text-warm-muted leading-relaxed mb-6">
          عفواً، يتطلب الوصول إلى شاشة{" "}
          <span className="font-bold text-warm-text font-sans">[{pageTitle}]</span> تسجيل الدخول بحساب يمتلك الصلاحية المناسبة.
          النظام مصمم بحماية أمنية مشددة تمنع الدخول غير المصرح به.
        </p>

        {/* Current Role Info */}
        <div className="bg-warm-bg rounded-2xl p-4 border border-warm-border mb-6 text-right space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-warm-muted">حالة الحساب الحالي:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                currentUser ? ROLE_LABELS[currentRole].color : "bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              {currentUser ? ROLE_LABELS[currentRole].title : "غير مسجل الدخول (زائر)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-warm-muted">الأدوار المصرح لها:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {allowedRoles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-semibold"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Go to Login / Home */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/login"
            className="flex-1 py-3 px-4 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            تسجيل الدخول بحسابك المخوّل
          </Link>
          <Link
            href="/"
            className="py-3 px-4 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-text font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};
