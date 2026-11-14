"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useApp } from "../../context/AppContext";
import { BusinessType, PlanTier } from "../../types";
import { PRICING_PLANS, PAYMENT_CREDENTIALS } from "../../lib/data";
import {
  Check,
  Smartphone,
  Copy,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { addNewTenant, submitSubscriptionPayment } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant");
  const [stationLabel, setStationLabel] = useState("المطبخ الرئيسي");
  const [orderPointLabel, setOrderPointLabel] = useState("طاولة");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D97706");

  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Payment Verification State
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone_cash">("instapay");
  const [senderAccount, setSenderAccount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTypeChange = (type: BusinessType) => {
    setBusinessType(type);
    if (type === "restaurant") {
      setStationLabel("المطبخ الرئيسي");
      setOrderPointLabel("طاولة");
      setPrimaryColor("#D97706");
    } else if (type === "cafe") {
      setStationLabel("البار وقسم القهوة");
      setOrderPointLabel("شباك استلام");
      setPrimaryColor("#B45309");
    } else if (type === "pharmacy") {
      setStationLabel("المعمل والصيدلية");
      setOrderPointLabel("غرفة الفحص");
      setPrimaryColor("#059669");
    } else {
      setStationLabel("المخزن وقسم التغليف");
      setOrderPointLabel("كاونتر الاستلام");
      setPrimaryColor("#0071E3");
    }
  };

  const currentPlanObj = PRICING_PLANS.find((p) => p.id === selectedPlan)!;
  const planAmount =
    billingCycle === "annual"
      ? currentPlanObj.priceAnnual
      : currentPlanObj.priceMonthly;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    const slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-") || `tenant-${Date.now()}`;

    const newTenant = addNewTenant({
      name: businessName,
      slug,
      businessType,
      stationLabel,
      orderPointLabel,
      branding: {
        primaryColor,
        themeMode: "warm",
        fontFamily: "Cairo",
        currency: "ج.م",
        taxPercentage: 14,
        serviceFeePercentage: 0,
        logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80",
      },
      planTier: selectedPlan,
      planStatus: "pending_approval",
      subscriptionStatus: "trial",
      subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      requireCashierApproval: false,
      enableSmartUpselling: true,
      ownerName,
      ownerPhone,
    });

    submitSubscriptionPayment({
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      planTier: selectedPlan,
      billingCycle,
      amount: planAmount,
      method: paymentMethod,
      senderAccount,
      transactionRef: transactionRef || `REF-${Date.now()}`,
    });

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/admin");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text pb-12">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold mb-2 text-warm-muted">
            <span className={step >= 1 ? "text-warm-text" : ""}>1. بيانات النشاط</span>
            <span className={step >= 2 ? "text-warm-text" : ""}>2. اختيار الباقة</span>
            <span className={step >= 3 ? "text-warm-text" : ""}>3. التحويل والتفعيل</span>
          </div>
          <div className="h-1.5 w-full bg-warm-border rounded-full overflow-hidden">
            <div
              className="h-full bg-warm-accent transition-all duration-300"
              style={{
                width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
              }}
            />
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-white p-8 rounded-3xl border border-emerald-300 text-center space-y-4 animate-fadeIn shadow-warm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-warm-text">
              تهانينا! تم تسجيل نشاطك بنجاح
            </h2>
            <p className="text-xs text-warm-muted max-w-md mx-auto">
              تم إرسال إيصال التحويل إلى لوحة المراجعة، ويجري الآن توجيهك إلى لوحة الإدارة للبدء مباشرة...
            </p>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-border shadow-warm">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-warm-text">
                    تسجيل نشاط تجاري جديد في Smart Menu
                  </h2>
                  <p className="text-xs text-warm-muted mt-1">
                    حدد طبيعة نشاطك والمسميات المناسبة لفريقك ولعملائك.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-warm-text block">
                      نوع النشاط التجاري:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "restaurant", name: "مطعم فاخر" },
                        { id: "cafe", name: "كافيه / مقهى" },
                        { id: "retail", name: "محل تجزئة" },
                        { id: "pharmacy", name: "صيدلية / معمل" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeChange(t.id as BusinessType)}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                            businessType === t.id
                              ? "bg-warm-text text-white border-warm-text shadow-sm"
                              : "bg-warm-surface border-warm-border text-warm-muted hover:bg-stone-100"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-warm-text block">
                      اسم النشاط التجاري:
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="مثال: بيت الشاورما، سبيشالتي كافيه..."
                      className="w-full px-4 py-3 rounded-2xl bg-warm-surface border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-warm-text block">
                        مسمى محطة التجهيز:
                      </label>
                      <input
                        type="text"
                        value={stationLabel}
                        onChange={(e) => setStationLabel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-warm-text block">
                        مسمى نقطة الطلب:
                      </label>
                      <input
                        type="text"
                        value={orderPointLabel}
                        onChange={(e) => setOrderPointLabel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-warm-text block">
                        اسم المسؤول:
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-warm-text block">
                        رقم هاتف المسؤول (واتساب):
                      </label>
                      <input
                        type="tel"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!businessName.trim() || !ownerName.trim()}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-2xl bg-warm-text hover:bg-stone-800 text-white font-extrabold text-xs shadow-warm flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-40"
                  >
                    <span>المتابعة لاختيار الباقة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-warm-text">اختر الباقة المناسبة</h2>
                    <p className="text-xs text-warm-muted mt-1">
                      يمكنك الترقية أو تغيير الباقة في أي وقت.
                    </p>
                  </div>

                  <div className="flex items-center bg-warm-surface p-1 rounded-xl border border-warm-border text-xs">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        billingCycle === "monthly"
                          ? "bg-white text-warm-text shadow-sm border border-warm-border"
                          : "text-warm-muted"
                      }`}
                    >
                      شهري
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annual")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        billingCycle === "annual"
                          ? "bg-warm-accent text-white shadow-sm"
                          : "text-warm-muted"
                      }`}
                    >
                      سنوي (وفر 17%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRICING_PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const price =
                      billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id as PlanTier)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-50/50 border-amber-500 shadow-md scale-102"
                            : "bg-warm-surface border-warm-border hover:bg-stone-100"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="font-extrabold text-sm text-warm-text">
                            {plan.name}
                          </div>
                          <div className="text-xl font-black text-warm-accent">
                            {price}{" "}
                            <span className="text-xs text-warm-muted font-normal">
                              ج.م
                            </span>
                          </div>
                          <p className="text-[11px] text-warm-muted leading-tight">
                            {plan.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-warm-border mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-warm-muted">
                            {billingCycle === "annual" ? "سنوي" : "شهري"}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "bg-warm-accent border-warm-accent text-white"
                                : "border-stone-400"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-muted text-xs font-bold"
                  >
                    الرجوع للخلف
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm flex items-center gap-2"
                  >
                    <span>الانتقال للدفع وتأكيد الحساب ({planAmount} ج.م)</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-warm-text">
                    تأكيد الدفع والتفعيل المباشر
                  </h2>
                  <p className="text-xs text-warm-muted mt-1">
                    المبلغ المطلوب سداده:{" "}
                    <strong className="text-warm-accent font-extrabold text-sm">
                      {planAmount} ج.م
                    </strong>{" "}
                    لباقة ({selectedPlan.toUpperCase()}).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("instapay")}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "instapay"
                        ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm"
                        : "bg-warm-surface border-warm-border text-warm-muted"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>تطبيق InstaPay (إنستاباي)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("vodafone_cash")}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "vodafone_cash"
                        ? "bg-rose-50 border-rose-400 text-rose-900 shadow-sm"
                        : "bg-warm-surface border-warm-border text-warm-muted"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>فودافون كاش (Vodafone Cash)</span>
                  </button>
                </div>

                {paymentMethod === "instapay" ? (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                    <div className="text-xs text-purple-900 font-bold">
                      بيانات التحويل عبر إنستاباي:
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-200 font-mono text-sm text-warm-text">
                      <span>{PAYMENT_CREDENTIALS.instapay.ipa}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(PAYMENT_CREDENTIALS.instapay.ipa, "ipa")
                        }
                        className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-bold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedKey === "ipa" ? "تم النسخ!" : "نسخ"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="text-xs text-rose-900 font-bold">
                      بيانات التحويل عبر فودافون كاش:
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200 font-mono text-sm text-warm-text">
                      <span>{PAYMENT_CREDENTIALS.vodafoneCash.walletNumber}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            PAYMENT_CREDENTIALS.vodafoneCash.walletNumber,
                            "vf"
                          )
                        }
                        className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-bold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedKey === "vf" ? "تم النسخ!" : "نسخ"}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-warm-text block">
                      {paymentMethod === "instapay"
                        ? "عنوان أو رقم الحساب المحوِّل منه:"
                        : "رقم المحفظة التي قمت بالتحويل منها:"}
                    </label>
                    <input
                      type="text"
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      placeholder={
                        paymentMethod === "instapay"
                          ? "username@instapay أو 01xxxxxxxxx"
                          : "010xxxxxxxx"
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-warm-text block">
                      رقم مرجع العملية / كود التحويل (Transaction ID):
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="كود العملية من رسالة التحويل (e.g. TXN-12345)"
                      className="w-full px-4 py-2.5 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-muted text-xs font-bold"
                  >
                    تغيير الباقة
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-warm flex items-center gap-2"
                  >
                    <span>إرسال إيصال التحويل وتفعيل النشاط</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
