"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  TenantSettings,
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentMethod,
  SubscriptionPayment,
  OrderItem,
  TableInfo,
  TableStatus,
  OrderType,
} from "../types";
import {
  INITIAL_TENANTS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TABLES,
} from "../lib/data";
import { getSocket, joinTenantRoom } from "../lib/socket";

interface CartItem extends OrderItem {}

interface AppContextType {
  tenants: TenantSettings[];
  activeTenant: TenantSettings;
  setActiveTenantId: (id: string) => void;
  updateActiveTenantSettings: (updated: Partial<TenantSettings>) => void;
  addNewTenant: (newTenant: Omit<TenantSettings, "id" | "createdAt">) => TenantSettings;

  categories: Category[];
  products: Product[];
  orders: Order[];
  tables: TableInfo[];
  subscriptions: SubscriptionPayment[];

  // Menu Management (CRUD) & Stock
  addProduct: (product: Omit<Product, "id" | "tenantId">) => Product;
  updateProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
  updateStockQuantity: (productId: string, delta: number) => void;
  addCategory: (name: string) => Category;
  deleteCategory: (categoryId: string) => void;
  loadSampleMenuForTenant: (tenantId: string) => void;
  clearTenantMenu: (tenantId: string) => void;

  // Floor Plan & Tables
  updateTableStatus: (tableNumber: string, status: TableStatus, activeOrderId?: string) => void;
  addTable: (number: string, capacity: number) => void;

  // Cart Management (Customer / Dine-in)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedModifiers?: OrderItem["selectedModifiers"], notes?: string) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Promo code
  appliedCoupon: { code: string; discountPercent: number } | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Active table/order point
  activeOrderPoint: string;
  setActiveOrderPoint: (val: string) => void;

  // Order actions
  placeOrder: (customerName?: string, customerPhone?: string, notes?: string) => Order;
  createDirectPosOrder: (
    items: OrderItem[],
    orderType: OrderType,
    orderPointName: string,
    customerName?: string,
    customerPhone?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string, method: PaymentMethod) => void;
  applyDiscountToOrder: (orderId: string, discountAmount: number, discountNote: string) => void;
  transferOrderTable: (orderId: string, newTableNumber: string) => void;
  callWaiter: (type: "assistance" | "bill") => void;

  // Subscription & Billing actions
  submitSubscriptionPayment: (
    data: Omit<SubscriptionPayment, "id" | "status" | "submittedAt">
  ) => SubscriptionPayment;
  verifySubscriptionPayment: (id: string, status: "verified" | "rejected") => void;
  updateTenantLicense: (
    tenantId: string,
    action: "extend_30" | "extend_365" | "trial_14" | "suspend" | "activate"
  ) => void;

  // Sound alert & Offline status
  isOnline: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  playAlertSound: (type: "new_order" | "ready" | "bell") => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<TenantSettings[]>(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantIdState] = useState<string>("tenant-first");
  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tablesList, setTablesList] = useState<TableInfo[]>(INITIAL_TABLES);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPayment[]>(INITIAL_SUBSCRIPTIONS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [activeOrderPoint, setActiveOrderPoint] = useState<string>("4");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const categories = categoriesList.filter((c) => c.tenantId === activeTenant.id);
  const products = productsList.filter((p) => p.tenantId === activeTenant.id);
  const tables = tablesList.filter((t) => t.tenantId === activeTenant.id);

  // Load products & categories from localStorage if present, otherwise default to INITIAL
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cachedProds = localStorage.getItem("smart_menu_products_v2");
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductsList(parsed);
        }
      }
      const cachedCats = localStorage.getItem("smart_menu_categories_v2");
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategoriesList(parsed);
        }
      }
      const cachedTables = localStorage.getItem("smart_menu_tables_v2");
      if (cachedTables) {
        const parsed = JSON.parse(cachedTables);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTablesList(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Save to localStorage whenever products, categories, or tables change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("smart_menu_products_v2", JSON.stringify(productsList));
      localStorage.setItem("smart_menu_categories_v2", JSON.stringify(categoriesList));
      localStorage.setItem("smart_menu_tables_v2", JSON.stringify(tablesList));
    } catch (e) {}
  }, [productsList, categoriesList, tablesList]);

  // Monitor Network Online/Offline Status
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    try {
      const cached = localStorage.getItem(`smart_menu_orders_${activeTenant.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
    } catch (e) {}

    // Listen for storage events (e.g. from poke-pal.html or barista-pal.html)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `smart_menu_orders_${activeTenant.id}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
            playAlertSound("new_order");
          }
        } catch (err) {}
      }
    };

    // Listen for direct window messages from interactive builders
    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "SMART_MENU_NEW_ORDER" && e.data.order) {
        const newOrder = e.data.order;
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          const updated = [newOrder, ...prev];
          try {
            localStorage.setItem(`smart_menu_orders_${activeTenant.id}`, JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
        playAlertSound("new_order");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("message", handleWindowMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [activeTenant.id]);

  // Sync orders to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`smart_menu_orders_${activeTenant.id}`, JSON.stringify(orders));
    } catch (e) {}
  }, [orders, activeTenant.id]);

  // Sound synthesizer for alerts
  const playAlertSound = (type: "new_order" | "ready" | "bell") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "new_order") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.18);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start(ctx.currentTime + 0.15);
        osc1.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
      } else if (type === "ready") {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(987.77, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  // Socket.io integration
  useEffect(() => {
    if (typeof window === "undefined") return;
    const socket = getSocket();
    joinTenantRoom(activeTenant.id, "customer");

    const onOrderCreated = (newOrder: Order) => {
      if (newOrder.tenantId === activeTenant.id) {
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });

        // Update corresponding table to occupied
        if (newOrder.orderPointName.startsWith(activeTenant.orderPointLabel)) {
          const tableNum = newOrder.orderPointName.replace(`${activeTenant.orderPointLabel} `, "").trim();
          setTablesList((prev) =>
            prev.map((t) =>
              t.tenantId === activeTenant.id && t.number === tableNum
                ? { ...t, status: "occupied", activeOrderId: newOrder.id }
                : t
            )
          );
        }

        playAlertSound("new_order");
      }
    };

    const onOrderStatusUpdated = ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      // Update table status if ready
      if (status === "ready") {
        setTablesList((prev) =>
          prev.map((t) => (t.activeOrderId === orderId ? { ...t, status: "ready" } : t))
        );
        playAlertSound("ready");
      }
    };

    const onOrderPaymentUpdated = ({ orderId, paymentMethod }: { orderId: string; paymentMethod: PaymentMethod }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, paymentStatus: "paid", paymentMethod } : o
        )
      );

      // Free table when paid
      setTablesList((prev) =>
        prev.map((t) => (t.activeOrderId === orderId ? { ...t, status: "available", activeOrderId: undefined } : t))
      );
    };

    const onWaiterCalled = (data: any) => {
      if (data?.orderPointName) {
        setTablesList((prev) =>
          prev.map((t) =>
            t.tenantId === activeTenant.id && t.number === data.orderPointName
              ? { ...t, status: data.type === "bill" ? "bill_requested" : "assistance" }
              : t
          )
        );
      }
      playAlertSound("bell");
    };

    socket.on("order:created", onOrderCreated);
    socket.on("order:status_updated", onOrderStatusUpdated);
    socket.on("order:payment_updated", onOrderPaymentUpdated);
    socket.on("order_point:waiter_called", onWaiterCalled);

    return () => {
      socket.off("order:created", onOrderCreated);
      socket.off("order:status_updated", onOrderStatusUpdated);
      socket.off("order:payment_updated", onOrderPaymentUpdated);
      socket.off("order_point:waiter_called", onWaiterCalled);
    };
  }, [activeTenant.id, soundEnabled]);

  const setActiveTenantId = (id: string) => {
    setActiveTenantIdState(id);
    setCart([]);
    setAppliedCoupon(null);
    joinTenantRoom(id, "customer");
  };

  const updateActiveTenantSettings = (updated: Partial<TenantSettings>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenant.id ? { ...t, ...updated } : t))
    );
  };

  const addNewTenant = (newTenantData: Omit<TenantSettings, "id" | "createdAt">): TenantSettings => {
    const id = `tenant-${Date.now()}`;
    const newTenant: TenantSettings = {
      ...newTenantData,
      id,
      createdAt: new Date().toISOString(),
    };
    setTenants((prev) => [newTenant, ...prev]);
    setActiveTenantId(id);
    return newTenant;
  };

  // Menu Management (CRUD)
  const addProduct = (productData: Omit<Product, "id" | "tenantId">): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      tenantId: activeTenant.id,
      stockQuantity: productData.stockQuantity || 30,
    };
    setProductsList((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId: string, updated: Partial<Product>) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductAvailability = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const updateStockQuantity = (productId: string, delta: number) => {
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stockQuantity: Math.max(0, (p.stockQuantity || 0) + delta) }
          : p
      )
    );
  };

  const addCategory = (name: string): Category => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      tenantId: activeTenant.id,
      name,
      sortOrder: categories.length + 1,
    };
    setCategoriesList((prev) => [...prev, newCat]);
    return newCat;
  };

  const deleteCategory = (categoryId: string) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Floor Plan Tables
  const updateTableStatus = (tableNumber: string, status: TableStatus, activeOrderId?: string) => {
    setTablesList((prev) =>
      prev.map((t) =>
        t.tenantId === activeTenant.id && t.number === tableNumber
          ? { ...t, status, activeOrderId }
          : t
      )
    );
  };

  const addTable = (number: string, capacity: number) => {
    const newTbl: TableInfo = {
      id: `tbl-${Date.now()}`,
      tenantId: activeTenant.id,
      number,
      name: `${activeTenant.orderPointLabel} ${number}`,
      capacity,
      status: "available",
    };
    setTablesList((prev) => [...prev, newTbl]);
  };

  const loadSampleMenuForTenant = (tenantId: string) => {
    // Generate categories mapped to tenantId
    const catMap: Record<string, string> = {};
    const sampleCats: Category[] = INITIAL_CATEGORIES.map((c, idx) => {
      const newId = `cat-${tenantId}-${idx + 1}`;
      catMap[c.id] = newId;
      return {
        ...c,
        id: newId,
        tenantId,
      };
    });

    const sampleProds: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-${tenantId}-${idx + 1}`,
      tenantId,
      categoryId: catMap[p.categoryId] || p.categoryId,
    }));

    const sampleTables: TableInfo[] = INITIAL_TABLES.map((t, idx) => ({
      ...t,
      id: `tbl-${tenantId}-${idx + 1}`,
      tenantId,
    }));

    setCategoriesList((prev) => [...prev.filter((c) => c.tenantId !== tenantId), ...sampleCats]);
    setProductsList((prev) => [...prev.filter((p) => p.tenantId !== tenantId), ...sampleProds]);
    setTablesList((prev) => [...prev.filter((t) => t.tenantId !== tenantId), ...sampleTables]);
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isSampleDataLoaded: true, onboardingCompleted: true } : t))
    );
  };

  const clearTenantMenu = (tenantId: string) => {
    setProductsList((prev) => prev.filter((p) => p.tenantId !== tenantId));
    setCategoriesList((prev) => prev.filter((c) => c.tenantId !== tenantId));
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isSampleDataLoaded: false, onboardingCompleted: false } : t))
    );
  };

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedModifiers?: OrderItem["selectedModifiers"],
    notes?: string
  ) => {
    const modTotal = selectedModifiers
      ? selectedModifiers.reduce((acc, m) => acc + m.price, 0)
      : 0;
    const unitPrice = product.price + modTotal;
    const totalPrice = unitPrice * quantity;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers) &&
          item.notes === notes
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice,
          selectedModifiers,
          notes,
        },
      ];
    });

    playAlertSound("bell");
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity,
        totalPrice: quantity * updated[index].unitPrice,
      };
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "SMART10" || clean === "WELCOME") {
      setAppliedCoupon({ code: clean, discountPercent: 10 });
      return { success: true, message: "تم تطبيق خصم 10% بنجاح! 🎉" };
    }
    if (clean === "VIP20") {
      setAppliedCoupon({ code: clean, discountPercent: 20 });
      return { success: true, message: "تم تطبيق خصم 20% للعملاء المميزين! 🌟" };
    }
    return { success: false, message: "كود الخصم غير صالح أو منتهي الصلاحية." };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Placing Customer Order
  const placeOrder = (customerName?: string, customerPhone?: string, notes?: string): Order => {
    let subtotal = cartTotal;
    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = (subtotal * appliedCoupon.discountPercent) / 100;
      subtotal = subtotal - discountAmount;
    }

    const taxAmount = (subtotal * activeTenant.branding.taxPercentage) / 100;
    const serviceAmount = (subtotal * activeTenant.branding.serviceFeePercentage) / 100;
    const total = subtotal + taxAmount + serviceAmount;

    const nextOrderNum = (orders.filter((o) => o.tenantId === activeTenant.id).length + 101).toString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tenantId: activeTenant.id,
      orderNumber: nextOrderNum,
      orderType: "dine_in",
      orderPointName: `${activeTenant.orderPointLabel} ${activeOrderPoint}`,
      customerName: customerName || "عميل الصالة",
      customerPhone,
      items: [...cart],
      status: activeTenant.requireCashierApproval ? "pending" : "preparing",
      subtotal: cartTotal,
      taxAmount,
      serviceAmount,
      discountAmount,
      discountNote: appliedCoupon ? `كوبون ${appliedCoupon.code}` : undefined,
      total,
      paymentStatus: "unpaid",
      notes,
      createdAt: new Date().toISOString(),
      prepStartedAt: activeTenant.requireCashierApproval ? undefined : new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update Table status
    setTablesList((prev) =>
      prev.map((t) =>
        t.tenantId === activeTenant.id && t.number === activeOrderPoint
          ? { ...t, status: "occupied", activeOrderId: newOrder.id }
          : t
      )
    );

    clearCart();

    const socket = getSocket();
    socket.emit("order:new", newOrder);
    playAlertSound("new_order");

    return newOrder;
  };

  // Direct POS Order (from Cashier)
  const createDirectPosOrder = (
    items: OrderItem[],
    orderType: OrderType,
    orderPointName: string,
    customerName?: string,
    customerPhone?: string
  ): Order => {
    const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
    const taxAmount = (subtotal * activeTenant.branding.taxPercentage) / 100;
    const serviceAmount =
      orderType === "dine_in"
        ? (subtotal * activeTenant.branding.serviceFeePercentage) / 100
        : 0;
    const total = subtotal + taxAmount + serviceAmount;

    const nextOrderNum = (orders.filter((o) => o.tenantId === activeTenant.id).length + 101).toString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tenantId: activeTenant.id,
      orderNumber: nextOrderNum,
      orderType,
      orderPointName,
      customerName: customerName || (orderType === "takeaway" ? "طلب سفري مباشر" : "عميل الصالة"),
      customerPhone,
      items,
      status: "preparing",
      subtotal,
      taxAmount,
      serviceAmount,
      total,
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
      prepStartedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (orderType === "dine_in") {
      const tableNum = orderPointName.replace(`${activeTenant.orderPointLabel} `, "").trim();
      setTablesList((prev) =>
        prev.map((t) =>
          t.tenantId === activeTenant.id && t.number === tableNum
            ? { ...t, status: "occupied", activeOrderId: newOrder.id }
            : t
        )
      );
    }

    const socket = getSocket();
    socket.emit("order:new", newOrder);
    playAlertSound("new_order");

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date().toISOString();
        return {
          ...o,
          status,
          prepStartedAt: status === "preparing" && !o.prepStartedAt ? now : o.prepStartedAt,
          readyAt: status === "ready" && !o.readyAt ? now : o.readyAt,
          completedAt: status === "completed" && !o.completedAt ? now : o.completedAt,
        };
      })
    );

    const socket = getSocket();
    socket.emit("order:update_status", {
      tenantId: activeTenant.id,
      orderId,
      status,
    });
  };

  const markOrderPaid = (orderId: string, method: PaymentMethod) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: "paid", paymentMethod: method } : o
      )
    );

    // Free table
    setTablesList((prev) =>
      prev.map((t) =>
        t.activeOrderId === orderId
          ? { ...t, status: "available", activeOrderId: undefined }
          : t
      )
    );

    const socket = getSocket();
    socket.emit("order:payment_status", {
      tenantId: activeTenant.id,
      orderId,
      paymentMethod: method,
    });
  };

  const applyDiscountToOrder = (orderId: string, discountAmount: number, discountNote: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newSubtotal = Math.max(0, o.subtotal - discountAmount);
        const taxAmount = (newSubtotal * activeTenant.branding.taxPercentage) / 100;
        const serviceAmount = (newSubtotal * activeTenant.branding.serviceFeePercentage) / 100;
        const total = newSubtotal + taxAmount + serviceAmount;
        return {
          ...o,
          discountAmount,
          discountNote,
          total,
        };
      })
    );
  };

  const transferOrderTable = (orderId: string, newTableNumber: string) => {
    const newOrderPointName = `${activeTenant.orderPointLabel} ${newTableNumber}`;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderPointName: newOrderPointName } : o))
    );

    // Free old table and occupy new
    setTablesList((prev) =>
      prev.map((t) => {
        if (t.activeOrderId === orderId) {
          return { ...t, status: "available", activeOrderId: undefined };
        }
        if (t.number === newTableNumber) {
          return { ...t, status: "occupied", activeOrderId: orderId };
        }
        return t;
      })
    );
  };

  const callWaiter = (type: "assistance" | "bill") => {
    const socket = getSocket();
    socket.emit("order_point:call_waiter", {
      tenantId: activeTenant.id,
      orderPointLabel: activeTenant.orderPointLabel,
      orderPointName: activeOrderPoint,
      type,
      timestamp: new Date().toISOString(),
    });
    playAlertSound("bell");
  };

  const submitSubscriptionPayment = (
    data: Omit<SubscriptionPayment, "id" | "status" | "submittedAt">
  ): SubscriptionPayment => {
    const newSub: SubscriptionPayment = {
      ...data,
      id: `sub-${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [newSub, ...prev]);

    setTenants((prev) =>
      prev.map((t) =>
        t.id === data.tenantId ? { ...t, planTier: data.planTier, planStatus: "pending_approval" } : t
      )
    );

    return newSub;
  };

  const verifySubscriptionPayment = (id: string, status: "verified" | "rejected") => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, verifiedAt: new Date().toISOString() } : s
      )
    );

    const targetSub = subscriptions.find((s) => s.id === id);
    if (targetSub) {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === targetSub.tenantId
            ? {
                ...t,
                planTier: targetSub.planTier,
                planStatus: status === "verified" ? "active" : "expired",
              }
            : t
        )
      );

      const socket = getSocket();
      socket.emit("subscription:updated", {
        tenantId: targetSub.tenantId,
        status,
        planTier: targetSub.planTier,
      });
    }
  };

  const updateTenantLicense = (
    tenantId: string,
    action: "extend_30" | "extend_365" | "trial_14" | "suspend" | "activate"
  ) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== tenantId) return t;

        const currentExp = new Date(t.subscriptionExpiry).getTime();
        const baseTime = currentExp > Date.now() ? currentExp : Date.now();

        let newExpiry = t.subscriptionExpiry;
        let newStatus = t.subscriptionStatus;
        let newPlanStatus = t.planStatus;

        if (action === "extend_30") {
          newExpiry = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();
          newStatus = "active";
          newPlanStatus = "active";
        } else if (action === "extend_365") {
          newExpiry = new Date(baseTime + 365 * 24 * 60 * 60 * 1000).toISOString();
          newStatus = "active";
          newPlanStatus = "active";
        } else if (action === "trial_14") {
          newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          newStatus = "trial";
          newPlanStatus = "active";
        } else if (action === "suspend") {
          newStatus = "suspended";
          newPlanStatus = "expired";
        } else if (action === "activate") {
          newStatus = "active";
          newPlanStatus = "active";
          if (new Date(t.subscriptionExpiry).getTime() <= Date.now()) {
            newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          }
        }

        const updated = {
          ...t,
          subscriptionStatus: newStatus,
          planStatus: newPlanStatus,
          subscriptionExpiry: newExpiry,
        };

        const socket = getSocket();
        socket.emit("subscription:updated", {
          tenantId: t.id,
          status: newStatus,
          planTier: t.planTier,
          expiry: newExpiry,
        });

        return updated;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        activeTenant,
        setActiveTenantId,
        updateActiveTenantSettings,
        addNewTenant,
        updateTenantLicense,
        categories,
        products,
        orders,
        tables,
        subscriptions,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        updateStockQuantity,
        addCategory,
        deleteCategory,
        loadSampleMenuForTenant,
        clearTenantMenu,
        updateTableStatus,
        addTable,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        activeOrderPoint,
        setActiveOrderPoint,
        placeOrder,
        createDirectPosOrder,
        updateOrderStatus,
        markOrderPaid,
        applyDiscountToOrder,
        transferOrderTable,
        callWaiter,
        submitSubscriptionPayment,
        verifySubscriptionPayment,
        isOnline,
        soundEnabled,
        toggleSound,
        playAlertSound,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
