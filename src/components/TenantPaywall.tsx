"use client";

import React, { useState } from "react";
import { TenantSettings } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Send,
  Zap,
  ArrowRight,
} from "lucide-react";

interface TenantPaywallProps {
  tenant: TenantSettings;
  children: React.ReactNode;
}

export const TenantPaywall: React.FC<TenantPaywallProps> = ({ tenant, children }) => {
  const { submitSubscriptionPayment, updateActiveTenantSettings } = useApp();
  const { currentRole } = useAuth();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">(tenant.planTier);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [senderAccount, setSenderAccount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [method, setMethod] = useState<"instapay" | "vodafone_cash">("instapay");
  const [submitted, setSubmitted] = useState(false);

  // Check if license is valid
  const isExpired =
    tenant.subscriptionStatus === "expired" ||
    tenant.subscriptionStatus === "suspended" ||
    new Date(tenant.subscriptionExpiry).getTime() < Date.now();

  // If Super Admin, allow viewing or previewing
  const canBypass = currentRole === "SUPER_ADMIN";

  if (!isExpired) {
    return <>{children}</>;
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInstantSuperAdminActivate = () => {
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    updateActiveTenantSettings({
      subscriptionStatus: "active",
      planStatus: "active",
      subscriptionExpiry: newExpiry,
    });
  };

  const handleSubmitRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderAccount || !transactionRef) return;

    submitSubscriptionPayment({
      tenantId: tenant.id,
      tenantName: tenant.name,
      planTier: selectedPlan,
      billingCycle: billingCycle,
      amount: selectedPlan === "starter" ? (billingCycle === "monthly" ? 499 : 4990) : (billingCycle === "monthly" ? 999 : 9990),
      method: method,
      senderAccount: senderAccount,
      transactionRef: transactionRef,
      receiptImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    });

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-10 border border-warm-border shadow-warm animate-fadeIn text-center">
        {/* Super Admin Bypass Banner */}
        {canBypass && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>لوحة صاحب المنصة (Super Admin Mode)</span>
              </div>
              <div className="text-xs text-purple-700 mt-0.5">
                أنت مسجل كمالك النظام؛ يمكنك تفعيل هذا النشاط فوراً أو تجاوزه.
              </div>
            </div>
            <button
              onClick={handleInstantSuperAdminActivate}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
            >
              تفعيل الحساب فوراً (+30 يوم)
            </button>
          </div>
        )}

        {/* Header Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
          <Lock className="w-10 h-10" />
        </div>

        {/* Tenant Name & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {tenant.subscriptionStatus === "suspended"
              ? "هذا الحساب معلق مؤقتاً"
              : "انتهت فترة الاشتراك لهذا النشاط"}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-warm-text tracking-tight mb-2">
          {tenant.name}
        </h1>
        <p className="text-sm text-warm-muted max-w-md mx-auto mb-8 leading-relaxed">
          نظام Smart Menu السحابي متوقف حالياً لهذا النشاط. لإعادة تفعيل الصالة، شاشة التجهيز،
          ونقاط البيع فوراً، يُرجى تجديد الاشتراك عبر وسائل الدفع السريعة أدناه.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fadeIn text-center space-y-2">
            <Check className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-black text-lg">تم إرسال طلب التفعيل بنجاح!</h3>
            <p className="text-xs text-emerald-700">
              وصل إشعار التحويل المالي إلى إدارة المنصة المركزية. سيتم مراجعة العملية وتفعيل
              حساب النشاط التجاري تلقائياً خلال دقائق.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRenewal} className="text-right space-y-6">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("instapay")}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  method === "instapay"
                    ? "border-warm-accent bg-amber-50/40 text-warm-text font-bold shadow-sm"
                    : "border-warm-border bg-warm-surface hover:bg-stone-50 text-warm-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    لحظي Zero Fees
                  </span>
                </div>
                <div className="mt-3">
                  <div className="font-extrabold text-xs">InstaPay إنستاباي</div>
                  <div className="text-[10px] text-warm-muted mt-0.5">تحويل بنكي فوري بالـ IPA</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("vodafone_cash")}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  method === "vodafone_cash"
                    ? "border-warm-accent bg-amber-50/40 text-warm-text font-bold shadow-sm"
                    : "border-warm-border bg-warm-surface hover:bg-stone-50 text-warm-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="w-5 h-5 text-rose-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    محافظ إلكترونية
                  </span>
                </div>
                <div className="mt-3">
                  <div className="font-extrabold text-xs">Vodafone Cash فودافون كاش</div>
                  <div className="text-[10px] text-warm-muted mt-0.5">محفظة كاش فورية</div>
                </div>
              </button>
            </div>

            {/* Account Details Box */}
            <div className="p-4 rounded-2xl bg-warm-bg border border-warm-border">
              {method === "instapay" ? (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => copyToClipboard("smartmenu@instapay", "ipa")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-warm-border text-xs font-bold text-warm-text hover:bg-stone-50"
                  >
                    {copiedField === "ipa" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ IPA</span>
                      </>
                    )}
                  </button>
                  <div className="text-right">
                    <div className="text-[10px] text-warm-muted">عنوان الدفع الفوري (IPA):</div>
                    <div className="font-mono font-bold text-sm text-warm-text">
                      smartmenu@instapay
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => copyToClipboard("01012345678", "vf")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-warm-border text-xs font-bold text-warm-text hover:bg-stone-50"
                  >
                    {copiedField === "vf" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                  <div className="text-right">
                    <div className="text-[10px] text-warm-muted">رقم محفظة فودافون كاش:</div>
                    <div className="font-mono font-bold text-sm text-warm-text">
                      01012345678
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs: Transaction Ref and Sender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">
                  رقم الهاتف أو الحساب المحوَّل منه:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 010xxxxxxxx"
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">
                  الرقم المرجعي للتحويل (Reference / TxID):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: TXN-884920"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-warm-text text-xs focus:outline-none focus:border-warm-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-warm-text hover:bg-stone-800 text-white font-extrabold text-sm transition-all shadow-warm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال إثبات التحويل والتفعيل الفوري</span>
            </button>
          </form>
        )}

        {/* Customer return button */}
        <div className="mt-6 pt-6 border-t border-warm-border text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text font-bold"
          >
            <span>العودة لصفحة المطاعم الأخرى المتاحة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
