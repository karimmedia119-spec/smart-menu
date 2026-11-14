"use client";

import React from "react";
import { Order } from "../types";
import { useApp } from "../context/AppContext";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  X,
  CreditCard,
  PhoneCall,
} from "lucide-react";

interface LiveOrderTrackerProps {
  orderId: string;
  onClose: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  orderId,
  onClose,
}) => {
  const { orders, activeTenant, callWaiter } = useApp();
  const [waiterCalled, setWaiterCalled] = React.useState<string | null>(null);

  const order = orders.find((o) => o.id === orderId);

  if (!order) return null;

  const currency = activeTenant.branding.currency;

  const getStatusStep = () => {
    switch (order.status) {
      case "pending":
        return 1;
      case "preparing":
        return 2;
      case "ready":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  };

  const step = getStatusStep();

  const handleCallWaiter = (type: "assistance" | "bill") => {
    callWaiter(type);
    setWaiterCalled(type === "bill" ? "تم طلب الفاتورة بنجاح!" : "تم استدعاء المساعد لطاولتك!");
    setTimeout(() => setWaiterCalled(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-warm-card rounded-3xl border border-warm-border overflow-hidden shadow-warmLg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-warm-border flex items-center justify-between bg-warm-surface/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="text-xs font-bold text-warm-text uppercase tracking-wider">
              تتبع الطلب لحظياً (Live Tracker)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tracker Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-warm-card">
          {/* Order Title & Number */}
          <div className="text-center space-y-1">
            <div className="text-xs text-warm-muted font-semibold">
              {order.orderPointName} • {activeTenant.name}
            </div>
            <div className="text-3xl font-black text-warm-text tracking-tight">
              طلب رقم #{order.orderNumber}
            </div>
            <p className="text-xs text-warm-muted">
              {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Stepper (Apple Warm Style) */}
          <div className="relative pt-2 pb-4">
            <div className="absolute top-1/2 right-4 left-4 h-1 bg-stone-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 right-4 h-1 bg-gradient-to-l from-emerald-600 to-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width:
                  step === 1
                    ? "25%"
                    : step === 2
                    ? "60%"
                    : step === 3
                    ? "90%"
                    : "100%",
              }}
            />

            <div className="relative z-10 flex justify-between">
              {/* Step 1: Received */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    step >= 1
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-warm-border text-stone-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold mt-2 text-warm-text">
                  تم الاستلام
                </span>
              </div>

              {/* Step 2: Preparing */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    step >= 2
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-warm-border text-stone-400"
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold mt-2 text-warm-text">
                  قيد التجهيز
                </span>
              </div>

              {/* Step 3: Ready */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    step >= 3
                      ? "bg-emerald-600 text-white animate-pulse"
                      : "bg-white border border-warm-border text-stone-400"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold mt-2 text-warm-text">
                  جاهز للاستلام!
                </span>
              </div>
            </div>
          </div>

          {/* Current Status Highlight Card */}
          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              order.status === "ready"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                : order.status === "preparing"
                ? "bg-amber-50 border-amber-200 text-amber-900 font-bold"
                : "bg-stone-50 border-stone-200 text-stone-800 font-bold"
            }`}
          >
            <div className="text-xs">
              {order.status === "ready"
                ? "🎉 وجبتك جاهزة الآن! يتم التقديم إلى طاولتك أو شباك الاستلام."
                : order.status === "preparing"
                ? `👨‍🍳 يقوم فريق ${activeTenant.stationLabel} بتحضير طلبك بكل إتقان...`
                : "⏳ تم إرسال الطلب، في انتظار تأكيد الكاشير."}
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-warm-muted">تفاصيل عناصر الطلب:</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-warm-surface border border-warm-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-warm-accent">
                      {item.quantity}x
                    </span>
                    <span className="text-warm-text font-medium">{item.productName}</span>
                  </div>
                  <span className="text-warm-text font-bold">
                    {item.totalPrice} {currency}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-warm-border text-xs font-bold">
              <span className="text-warm-muted">الإجمالي النهائي:</span>
              <span className="text-sm font-extrabold text-warm-accent">
                {order.total.toFixed(1)} {currency}
              </span>
            </div>
          </div>

          {/* Toast Message if waiter was called */}
          {waiterCalled && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold animate-fadeIn">
              {waiterCalled}
            </div>
          )}

          {/* Actions: Request Bill / Call Waiter */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleCallWaiter("assistance")}
              className="py-2.5 px-3 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-text font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
              <span>استدعاء الويتر</span>
            </button>
            <button
              onClick={() => handleCallWaiter("bill")}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              <span>طلب الفاتورة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
