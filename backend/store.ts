import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin";
import User from "./models/User";
import Customer from "./models/Customer";
import Product from "./models/Product";
import ActivityLog from "./models/ActivityLog";
import Banner from "./models/Banner";
import PlatformSetting from "./models/PlatformSetting";

export interface InMemoryStore {
  admins: Array<{
    _id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: "superadmin" | "admin";
    isActive?: boolean;
    createdAt?: Date;
  }>;
  users: Array<{
    _id: string;
    fullName: string;
    email: string;
    country: string;
    mobileNumber: string;
    phone?: string;
    passwordHash: string;
    tier: "Silver" | "Gold" | "Platinum";
    verified: boolean;
    createdAt: Date;
  }>;
  products: Array<{
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
    createdAt: Date;
    updatedAt?: Date;
  }>;
  orders: Array<{
    _id: string;
    orderNumber: string;
    memberName: string;
    memberEmail?: string;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    commissionRate?: number;
    commissionAmount?: number;
    sellerPayout?: number;
    commissionStatus?: "credited" | "pending";
    paymentMethod?: string;
    createdAt: Date;
  }>;
  sellers: Array<{
    _id: string;
    shopName?: string;
    storefront: string;
    ownerName: string;
    ownerEmail?: string;
    email: string;
    mobileNumber?: string;
    businessAddress?: string;
    passwordHash?: string;
    listingsCount: number;
    status: "pending" | "approved" | "review" | "suspended" | "rejected";
    createdAt: Date;
  }>;
  customers: Array<{ _id: string; name: string; email: string; tier: "Silver" | "Gold" | "Platinum"; ordersCount: number; lifetimeSpend: number; createdAt: Date }>;
  activityLogs: Array<{
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
    createdAt: Date;
  }>;
  banners: Array<{
    _id: string;
    imageUrl: string;
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    link?: string;
    order: number;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  otps: Array<{
    email: string;
    otp: string;
    purpose: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  platformSettings: {
    commissionRate: number;
    platformBalance: number;
    totalCommissionEarned: number;
    updatedAt: Date;
  };
  platformWithdrawals: Array<{
    _id: string;
    amount: number;
    note: string;
    adminEmail: string;
    adminName: string;
    date: Date;
    status: string;
  }>;
}

// Initial seed hash derived strictly from optional environment variable (never hardcoded in source)
const INITIAL_ADMIN_SEED_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_SEED_PASSWORD;
const INITIAL_ADMIN_SEED_HASH = INITIAL_ADMIN_SEED_PASSWORD ? bcrypt.hashSync(INITIAL_ADMIN_SEED_PASSWORD, 10) : "";

export const INITIAL_BANNERS_SEED = [
  {
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Smart Shopping Experience",
    subtitle: "DEMAND PERFECTION. THE NEW GOLD STANDARD.",
    description: "Plunge into our curated catalog of ultra-premium electronics, handcrafted jewellery, and high-net-worth designer apparel.",
    buttonText: "Shop Now",
    link: "category_search",
    order: 1,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Guaranteed 20 Min Delivery",
    subtitle: "EXPRESS URBAN LUXURY AT YOUR DOORSTEP",
    description: "Why wait for premium? Direct courier delivery to your sector in under 20 minutes.",
    buttonText: "See Speed Deals",
    link: "category_search",
    order: 2,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "B2B Volume Wholesale Deals",
    subtitle: "DIRECT BULK IMPORTS FROM ATELIER LEADERS",
    description: "Secure Persian saffron lots, bulk fast-charger boxes, and designer satin wraps directly. Save up to 45% with our transparent tier grids.",
    buttonText: "Browse Wholesale",
    link: "category_search",
    order: 3,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Exclusive Sovereign Atelier",
    subtitle: "HAND-CRAFTED BESPOKE COUTURE",
    description: "Immerse yourself in our limited-edition autumn lookbook and royal designer wear.",
    buttonText: "Explore Atelier",
    link: "category_search",
    order: 4,
    active: true,
  },
];

export const INITIAL_PRODUCTS_SEED = [
  {
    _id: "prod_1",
    id: 1,
    name: "Aurelia Royal Gold Chronograph Watch",
    brand: "Aurelia Genf",
    price: 18499,
    mrp: 29999,
    rating: 4.8,
    reviewsCount: 312,
    stock: 14,
    stockStatus: "In Stock",
    category: "luxury",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Crafted in Switzerland, the Aurelia Chronograph boasts an 18-karat yellow gold case, hand-stitched alligator strap, and automatic precision movement.",
    specifications: { "Case Material": "18k Yellow Gold", "Movement": "Swiss Automatic Chronograph" },
    emoji: "⌚",
    createdAt: new Date(),
  },
  {
    _id: "prod_2",
    id: 2,
    name: "Alike-Pro Soundmaster Gold Edition",
    brand: "Alike Audio",
    price: 3499,
    mrp: 6999,
    rating: 4.6,
    reviewsCount: 148,
    stock: 8,
    stockStatus: "In Stock",
    category: "electronics",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Immersive active noise-cancelling headphones tuned to golden standard. Features gold brushed metal plating and 40-hour battery capacity.",
    specifications: { "Driver Unit": "40mm Dynamic", "ANC Support": "Active Hybrid ANC" },
    emoji: "🎧",
    createdAt: new Date(),
  },
  {
    _id: "prod_3",
    id: 3,
    name: "18K Gold plated Venetian Chain Necklace",
    brand: "Venezia Jewels",
    price: 5999,
    mrp: 11999,
    rating: 4.9,
    reviewsCount: 220,
    stock: 12,
    stockStatus: "In Stock",
    category: "jewellery",
    badge: "TRENDING",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"],
    description: "An elegant Italian-crafted Venetian chain dipped in authentic 18-karat gold with precision linkage.",
    specifications: { "Chain Length": "22 Inches", "Metal": "18k Gold on Sterling Silver" },
    emoji: "💍",
    createdAt: new Date(),
  },
  {
    _id: "prod_4",
    id: 4,
    name: "Alike-Book Master Pro 16",
    brand: "Alike-ND Computing",
    price: 89999,
    mrp: 124999,
    rating: 4.9,
    reviewsCount: 96,
    stock: 5,
    stockStatus: "In Stock",
    category: "laptops",
    badge: "LIMITED",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"],
    description: "Powered by the stellar M4 Alike SuperChip, featuring 32GB unified RAM, 1TB premium high-speed flash storage.",
    specifications: { "Processor": "Alike M4 Gen2 Max", "RAM": "32GB Unified" },
    emoji: "💻",
    createdAt: new Date(),
  },
  {
    _id: "prod_5",
    id: 5,
    name: "Midnight Silk Evening Gown",
    brand: "Aura Couture",
    price: 7999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 88,
    stock: 6,
    stockStatus: "In Stock",
    category: "fashion",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600"],
    description: "Flowing beautifully, this mulberry silk evening gown is tailored precisely for VIP cocktail galas.",
    specifications: { "Fabric": "100% Organic Mulberry Silk", "Stitch": "Handcrafted Atelier" },
    emoji: "👗",
    createdAt: new Date(),
  },
  {
    _id: "prod_6",
    id: 6,
    name: "Alike-Phon Gold-Titanium 15 Ultra",
    brand: "Alike Mobiles",
    price: 64999,
    mrp: 89999,
    rating: 4.8,
    reviewsCount: 450,
    stock: 9,
    stockStatus: "In Stock",
    category: "mobiles",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600"],
    description: "The crown jewel of modern smartphones. Crafted out of grade-5 gold titanium with 200MP Triple Golden-Eye Lens.",
    specifications: { "Chassis": "Tier-5 Titanium Gold Alloy", "Camera": "200MP Triple Lens" },
    emoji: "📱",
    createdAt: new Date(),
  },
  {
    _id: "prod_7",
    id: 7,
    name: "Luxury Gold Trim Espresso Machine",
    brand: "Barista Royale",
    price: 18999,
    mrp: 29999,
    rating: 4.5,
    reviewsCount: 110,
    stock: 4,
    stockStatus: "In Stock",
    category: "furniture",
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600"],
    description: "Premium professional grade espresso pump embellished with authentic polished brass gold trims.",
    specifications: { "Pressure": "19-Bar Italian Pump", "Finish": "Gold Lustre Metallic Trims" },
    emoji: "☕",
    createdAt: new Date(),
  },
  {
    _id: "prod_8",
    id: 8,
    name: "Wholesale Premium Organic Saffron Bulks (100g)",
    brand: "Persian Royal Wholesales",
    price: 14500,
    mrp: 25000,
    rating: 4.9,
    reviewsCount: 310,
    stock: 20,
    stockStatus: "In Stock",
    category: "wholesale",
    badge: "SALE",
    isFlashSale: true,
    isWholesale: true,
    wholesaleMinQty: 5,
    wholesalePrice: 12500,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"],
    description: "Direct premium grade-A saffron threads collected of royal fields. Highly aromatic, purely tested.",
    specifications: { "Grade": "Super Negin AAA Quality", "Origin": "Khorasan Fields" },
    emoji: "🌿",
    createdAt: new Date(),
  },
  {
    _id: "prod_9",
    id: 9,
    name: "Wholesale Alike Type-C Fast Chargers [Bulk Pack 50pcs]",
    brand: "Alike Hardware",
    price: 4999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 65,
    stock: 15,
    stockStatus: "In Stock",
    category: "wholesale",
    badge: "HOT",
    isFlashSale: false,
    isWholesale: true,
    wholesaleMinQty: 2,
    wholesalePrice: 4499,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600"],
    description: "Industrial wholesale supply of 50 high-durability fast chargers. Perfect for retailers and suppliers.",
    specifications: { "Output": "33W Power Delivery 3.0", "Box Quantity": "50 Pieces" },
    emoji: "🔌",
    createdAt: new Date(),
  },
  {
    _id: "prod_10",
    id: 10,
    name: "Alike RGB-Onyx Gaming Keyboard",
    brand: "Alike Gaming",
    price: 1999,
    mrp: 3999,
    rating: 4.5,
    reviewsCount: 194,
    stock: 18,
    stockStatus: "In Stock",
    category: "gaming",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600"],
    description: "Sleek tactical mechanical keyboard fitted with gold-plated switches for instant response, gorgeous backlit layouts.",
    specifications: { "Key Switch": "Gold Contact Blue Clicky", "Chassis": "Aircraft Aluminum" },
    emoji: "⌨️",
    createdAt: new Date(),
  },
  {
    _id: "prod_11",
    id: 11,
    name: "Premium Gold Glow Facial Extract Glow Serum",
    brand: "Glow & Co",
    price: 1299,
    mrp: 2499,
    rating: 4.4,
    reviewsCount: 82,
    stock: 25,
    stockStatus: "In Stock",
    category: "beauty",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600"],
    description: "Enriched with real micro gold leaf flakes and organic hyaluronic essence for deep moisturization.",
    specifications: { "Ingredients": "24k Gold Extract, Vitamin E", "Volume": "50ml Luxury Dropper" },
    emoji: "✨",
    createdAt: new Date(),
  },
  {
    _id: "prod_12",
    id: 12,
    name: "Sleek Chrome Finish Professional Tool Kit (20 Min Delivery)",
    brand: "Apex Hardware",
    price: 2499,
    mrp: 4999,
    rating: 4.6,
    reviewsCount: 54,
    stock: 2,
    stockStatus: "Only 2 left!",
    category: "hardware",
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600"],
    description: "Complete premium rust-resistant vanadium steel toolkit housed in a gold-accented protective hardcase.",
    specifications: { "Piece Count": "48 Professional Tools", "Material": "Chrome-Vanadium Grade" },
    emoji: "🔧",
    createdAt: new Date(),
  },
  {
    _id: "prod_13",
    id: 13,
    name: "Luxury Gold Velvet Ottoman Sofa Chair",
    brand: "Amore Living",
    price: 12499,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 42,
    stock: 3,
    stockStatus: "Only 2 left!",
    category: "furniture",
    badge: "TRENDING",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600"],
    description: "Make a bold luxury statement. Ultra cozy golden premium velvet upholstery backed on sturdy gold frames.",
    specifications: { "Upholstery": "Luxe Velvet Gold Fibre", "Frame": "Stainless Gold-PVD Steel" },
    emoji: "🛋️",
    createdAt: new Date(),
  },
  {
    _id: "prod_14",
    id: 14,
    name: "Alike Ultra-Premium Organic Caviar Shield (20 Min Delivery)",
    brand: "Royal Caspian",
    price: 4500,
    mrp: 7500,
    rating: 4.9,
    reviewsCount: 30,
    stock: 5,
    stockStatus: "20-Min Express",
    category: "delivery",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"],
    description: "Direct elite food-gourmet collection delivered at cold temperature straight to your doorway.",
    specifications: { "Standard Grade": "Beluga Royal Golden Reserve", "Chill Seal": "Yes, dry-ice insulated" },
    emoji: "🍣",
    createdAt: new Date(),
  },
  {
    _id: "prod_15",
    id: 15,
    name: "Alike Gold plated Pro Gaming Controller",
    brand: "Alike Gaming",
    price: 4999,
    mrp: 7999,
    rating: 4.7,
    reviewsCount: 162,
    stock: 11,
    stockStatus: "In Stock",
    category: "gaming",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=80&w=600"],
    description: "Custom metallic gold plated grips, tactile mechanical paddles, hall-effect anti-drift triggers.",
    specifications: { "Triggers": "Hall Effect Magnetic", "Latency": "1ms Ultra-Fast Wireless" },
    emoji: "🎮",
    createdAt: new Date(),
  },
];

export const memoryStore: InMemoryStore = {
  // Master Superadmin AND Regular Staff Admin accounts
  admins: [
    {
      _id: "admin_super_1",
      email: "noyondey176@gmail.com",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: "Noyon Dey",
      role: "superadmin",
      isActive: true,
      createdAt: new Date(),
    },
    {
      _id: "admin_staff_1",
      email: "admin234@gmail.com",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: "Regular Staff Admin",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    },
  ],
  users: [
    {
      _id: "user_noyon_superadmin",
      fullName: "Noyon Dey",
      email: "noyondey176@gmail.com",
      country: "+880",
      mobileNumber: "1700000000",
      phone: "+880 1700000000",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Platinum",
      verified: true,
      createdAt: new Date(),
    },
  ],
  products: INITIAL_PRODUCTS_SEED.map((p) => ({
    ...p,
    sellerId: "admin",
    sellerShopName: "ALIKE-ND Official",
  })),
  orders: [
    {
      _id: "ord_1",
      orderNumber: "AN-5201",
      memberName: "Vikram Malhotra",
      memberEmail: "vikram@example.com",
      total: 2400,
      status: "pending",
      commissionRate: 5,
      commissionAmount: 120,
      sellerPayout: 2280,
      commissionStatus: "credited",
      paymentMethod: "UPI (PHONEPE)",
      createdAt: new Date(),
    },
    {
      _id: "ord_2",
      orderNumber: "AN-5200",
      memberName: "Sara Whitfield",
      memberEmail: "sara@example.com",
      total: 1250,
      status: "shipped",
      commissionRate: 5,
      commissionAmount: 63,
      sellerPayout: 1187,
      commissionStatus: "credited",
      paymentMethod: "VISA CARD",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      _id: "ord_3",
      orderNumber: "AN-5199",
      memberName: "Elena Rostova",
      memberEmail: "elena@example.com",
      total: 4200,
      status: "delivered",
      commissionRate: 5,
      commissionAmount: 210,
      sellerPayout: 3990,
      commissionStatus: "credited",
      paymentMethod: "MASTERCARD",
      createdAt: new Date(Date.now() - 172800000),
    },
  ],
  sellers: [
    {
      _id: "sel_1",
      shopName: "Maison Argent",
      storefront: "Maison Argent",
      ownerName: "Sara Whitfield",
      ownerEmail: "sara@example.com",
      email: "sara@example.com",
      mobileNumber: "+91 98765 43210",
      businessAddress: "42 Rue de la Paix, Paris",
      listingsCount: 34,
      status: "approved",
      createdAt: new Date(),
    },
    {
      _id: "sel_2",
      shopName: "Noir & Gold Atelier",
      storefront: "Noir & Gold Atelier",
      ownerName: "Daniel Cho",
      ownerEmail: "daniel@example.com",
      email: "daniel@example.com",
      mobileNumber: "+91 98765 43211",
      businessAddress: "15 Gangnam-daero, Seoul",
      listingsCount: 12,
      status: "pending",
      createdAt: new Date(),
    },
    {
      _id: "sel_3",
      shopName: "Atelier Vesper",
      storefront: "Atelier Vesper",
      ownerName: "Claire Dupont",
      ownerEmail: "claire@example.com",
      email: "claire@example.com",
      mobileNumber: "+91 98765 43212",
      businessAddress: "88 Kensington High St, London",
      listingsCount: 19,
      status: "approved",
      createdAt: new Date(),
    },
  ],
  customers: [
    { _id: "cust_1", name: "Vikram Malhotra", email: "vikram@example.com", tier: "Platinum", ordersCount: 14, lifetimeSpend: 28400, createdAt: new Date() },
    { _id: "cust_2", name: "Amara Okafor", email: "amara@example.com", tier: "Silver", ordersCount: 3, lifetimeSpend: 3120, createdAt: new Date() },
    { _id: "cust_3", name: "Elena Rostova", email: "elena@example.com", tier: "Platinum", ordersCount: 22, lifetimeSpend: 47900, createdAt: new Date() },
    { _id: "cust_4", name: "Julian Vance", email: "julian@example.com", tier: "Gold", ordersCount: 7, lifetimeSpend: 11800, createdAt: new Date() },
  ],
  activityLogs: [
    {
      _id: "act_init_1",
      eventType: "Login",
      userName: "Noyon Dey",
      email: "noyondey176@gmail.com",
      status: "success",
      ipAddress: "157.240.199.35",
      deviceInfo: "Chrome 128 on macOS",
      browser: "Chrome",
      os: "macOS",
      details: "Super Admin Console authentication verified",
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
    },
    {
      _id: "act_init_2",
      eventType: "Registration",
      userName: "Vikram Malhotra",
      email: "vikram@example.com",
      status: "success",
      ipAddress: "103.21.244.0",
      deviceInfo: "Safari on iOS (iPhone)",
      browser: "Safari",
      os: "iOS (iPhone)",
      details: "New customer registered via Web Form",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      _id: "act_init_3",
      eventType: "Login",
      userName: "Elena Rostova",
      email: "elena@example.com",
      status: "success",
      ipAddress: "185.220.101.5",
      deviceInfo: "Chrome on Windows 11",
      browser: "Chrome",
      os: "Windows 11",
      details: "Password authentication verified against alikendshop.users",
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      _id: "act_init_4",
      eventType: "Failed Login",
      userName: "Unknown",
      email: "intruder@suspicious.net",
      status: "failed",
      ipAddress: "45.154.255.89",
      deviceInfo: "Firefox on Linux",
      browser: "Firefox",
      os: "Linux",
      details: "No account found in alikendshop.users",
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
    },
  ],
  banners: INITIAL_BANNERS_SEED.map((b, i) => ({
    ...b,
    _id: `ban_seed_${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  platformSettings: {
    commissionRate: 5,
    platformBalance: 393,
    totalCommissionEarned: 393,
    updatedAt: new Date(),
  },
  platformWithdrawals: [],
  otps: [],
};

let lastConnectionError: string | null = null;
let lastMaskedUri: string | null = null;
let isConnecting = false;

// Attach persistent mongoose event listeners to prevent unhandled error crashes
mongoose.connection.on("error", (err) => {
  const rawMsg = err?.message || String(err);
  if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("tlsv1 alert internal error")) {
    lastConnectionError = "MongoDB Atlas rejected the TLS handshake (SSL alert 80). Operating in automatic sync fallback mode.";
    console.log("ℹ️ [MONGODB ATLAS NOTICE] IP Whitelist needed in Atlas (0.0.0.0/0). In-memory fallback active.");
  } else {
    lastConnectionError = rawMsg;
    console.log("ℹ️ [MONGODB RUNTIME EVENT]:", rawMsg);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("ℹ️ [MONGODB STATUS] Connection dropped or inactive. Falling back to in-memory store.");
});

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getMongoDbInfo() {
  return {
    connected: isMongoConnected(),
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || (isMongoConnected() ? "alikendshop" : "offline_in_memory"),
    host: mongoose.connection.host || "none",
    connectionError: lastConnectionError,
    maskedUri: lastMaskedUri,
  };
}

export async function connectMongoDB() {
  if (isConnecting) return;
  isConnecting = true;

  const defaultAtlasUri = "mongodb+srv://alikendshop_db_user:kowshiknoyon@cluster0.xqfwmyh.mongodb.net/alikendshop?retryWrites=true&w=majority";
  let rawUri = process.env.MONGO_URI;

  if (!rawUri || !rawUri.trim() || rawUri.includes("xxxxx") || rawUri.includes("<password>")) {
    rawUri = defaultAtlasUri;
  }

  const uri = rawUri.trim();
  lastMaskedUri = uri.replace(/\/\/[^:]+:([^@]+)@/, (m, p1) => m.replace(p1, "****"));

  try {
    mongoose.set("bufferCommands", false);
    
    console.log(`🔌 [MONGODB CONNECTING] Initiating connection to MongoDB: ${lastMaskedUri}... Target DB: 'alikendshop'`);

    await mongoose.connect(uri, {
      dbName: "alikendshop",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    });
    
    lastConnectionError = null;
    console.log(`✅ [MONGODB CONNECTED] Connected successfully! Database: "${mongoose.connection.name}", Host: ${mongoose.connection.host}`);

    // ADMIN MANAGEMENT & SEEDING in alikendshop.admins
    try {
      // 1. Ensure Superadmin (noyondey176@gmail.com) exists with role "superadmin"
      const existingSuper = await Admin.findOne({ email: "noyondey176@gmail.com" });
      if (!existingSuper) {
        if (INITIAL_ADMIN_SEED_HASH) {
          await Admin.create({
            email: "noyondey176@gmail.com",
            passwordHash: INITIAL_ADMIN_SEED_HASH,
            name: "Noyon Dey",
            role: "superadmin",
            isActive: true,
          });
          console.log("✨ [MONGODB SEED] Super Admin account created in alikendshop.admins: noyondey176@gmail.com");
        }
      } else {
        // Dynamic preservation: Never overwrite stored passwordHash in MongoDB
        if (existingSuper.role !== "superadmin" || !existingSuper.isActive) {
          existingSuper.role = "superadmin";
          existingSuper.isActive = true;
          await existingSuper.save();
        }
      }

      // 2. Ensure initial regular Admin (admin234@gmail.com) exists with role "admin"
      const existingStaff = await Admin.findOne({ email: "admin234@gmail.com" });
      if (!existingStaff) {
        if (INITIAL_ADMIN_SEED_HASH) {
          await Admin.create({
            email: "admin234@gmail.com",
            passwordHash: INITIAL_ADMIN_SEED_HASH,
            name: "Regular Staff Admin",
            role: "admin",
            isActive: true,
          });
          console.log("✨ [MONGODB SEED] Initial Regular Admin created in alikendshop.admins: admin234@gmail.com");
        }
      } else {
        // Dynamic preservation: Never overwrite stored passwordHash in MongoDB
        if (!existingStaff.isActive) {
          existingStaff.isActive = true;
          await existingStaff.save();
        }
      }

      // 3. Dynamic Admin Accounts: All admin accounts created in alikendshop.admins are permanently preserved

      // 4. Seed Products if empty or sync products
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        console.log("📦 [MONGODB SEED] Seeding full catalog items into alikendshop.products...");
        for (const p of INITIAL_PRODUCTS_SEED) {
          const { _id, ...pData } = p;
          await Product.create(pData);
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${INITIAL_PRODUCTS_SEED.length} products in alikendshop.products`);
      }

      const totalAdmins = await Admin.countDocuments();
      console.log(`🔒 [ADMIN AUDIT] Total admin accounts in 'alikendshop.admins': ${totalAdmins}`);

      // 5. Seed Hero Carousel Banners if empty in alikendshop.banners
      const bannerCount = await Banner.countDocuments();
      if (bannerCount === 0) {
        console.log("🎨 [MONGODB SEED] Seeding initial hero slides into alikendshop.banners...");
        for (const b of INITIAL_BANNERS_SEED) {
          await Banner.create(b);
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${INITIAL_BANNERS_SEED.length} banners in alikendshop.banners`);
      }

      // Seed Superadmin user in alikendshop.users
      const existingUserNoyon = await User.findOne({ email: "noyondey176@gmail.com" });
      if (!existingUserNoyon && INITIAL_ADMIN_SEED_HASH) {
        await User.create({
          fullName: "Noyon Dey",
          email: "noyondey176@gmail.com",
          country: "+880",
          mobileNumber: "1700000000",
          phone: "+880 1700000000",
          passwordHash: INITIAL_ADMIN_SEED_HASH,
          tier: "Platinum",
          verified: true,
        });
      }

      // 5. Ensure Platform Settings exist in alikendshop.platform_settings
      const existingSetting = await PlatformSetting.findOne({ key: "commission_settings" });
      if (!existingSetting) {
        await PlatformSetting.create({
          key: "commission_settings",
          commissionRate: 5,
          platformBalance: 0,
          totalCommissionEarned: 0,
          updatedBy: "superadmin",
        });
        console.log("💰 [MONGODB SEED] Platform Commission settings initialized with default 5% rate in alikendshop.platform_settings");
      }
    } catch (e: any) {
      console.warn("⚠️ [MONGODB SEED NOTICE]:", e?.message || e);
    }
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("IP that isn't whitelisted")) {
      lastConnectionError = "MongoDB Atlas requires IP Whitelist (0.0.0.0/0). Running in automatic in-memory sync mode.";
    } else {
      lastConnectionError = rawMsg;
    }
  } finally {
    isConnecting = false;
  }
}

// Background auto-reconnect interval (every 30 seconds if disconnected)
setInterval(() => {
  if (!isMongoConnected() && mongoose.connection.readyState !== 2 && !isConnecting) {
    connectMongoDB().catch(() => {});
  }
}, 30000);

