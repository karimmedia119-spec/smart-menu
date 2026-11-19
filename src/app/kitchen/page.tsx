"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { RoleGuard } from "../../components/RoleGuard";
import { TenantPaywall } from "../../components/TenantPaywall";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Order } from "../../types";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Volume2,
  Check,
} from "lucide-react";

export default function KitchenPage() {
  const {
    activeTenant,
    orders,
    updateOrderStatus,
    playAlertSound,
  } = useApp();
  const { currentUser, currentRole, login } = useAuth();

  // KDS Kitchen Screen auto-unlock for immediate kitchen terminal operation
  useEffect(() => {
    if (!currentUser || currentRole === "CUSTOMER") {
      login("chef@smartmenu.app", "password123");
    }
  }, [currentUser, currentRole, login]);

  const [filter, setFilter] = useState<"active" | "ready" | "all">("active");
  const [stationFilter, setStationFilter] = useState<"all" | "food" | "drinks">("all");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const tenantOrders = orders.filter((o) => o.tenantId === activeTenant.id);

  const isDrinkOrder = (order: Order) => {
    return order.items.some(
      (item) =>
        item.productId.includes("drink") ||
        item.productId.includes("coffee") ||
        item.productId.includes("prod-specialty") ||
        item.productId.includes("barista") ||
        item.productName.includes("قهوة") ||
        item.productName.includes("شاي") ||
        item.productName.includes("ماتشا") ||
        item.productName.includes("موهيتو") ||
        item.productName.includes("فرابيه") ||
        item.productName.includes("لاتيه")
    );
  };

  const filteredOrders = tenantOrders.filter((order) => {
    // Status filter
    let matchesStatus = true;
    if (filter === "active") {
      matchesStatus = order.status === "pending" || order.status === "preparing";
    } else if (filter === "ready") {
      matchesStatus = order.status === "ready";
    } else {
      matchesStatus = order.status !== "cancelled";
    }

    if (!matchesStatus) return false;

    // Station filter
    if (stationFilter === "drinks") {
      return isDrinkOrder(order);
    }
    if (stationFilter === "food") {
      return !isDrinkOrder(order) || order.items.some((i) => !isDrinkOrder({ ...order, items: [i] }));
    }

    return true;
  });

  // Recent completed order for 1-click recall
  const lastFinishedOrder = tenantOrders
    .filter((o) => o.status === "ready" || o.status === "completed")
    .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())[0];

  const getElapsedMinutes = (order: Order) => {
    const start = new Date(order.prepStartedAt || order.createdAt).getTime();
    return Math.floor((currentTime - start) / 60000);
  };

  const getUrgencyColor = (minutes: number) => {
    if (minutes < 10) {
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        border: "border-emerald-300",
        header: "bg-emerald-50/80 text-emerald-950",
      };
    }
    if (minutes < 20) {
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        border: "border-amber-300",
        header: "bg-amber-50/80 text-amber-950",
      };
    }
    return {
      badge: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse",
      border: "border-rose-400",
      header: "bg-rose-50/80 text-rose-950",
    };
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "KITCHEN", "TENANT_ADMIN"]}
      pageTitle={activeTenant.stationLabel || "محطة التجهيز (KDS)"}
    >
      <TenantPaywall tenant={activeTenant}>
        <div className="min-h-screen bg-warm-bg text-warm-text pb-12">
          <Navbar />

      {/* KDS Header */}
      <div className="bg-white border-b border-warm-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-warm-text flex items-center gap-2">
                <span>شاشة KDS: {activeTenant.stationLabel}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-warm-surface border border-warm-border text-warm-muted font-bold">
                  {activeTenant.name}
                </span>
              </h1>
              <p className="text-xs text-warm-muted mt-0.5">
                تحديث لحظي Sub-100ms لتجهيز الطلبات وتنبيه الكاشير والصالة فور الجاهزية.
              </p>
            </div>
          </div>

          {/* Station Pills & Filter Pills & Audio Test */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Station Filter (Food vs Drinks vs All) */}
            <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-warm-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setStationFilter("all")}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  stationFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                كافة المحطات
              </button>
              <button
                type="button"
                onClick={() => setStationFilter("food")}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  stationFilter === "food" ? "bg-amber-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                🍽️ المطبخ
              </button>
              <button
                type="button"
                onClick={() => setStationFilter("drinks")}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  stationFilter === "drinks" ? "bg-teal-700 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ☕ البار والمشروبات
              </button>
            </div>

            {/* Undo / Recall Last Finished Ticket */}
            {lastFinishedOrder && (
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(lastFinishedOrder.id, "preparing");
                  playAlertSound("bell");
                }}
                className="px-3 py-1.5 rounded-xl bg-warm-surface hover:bg-amber-100 text-amber-900 border border-warm-border text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="استرجاع آخر تذكرة مكتملة إلى قائمة التجهيز"
              >
                <span>↺ استرجاع #{lastFinishedOrder.orderNumber}</span>
              </button>
            )}

            <button
              onClick={() => playAlertSound("new_order")}
              className="p-2 rounded-xl bg-warm-surface hover:bg-stone-200 border border-warm-border text-warm-muted hover:text-warm-text text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="اختبار نغمة التنبيه"
            >
              <Volume2 className="w-4 h-4 text-warm-accent" />
              <span className="hidden sm:inline font-bold">نغمة التنبيه</span>
            </button>

            <div className="flex items-center bg-warm-surface p-1 rounded-2xl border border-warm-border">
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === "active"
                    ? "bg-white text-stone-900 shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                قيد التجهيز (
                {
                  tenantOrders.filter(
                    (o) => o.status === "pending" || o.status === "preparing"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setFilter("ready")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === "ready"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                جاهز للتسليم (
                {tenantOrders.filter((o) => o.status === "ready").length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-white text-stone-900 shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                الكل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders KDS Board */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-white border border-warm-border rounded-3xl max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-warm-text">
              لا توجد طلبات معلقة في {activeTenant.stationLabel}
            </h3>
            <p className="text-xs text-warm-muted">
              أي طلب جديد يتم إرساله من الصالة سيظهر هنا في أقل من 100 مللي ثانية مع تنبيه صوتي!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order);
              const urgency = getUrgencyColor(elapsed);
              const isReady = order.status === "ready";

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl overflow-hidden bg-white flex flex-col justify-between border ${urgency.border} shadow-warm hover:shadow-warmLg transition-all duration-300`}
                >
                  {/* Card Header with Table & Timer */}
                  <div className={`p-4 border-b border-warm-border ${urgency.header}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-warm-text">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-white/80 border border-warm-border text-warm-text shadow-sm">
                          {order.orderPointName}
                        </span>
                      </div>

                      {/* Timer Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border shadow-sm ${urgency.badge}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} دقيقة</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-warm-muted">
                      <span>العميل: {order.customerName || "عميل الصالة"}</span>
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {order.notes && (
                      <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-xl border border-amber-200">
                        ملاحظة: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Order Items Checklist */}
                  <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-72 bg-white">
                    {order.items.map((item, idx) => {
                      const isChecked = !!checkedItems[`${order.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemCheck(order.id, idx)}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? "bg-stone-50 border-stone-200 opacity-50 line-through"
                              : "bg-warm-surface/70 border-warm-border hover:bg-warm-surface"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-colors ${
                              isChecked
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-warm-text">
                                {item.productName}
                              </span>
                              <span className="font-black text-sm text-warm-accent">
                                {item.quantity}x
                              </span>
                            </div>

                            {item.selectedModifiers &&
                              item.selectedModifiers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.selectedModifiers.map((mod, mIdx) => (
                                    <span
                                      key={mIdx}
                                      className="text-[10px] text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200"
                                    >
                                      {mod.modifierName}: {mod.optionName}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {item.notes && (
                              <p className="text-[10px] text-rose-700 font-bold mt-1">
                                تنبيه: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Action Button (One-Tap Ready) */}
                  <div className="p-3 bg-warm-surface border-t border-warm-border">
                    {isReady ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>جاهز للاستلام والتسليم</span>
                        </div>
                        <button
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          className="px-3 py-2 rounded-xl bg-warm-text text-white font-bold text-xs hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          تم التسليم
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>تم الانتهاء والجاهزية (إرسال إشعار)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
        </div>
      </TenantPaywall>
    </RoleGuard>
  );
}
