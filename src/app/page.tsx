"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { Product } from "../types";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { CartDrawer } from "../components/CartDrawer";
import { LiveOrderTracker } from "../components/LiveOrderTracker";
import { TenantPaywall } from "../components/TenantPaywall";
import {
  Search,
  Plus,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CustomerPage() {
  const {
    activeTenant,
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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<"all" | "bestseller" | "vegetarian" | "spicy">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const currency = activeTenant.branding.currency;

  // Filter products by category, search query, and dietary tags (Zero-Latency Amazon DNA)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, selectedCategory, searchQuery, selectedTag]);

  // Find latest active order for this table/order point
  const latestOrderForThisTable = useMemo(() => {
    const tablePrefix = `${activeTenant.orderPointLabel} ${activeOrderPoint}`;
    return orders.find(
      (o) =>
        o.tenantId === activeTenant.id &&
        o.orderPointName === tablePrefix &&
        o.status !== "completed" &&
        o.status !== "cancelled"
    );
  }, [orders, activeTenant, activeOrderPoint]);

  return (
    <TenantPaywall tenant={activeTenant}>
      <div className="min-h-screen bg-warm-bg text-warm-text pb-28">
        <Navbar />

        {/* Hero / Brand Banner (Apple Warm Aesthetics) */}
      <div className="relative border-b border-warm-border overflow-hidden bg-gradient-to-b from-warm-surface to-warm-bg py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-right">
            <img
              src={activeTenant.branding.logoUrl}
              alt={activeTenant.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-warm-border shadow-warm"
            />
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-3xl font-black text-warm-text tracking-tight">
                  {activeTenant.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  قائمة ذكية فاخرة
                </span>
              </div>
              <p className="text-xs text-warm-muted mt-1 max-w-md">
                اختر أطباقك المفضلة وسيقوم فريق {activeTenant.stationLabel} بتحضيرها فوراً ومتابعتها لحظياً.
              </p>
            </div>
          </div>

          {/* Table / QR Point Picker */}
          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-warm-border shadow-sm">
            <div className="text-right">
              <span className="text-[10px] text-warm-muted block font-bold">
                موقعك الحالي ({activeTenant.orderPointLabel}):
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {["1", "2", "4", "8", "VIP"].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveOrderPoint(num)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      activeOrderPoint === num
                        ? "bg-warm-text text-white shadow-md scale-105"
                        : "bg-warm-surface text-warm-muted hover:bg-stone-200 border border-warm-border"
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

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Active Order Banner (if table has an order in progress) */}
        {latestOrderForThisTable && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-4 animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping" />
              <div>
                <div className="text-xs font-bold text-warm-text flex items-center gap-2">
                  <span>طلبك رقم #{latestOrderForThisTable.orderNumber} قيد المتابعة</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                    {latestOrderForThisTable.status === "ready"
                      ? "جاهز للاستلام 🎉"
                      : latestOrderForThisTable.status === "preparing"
                      ? "جاري التجهيز 👨‍🍳"
                      : "تم الاستلام ⏳"}
                  </span>
                </div>
                <div className="text-[11px] text-warm-muted">
                  {latestOrderForThisTable.orderPointName} • إجمالي {latestOrderForThisTable.total.toFixed(1)} {currency}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTrackingOrderId(latestOrderForThisTable.id)}
              className="px-4 py-2 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm transition-transform active:scale-95 whitespace-nowrap"
            >
              تتبع الطلب مباشرة
            </button>
          </div>
        )}

        {/* Search Bar & Zero-Latency Filter (Amazon DNA) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وجبة، مشروب، أو مكونات..."
              className="w-full pr-10 pl-4 py-3 rounded-2xl bg-white border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Interactive Custom Experience Cards (Poke Pal Bowl Builder & Barista Pal Coffee Builder) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/poke-pal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-teal-900 to-teal-950 text-white border border-teal-800 shadow-warm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 block"
          >
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-[10px] font-black uppercase tracking-wider mb-2 border border-teal-700">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  تجربة تفاعلية حية ثلاثية الأبعاد
                </span>
                <h3 className="text-lg font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  🥗 Poke Pal — صمّم طبق البوكيه التفاعلي
                </h3>
                <p className="text-xs text-teal-200/80 mt-1 max-w-sm leading-relaxed">
                  امسك المكونات بقفاز الشيف: أرز السوشي، السالمون، الأفوكادو، الصوصات بالقطارة، ورشة البهارات مع إيصال حراري فوري!
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-teal-800/60 border border-teal-700 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 transition-all text-white">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
            </div>
          </a>

          <a
            href="/barista-pal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#2c1d11] to-[#1a1008] text-white border border-amber-950 shadow-warm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 block"
          >
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 text-[10px] font-black uppercase tracking-wider mb-2 border border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  باريستا وكافيه محترف
                </span>
                <h3 className="text-lg font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                  ☕ Barista Pal — صمّم مشروبك المخصص
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-sm leading-relaxed">
                  اختر الكوب، أسقط الثلج بفيزياء حية، صب الإسبريسو أو الماتشا، اسكب الحليب وزيّن بالكراميل والكريمة ورشة القرفة!
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-900/40 border border-amber-800/80 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-600 transition-all text-white">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
            </div>
          </a>
        </div>

        {/* Dietary & Highlight Tags Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedTag === "all"
                ? "bg-warm-text text-white shadow-sm"
                : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
            }`}
          >
            جميع الأصناف
          </button>
          <button
            onClick={() => setSelectedTag("bestseller")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              selectedTag === "bestseller"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
            }`}
          >
            <span>الأكثر طلباً ⭐</span>
          </button>
          <button
            onClick={() => setSelectedTag("vegetarian")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              selectedTag === "vegetarian"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
            }`}
          >
            <span>نباتي وخفيف 🌱</span>
          </button>
          <button
            onClick={() => setSelectedTag("spicy")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              selectedTag === "spicy"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
            }`}
          >
            <span>حار وسبايسي 🌶️</span>
          </button>
        </div>

        {/* Categories Pills Carousel (Apple Fluid Design) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-warm-text text-white shadow-warm scale-105"
                : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
            }`}
          >
            الكل ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-warm-text text-white shadow-warm scale-105"
                    : "bg-white text-warm-muted border border-warm-border hover:bg-warm-surface"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Products Grid (Apple Warm Off-White Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const hasModifiers = product.modifiers && product.modifiers.length > 0;
            return (
              <div
                key={product.id}
                onClick={() => {
                  if (product.isAvailable) setSelectedProduct(product);
                }}
                className={`group relative bg-warm-card rounded-3xl overflow-hidden border border-warm-border transition-all duration-300 flex flex-col justify-between shadow-warm hover:shadow-warmLg ${
                  product.isAvailable ? "cursor-pointer hover:border-amber-300" : "opacity-60"
                }`}
              >
                {/* Product Image */}
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {product.prepTimeMinutes && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-stone-800 shadow-sm">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {product.prepTimeMinutes} د
                      </span>
                    )}
                    {product.calories && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-stone-800 shadow-sm">
                        <Flame className="w-3 h-3 text-rose-500" />
                        {product.calories}
                      </span>
                    )}
                  </div>

                  {product.isBestSeller && (
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      الأكثر طلباً
                    </div>
                  )}

                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md">
                        غير متوفر حالياً
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info & Price */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-warm-text group-hover:text-warm-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-warm-muted line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & 1-Tap Add Action (Amazon DNA) */}
                  <div className="flex items-center justify-between pt-2 border-t border-warm-border">
                    <div>
                      <span className="text-base font-black text-warm-text">
                        {product.price}
                      </span>
                      <span className="text-xs font-semibold text-warm-muted mr-1">
                        {currency}
                      </span>
                    </div>

                    {product.isAvailable ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasModifiers) {
                            setSelectedProduct(product);
                          } else {
                            addToCart(product, 1);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-warm-surface hover:bg-warm-text hover:text-white text-warm-text font-bold text-xs flex items-center gap-1 border border-warm-border transition-all duration-200 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{hasModifiers ? "تخصيص" : "إضافة"}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400">نفذت الكمية</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-warm-border p-6 shadow-sm">
            <p className="text-sm font-bold text-warm-muted">
              لم نتمكن من العثور على أطباق مطابقة لبحثك "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedTag("all");
              }}
              className="px-4 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text font-bold"
            >
              عرض كافة المنتجات
            </button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar (Amazon Warm DNA) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-fadeIn">
          <div
            onClick={() => setIsCartOpen(true)}
            className="p-3.5 rounded-2xl bg-white border border-warm-border shadow-warmLg flex items-center justify-between cursor-pointer hover:border-amber-400 transition-transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-warm"
                style={{ backgroundColor: activeTenant.branding.primaryColor || "#D97706" }}
              >
                {cartCount}
              </div>
              <div>
                <div className="text-xs font-bold text-warm-text">
                  عرض تفاصيل الطلب ({cartCount} عناصر)
                </div>
                <div className="text-[11px] text-warm-muted">
                  {activeTenant.orderPointLabel} {activeOrderPoint}
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
          primaryColor={activeTenant.branding.primaryColor}
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
