export type BusinessType = "restaurant" | "cafe" | "retail" | "pharmacy" | "service";

export type PlanTier = "starter" | "pro" | "enterprise";
export type PlanStatus = "active" | "pending_approval" | "expired";
export type SubscriptionLicenseStatus = "active" | "trial" | "expired" | "suspended";

export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "CASHIER" | "KITCHEN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId?: string; // null for SUPER_ADMIN
  avatarUrl?: string;
  password?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface TenantBranding {
  logoUrl?: string;
  coverUrl?: string;
  primaryColor: string;
  themeMode: "warm" | "dark" | "light" | "system";
  fontFamily: string;
  currency: string;
  taxPercentage: number;
  serviceFeePercentage: number;
}

export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  stationLabel: string;
  orderPointLabel: string;
  branding: TenantBranding;
  planTier: PlanTier;
  planStatus: PlanStatus;
  subscriptionStatus: SubscriptionLicenseStatus;
  subscriptionExpiry: string; // ISO string
  requireCashierApproval: boolean;
  enableSmartUpselling: boolean;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
  onboardingCompleted?: boolean;
  isSampleDataLoaded?: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductModifier {
  id: string;
  name: string;
  required: boolean;
  maxSelection?: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  stockQuantity?: number; // إدارة المخزون
  isUpsell?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isBestSeller?: boolean;
  prepTimeMinutes?: number;
  calories?: number;
  modifiers?: ProductModifier[];
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedModifiers?: {
    modifierName: string;
    optionName: string;
    price: number;
  }[];
  notes?: string;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "card" | "vodafone_cash" | "instapay";
export type OrderType = "dine_in" | "takeaway" | "delivery";

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  orderType: OrderType;
  orderPointName: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discountAmount?: number;
  discountNote?: string;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  prepStartedAt?: string;
  readyAt?: string;
  completedAt?: string;
}

export type TableStatus = "available" | "occupied" | "ready" | "bill_requested" | "assistance";

export interface TableInfo {
  id: string;
  tenantId: string;
  number: string;
  name: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
}

export interface SubscriptionPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  planTier: PlanTier;
  billingCycle: "monthly" | "annual";
  amount: number;
  method: "instapay" | "vodafone_cash";
  senderAccount: string;
  transactionRef: string;
  receiptImageUrl?: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
}
