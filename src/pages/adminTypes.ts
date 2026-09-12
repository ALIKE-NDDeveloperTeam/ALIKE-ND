export interface Product {
  _id: string;
  id?: number;
  name: string;
  brand?: string;
  category: string;
  price: number;
  mrp?: number;
  rating?: number;
  reviewsCount?: number;
  stock: number;
  stockStatus?: string;
  badge?: string;
  isFlashSale?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  specifications?: Record<string, string>;
  isWholesale?: boolean;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  colors?: string[];
  sizes?: string[];
  emoji?: string;
  sellerId?: string;
  sellerShopName?: string;
  flashEndsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  _id: string;
  orderNumber: string;
  memberName: string;
  memberEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type SellerStatus = "pending" | "approved" | "review" | "suspended" | "rejected";

export interface Seller {
  _id: string;
  shopName?: string;
  storefront: string;
  ownerName: string;
  ownerEmail?: string;
  email?: string;
  mobileNumber?: string;
  businessAddress?: string;
  listingsCount: number;
  status: SellerStatus;
  createdAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  mobileNumber?: string;
  tier: "Silver" | "Gold" | "Platinum";
  isBlocked?: boolean;
  verified?: boolean;
  ordersCount: number;
  lifetimeSpend: number;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalSellers: number;
  ordersBreakdown: {
    pending: number;
    processing?: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export interface AdminProfile {
  _id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
}

export interface AdminAccount {
  _id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
  isActive?: boolean;
  createdAt?: string;
}

export interface SalesReport {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  totalOrders?: number;
  totalMembersCount: number;
  revenueByTier: {
    Platinum: number;
    Gold: number;
    Silver: number;
  };
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface ActivityLogEvent {
  _id: string;
  eventType: "Registration" | "Login" | "Failed Login";
  userName: string;
  email: string;
  status: "success" | "failed";
  ipAddress: string;
  deviceInfo: string;
  browser?: string;
  os?: string;
  details?: string;
  createdAt: string;
}

export interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionOrderLog {
  _id: string;
  orderNumber: string;
  date: string;
  memberName: string;
  memberEmail?: string;
  total: number;
  commissionRate: number;
  commissionAmount: number;
  sellerPayout: number;
  paymentMethod?: string;
  status: OrderStatus;
  commissionStatus?: string;
}

export interface PlatformWithdrawal {
  _id: string;
  amount: number;
  note?: string;
  adminEmail?: string;
  adminName?: string;
  date: string;
  status: string;
}

export interface CommissionData {
  commissionRate: number;
  totalCommissionEarned: number;
  runningBalance: number;
  totalWithdrawn?: number;
  totalOrdersCount: number;
  orders: CommissionOrderLog[];
  withdrawals?: PlatformWithdrawal[];
}



