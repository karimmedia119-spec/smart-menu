"use client";

import React, { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { RoleGuard } from "../../components/RoleGuard";
import { TenantPaywall } from "../../components/TenantPaywall";
import { useApp } from "../../context/AppContext";
import { Order, PaymentMethod, TableInfo, OrderType, OrderItem } from "../../types";
import {
  ReceiptText,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  X,
  WifiOff,
  LayoutGrid,
  Plus,
  Percent,
  MoveRight,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ShoppingBag,
} from "lucide-react";

export default function CashierPage() {
  const {
    activeTenant,
    orders,
    tables,
    products,
    categories,
    markOrderPaid,
    applyDiscountToOrder,
    transferOrderTable,
    createDirectPosOrder,
    isOnline,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"floor" | "orders" | "shift">("floor");
  const [filterStatus, setFilterStatus] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [searchQuery, setSearchQuery] = useState("");
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Table QR Code Generator State
  const [qrModalTable, setQrModalTable] = useState<string | null>(null);

  // Direct POS New Order Modal State
  const [isPosOrderModalOpen, setIsPosOrderModalOpen] = useState(false);
  const [posSelectedTable, setPosSelectedTable] = useState("1");
  const [posOrderType, setPosOrderType] = useState<OrderType>("dine_in");
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCart, setPosCart] = useState<OrderItem[]>([]);
  const [posCategoryFilter, setPosCategoryFilter] = useState("all");

  // Discount Modal State
  const [discountModalOrderId, setDiscountModalOrderId] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percent">("percent");
  const [discountNote, setDiscountNote] = useState("خصم خاص للعميل");

  // Table Transfer Modal State
  const [transferOrderId, setTransferOrderId] = useState<string | null>(null);
  const [targetTableNumber, setTargetTableNumber] = useState("2");

  const currency = activeTenant.branding.currency;
  const tenantOrders = orders.filter((o) => o.tenantId === activeTenant.id);

  const filteredOrders = tenantOrders.filter((order) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unpaid" && order.paymentStatus === "unpaid") ||
      (filterStatus === "paid" && order.paymentStatus === "paid");

    const matchesSearch =
      !searchQuery.trim() ||
      order.orderNumber.includes(searchQuery) ||
      order.orderPointName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Shift Financial Calculations
  const paidOrders = tenantOrders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
  const cashRevenue = paidOrders
    .filter((o) => o.paymentMethod === "cash")
    .reduce((acc, o) => acc + o.total, 0);
  const instapayRevenue = paidOrders
    .filter((o) => o.paymentMethod === "instapay")
    .reduce((acc, o) => acc + o.total, 0);
  const vodafoneRevenue = paidOrders
    .filter((o) => o.paymentMethod === "vodafone_cash")
    .reduce((acc, o) => acc + o.total, 0);
  const cardRevenue = paidOrders
    .filter((o) => o.paymentMethod === "card")
    .reduce((acc, o) => acc + o.total, 0);

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleCollectPayment = (orderId: string, method: PaymentMethod) => {
    markOrderPaid(orderId, method);
  };

  // Direct POS Cart Handlers
  const addToPosCart = (product: any) => {
    setPosCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        },
      ];
    });
  };

  const submitPosOrder = () => {
    if (posCart.length === 0) return;
    const orderPoint =
      posOrderType === "dine_in"
        ? `${activeTenant.orderPointLabel} ${posSelectedTable}`
        : "طلب سفري خارجي (Takeaway)";

    createDirectPosOrder(
      posCart,
      posOrderType,
      orderPoint,
      posCustomerName,
      ""
    );
    setPosCart([]);
    setPosCustomerName("");
    setIsPosOrderModalOpen(false);
  };

  // Export Shift to CSV
  const exportShiftCSV = () => {
    const headers = ["رقم الطلب", "الموقع", "التاريخ والوقت", "طريقة الدفع", "المجموع الفرعي", "الخصم", "الضريبة", "الإجمالي النهائي"];
    const rows = paidOrders.map((o) => [
      o.orderNumber,
      o.orderPointName,
      new Date(o.createdAt).toLocaleString("ar-EG"),
      o.paymentMethod || "كاش",
      o.subtotal.toFixed(2),
      (o.discountAmount || 0).toFixed(2),
      o.taxAmount.toFixed(2),
      o.total.toFixed(2),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shift_report_${activeTenant.slug}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyDiscount = () => {
    if (!discountModalOrderId || !discountValue) return;
    const target = orders.find((o) => o.id === discountModalOrderId);
    if (!target) return;

    let calculatedDiscount = parseFloat(discountValue);
    if (discountType === "percent") {
      calculatedDiscount = (target.subtotal * calculatedDiscount) / 100;
    }

    applyDiscountToOrder(discountModalOrderId, calculatedDiscount, discountNote);
    setDiscountModalOrderId(null);
    setDiscountValue("");
  };

  const handleTransferTable = () => {
    if (!transferOrderId || !targetTableNumber) return;
    transferOrderTable(transferOrderId, targetTableNumber);
    setTransferOrderId(null);
  };

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "CASHIER", "TENANT_ADMIN"]}
      pageTitle="الكاشير وإدارة الصالة ونقاط البيع"
    >
      <TenantPaywall tenant={activeTenant}>
        <div className="min-h-screen bg-warm-bg text-warm-text pb-12">
          <Navbar />

      {/* Cashier Top Banner */}
      <div className="bg-white border-b border-warm-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-sm">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-warm-text flex items-center gap-2">
                <span>نقطة البيع والكاشير المتقدمة (Advanced POS)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-warm-surface border border-warm-border text-warm-muted font-bold">
                  {activeTenant.name}
                </span>
              </h1>
              <p className="text-xs text-warm-muted mt-0.5">
                مخطط الصالة التفاعلي، طلبات الكاونتر والسفري، تحصيل الفواتير، ونقل الطاولات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Order Button */}
            <button
              onClick={() => setIsPosOrderModalOpen(true)}
              className="py-2 px-3.5 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-warm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>طلب كاشير جديد (سفري / صالة)</span>
            </button>

            {/* Table QR Generator Button */}
            <button
              onClick={() => setQrModalTable("4")}
              className="py-2 px-3 rounded-2xl bg-warm-surface hover:bg-stone-100 border border-warm-border text-warm-text font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4 text-warm-accent" />
              <span>طباعة كود QR للطاولات</span>
            </button>

            {/* Tab Switcher */}
            <div className="flex items-center bg-warm-surface p-1 rounded-2xl border border-warm-border">
              <button
                onClick={() => setActiveTab("floor")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === "floor"
                    ? "bg-white text-warm-text shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>مخطط الطاولات</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-white text-warm-text shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                قائمة الفواتير ({tenantOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("shift")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "shift"
                    ? "bg-white text-warm-text shadow-sm border border-warm-border"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                تقرير الوردية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-sm">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>
              أنت تعمل حالياً في وضع عدم الاتصال (Offline Mode). جميع العمليات محفوظة محلياً وسيتم المزامنة تلقائياً.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* TAB 1: INTERACTIVE FLOOR PLAN & TABLES (مخطط الصالة الذكي) */}
        {activeTab === "floor" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-warm-border shadow-warm">
              <div>
                <h2 className="text-base font-black text-warm-text flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-warm-accent" />
                  <span>مخطط وحالة طاولات {activeTenant.name}</span>
                </h2>
                <p className="text-xs text-warm-muted mt-0.5">
                  انقر على أي طاولة مشغولة لإدارتها، أو انقر على طاولة خالية لفتح طلب فوري.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  خالية (متاحة)
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  مشغولة (قيد التجهيز)
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  جاهز للتقديم 🎉
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  طلب فاتورة / مساعدة
                </span>
              </div>
            </div>

            {/* Tables Visual Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((table) => {
                const activeOrder = orders.find((o) => o.id === table.activeOrderId);
                const isOccupied = table.status !== "available";

                let cardBg = "bg-white border-warm-border hover:border-warm-accent";
                let badge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                let badgeText = "متاحة";

                if (table.status === "occupied") {
                  cardBg = "bg-amber-50/40 border-amber-300 shadow-sm";
                  badge = "bg-amber-100 text-amber-900 border-amber-200";
                  badgeText = "مشغولة";
                } else if (table.status === "ready") {
                  cardBg = "bg-blue-50/50 border-blue-400 shadow-sm";
                  badge = "bg-blue-100 text-blue-900 border-blue-200";
                  badgeText = "جاهز للتسليم";
                } else if (table.status === "bill_requested") {
                  cardBg = "bg-rose-50/60 border-rose-300 animate-pulse";
                  badge = "bg-rose-100 text-rose-900 border-rose-200";
                  badgeText = "طلب الفاتورة 💳";
                } else if (table.status === "assistance") {
                  cardBg = "bg-purple-50/60 border-purple-300 animate-pulse";
                  badge = "bg-purple-100 text-purple-900 border-purple-200";
                  badgeText = "طلب ويتر 🔔";
                }

                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      if (!isOccupied) {
                        setPosSelectedTable(table.number);
                        setPosOrderType("dine_in");
                        setIsPosOrderModalOpen(true);
                      }
                    }}
                    className={`rounded-3xl p-5 border flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 shadow-warm hover:shadow-warmLg ${cardBg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-lg text-warm-text">
                          {table.name}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge}`}>
                          {badgeText}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-warm-muted mt-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>سعة {table.capacity} أفراد</span>
                      </div>
                    </div>

                    {/* Active Order Preview if Occupied */}
                    {activeOrder ? (
                      <div className="p-3 rounded-2xl bg-white border border-warm-border space-y-1.5 shadow-xs text-xs">
                        <div className="flex justify-between items-center font-extrabold">
                          <span className="text-warm-text">#{activeOrder.orderNumber}</span>
                          <span className="text-warm-accent font-black">
                            {activeOrder.total.toFixed(1)} {currency}
                          </span>
                        </div>
                        <div className="text-[11px] text-warm-muted truncate">
                          {activeOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                        </div>

                        {/* Quick Table Actions */}
                        <div className="pt-2 border-t border-warm-border/60 flex items-center justify-between gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(activeOrder);
                            }}
                            className="p-1 rounded-lg bg-warm-surface hover:bg-stone-200 text-stone-700"
                            title="طباعة الحساب"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiscountModalOrderId(activeOrder.id);
                            }}
                            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800"
                            title="تطبيق خصم"
                          >
                            <Percent className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferOrderId(activeOrder.id);
                            }}
                            className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800"
                            title="نقل الطاولة"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCollectPayment(activeOrder.id, "cash");
                            }}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold"
                          >
                            تحصيل
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-center border border-dashed border-warm-border rounded-2xl bg-warm-surface/50 text-[11px] text-warm-muted font-bold">
                        + انقر لبدء طلب جديد
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ALL ORDERS & INVOICES LIST */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم الطلب، الطاولة، أو اسم العميل..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white border border-warm-border text-xs text-warm-text placeholder-stone-400 focus:outline-none focus:border-warm-accent shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-warm-surface p-1 rounded-2xl border border-warm-border">
                <button
                  onClick={() => setFilterStatus("unpaid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "unpaid"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-warm-muted hover:text-warm-text"
                  }`}
                >
                  غير محصل (
                  {tenantOrders.filter((o) => o.paymentStatus === "unpaid").length}
                  )
                </button>
                <button
                  onClick={() => setFilterStatus("paid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "paid"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-warm-muted hover:text-warm-text"
                  }`}
                >
                  تم التحصيل ({paidOrders.length})
                </button>
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "all"
                      ? "bg-white text-stone-900 shadow-sm border border-warm-border"
                      : "text-warm-muted hover:text-warm-text"
                  }`}
                >
                  الكل ({tenantOrders.length})
                </button>
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const isPaid = order.paymentStatus === "paid";
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 border border-warm-border flex flex-col justify-between space-y-4 shadow-warm hover:shadow-warmLg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-warm-text">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-warm-surface border border-warm-border text-warm-text">
                            {order.orderPointName}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200 animate-pulse"
                          }`}
                        >
                          {isPaid
                            ? `مدفوع (${order.paymentMethod || "كاش"})`
                            : "غير محصل"}
                        </span>
                      </div>

                      <div className="text-[11px] text-warm-muted mt-1 flex justify-between">
                        <span>العميل: {order.customerName}</span>
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 bg-warm-surface/70 p-3 rounded-2xl border border-warm-border max-h-36 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-warm-text font-medium">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-bold text-warm-text">
                            {item.totalPrice} {currency}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-1 pt-2 border-t border-warm-border text-xs text-warm-muted">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>{order.subtotal.toFixed(1)} {currency}</span>
                      </div>

                      {order.discountAmount ? (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>الخصم ({order.discountNote || "خصم"}):</span>
                          <span>-{order.discountAmount.toFixed(1)} {currency}</span>
                        </div>
                      ) : null}

                      <div className="flex justify-between font-extrabold text-sm text-warm-text pt-1">
                        <span>المطلوب تحصيله:</span>
                        <span className="text-warm-accent font-black">
                          {order.total.toFixed(1)} {currency}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Payments & Discounts */}
                    <div className="space-y-2 pt-2">
                      {!isPaid ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-warm-muted font-bold">طريقة التحصيل:</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setDiscountModalOrderId(order.id)}
                                className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"
                              >
                                <Percent className="w-3 h-3" />
                                <span>تطبيق خصم</span>
                              </button>
                              <button
                                onClick={() => setTransferOrderId(order.id)}
                                className="text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"
                              >
                                <MoveRight className="w-3 h-3" />
                                <span>نقل الطاولة</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleCollectPayment(order.id, "cash")}
                              className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              <span>كاش Cash</span>
                            </button>
                            <button
                              onClick={() => handleCollectPayment(order.id, "instapay")}
                              className="py-2 px-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>InstaPay</span>
                            </button>
                            <button
                              onClick={() => handleCollectPayment(order.id, "vodafone_cash")}
                              className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>فودافون كاش</span>
                            </button>
                            <button
                              onClick={() => handleCollectPayment(order.id, "card")}
                              className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>فيزا / بطاقة</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePrint(order)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-warm-surface hover:bg-stone-100 text-warm-text font-bold text-xs flex items-center justify-center gap-2 border border-warm-border transition-colors shadow-sm"
                        >
                          <Printer className="w-4 h-4 text-warm-accent" />
                          <span>طباعة إيصال حراري (80mm)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SHIFT REPORT & CSV EXPORT */}
        {activeTab === "shift" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-warm-border shadow-warm">
              <div>
                <h2 className="text-base font-black text-warm-text">
                  ملخص الوردية المالية وتقفيل الحسابات
                </h2>
                <p className="text-xs text-warm-muted">
                  إجمالي المبيعات، تصنيف طرق الدفع، وعدد الفواتير المحصلة اليوم.
                </p>
              </div>

              <button
                onClick={exportShiftCSV}
                className="py-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الوردية كملف Excel / CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-warm-border space-y-2 shadow-warm">
                <span className="text-xs text-warm-muted font-bold block">
                  إجمالي إيرادات الوردية
                </span>
                <div className="text-2xl font-black text-warm-text">
                  {totalRevenue.toFixed(1)}{" "}
                  <span className="text-sm font-semibold text-warm-muted">
                    {currency}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{paidOrders.length} طلبات محصلة</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-warm-border space-y-2 shadow-warm">
                <span className="text-xs text-warm-muted font-bold block">
                  التحصيل كاش (درج النقدية)
                </span>
                <div className="text-2xl font-black text-emerald-700">
                  {cashRevenue.toFixed(1)}{" "}
                  <span className="text-sm font-semibold text-warm-muted">
                    {currency}
                  </span>
                </div>
                <span className="text-[11px] text-warm-muted">نقدية فعلية بالخزينة</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-warm-border space-y-2 shadow-warm">
                <span className="text-xs text-warm-muted font-bold block">
                  التحصيل الإلكتروني (InstaPay)
                </span>
                <div className="text-2xl font-black text-purple-700">
                  {instapayRevenue.toFixed(1)}{" "}
                  <span className="text-sm font-semibold text-warm-muted">
                    {currency}
                  </span>
                </div>
                <span className="text-[11px] text-warm-muted">تحويل بنكي فوري</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-warm-border space-y-2 shadow-warm">
                <span className="text-xs text-warm-muted font-bold block">
                  فودافون كاش والمحافظ
                </span>
                <div className="text-2xl font-black text-rose-600">
                  {vodafoneRevenue.toFixed(1)}{" "}
                  <span className="text-sm font-semibold text-warm-muted">
                    {currency}
                  </span>
                </div>
                <span className="text-[11px] text-warm-muted">محافظ الهواتف</span>
              </div>
            </div>

            {/* Shift Details Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-warm-border space-y-4 shadow-warm">
              <h3 className="text-sm font-bold text-warm-text flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-warm-accent" />
                <span>سجل المبيعات والطلبات بالوردية الحالية</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-warm-border text-warm-muted font-bold">
                      <th className="py-2.5 px-3">رقم الطلب</th>
                      <th className="py-2.5 px-3">الموقع</th>
                      <th className="py-2.5 px-3">الوقت</th>
                      <th className="py-2.5 px-3">العناصر</th>
                      <th className="py-2.5 px-3">طريقة الدفع</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border/60">
                    {paidOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-warm-surface/60 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-warm-text">
                          #{o.orderNumber}
                        </td>
                        <td className="py-3 px-3 font-semibold">{o.orderPointName}</td>
                        <td className="py-3 px-3 text-warm-muted">
                          {new Date(o.createdAt).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3">
                          {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-warm-surface border border-warm-border text-warm-text font-bold">
                            {o.paymentMethod || "كاش"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-warm-accent">
                          {o.total.toFixed(1)} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DIRECT POS ORDER MODAL (طلب كاشير سريع) */}
      {isPosOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl h-[88vh] bg-white rounded-3xl border border-warm-border shadow-warmLg flex flex-col md:flex-row overflow-hidden">
            {/* Left/Main Column: Menu Product Picker */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-l border-warm-border p-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-warm-accent" />
                  <h3 className="font-extrabold text-sm text-warm-text">
                    تسجيل طلب مباشر من الكاشير
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-warm-surface p-1 rounded-xl border border-warm-border text-xs">
                  <button
                    onClick={() => setPosOrderType("dine_in")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      posOrderType === "dine_in"
                        ? "bg-white text-warm-text shadow-sm"
                        : "text-warm-muted"
                    }`}
                  >
                    صالة (طاولة)
                  </button>
                  <button
                    onClick={() => setPosOrderType("takeaway")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      posOrderType === "takeaway"
                        ? "bg-warm-text text-white shadow-sm"
                        : "text-warm-muted"
                    }`}
                  >
                    سفري (Takeaway)
                  </button>
                </div>
              </div>

              {/* Table Picker if Dine-in */}
              {posOrderType === "dine_in" && (
                <div className="flex items-center gap-2 py-2 overflow-x-auto text-xs">
                  <span className="font-bold text-warm-muted whitespace-nowrap">الطاولة:</span>
                  {tables.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPosSelectedTable(t.number)}
                      className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                        posSelectedTable === t.number
                          ? "bg-warm-accent text-white shadow-sm"
                          : "bg-warm-surface text-warm-muted border border-warm-border"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Category Pills */}
              <div className="flex gap-1.5 py-2 overflow-x-auto text-xs scrollbar-none">
                <button
                  onClick={() => setPosCategoryFilter("all")}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap ${
                    posCategoryFilter === "all"
                      ? "bg-warm-text text-white"
                      : "bg-warm-surface text-warm-muted border border-warm-border"
                  }`}
                >
                  الكل
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPosCategoryFilter(c.id)}
                    className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap ${
                      posCategoryFilter === c.id
                        ? "bg-warm-text text-white"
                        : "bg-warm-surface text-warm-muted border border-warm-border"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
                {products
                  .filter((p) => posCategoryFilter === "all" || p.categoryId === posCategoryFilter)
                  .map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => addToPosCart(prod)}
                      className="p-3 rounded-2xl bg-warm-surface/60 border border-warm-border hover:border-warm-accent hover:bg-warm-surface cursor-pointer transition-all flex flex-col justify-between space-y-2 shadow-xs active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-warm-border"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-warm-text truncate">
                            {prod.name}
                          </div>
                          <div className="font-black text-xs text-warm-accent">
                            {prod.price} {currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Column: Running POS Ticket / Receipt */}
            <div className="w-full md:w-80 flex flex-col justify-between p-5 bg-warm-surface/70">
              <div className="flex justify-between items-center pb-2 border-b border-warm-border">
                <span className="font-black text-xs text-warm-text">تذكرة الطلب الحالية</span>
                <button
                  onClick={() => setIsPosOrderModalOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-200 text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2">
                {posCart.length === 0 ? (
                  <div className="py-16 text-center text-xs text-warm-muted">
                    انقر على الأصناف لإضافتها للتذكرة فورياً
                  </div>
                ) : (
                  posCart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-warm-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-warm-text">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-[11px] text-warm-muted">
                          {item.totalPrice} {currency}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setPosCart((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-rose-500 hover:text-rose-700 text-xs px-2"
                      >
                        حذف
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Submit */}
              <div className="space-y-3 pt-3 border-t border-warm-border">
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  placeholder="اسم العميل (اختياري)..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-warm-border text-xs text-warm-text"
                />

                <div className="flex justify-between text-sm font-black text-warm-text">
                  <span>الإجمالي:</span>
                  <span className="text-warm-accent">
                    {posCart.reduce((acc, i) => acc + i.totalPrice, 0).toFixed(1)} {currency}
                  </span>
                </div>

                <button
                  onClick={submitPosOrder}
                  disabled={posCart.length === 0}
                  className="w-full py-3 rounded-2xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm disabled:opacity-40"
                >
                  إرسال الطلب للمحطة وتأكيد الفاتورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {discountModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-warm-border shadow-warmLg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-warm-text">تطبيق خصم على الفاتورة</h3>
              <button
                onClick={() => setDiscountModalOrderId(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 bg-warm-surface p-1 rounded-xl border border-warm-border text-xs">
              <button
                type="button"
                onClick={() => setDiscountType("percent")}
                className={`flex-1 py-1 rounded-lg font-bold ${
                  discountType === "percent"
                    ? "bg-white text-warm-text shadow-sm"
                    : "text-warm-muted"
                }`}
              >
                نسبة مئوية (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("amount")}
                className={`flex-1 py-1 rounded-lg font-bold ${
                  discountType === "amount"
                    ? "bg-white text-warm-text shadow-sm"
                    : "text-warm-muted"
                }`}
              >
                مبلغ ثابت (ج.م)
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warm-text block">
                قيمة الخصم ({discountType === "percent" ? "%" : "ج.م"}):
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "50"}
                className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warm-text block">سبب الخصم:</label>
              <input
                type="text"
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                placeholder="خصم عميل مميز / عرض خاص"
                className="w-full px-3 py-2 rounded-xl bg-warm-surface border border-warm-border text-xs text-warm-text"
              />
            </div>

            <button
              onClick={handleApplyDiscount}
              className="w-full py-2.5 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm"
            >
              تطبيق الخصم وإعادة احتساب الإجمالي
            </button>
          </div>
        </div>
      )}

      {/* TABLE TRANSFER MODAL */}
      {transferOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-warm-border shadow-warmLg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-warm-text">نقل الطلب لطاولة أخرى</h3>
              <button
                onClick={() => setTransferOrderId(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-warm-muted">
              اختر الطاولة الجديدة لنقل الطلب إليها وتحويل حالتها إلى مشغولة فوراً:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {tables
                .filter((t) => t.status === "available")
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTargetTableNumber(t.number)}
                    className={`p-3 rounded-xl border text-xs font-bold ${
                      targetTableNumber === t.number
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-warm-surface border-warm-border text-warm-text"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
            </div>

            <button
              onClick={handleTransferTable}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-sm"
            >
              تأكيد نقل الطلب
            </button>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal for Tables */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-warm-border shadow-warmLg p-6 space-y-5 text-center">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-warm-text">
                رمز QR لـ {activeTenant.orderPointLabel} {qrModalTable}
              </h3>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 flex-wrap">
              {tables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => setQrModalTable(tbl.number)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    qrModalTable === tbl.number
                      ? "bg-warm-text text-white shadow-sm"
                      : "bg-warm-surface border border-warm-border text-warm-muted"
                  }`}
                >
                  {tbl.number}
                </button>
              ))}
            </div>

            {/* QR Card Preview */}
            <div className="p-5 rounded-2xl bg-warm-surface border-2 border-dashed border-warm-border space-y-3">
              <div className="font-extrabold text-sm text-warm-text">
                {activeTenant.name}
              </div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:3000/?table=${qrModalTable}`}
                alt="Table QR Code"
                className="w-44 h-44 mx-auto rounded-xl border border-warm-border p-2 bg-white shadow-sm"
              />
              <p className="text-[11px] text-warm-muted font-bold">
                امسح الكود لفتح القائمة والطلب مباشرة من طاولتك
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-warm-accent hover:bg-amber-600 text-white font-extrabold text-xs shadow-warm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كارت الطاولة للعميل</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden Thermal Receipt 80mm Print Layout */}
      {printingOrder && (
        <div id="thermal-receipt-print-area" className="hidden">
          <div style={{ textAlign: "center", marginBottom: "4mm" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0" }}>
              {activeTenant.name}
            </h2>
            <p style={{ margin: "1mm 0", fontSize: "10px" }}>
              {activeTenant.ownerPhone}
            </p>
            <p style={{ margin: "0", fontSize: "10px" }}>
              فاتورة ضريبية مبسطة
            </p>
          </div>

          <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "2mm 0", margin: "2mm 0" }}>
            <div>رقم الطلب: #{printingOrder.orderNumber}</div>
            <div>الموقع: {printingOrder.orderPointName}</div>
            <div>التاريخ: {new Date(printingOrder.createdAt).toLocaleString("ar-EG")}</div>
            <div>طريقة الدفع: {printingOrder.paymentMethod || "كاش"}</div>
          </div>

          <table style={{ width: "100%", margin: "2mm 0", textAlign: "right" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
              </tr>
            </thead>
            <tbody>
              {printingOrder.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", paddingTop: "2mm", marginTop: "2mm" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>المجموع الفرعي:</span>
              <span>{printingOrder.subtotal.toFixed(1)} {currency}</span>
            </div>

            {printingOrder.discountAmount ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>الخصم ({printingOrder.discountNote || "خصم"}):</span>
                <span>-{printingOrder.discountAmount.toFixed(1)} {currency}</span>
              </div>
            ) : null}

            {printingOrder.taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>ضريبة القيمة المضافة ({activeTenant.branding.taxPercentage}%):</span>
                <span>{printingOrder.taxAmount.toFixed(1)} {currency}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "12px", marginTop: "1mm" }}>
              <span>الإجمالي النهائي:</span>
              <span>{printingOrder.total.toFixed(1)} {currency}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "5mm", fontSize: "9px" }}>
            نتشرف دائماً بخدمتكم!
            <br />
            Smart Menu Warm SaaS
          </div>
        </div>
      )}
        </div>
      </TenantPaywall>
    </RoleGuard>
  );
}
