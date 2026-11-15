"use client";

import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Sliders,
  Utensils,
  Plus,
  QrCode,
  ChefHat,
  ArrowRight,
  BookOpen,
  Zap,
} from "lucide-react";
import { TenantSettings } from "../types";

interface OnboardingGuideProps {
  tenant: TenantSettings;
  categoriesCount: number;
  productsCount: number;
  tablesCount: number;
  onLoadSampleMenu: () => void;
  onOpenAddProduct: () => void;
  onNavigateTab: (tab: "menu_manager" | "tables_qr" | "tenant_settings") => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  tenant,
  categoriesCount,
  productsCount,
  tablesCount,
  onLoadSampleMenu,
  onOpenAddProduct,
  onNavigateTab,
}) => {
  // Step completion calculation
  const hasBranding = tenant.name && tenant.stationLabel;
  const hasCategories = categoriesCount > 0;
  const hasProducts = productsCount > 0;
  const hasTables = tablesCount > 0;

  const completedSteps = [hasBranding, hasCategories, hasProducts, hasTables].filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-6 md:p-8 shadow-warm space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-warm-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-warm-accent" />
            <span>دليل البدء السريع وإرشادات التشغيل</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-warm-text tracking-tight">
            مرحباً بك في منصة Smart Menu!
          </h2>
          <p className="text-xs text-warm-muted mt-1 leading-relaxed max-w-xl">
            نشاطك التجاري <strong className="text-warm-text">[{tenant.name}]</strong> جاهز ومفعل بفترة
            تجربة مجانية لمدة أسبوع (7 أيام). اتبع هذه الخطوات البسيطة لإطلاق قائمتك الذكية واستقبال
            أول طلب في صالتك!
          </p>
        </div>

        {/* Progress Circle / Bar */}
        <div className="bg-warm-surface p-4 rounded-2xl border border-warm-border shrink-0 text-center w-full md:w-48 shadow-xs">
          <div className="text-xs text-warm-muted font-bold mb-1">اكتمال الإعداد:</div>
          <div className="text-2xl font-black text-warm-text">{progressPercent}%</div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-warm-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-warm-muted mt-1 font-semibold">
            {completedSteps} من 4 خطوات مكتملة
          </div>
        </div>
      </div>

      {/* 4 Steps Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Step 1: Branding & Station Name */}
        <div
          onClick={() => onNavigateTab("tenant_settings")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all text-right flex items-start gap-3.5 ${
            hasBranding
              ? "bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/50"
              : "bg-warm-surface border-warm-border hover:border-warm-accent"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasBranding ? "bg-emerald-100 text-emerald-700" : "bg-warm-surface border border-warm-border text-warm-text"
            }`}
          >
            {hasBranding ? <CheckCircle2 className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-warm-text">1. مسميات المحطة والهوية</h4>
              <span className="text-[10px] font-bold text-warm-muted">الخطوة 1</span>
            </div>
            <p className="text-[11px] text-warm-muted mt-1 leading-relaxed">
              تحديد اسم محطة التحضير ({tenant.stationLabel}) واسم موقع الطلب ({tenant.orderPointLabel}) والألوان.
            </p>
          </div>
        </div>

        {/* Step 2: Categories */}
        <div
          onClick={() => onNavigateTab("menu_manager")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all text-right flex items-start gap-3.5 ${
            hasCategories
              ? "bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/50"
              : "bg-warm-surface border-warm-border hover:border-warm-accent"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasCategories ? "bg-emerald-100 text-emerald-700" : "bg-warm-surface border border-warm-border text-warm-text"
            }`}
          >
            {hasCategories ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-warm-text">2. تصنيفات وأقسام المنيو</h4>
              <span className="text-[10px] font-bold text-warm-muted">الخطوة 2</span>
            </div>
            <p className="text-[11px] text-warm-muted mt-1 leading-relaxed">
              تنظيم الأطباق في أقسام واضحة (مقبلات، أطباق رئيسية، مشروبات، حلويات).
            </p>
          </div>
        </div>

        {/* Step 3: Products */}
        <div
          onClick={onOpenAddProduct}
          className={`cursor-pointer p-4 rounded-2xl border transition-all text-right flex items-start gap-3.5 ${
            hasProducts
              ? "bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/50"
              : "bg-warm-surface border-warm-border hover:border-warm-accent"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasProducts ? "bg-emerald-100 text-emerald-700" : "bg-warm-surface border border-warm-border text-warm-text"
            }`}
          >
            {hasProducts ? <CheckCircle2 className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-warm-text">3. إضافة الأطباق والأسعار</h4>
              <span className="text-[10px] font-bold text-warm-muted">الخطوة 3</span>
            </div>
            <p className="text-[11px] text-warm-muted mt-1 leading-relaxed">
              رفع صور الأطباق وتحديد الأسعار وخيارات الحجم والإضافات وإدارة المخزون.
            </p>
          </div>
        </div>

        {/* Step 4: Tables & QR */}
        <div
          onClick={() => onNavigateTab("tables_qr")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all text-right flex items-start gap-3.5 ${
            hasTables
              ? "bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/50"
              : "bg-warm-surface border-warm-border hover:border-warm-accent"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasTables ? "bg-emerald-100 text-emerald-700" : "bg-warm-surface border border-warm-border text-warm-text"
            }`}
          >
            {hasTables ? <CheckCircle2 className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-warm-text">4. رموز QR والطاولات</h4>
              <span className="text-[10px] font-bold text-warm-muted">الخطوة 4</span>
            </div>
            <p className="text-[11px] text-warm-muted mt-1 leading-relaxed">
              توليد وطباعة أوراق الـ QR لجميع الطاولات ليمسحها العميل ويبدأ الطلب.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar for Instant Setup */}
      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-warm-accent shrink-0" />
          <div>
            <div className="text-xs font-black text-warm-text">
              تريد تجربة شكل المنظومة كاملة فوراً دون إدخال بيانات يدوية؟
            </div>
            <div className="text-[11px] text-warm-muted">
              يمكنك بضغطة زر واحدة تحميل قائمة طعام وأقسام وطاولات تجريبية للمعاينة الحية والتجربة.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onLoadSampleMenu}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-black text-xs transition-all shadow-warm flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            <span>تحميل قائمة تجريبية جاهزة</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-warm-border text-warm-text font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف من الصفر</span>
          </button>
        </div>
      </div>
    </div>
  );
};
