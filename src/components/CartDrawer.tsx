"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Receipt,
  Tag,
  CheckCircle2,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    activeTenant,
    activeOrderPoint,
    placeOrder,
    products,
    addToCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currency = activeTenant.branding.currency;

  let discountedSubtotal = cartTotal;
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = (cartTotal * appliedCoupon.discountPercent) / 100;
    discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  }

  const taxAmount = (discountedSubtotal * activeTenant.branding.taxPercentage) / 100;
  const serviceAmount =
    (discountedSubtotal * activeTenant.branding.serviceFeePercentage) / 100;
  const finalTotal = discountedSubtotal + taxAmount + serviceAmount;

  // Smart Upsell Products (Amazon DNA)
  const cartProductIds = new Set(cart.map((item) => item.productId));
  const upsellSuggestions = products
    .filter((p) => p.isUpsell && !cartProductIds.has(p.id))
    .slice(0, 3);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput("");
    setTimeout(() => setCouponFeedback(null), 4000);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const order = placeOrder(customerName, customerPhone, orderNotes);
      setIsSubmitting(false);
      onOrderSuccess(order.id);
      onClose();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-warm-card flex flex-col justify-between border-r border-warm-border shadow-warmLg overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-warm-border flex items-center justify-between bg-warm-surface/80">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-warm-accent" />
            <div>
              <h2 className="font-extrabold text-base text-warm-text">سلة الطلبات</h2>
              <p className="text-[11px] text-warm-muted">
                {activeTenant.orderPointLabel} {activeOrderPoint} • {activeTenant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-card">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-warm-surface flex items-center justify-center mx-auto text-warm-muted border border-warm-border">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-warm-text">السلة فارغة حالياً</h3>
              <p className="text-xs text-warm-muted max-w-xs mx-auto">
                تصفح قائمة الطعام الرائعة وأضف أطباقك المفضلة بنقرة واحدة!
              </p>
            </div>
          ) : (
            <>
              {/* Order Items List */}
              <div className="space-y-2.5">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="p-3 rounded-2xl bg-warm-surface border border-warm-border flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-warm-text truncate">
                        {item.productName}
                      </div>

                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedModifiers.map((mod, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[10px] text-warm-muted bg-white px-1.5 py-0.5 rounded border border-warm-border/60"
                            >
                              {mod.optionName} {mod.price > 0 && `(+${mod.price})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-[10px] text-amber-700 mt-1 italic">
                          "{item.notes}"
                        </p>
                      )}

                      <div className="font-extrabold text-xs text-warm-accent mt-1.5">
                        {item.totalPrice} {currency}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-xl px-2 py-1 border border-warm-border shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                        className="p-1 hover:text-rose-600 transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Minus className="w-3 h-3 text-stone-600" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-warm-text w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                        className="p-1 text-stone-600 hover:text-emerald-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo / Coupon Code Section */}
              <div className="p-3 rounded-2xl bg-warm-surface border border-warm-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-warm-text">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-warm-accent" />
                    <span>كود الخصم (Promo Code):</span>
                  </div>
                  <span className="text-[10px] text-warm-muted font-normal">
                    جرّب كود <strong>SMART10</strong>
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>كوبون {appliedCoupon.code} مفعّل ({appliedCoupon.discountPercent}%)</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-rose-600 text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="أدخل كود الخصم..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-warm-border text-xs text-warm-text uppercase font-bold focus:outline-none focus:border-warm-accent"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-warm-text hover:bg-stone-800 text-white font-bold text-xs transition-colors"
                    >
                      تطبيق
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] font-bold ${
                      couponFeedback.success ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Smart Upselling Engine (Amazon DNA) */}
              {activeTenant.enableSmartUpselling && upsellSuggestions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>يُطلب عادةً مع هذه الوجبة (عروض ذكية)</span>
                  </div>

                  <div className="space-y-2">
                    {upsellSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-100 text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-bold text-warm-text">{product.name}</div>
                            <div className="text-[11px] text-amber-700 font-bold">
                              +{product.price} {currency}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          className="px-2.5 py-1 rounded-lg bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          إضافة
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info (Optional) */}
              <div className="space-y-2 pt-2 border-t border-warm-border">
                <label className="text-xs font-bold text-warm-text block">
                  بيانات العميل (اختياري):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم"
                    className="px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    className="px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent"
                  />
                </div>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="أي ملاحظات عامة حول الطلب..."
                  className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent"
                />
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-warm-border bg-warm-surface space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-warm-muted">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-warm-text">
                  {cartTotal.toFixed(1)} {currency}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم الكوبون ({appliedCoupon.code}):</span>
                  <span>-{discountAmount.toFixed(1)} {currency}</span>
                </div>
              )}

              {activeTenant.branding.taxPercentage > 0 && (
                <div className="flex justify-between text-[11px] text-warm-muted">
                  <span>ضريبة القيمة المضافة ({activeTenant.branding.taxPercentage}%):</span>
                  <span>+{taxAmount.toFixed(1)} {currency}</span>
                </div>
              )}
              {activeTenant.branding.serviceFeePercentage > 0 && (
                <div className="flex justify-between text-[11px] text-warm-muted">
                  <span>رسوم الخدمة ({activeTenant.branding.serviceFeePercentage}%):</span>
                  <span>+{serviceAmount.toFixed(1)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-warm-text pt-1.5 border-t border-warm-border">
                <span>الإجمالي النهائي:</span>
                <span className="text-warm-accent font-black">
                  {finalTotal.toFixed(1)} {currency}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
              style={{ backgroundColor: activeTenant.branding.primaryColor || "#D97706" }}
            >
              {isSubmitting ? (
                <span>جاري إرسال الطلب...</span>
              ) : (
                <>
                  <span>إرسال الطلب الآن للمحطة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
