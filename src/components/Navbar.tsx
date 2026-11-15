"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { TrialBanner } from "./TrialBanner";
import {
  UtensilsCrossed,
  ChefHat,
  ReceiptText,
  ShieldCheck,
  Building2,
  ChevronDown,
  PlusCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  UserCheck,
  Lock,
  Sparkles,
  LogIn,
} from "lucide-react";

const ROLE_DISPLAY: Record<UserRole, { label: string; badge: string; color: string }> = {
  SUPER_ADMIN: {
    label: "مالك المنصة",
    badge: "Super Admin",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  TENANT_ADMIN: {
    label: "مدير المطعم",
    badge: "Tenant Admin",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CASHIER: {
    label: "الكاشير",
    badge: "Cashier",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  KITCHEN: {
    label: "المطبخ KDS",
    badge: "Kitchen",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  CUSTOMER: {
    label: "العميل",
    badge: "Guest",
    color: "bg-stone-100 text-stone-800 border-stone-200",
  },
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    activeTenant,
    tenants,
    setActiveTenantId,
    orders,
    subscriptions,
    isOnline,
    soundEnabled,
    toggleSound,
  } = useApp();

  const { currentUser, currentRole, switchRole } = useAuth();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Pending counts for badges
  const tenantOrders = orders.filter((o) => o.tenantId === activeTenant.id);
  const activePrepOrdersCount = tenantOrders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  ).length;
  const unpaidCashierOrdersCount = tenantOrders.filter(
    (o) => o.paymentStatus === "unpaid" && o.status !== "cancelled"
  ).length;
  const pendingSubscriptionsCount = subscriptions.filter(
    (s) => s.status === "pending"
  ).length;

  const isTenantExpired =
    activeTenant.subscriptionStatus === "expired" ||
    activeTenant.subscriptionStatus === "suspended" ||
    new Date(activeTenant.subscriptionExpiry).getTime() < Date.now();

  const navLinks = [
    {
      href: "/",
      label: "الصالة (العميل)",
      icon: UtensilsCrossed,
      badge: null,
      allowed: true,
    },
    {
      href: "/kitchen",
      label: activeTenant.stationLabel || "محطة التجهيز",
      icon: ChefHat,
      badge: activePrepOrdersCount > 0 ? activePrepOrdersCount : null,
      badgeColor: "bg-amber-600 text-white",
      allowed: currentRole === "SUPER_ADMIN" || currentRole === "KITCHEN" || currentRole === "TENANT_ADMIN",
    },
    {
      href: "/cashier",
      label: "الكاشير والإدارة",
      icon: ReceiptText,
      badge: unpaidCashierOrdersCount > 0 ? unpaidCashierOrdersCount : null,
      badgeColor: "bg-stone-800 text-white",
      allowed: currentRole === "SUPER_ADMIN" || currentRole === "CASHIER" || currentRole === "TENANT_ADMIN",
    },
    {
      href: "/admin",
      label: currentRole === "SUPER_ADMIN" ? "المنصة المركزية & المنيو" : "إدارة المنيو والفرع",
      icon: ShieldCheck,
      badge: pendingSubscriptionsCount > 0 ? pendingSubscriptionsCount : null,
      badgeColor: "bg-emerald-600 text-white",
      allowed: currentRole === "SUPER_ADMIN" || currentRole === "TENANT_ADMIN",
    },
  ];

  return (
    <>
      <TrialBanner tenant={activeTenant} />
      <header className="sticky top-0 z-50 glass-panel border-b border-warm-border px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Tenant Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-warm transition-transform group-hover:scale-105"
              style={{ backgroundColor: activeTenant.branding.primaryColor || "#D97706" }}
            >
              S
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-warm-text flex items-center gap-1.5">
                Smart Menu
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-warm-surface border border-warm-border text-warm-muted">
                  Warm SaaS
                </span>
              </span>
            </div>
          </Link>

          {/* Tenant Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setTenantDropdownOpen(!tenantDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-xs font-medium text-warm-text transition-colors shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-warm-muted" />
              <span className="truncate max-w-[120px] sm:max-w-[160px] font-bold text-warm-text">
                {activeTenant.name}
              </span>
              {isTenantExpired && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="منتهي الاشتراك" />
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-warm-muted transition-transform ${
                  tenantDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-warm-border mb-1">
                  <div className="text-[11px] font-medium text-warm-muted">
                    النشاط التجاري النشط:
                  </div>
                  <div className="text-xs font-bold text-warm-text flex items-center justify-between mt-0.5">
                    <span>{activeTenant.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        isTenantExpired
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isTenantExpired ? "منتهي / معلق" : `باقة ${activeTenant.planTier}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {tenants.map((tenant) => {
                    const isExpired =
                      tenant.subscriptionStatus === "expired" ||
                      tenant.subscriptionStatus === "suspended" ||
                      new Date(tenant.subscriptionExpiry).getTime() < Date.now();
                    return (
                      <button
                        key={tenant.id}
                        onClick={() => {
                          setActiveTenantId(tenant.id);
                          setTenantDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-right ${
                          tenant.id === activeTenant.id
                            ? "bg-warm-surface text-warm-text font-bold border border-warm-border"
                            : "text-warm-muted hover:bg-stone-50 hover:text-warm-text"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-warm-text flex items-center gap-1.5">
                            {tenant.name}
                            {isExpired && (
                              <span className="text-[9px] px-1 bg-rose-100 text-rose-700 rounded font-normal">
                                معلق
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-warm-muted">
                            {tenant.stationLabel} • {tenant.orderPointLabel}
                          </span>
                        </div>
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: tenant.branding.primaryColor }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-warm-border mt-2 pt-2">
                  <Link
                    href="/onboarding"
                    onClick={() => setTenantDropdownOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-warm-text text-white font-semibold text-xs hover:bg-stone-800 transition-colors shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    تسجيل نشاط تجاري جديد
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Switcher for the 3 Branches */}
        <nav className="flex items-center gap-1 bg-warm-surface/80 p-1 rounded-2xl border border-warm-border overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-warm-text font-bold shadow-sm border border-warm-border"
                    : link.allowed
                    ? "text-warm-muted hover:text-warm-text hover:bg-white/50"
                    : "text-stone-400 hover:text-stone-500 opacity-70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-warm-accent" : "text-warm-muted"
                  }`}
                />
                <span>{link.label}</span>
                {!link.allowed && <Lock className="w-2.5 h-2.5 text-stone-400 inline" />}
                {link.badge !== null && (
                  <span
                    className={`min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse ${link.badgeColor}`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Role Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* RBAC Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setTenantDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                ROLE_DISPLAY[currentRole].color
              }`}
              title="تغيير صلاحية الدخول لتجربة النظام"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{ROLE_DISPLAY[currentRole].label}</span>
              <span className="text-[10px] uppercase font-mono px-1 rounded bg-white/70">
                {ROLE_DISPLAY[currentRole].badge}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-fadeIn text-right">
                <div className="px-3 py-1.5 border-b border-warm-border mb-1 text-[11px] text-warm-muted font-bold flex items-center justify-between">
                  <span>الصلاحيات والأدوار (RBAC)</span>
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>

                <div className="space-y-1">
                  {(Object.keys(ROLE_DISPLAY) as UserRole[]).map((r) => {
                    const info = ROLE_DISPLAY[r];
                    const isSelected = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          isSelected
                            ? "bg-amber-50 text-warm-text font-bold border border-warm-accent"
                            : "text-warm-muted hover:bg-stone-50 hover:text-warm-text"
                        }`}
                      >
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-warm-text">{info.label}</span>
                          <span className="text-[10px] text-warm-muted">{info.badge}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${info.color}`}
                        >
                          {r}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "كتم الصوت" : "تشغيل التنبيهات الصوتية"}
            className="p-1.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-muted hover:text-warm-text transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-warm-accent" />
            ) : (
              <VolumeX className="w-4 h-4 text-warm-muted" />
            )}
          </button>

          {/* Real-time / Offline Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>أوفلاين</span>
              </>
            )}
          </div>

          {/* Login / Auth Portal link */}
          <Link
            href="/login"
            title="صفحة تسجيل الدخول وإدارة الحساب"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-text font-bold text-xs transition-colors shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5 text-warm-accent" />
            <span className="hidden sm:inline">دخول</span>
          </Link>
        </div>
      </div>
    </header>
  </>
);
};
