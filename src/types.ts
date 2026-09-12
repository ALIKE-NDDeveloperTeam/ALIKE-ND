/**
 * Types & Interfaces for Alike-ND E-Commerce Platform
 */

export interface Product {
  id: number;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviewsCount: number;
  stock?: number;
  stockStatus?: string;
  image: string;
  images?: string[];
  category: string;
  badge?: 'SALE' | 'HOT' | 'NEW' | 'TRENDING' | 'LIMITED' | string;
  isFlashSale?: boolean;
  flashEndsAt?: string;
  description: string;
  specifications: Record<string, string>;
  isWholesale?: boolean;
  wholesaleMinQty?: number;
  wholesalePrice?: number;
  colors?: string[];
  sizes?: string[];
  emoji?: string;
  sellerId?: string;
  sellerShopName?: string;
}

export interface SellerProfile {
  _id: string;
  shopName: string;
  storefront?: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  businessAddress: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'review';
  listingsCount?: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Remote';
  logo: string;
  description: string;
  requirements: string[];
  category?: string;
  dateAdded?: string;
  shortDesc?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  delivery: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  address: Address;
  paymentMethod: string;
  trackingStep: number; // 1: Order Placed, 2: Processing, 3: Shipped, 4: Delivered
  memberEmail?: string;
  userId?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  attachment?: {
    name: string;
    url: string;
  };
  image?: string;
  isSending?: boolean;
  isDelivered?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  replyToText?: string;
  replyToSender?: 'user' | 'contact';
  isStarred?: boolean;
  isVoice?: boolean;
  voiceDuration?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  reactions?: { emoji: string; }[];
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isBlocked?: boolean;
  isMuted?: boolean;
}

export interface Notification {
  id: string | number;
  type: 'order' | 'promotion' | 'system' | 'shipping' | 'promo' | 'warning' | 'security' | 'message';
  title: string;
  description?: string;
  message?: string;
  timestamp: string;
  isRead?: boolean;
  isUnread?: boolean;
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  mobileNumber?: string;
  tier?: 'Silver' | 'Gold' | 'Platinum' | string;
  avatar?: string;
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

