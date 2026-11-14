"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { useApp } from "../../../context/AppContext";
import { Product } from "../../../types";
import { ProductDetailModal } from "../../../components/ProductDetailModal";
import { CartDrawer } from "../../../components/CartDrawer";
import { LiveOrderTracker } from "../../../components/LiveOrderTracker";
import { TenantPaywall } from "../../../components/TenantPaywall";
import {
  Search,
  Plus,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function TenantDedicatedMenuPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const {
    tenants,
    activeTenant,
    setActiveTenantId,
    categories,
    products,
    cart,
    cartCount,
    cartTotal,
    addToCart,
    activeOrderPoint,
    setActiveOrderPoint,
    orders,
  } = useApp();

  // Find tenant by slug
  const targetTenant = useMemo(() => {
    return tenants.find((t) => t.slug === slug) || null;
  }, [tenants, slug]);

  // Synchronize active tenant when viewing dedicated route
  useEffect(() => {
    if (targetTenant && targetTenant.id !== activeTenant.id) {
      setActiveTenantId(targetTenant.id);
    }
  }, [targetTenant, activeTenant.id, setActiveTenantId]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<"all" | "bestseller" | "vegetarian" | "spicy">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  if (!targetTenant) {
    return (
      <div className="min-h-screen bg-warm-bg text-warm-text flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-warm-border text-center shadow-warm">
          <Building2 className="w-12 h-12 text-warm-accent mx-auto mb-4" />
          <h2 className="text-xl font-black text-warm-text mb-2">عفواً، هذا النشاط التجاري غير موجود</h2>
          <p className="text-xs text-warm-muted mb-6">
            تأكد من كتابة الرابط أو رمز QR بشكل صحيح، أو تصفح الأنشطة المتاحة.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-warm-text text-white font-bold text-xs"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  const currency = targetTenant.branding.currency;

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTag === "bestseller") matchesTag = !!p.isBestSeller;
    if (selectedTag === "vegetarian") matchesTag = !!p.isVegetarian;
    if (selectedTag === "spicy") matchesTag = !!p.isSpicy;

    return matchesCategory && matchesSearch && matchesTag;
  });

  const latestOrderForThisTable = orders.find(
    (o) =>
      o.tenantId === targetTenant.id &&
      o.orderPointName === `${targetTenant.orderPointLabel} ${activeOrderPoint}` &&
      o.status !== "completed" &&
      o.status !== "cancelled"
  );

  return (
    <TenantPaywall tenant={targetTenant}>
      <div className="min-h-screen bg-warm-bg text-warm-text pb-28">
        <Navbar />

        {/* Hero / Brand Banner */}
        <div className="relative border-b border-warm-border overflow-hidden bg-gradient-to-b from-warm-surface to-warm-bg py-8 px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-right">
              <img
                src={targetTenant.branding.logoUrl}
                alt={targetTenant.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-warm-border shadow-warm"
              />
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-black text-warm-text tracking-tight">
                    {targetTenant.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    نسخة مخصصة
                  </span>
                </div>
                <p className="text-xs text-warm-muted mt-1 max-w-md">
                  قائمة طعام إلكترونية ذكية خاصة بـ {targetTenant.name}. اطلب مباشرة وسيقوم فريق{" "}
                  {targetTenant.stationLabel} بالتحضير فوراً.
                </p>
              </div>
            </div>

            {/* Table / QR Point Picker */}
            <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-warm-border shadow-sm">
              <div className="text-right">
                <span className="text-[10px] text-warm-muted block font-bold">
                  موقعك الحالي ({targetTenant.orderPointLabel}):
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {["1", "2", "3", "4", "5", "VIP"].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveOrderPoint(num)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                        activeOrderPoint === num
                          ? "bg-warm-text text-white shadow-sm"
                          : "bg-white text-stone-700 hover:bg-stone-100 border border-warm-border"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Order Banner for this table */}
        {latestOrderForThisTable && (
          <div className="max-w-5xl mx-auto px-4 mt-4">
            <div
              onClick={() => setActiveTrackingOrderId(latestOrderForThisTable.id)}
              className="cursor-pointer bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:bg-amber-100/80 transition-colors animate-pulse"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    طلبك #{latestOrderForThisTable.orderNumber} قيد المتابعة الحية
                  </span>
                  <span className="text-[10px] text-amber-800">
                    الحالة:{" "}
                    {latestOrderForThisTable.status === "pending"
                      ? "وصل لمحطة التجهيز"
                      : latestOrderForThisTable.status === "preparing"
                      ? "جاري التحضير الآن"
                      : "جاهز للاستلام!"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
                <span>تتبع الطلب</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 mt-6">
          {/* Search Bar & Smart Filter Bar (Amazon DNA) */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-warm-muted absolute right-3.5 top-3.5" />
              <input
                type="text"
                placeholder="ابحث فوراً بالاسم أو المكونات (Zero-Latency)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-2xl bg-white border border-warm-border text-warm-text placeholder:text-stone-400 text-xs focus:outline-none focus:border-warm-accent shadow-warm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3.5 top-3 text-[11px] text-warm-muted hover:text-warm-text font-bold"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Dietary Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedTag("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === "all"
                    ? "bg-warm-text text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-warm-border"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedTag("bestseller")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === "bestseller"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-warm-border"
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>الأكثر طلباً</span>
              </button>
              <button
                onClick={() => setSelectedTag("vegetarian")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === "vegetarian"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-warm-border"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>نباتي (Vegetarian)</span>
              </button>
              <button
                onClick={() => setSelectedTag("spicy")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === "spicy"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-50 border border-warm-border"
                }`}
              >
                <Flame className="w-3 h-3 text-rose-500" />
                <span>حار (Spicy)</span>
              </button>
            </div>

            {/* Category Slider */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-warm-accent text-white shadow-warm"
                    : "bg-white text-warm-text hover:bg-stone-100 border border-warm-border shadow-xs"
                }`}
              >
                جميع الأقسام
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-warm-accent text-white shadow-warm"
                      : "bg-white text-warm-text hover:bg-stone-100 border border-warm-border shadow-xs"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer bg-white rounded-3xl p-3.5 border border-warm-border hover:border-warm-accent transition-all duration-200 shadow-warm hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.isBestSeller && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        الأكثر طلباً
                      </span>
                    )}
                    {product.isSpicy && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <Flame className="w-3 h-3" />
                        حار
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-warm-text group-hover:text-warm-accent transition-colors">
                      {product.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-warm-text">
                        {product.price}
                      </span>
                      <span className="text-[10px] font-semibold text-warm-muted mr-1">
                        {currency}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-warm-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-warm-muted">
                    {product.prepTimeMinutes && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {product.prepTimeMinutes} د
                      </span>
                    )}
                    {product.calories && (
                      <span>{product.calories} سعرة</span>
                    )}
                  </div>

                  {/* 1-Tap Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.modifiers && product.modifiers.length > 0) {
                        setSelectedProduct(product);
                      } else {
                        addToCart(product, 1);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-warm-surface hover:bg-warm-accent hover:text-white border border-warm-border text-warm-text font-bold text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sticky Cart Bar (Amazon DNA) */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto animate-slideUp">
            <div
              onClick={() => setIsCartOpen(true)}
              className="cursor-pointer bg-warm-text hover:bg-stone-800 text-white rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-warm-accent flex items-center justify-center font-black text-xs text-white">
                  {cartCount}
                </span>
                <div>
                  <div className="font-extrabold text-xs">عرض السلة ومتابعة الطلب</div>
                  <div className="text-[10px] text-stone-300">
                    {targetTenant.orderPointLabel} {activeOrderPoint}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-left font-black text-sm text-warm-accent">
                  {cartTotal.toFixed(1)} {currency}
                </div>
                <div className="w-8 h-8 rounded-full bg-warm-surface border border-warm-border flex items-center justify-center text-warm-text">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            currency={currency}
            primaryColor={targetTenant.branding.primaryColor}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOrderSuccess={(orderId) => setActiveTrackingOrderId(orderId)}
        />

        {/* Live Order Tracker Modal */}
        {activeTrackingOrderId && (
          <LiveOrderTracker
            orderId={activeTrackingOrderId}
            onClose={() => setActiveTrackingOrderId(null)}
          />
        )}
      </div>
    </TenantPaywall>
  );
}
