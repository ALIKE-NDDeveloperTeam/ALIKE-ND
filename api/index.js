// backend/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// backend/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";

// backend/models/Admin.ts
import mongoose, { Schema } from "mongoose";
var AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Super Admin" },
    role: { type: String, enum: ["superadmin", "admin"], default: "superadmin" },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: "admins"
  }
);
var Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema, "admins");
var Admin_default = Admin;

// backend/models/User.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var UserSchema = new Schema2(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    country: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    verified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: "users"
    // Explicitly ensure target collection is "users"
  }
);
var User = mongoose2.models.User || mongoose2.model("User", UserSchema, "users");
var User_default = User;

// backend/models/Order.ts
import mongoose3, { Schema as Schema3 } from "mongoose";
var OrderSchema = new Schema3(
  {
    orderNumber: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing"
    },
    items: [
      {
        productId: { type: Schema3.Types.Mixed },
        name: String,
        qty: Number,
        price: Number,
        image: String,
        color: String,
        size: String
      }
    ],
    address: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zip: String
    },
    paymentMethod: { type: String, default: "CARD" },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 },
    trackingStep: { type: Number, default: 2 },
    commissionRate: { type: Number, default: 5 },
    commissionAmount: { type: Number, default: 0 },
    sellerPayout: { type: Number, default: 0 },
    commissionStatus: { type: String, enum: ["credited", "pending"], default: "credited" },
    approvedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    walletCredited: { type: Boolean, default: false },
    manualOverride: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "orders" }
);
var Order_default = mongoose3.model("Order", OrderSchema);

// backend/models/Product.ts
import mongoose4, { Schema as Schema4 } from "mongoose";
var ProductSchema = new Schema4(
  {
    id: { type: Number },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Alike Sovereign" },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, default: "", trim: true },
    eligibleFor20MinDelivery: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    stock: { type: Number, required: true, min: 0, default: 10 },
    stockStatus: { type: String, default: "In Stock" },
    badge: { type: String, default: "" },
    isFlashSale: { type: Boolean, default: false },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    specifications: { type: Schema4.Types.Mixed, default: {} },
    isWholesale: { type: Boolean, default: false },
    wholesalePrice: { type: Number, default: 0 },
    wholesaleMinQty: { type: Number, default: 1 },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    emoji: { type: String, default: "\u{1F4E6}" },
    sellerId: { type: String, default: "admin", index: true },
    sellerShopName: { type: String, default: "ALIKE-ND Official" }
  },
  { timestamps: true, collection: "products" }
);
var Product_default = mongoose4.model("Product", ProductSchema);

// backend/models/Seller.ts
import mongoose5, { Schema as Schema5 } from "mongoose";
var SellerSchema = new Schema5(
  {
    shopName: { type: String, required: true, trim: true },
    storefront: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    businessAddress: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    listingsCount: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    pendingWithdrawals: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "review"],
      default: "pending"
    }
  },
  { timestamps: true, collection: "sellers" }
);
var Seller_default = mongoose5.model("Seller", SellerSchema);

// backend/models/SellerWithdrawal.ts
import mongoose6, { Schema as Schema6 } from "mongoose";
var SellerWithdrawalSchema = new Schema6(
  {
    sellerId: { type: Schema6.Types.Mixed, ref: "Seller", required: true, index: true },
    sellerEmail: { type: String, required: true, trim: true, lowercase: true },
    sellerShopName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    payoutDetails: { type: String, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    rejectionReason: { type: String, trim: true },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedByAdminEmail: { type: String, trim: true }
  },
  { timestamps: true, collection: "seller_withdrawals" }
);
var SellerWithdrawal_default = mongoose6.model("SellerWithdrawal", SellerWithdrawalSchema);

// backend/models/ActivityLog.ts
import mongoose7, { Schema as Schema7 } from "mongoose";
var ActivityLogSchema = new Schema7(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["Registration", "Login", "Failed Login"],
      index: true
    },
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    status: { type: String, required: true, enum: ["success", "failed"], default: "success" },
    ipAddress: { type: String, default: "127.0.0.1" },
    deviceInfo: { type: String, default: "Web Browser" },
    browser: { type: String },
    os: { type: String },
    details: { type: String }
  },
  {
    timestamps: true,
    collection: "activity_logs"
    // Explicitly ensure target collection is "activity_logs" in alikendshop
  }
);
ActivityLogSchema.index({ createdAt: -1 });
var ActivityLog = mongoose7.models.ActivityLog || mongoose7.model("ActivityLog", ActivityLogSchema, "activity_logs");
var ActivityLog_default = ActivityLog;

// backend/middleware/auth.ts
import jwt from "jsonwebtoken";

// backend/store.ts
import mongoose10 from "mongoose";
import bcrypt from "bcryptjs";

// backend/models/Banner.ts
import mongoose8, { Schema as Schema8 } from "mongoose";
var BannerSchema = new Schema8(
  {
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    buttonText: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true, collection: "banners" }
);
var Banner = mongoose8.models.Banner || mongoose8.model("Banner", BannerSchema, "banners");
var Banner_default = Banner;

// backend/models/PlatformSetting.ts
import mongoose9, { Schema as Schema9 } from "mongoose";
var PlatformSettingSchema = new Schema9(
  {
    key: { type: String, required: true, unique: true, default: "commission_settings" },
    commissionRate: { type: Number, default: 5, min: 0, max: 100 },
    platformBalance: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    updatedBy: { type: String, default: "superadmin" }
  },
  { timestamps: true, collection: "platform_settings" }
);
var PlatformSetting_default = mongoose9.model("PlatformSetting", PlatformSettingSchema);

// backend/store.ts
var INITIAL_ADMIN_SEED_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_SEED_PASSWORD || "";
var INITIAL_ADMIN_SEED_HASH = INITIAL_ADMIN_SEED_PASSWORD ? bcrypt.hashSync(INITIAL_ADMIN_SEED_PASSWORD, 10) : "";
var INITIAL_SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "developer.alikend@gmail.com";
var INITIAL_SUPERADMIN_NAME = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";
var INITIAL_STAFF_EMAIL = process.env.STAFF_ADMIN_EMAIL?.trim().toLowerCase() || "admin234@gmail.com";
var INITIAL_BANNERS_SEED = [
  {
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Smart Shopping Experience",
    subtitle: "DEMAND PERFECTION. THE NEW GOLD STANDARD.",
    description: "Plunge into our curated catalog of ultra-premium electronics, handcrafted jewellery, and high-net-worth designer apparel.",
    buttonText: "Shop Now",
    link: "category_search",
    order: 1,
    active: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Guaranteed Fast Delivery",
    subtitle: "EXPRESS URBAN LUXURY AT YOUR DOORSTEP",
    description: "Why wait for premium? Direct courier delivery to your sector with fast dispatch.",
    buttonText: "See Speed Deals",
    link: "category_search",
    order: 2,
    active: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "B2B Volume Wholesale Deals",
    subtitle: "DIRECT BULK IMPORTS FROM ATELIER LEADERS",
    description: "Secure Persian saffron lots, bulk fast-charger boxes, and designer satin wraps directly. Save up to 45% with our transparent tier grids.",
    buttonText: "Browse Wholesale",
    link: "category_search",
    order: 3,
    active: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Exclusive Sovereign Atelier",
    subtitle: "HAND-CRAFTED BESPOKE COUTURE",
    description: "Immerse yourself in our limited-edition autumn lookbook and royal designer wear.",
    buttonText: "Explore Atelier",
    link: "category_search",
    order: 4,
    active: true
  }
];
var INITIAL_PRODUCTS_SEED = [
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
    emoji: "\u231A",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F3A7}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F48D}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F4BB}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F457}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F4F1}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u2615",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_8",
    id: 8,
    name: "Wholesale Premium Organic Saffron Bulks (100g)",
    brand: "Persian Royal Wholesales",
    price: 14500,
    mrp: 25e3,
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
    emoji: "\u{1F33F}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F50C}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u2328\uFE0F",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u2728",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_12",
    id: 12,
    name: "Sleek Chrome Finish Professional Tool Kit (Fast Delivery)",
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
    emoji: "\u{1F527}",
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F6CB}\uFE0F",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_14",
    id: 14,
    name: "Alike Ultra-Premium Organic Caviar Shield (Fast Delivery)",
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
    emoji: "\u{1F363}",
    eligibleFor20MinDelivery: true,
    createdAt: /* @__PURE__ */ new Date()
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
    emoji: "\u{1F3AE}",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_16",
    id: 16,
    name: "Royal Gir Cow Organic A2 Pure Bilona Ghee (1L)",
    brand: "Vedic Organics",
    price: 1850,
    mrp: 2400,
    rating: 4.9,
    reviewsCount: 284,
    stock: 35,
    stockStatus: "20-Min Express",
    category: "grocery",
    subCategory: "Oil & Ghee",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=600"],
    description: "Authentic Vedic churned Gir cow A2 cultured bilona ghee in luxury glass jar. Freshly packed, rich aroma, and high nutritional purity.",
    specifications: { "Volume": "1000ml (1 Litre)", "Process": "Traditional Wooden Churned Bilona", "Certification": "FSSAI Organic Certified" },
    emoji: "\u{1F9C8}",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_17",
    id: 17,
    name: "Royal Dum Biryani Feast with Mirchi Ka Salan & Raita",
    brand: "Nawabi Dastarkhwan",
    price: 499,
    mrp: 699,
    rating: 4.9,
    reviewsCount: 420,
    stock: 20,
    stockStatus: "20-Min Express",
    category: "food_delivery",
    subCategory: "Biryani",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"],
    description: "Slow-cooked saffron-infused fragrant basmati rice layered with rich marinated spices, caramelized onions, and royal herbs. Dispatched piping hot with fast delivery.",
    specifications: { "Portion": "Serves 1-2 Persons", "Packaging": "Hot Insulated Luxury Box", "Delivery Speed": "Fast Delivery" },
    emoji: "\u{1F35B}",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_18",
    id: 18,
    name: "Artisanal Wood-Fired Truffle Margherita Pizza (12-inch)",
    brand: "Atelier Pizza Roma",
    price: 649,
    mrp: 899,
    rating: 4.8,
    reviewsCount: 195,
    stock: 15,
    stockStatus: "20-Min Express",
    category: "food_delivery",
    subCategory: "Pizza",
    eligibleFor20MinDelivery: true,
    badge: "SALE",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"],
    description: "Sourdough crust baked in oak-fired ovens at 450\xB0C. San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and Italian black truffle oil.",
    specifications: { "Size": "12 Inch Round", "Crust": "48-Hour Fermented Sourdough", "Cheese": "100% Buffalo Mozzarella" },
    emoji: "\u{1F355}",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    _id: "prod_19",
    id: 19,
    name: "Exotic California Jumbo Almonds & Walnuts Combo (1kg)",
    brand: "Alike Gourmet Harvest",
    price: 1399,
    mrp: 2199,
    rating: 4.8,
    reviewsCount: 160,
    stock: 40,
    stockStatus: "20-Min Express",
    category: "grocery",
    subCategory: "Dry Fruits & Nuts",
    eligibleFor20MinDelivery: true,
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600"],
    description: "Vacuum nitrogen sealed premium crunchy California almonds and light-halves Kashmiri walnuts. Rich in plant protein, antioxidants, and essential healthy fats.",
    specifications: { "Net Weight": "500g Almonds + 500g Walnuts", "Grade": "King Jumbo Selection", "Origin": "California / Kashmir" },
    emoji: "\u{1F95C}",
    createdAt: /* @__PURE__ */ new Date()
  }
];
var memoryStore = {
  // Master Superadmin AND Regular Staff Admin accounts
  admins: [
    {
      _id: "admin_super_1",
      email: INITIAL_SUPERADMIN_EMAIL,
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: INITIAL_SUPERADMIN_NAME,
      role: "superadmin",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    },
    {
      _id: "admin_staff_1",
      email: INITIAL_STAFF_EMAIL,
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: "Regular Staff Admin",
      role: "admin",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    }
  ],
  users: [
    {
      _id: "user_superadmin_init",
      fullName: INITIAL_SUPERADMIN_NAME,
      email: INITIAL_SUPERADMIN_EMAIL,
      country: "+880",
      mobileNumber: "1700000000",
      phone: "+880 1700000000",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Platinum",
      verified: true,
      createdAt: /* @__PURE__ */ new Date()
    }
  ],
  products: INITIAL_PRODUCTS_SEED.map((p) => ({
    ...p,
    sellerId: "admin",
    sellerShopName: "ALIKE-ND Official"
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
      createdAt: /* @__PURE__ */ new Date()
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
      createdAt: new Date(Date.now() - 864e5)
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
      createdAt: new Date(Date.now() - 1728e5)
    }
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
      createdAt: /* @__PURE__ */ new Date()
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
      createdAt: /* @__PURE__ */ new Date()
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
      createdAt: /* @__PURE__ */ new Date()
    }
  ],
  customers: [
    { _id: "cust_1", name: "Vikram Malhotra", email: "vikram@example.com", tier: "Platinum", ordersCount: 14, lifetimeSpend: 28400, createdAt: /* @__PURE__ */ new Date() },
    { _id: "cust_2", name: "Amara Okafor", email: "amara@example.com", tier: "Silver", ordersCount: 3, lifetimeSpend: 3120, createdAt: /* @__PURE__ */ new Date() },
    { _id: "cust_3", name: "Elena Rostova", email: "elena@example.com", tier: "Platinum", ordersCount: 22, lifetimeSpend: 47900, createdAt: /* @__PURE__ */ new Date() },
    { _id: "cust_4", name: "Julian Vance", email: "julian@example.com", tier: "Gold", ordersCount: 7, lifetimeSpend: 11800, createdAt: /* @__PURE__ */ new Date() }
  ],
  activityLogs: [
    {
      _id: "act_init_1",
      eventType: "Login",
      userName: INITIAL_SUPERADMIN_NAME,
      email: INITIAL_SUPERADMIN_EMAIL,
      status: "success",
      ipAddress: "157.240.199.35",
      deviceInfo: "Chrome 128 on macOS",
      browser: "Chrome",
      os: "macOS",
      details: "Super Admin Console authentication verified",
      createdAt: new Date(Date.now() - 1e3 * 60 * 12)
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
      createdAt: new Date(Date.now() - 1e3 * 60 * 45)
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
      createdAt: new Date(Date.now() - 1e3 * 60 * 120)
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
      createdAt: new Date(Date.now() - 1e3 * 60 * 240)
    }
  ],
  banners: INITIAL_BANNERS_SEED.map((b, i) => ({
    ...b,
    _id: `ban_seed_${i + 1}`,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  })),
  platformSettings: {
    commissionRate: 5,
    platformBalance: 393,
    totalCommissionEarned: 393,
    updatedAt: /* @__PURE__ */ new Date()
  },
  platformWithdrawals: [],
  sellerWithdrawals: [],
  otps: []
};
var lastConnectionError = null;
var lastMaskedUri = null;
var isConnecting = false;
var authFailed = false;
var cachedPromise = null;
mongoose10.connection.on("error", (err) => {
  const rawMsg = err?.message || String(err);
  if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("tlsv1 alert internal error")) {
    lastConnectionError = "MongoDB Atlas rejected the TLS handshake (SSL alert 80). Operating in automatic sync fallback mode.";
    console.log("\u2139\uFE0F [MONGODB ATLAS NOTICE] IP Whitelist needed in Atlas (0.0.0.0/0). In-memory fallback active.");
  } else if (rawMsg.toLowerCase().includes("auth failed") || rawMsg.toLowerCase().includes("authentication failed") || rawMsg.includes("bad auth")) {
    authFailed = true;
    lastConnectionError = "MongoDB Atlas authentication failed: invalid credentials in MONGO_URI. Operating in automatic in-memory mode.";
    console.log("\u2139\uFE0F [MONGODB ATLAS NOTICE] Database credentials authentication failed. Operating in automatic in-memory mode.");
  } else {
    lastConnectionError = rawMsg;
    console.log("\u2139\uFE0F [MONGODB NOTICE]:", rawMsg);
  }
});
mongoose10.connection.on("disconnected", () => {
  console.log("\u2139\uFE0F [MONGODB STATUS] Connection dropped or inactive. Falling back to in-memory store.");
});
function isMongoConnected() {
  return mongoose10.connection.readyState === 1;
}
function getMongoDbInfo() {
  return {
    connected: isMongoConnected(),
    readyState: mongoose10.connection.readyState,
    databaseName: mongoose10.connection.name || (isMongoConnected() ? "alikendshop" : "offline_in_memory"),
    host: mongoose10.connection.host || "none",
    connectionError: lastConnectionError,
    maskedUri: lastMaskedUri
  };
}
async function connectMongoDB(force = false) {
  if (isMongoConnected() && !force) {
    return mongoose10;
  }
  if (cachedPromise && !force) {
    return await cachedPromise;
  }
  if (authFailed && !force) {
    return null;
  }
  if (force) {
    authFailed = false;
    cachedPromise = null;
  }
  const rawUri = process.env.MONGO_URI;
  if (!rawUri || !rawUri.trim() || rawUri.includes("xxxxx") || rawUri.includes("<password>")) {
    lastConnectionError = "MongoDB URI not configured or contains placeholder credentials. Operating in automatic in-memory mode.";
    lastMaskedUri = rawUri ? rawUri.replace(/\/\/[^:]+:([^@]+)@/, (m, p1) => m.replace(p1, "****")) : "unconfigured";
    console.log("\u2139\uFE0F [MONGODB NOTICE] MONGO_URI not configured with live credentials. In-memory data store active.");
    return null;
  }
  const uri = rawUri.trim();
  lastMaskedUri = uri.replace(/\/\/[^:]+:([^@]+)@/, (m, p1) => m.replace(p1, "****"));
  cachedPromise = (async () => {
    isConnecting = true;
    const maxRetries = 1;
    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      try {
        mongoose10.set("bufferCommands", false);
        console.log(`\u{1F50C} [MONGODB CONNECTING] Attempt ${attempt}/${maxRetries + 1} to ${lastMaskedUri}... Target DB: 'alikendshop'`);
        await mongoose10.connect(uri, {
          dbName: "alikendshop",
          // 15s server selection: Gives serverless cold starts sufficient time for DNS/TLS/SDAM
          serverSelectionTimeoutMS: 15e3,
          // 15s initial TCP connect timeout
          connectTimeoutMS: 15e3,
          // 45s socket timeout: Prevents premature termination during slower queries
          socketTimeoutMS: 45e3,
          // Serverless connection pool: Low max to prevent Atlas M0/M2/M10 connection exhaustion across Lambdas
          maxPoolSize: 5,
          // minPoolSize: 0 ensures cold/frozen serverless containers do not hold open idle sockets
          minPoolSize: 0,
          // Drop idle sockets after 15 seconds to free Atlas resources
          maxIdleTimeMS: 15e3
        });
        lastConnectionError = null;
        console.log(`\u2705 [MONGODB CONNECTED] Connected successfully! Database: "${mongoose10.connection.name}", Host: ${mongoose10.connection.host}`);
        break;
      } catch (err) {
        const rawMsg = err?.message || String(err);
        const isAuthError = rawMsg.toLowerCase().includes("auth failed") || rawMsg.toLowerCase().includes("authentication failed") || rawMsg.includes("bad auth");
        const isTransient = rawMsg.includes("Server selection timed out") || rawMsg.includes("ETIMEDOUT") || rawMsg.includes("ECONNRESET") || rawMsg.includes("ENOTFOUND");
        if (isAuthError) {
          authFailed = true;
          lastConnectionError = "MongoDB Atlas authentication failed: invalid credentials in MONGO_URI. Operating in automatic in-memory mode.";
          console.log("\u2139\uFE0F [MONGODB ATLAS NOTICE] Database credentials authentication failed. In-memory fallback active.");
          throw err;
        }
        if (attempt <= maxRetries && isTransient) {
          console.warn(`\u26A0\uFE0F [MONGODB RETRY] Transient cold-start error on attempt ${attempt}: "${rawMsg}". Retrying in 1000ms...`);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          continue;
        }
        if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("IP that isn't whitelisted")) {
          lastConnectionError = "MongoDB Atlas requires IP Whitelist (0.0.0.0/0). Running in automatic in-memory sync mode.";
          console.log("\u2139\uFE0F [MONGODB ATLAS NOTICE] IP Whitelist needed in Atlas (0.0.0.0/0). In-memory fallback active.");
        } else {
          lastConnectionError = rawMsg;
          console.log("\u2139\uFE0F [MONGODB NOTICE]:", rawMsg);
        }
        throw err;
      }
    }
    return mongoose10;
  })().catch((err) => {
    cachedPromise = null;
    return null;
  }).finally(() => {
    isConnecting = false;
    if (!isMongoConnected()) {
      cachedPromise = null;
    }
  });
  const result = await cachedPromise;
  if (!result || !isMongoConnected()) {
    return null;
  }
  try {
    const existingSuper = await Admin_default.findOne({ email: INITIAL_SUPERADMIN_EMAIL });
    if (!existingSuper) {
      if (INITIAL_ADMIN_SEED_HASH) {
        await Admin_default.create({
          email: INITIAL_SUPERADMIN_EMAIL,
          passwordHash: INITIAL_ADMIN_SEED_HASH,
          name: INITIAL_SUPERADMIN_NAME,
          role: "superadmin",
          isActive: true
        });
        console.log(`\u2728 [MONGODB SEED] Super Admin account created in alikendshop.admins: ${INITIAL_SUPERADMIN_EMAIL}`);
      } else {
        console.warn("\u26A0\uFE0F No superadmin account exists and INITIAL_ADMIN_PASSWORD is not set \u2014 set this environment variable in Vercel and redeploy to create the initial superadmin account securely.");
      }
    } else {
      if ((!existingSuper.passwordHash || existingSuper.passwordHash === "") && INITIAL_ADMIN_SEED_HASH) {
        existingSuper.passwordHash = INITIAL_ADMIN_SEED_HASH;
      }
      if (existingSuper.role !== "superadmin" || !existingSuper.isActive) {
        existingSuper.role = "superadmin";
        existingSuper.isActive = true;
      }
      await existingSuper.save();
      if (existingSuper.passwordHash) {
        const memSuper = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === INITIAL_SUPERADMIN_EMAIL);
        if (memSuper) {
          memSuper.passwordHash = existingSuper.passwordHash;
        }
      }
    }
    const existingStaff = await Admin_default.findOne({ email: INITIAL_STAFF_EMAIL });
    if (!existingStaff) {
      if (INITIAL_ADMIN_SEED_HASH) {
        await Admin_default.create({
          email: INITIAL_STAFF_EMAIL,
          passwordHash: INITIAL_ADMIN_SEED_HASH,
          name: "Regular Staff Admin",
          role: "admin",
          isActive: true
        });
        console.log(`\u2728 [MONGODB SEED] Initial Regular Admin created in alikendshop.admins: ${INITIAL_STAFF_EMAIL}`);
      }
    } else {
      if ((!existingStaff.passwordHash || existingStaff.passwordHash === "") && INITIAL_ADMIN_SEED_HASH) {
        existingStaff.passwordHash = INITIAL_ADMIN_SEED_HASH;
      }
      if (!existingStaff.isActive) {
        existingStaff.isActive = true;
      }
      await existingStaff.save();
      if (existingStaff.passwordHash) {
        const memStaff = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === INITIAL_STAFF_EMAIL);
        if (memStaff) {
          memStaff.passwordHash = existingStaff.passwordHash;
        }
      }
    }
    const liveAdmins = await Admin_default.find().lean();
    for (const liveAdmin of liveAdmins) {
      if (liveAdmin.email && liveAdmin.passwordHash) {
        const cleanEmail = liveAdmin.email.toLowerCase().trim();
        const targetMem = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
        if (targetMem) {
          targetMem.passwordHash = liveAdmin.passwordHash;
        }
      }
    }
    const prodCount = await Product_default.countDocuments();
    if (prodCount === 0) {
      console.log("\u{1F4E6} [MONGODB SEED] Seeding full catalog items into alikendshop.products...");
      for (const p of INITIAL_PRODUCTS_SEED) {
        const { _id, ...pData } = p;
        await Product_default.create(pData);
      }
      console.log(`\u2728 [MONGODB SEED] Successfully seeded ${INITIAL_PRODUCTS_SEED.length} products in alikendshop.products`);
    }
    const totalAdmins = await Admin_default.countDocuments();
    console.log(`\u{1F512} [ADMIN AUDIT] Total admin accounts in 'alikendshop.admins': ${totalAdmins}`);
    const bannerCount = await Banner_default.countDocuments();
    if (bannerCount === 0) {
      console.log("\u{1F3A8} [MONGODB SEED] Seeding initial hero slides into alikendshop.banners...");
      for (const b of INITIAL_BANNERS_SEED) {
        await Banner_default.create(b);
      }
      console.log(`\u2728 [MONGODB SEED] Successfully seeded ${INITIAL_BANNERS_SEED.length} banners in alikendshop.banners`);
    }
    const existingUserNoyon = await User_default.findOne({ email: INITIAL_SUPERADMIN_EMAIL });
    if (!existingUserNoyon && INITIAL_ADMIN_SEED_HASH) {
      await User_default.create({
        fullName: INITIAL_SUPERADMIN_NAME,
        email: INITIAL_SUPERADMIN_EMAIL,
        country: "+880",
        mobileNumber: "1700000000",
        phone: "+880 1700000000",
        passwordHash: INITIAL_ADMIN_SEED_HASH,
        tier: "Platinum",
        verified: true
      });
    }
    const existingSetting = await PlatformSetting_default.findOne({ key: "commission_settings" });
    if (!existingSetting) {
      await PlatformSetting_default.create({
        key: "commission_settings",
        commissionRate: 5,
        platformBalance: 0,
        totalCommissionEarned: 0,
        updatedBy: "superadmin"
      });
      console.log("\u{1F4B0} [MONGODB SEED] Platform Commission settings initialized with default 5% rate in alikendshop.platform_settings");
    }
  } catch (e) {
    console.warn("\u26A0\uFE0F [MONGODB SEED NOTICE]:", e?.message || e);
  }
  return mongoose10;
}
setInterval(() => {
  if (!isMongoConnected() && mongoose10.connection.readyState !== 2 && !isConnecting && !authFailed) {
    connectMongoDB().catch(() => {
    });
  }
}, 3e4);

// backend/middleware/auth.ts
var JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. The server cannot start without it \u2014 set JWT_SECRET in Vercel Environment Variables (a long random string) and redeploy."
  );
}
function isSuperAdminRole(recordOrRole, emailFallback) {
  if (!recordOrRole) return false;
  let role;
  let email;
  if (typeof recordOrRole === "string") {
    role = recordOrRole;
    email = emailFallback;
  } else {
    role = recordOrRole.role;
    email = recordOrRole.email || emailFallback;
  }
  if (role === "superadmin") {
    return true;
  }
  const envSuperAdminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  if (envSuperAdminEmail && email) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === envSuperAdminEmail) {
      return true;
    }
  }
  return false;
}
function resolveAdminRole(recordOrRole, emailFallback) {
  return isSuperAdminRole(recordOrRole, emailFallback) ? "superadmin" : "admin";
}
async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required: Missing or invalid Authorization header."
    });
  }
  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired admin session token."
    });
  }
  if (!payload || !payload.adminId || payload.role === "customer" || payload.userId) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Admin privileges required. Regular customer accounts cannot access admin routes."
    });
  }
  if (isMongoConnected()) {
    try {
      const adminDoc = await Admin_default.findById(payload.adminId);
      if (adminDoc) {
        if (adminDoc.isActive === false) {
          return res.status(403).json({
            success: false,
            error: "Access denied: Admin account is inactive or suspended."
          });
        }
        const role = resolveAdminRole(adminDoc);
        req.adminId = String(adminDoc._id);
        req.admin = {
          _id: String(adminDoc._id),
          email: adminDoc.email,
          name: adminDoc.name,
          role,
          isActive: adminDoc.isActive
        };
        return next();
      }
    } catch (dbErr) {
      console.warn("MongoDB admin lookup error:", dbErr?.message);
    }
  }
  const memAdmin = (memoryStore.admins || []).find(
    (a) => a.email.toLowerCase() === (payload.email || "").toLowerCase() || a._id === payload.adminId
  );
  if (memAdmin) {
    if (memAdmin.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Admin account is inactive."
      });
    }
    const role = resolveAdminRole(memAdmin);
    req.adminId = memAdmin._id || "admin_mem";
    req.admin = {
      _id: memAdmin._id || "admin_mem",
      email: memAdmin.email,
      name: memAdmin.name,
      role,
      isActive: memAdmin.isActive
    };
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Access denied: Admin account not found."
  });
}
function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  if (!isSuperAdminRole(req.admin)) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Super Admin privilege required for this restricted action. Regular Admin accounts cannot perform this operation."
    });
  }
  return next();
}

// backend/utils/activityLogger.ts
function parseClientInfo(req) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = "127.0.0.1";
  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    ip = forwarded[0].trim();
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  } else if (req.ip) {
    ip = req.ip;
  }
  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";
  const ua = req.headers["user-agent"] || "Unknown Browser";
  let browser = "Chrome";
  let os = "Desktop";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";
  else if (ua.includes("curl") || ua.includes("Postman")) browser = "API Client";
  if (ua.includes("iPhone")) os = "iOS (iPhone)";
  else if (ua.includes("iPad")) os = "iOS (iPad)";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  const deviceInfo = `${browser} on ${os}`;
  return { ip, browser, os, deviceInfo, rawUserAgent: ua };
}
async function logActivity(params, req) {
  try {
    let ip = params.ipAddress;
    let browser = params.browser;
    let os = params.os;
    let deviceInfo = params.deviceInfo;
    if (req) {
      const parsed = parseClientInfo(req);
      if (!ip) ip = parsed.ip;
      if (!browser) browser = parsed.browser;
      if (!os) os = parsed.os;
      if (!deviceInfo) deviceInfo = parsed.deviceInfo;
    }
    const payload = {
      eventType: params.eventType,
      userName: params.userName || (params.email.includes("@") ? params.email.split("@")[0] : "User"),
      email: params.email.toLowerCase().trim(),
      status: params.status || (params.eventType === "Failed Login" ? "failed" : "success"),
      ipAddress: ip || "127.0.0.1",
      deviceInfo: deviceInfo || "Web Browser",
      browser: browser || "Web Browser",
      os: os || "Desktop",
      details: params.details || "",
      createdAt: /* @__PURE__ */ new Date()
    };
    console.log(`\u{1F4CB} [ACTIVITY LOG] Recording [${payload.eventType}] for ${payload.email} (${payload.status}) - IP: ${payload.ipAddress}, Device: ${payload.deviceInfo}`);
    if (!memoryStore.activityLogs) {
      memoryStore.activityLogs = [];
    }
    const memEntry = {
      _id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...payload
    };
    memoryStore.activityLogs.unshift(memEntry);
    if (memoryStore.activityLogs.length > 500) {
      memoryStore.activityLogs.pop();
    }
    if (isMongoConnected()) {
      try {
        const mongoLog = await ActivityLog_default.create(payload);
        console.log(`\u{1F4BE} [ACTIVITY LOG MONGODB] Persisted to MongoDB 'alikendshop.activity_logs' with ID: ${mongoLog._id}`);
        return mongoLog;
      } catch (dbErr) {
        console.warn("\u26A0\uFE0F [ACTIVITY LOG MONGODB WARNING] Could not write to MongoDB:", dbErr.message);
      }
    }
    return memEntry;
  } catch (err) {
    console.error("\u274C [ACTIVITY LOG ERROR]:", err);
    return null;
  }
}

// backend/routes/auth.ts
var router = Router();
function syncAdminPasswordToMemoryStore(email, newPasswordHash, extraData) {
  const cleanEmail = email.toLowerCase().trim();
  if (!memoryStore.admins) memoryStore.admins = [];
  const existingIndex = memoryStore.admins.findIndex(
    (a) => a.email.toLowerCase() === cleanEmail
  );
  if (existingIndex !== -1) {
    memoryStore.admins[existingIndex].passwordHash = newPasswordHash;
    if (extraData?.name) memoryStore.admins[existingIndex].name = extraData.name;
    if (extraData?.role) memoryStore.admins[existingIndex].role = extraData.role;
    if (extraData?.isActive !== void 0) memoryStore.admins[existingIndex].isActive = extraData.isActive;
  } else {
    memoryStore.admins.push({
      _id: `admin_${Date.now()}`,
      email: cleanEmail,
      name: extraData?.name || "Admin",
      role: extraData?.role || "admin",
      passwordHash: newPasswordHash,
      isActive: extraData?.isActive !== void 0 ? extraData.isActive : true,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
}
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    let adminRecord = null;
    let isFromMongo = false;
    if (isMongoConnected()) {
      try {
        adminRecord = await Admin_default.findOne({ email: cleanEmail });
        if (adminRecord) isFromMongo = true;
      } catch (err) {
        console.warn("MongoDB admin query fallback:", err);
      }
    }
    if (!adminRecord) {
      adminRecord = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
    }
    if (!adminRecord) {
      console.warn(`\u26D4 [ADMIN LOGIN REJECTED] Email not in admins collection: ${cleanEmail}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: "Unauthorized Admin Attempt",
          email: cleanEmail,
          details: `Admin authentication failed: No admin account found for ${cleanEmail}`
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Admin authentication failed: Invalid email or password."
      });
    }
    if (adminRecord.isActive === false) {
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: adminRecord.name || "Admin",
          email: adminRecord.email,
          details: "Admin login blocked: Account is deactivated"
        },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Admin account is suspended or inactive."
      });
    }
    const hasStoredHash = Boolean(adminRecord.passwordHash && String(adminRecord.passwordHash).trim() !== "");
    let isMatch = false;
    if (hasStoredHash) {
      try {
        isMatch = await bcrypt2.compare(password, adminRecord.passwordHash);
      } catch {
        isMatch = false;
      }
    } else {
      isMatch = true;
    }
    if (!isMatch) {
      if (!isFromMongo) {
        console.warn(`\u26A0\uFE0F [ADMIN LOGIN DEGRADED] Database offline & memoryStore password mismatch for: ${cleanEmail}`);
        return res.status(503).json({
          success: false,
          error: "Cannot verify admin credentials right now: database is temporarily unavailable, please try again in a moment."
        });
      }
      console.log(`\u2139\uFE0F [ADMIN LOGIN] Password verification failed for: ${cleanEmail}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: adminRecord.name || "Admin",
          email: adminRecord.email,
          details: "Admin login failed: Incorrect password provided"
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Incorrect password for admin account."
      });
    }
    if (!hasStoredHash) {
      try {
        const newHash = await bcrypt2.hash(password, 10);
        adminRecord.passwordHash = newHash;
        if (isFromMongo && adminRecord.save) {
          await adminRecord.save();
        }
        syncAdminPasswordToMemoryStore(cleanEmail, newHash, { role: adminRecord.role, isActive: adminRecord.isActive });
      } catch (_saveErr) {
      }
    }
    const role = resolveAdminRole(adminRecord.role, cleanEmail);
    const adminId = String(adminRecord._id || `admin_${Date.now()}`);
    const token = jwt2.sign(
      { adminId, email: adminRecord.email, name: adminRecord.name, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(`\u{1F6E1}\uFE0F [ADMIN AUTH SUCCESS] Logged in: ${adminRecord.email} [Role: ${role.toUpperCase()}]`);
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: adminRecord.name || (role === "superadmin" ? "Super Admin" : "Operations Admin"),
        email: adminRecord.email,
        details: `${role === "superadmin" ? "Super Admin Console" : "Regular Operations Admin Console"} authenticated successfully`
      },
      req
    );
    return res.json({
      success: true,
      token,
      admin: {
        _id: adminId,
        email: adminRecord.email,
        name: adminRecord.name,
        role
      },
      database: isFromMongo ? "alikendshop" : "in_memory",
      collection: "admins"
    });
  } catch (err) {
    console.error("\u{1F4A5} [ADMIN LOGIN ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Admin login failed" });
  }
});
router.post("/bridge-login", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.userToken;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : bodyToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Bridge login requires a valid existing session token. Email alone is not sufficient."
      });
    }
    let decoded;
    try {
      decoded = jwt2.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, error: "Invalid or expired session token." });
    }
    if (decoded && decoded.adminId) {
      return res.json({
        success: true,
        token,
        admin: {
          _id: decoded.adminId,
          email: decoded.email,
          name: decoded.name || "Admin",
          role: resolveAdminRole(decoded.role, decoded.email)
        }
      });
    }
    if (!decoded || !decoded.email) {
      return res.status(401).json({ success: false, error: "Token does not contain a verifiable identity." });
    }
    const email = String(decoded.email).toLowerCase().trim();
    if (isMongoConnected()) {
      const adminDoc = await Admin_default.findOne({ email });
      if (adminDoc && adminDoc.isActive !== false) {
        const role = resolveAdminRole(adminDoc.role, email);
        const adminToken = jwt2.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({
          success: true,
          token: adminToken,
          admin: { _id: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role }
        });
      }
    }
    const memAdmin = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === email);
    if (memAdmin && memAdmin.isActive !== false) {
      const role = resolveAdminRole(memAdmin.role, email);
      const adminToken = jwt2.sign(
        { adminId: memAdmin._id || `admin_${Date.now()}`, email: memAdmin.email, name: memAdmin.name, role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        success: true,
        token: adminToken,
        admin: { _id: memAdmin._id || `admin_${Date.now()}`, email: memAdmin.email, name: memAdmin.name, role }
      });
    }
    return res.status(403).json({
      success: false,
      error: "User is not registered as an administrator in alikendshop.admins"
    });
  } catch (err) {
    console.error("\u{1F4A5} [BRIDGE LOGIN ERROR]:", err);
    return res.status(500).json({ success: false, error: err.message || "Bridge login failed" });
  }
});
router.get("/me", requireAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    return res.json({
      valid: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});
router.get("/admin-users", requireAdmin, requireSuperAdmin, async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const admins = await Admin_default.find().sort({ createdAt: -1 }).select("-passwordHash");
        const validAdmins = admins.filter(
          (a) => a.email && a.email.trim() !== "" && a.name && a.name.trim() !== ""
        );
        return res.json(validAdmins);
      } catch (err) {
        console.warn("MongoDB fetch admins failed, falling back to memory:", err);
      }
    }
    const safeMemAdmins = (memoryStore.admins || []).filter((a) => a.email && a.email.trim() !== "" && a.name && a.name.trim() !== "").map((a) => ({
      _id: a._id || `admin_${a.email}`,
      email: a.email.trim(),
      name: a.name.trim(),
      role: resolveAdminRole(a),
      isActive: a.isActive !== false,
      createdAt: a.createdAt || /* @__PURE__ */ new Date()
    }));
    return res.json(safeMemAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch admin accounts" });
  }
});
router.post("/admin-users", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, name, role = "admin" } = req.body;
    const cleanEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";
    if (!cleanEmail || !cleanName || !cleanPassword) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required and cannot be empty or whitespace-only."
      });
    }
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        error: "Cannot create admin account right now: database is temporarily unavailable. Please try again in a moment."
      });
    }
    const existing = await Admin_default.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ success: false, error: "An admin account with this email already exists" });
    }
    const existingMem = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
    if (existingMem) {
      return res.status(409).json({ success: false, error: "An admin account with this email already exists" });
    }
    const passwordHash = await bcrypt2.hash(cleanPassword, 10);
    const assignedRole = role === "superadmin" ? "superadmin" : "admin";
    const created = await Admin_default.create({
      email: cleanEmail,
      passwordHash,
      name: cleanName,
      role: assignedRole,
      isActive: true
    });
    const createdId = String(created._id);
    memoryStore.admins.push({
      _id: createdId,
      email: cleanEmail,
      passwordHash,
      name: cleanName,
      role: assignedRole,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    });
    console.log(`\u2728 [ADMIN CREATED] New ${assignedRole} created: ${cleanEmail}`);
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Super Admin",
        email: req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system",
        details: `Created new ${assignedRole} account for ${cleanEmail} (${cleanName})`
      },
      req
    );
    return res.status(201).json({
      success: true,
      message: `Administrator ${cleanEmail} created successfully with role '${assignedRole}'`,
      admin: {
        _id: createdId,
        email: cleanEmail,
        name: cleanName,
        role: assignedRole,
        isActive: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create admin account" });
  }
});
router.delete("/admin-users/:id", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const target = await Admin_default.findById(id);
      if (target && isSuperAdminRole(target)) {
        return res.status(403).json({ success: false, error: "Master Super Admin account cannot be deleted" });
      }
      if (target) {
        await Admin_default.findByIdAndDelete(id);
      }
    }
    const index = memoryStore.admins.findIndex((a) => a._id === id || a.email === id);
    if (index !== -1) {
      if (isSuperAdminRole(memoryStore.admins[index])) {
        return res.status(403).json({ success: false, error: "Master Super Admin account cannot be deleted" });
      }
      memoryStore.admins.splice(index, 1);
    }
    return res.json({ success: true, message: "Admin account deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete admin" });
  }
});
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    if (isMongoConnected()) {
      const [totalUsers2, totalOrders2, totalProducts2, totalSellers2, ordersList] = await Promise.all([
        User_default.countDocuments(),
        Order_default.countDocuments(),
        Product_default.countDocuments(),
        Seller_default.countDocuments(),
        Order_default.find().lean()
      ]);
      const totalRevenue2 = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const pendingOrders = ordersList.filter((o) => o.status === "pending").length;
      const shippedOrders = ordersList.filter((o) => o.status === "shipped").length;
      const deliveredOrders = ordersList.filter((o) => o.status === "delivered").length;
      const cancelledOrders = ordersList.filter((o) => o.status === "cancelled").length;
      return res.json({
        totalUsers: totalUsers2,
        totalOrders: totalOrders2,
        totalRevenue: totalRevenue2,
        totalProducts: totalProducts2,
        totalSellers: totalSellers2,
        ordersBreakdown: {
          pending: pendingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        }
      });
    }
    const totalUsers = memoryStore.users.length;
    const totalOrders = memoryStore.orders.length;
    const totalProducts = memoryStore.products.length;
    const totalSellers = memoryStore.sellers.length;
    const totalRevenue = memoryStore.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      totalSellers,
      ordersBreakdown: {
        pending: memoryStore.orders.filter((o) => o.status === "pending").length,
        shipped: memoryStore.orders.filter((o) => o.status === "shipped").length,
        delivered: memoryStore.orders.filter((o) => o.status === "delivered").length,
        cancelled: memoryStore.orders.filter((o) => o.status === "cancelled").length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to calculate admin stats" });
  }
});
router.get("/reports", requireAdmin, requireSuperAdmin, async (_req, res) => {
  try {
    let ordersList = [];
    let usersList = [];
    if (isMongoConnected()) {
      ordersList = await Order_default.find().lean();
      usersList = await User_default.find().lean();
    } else {
      ordersList = memoryStore.orders;
      usersList = memoryStore.users;
    }
    const totalRevenue = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const averageOrderValue = ordersList.length ? Math.round(totalRevenue / ordersList.length) : 0;
    return res.json({
      success: true,
      totalRevenue,
      averageOrderValue,
      totalOrdersCount: ordersList.length,
      totalMembersCount: usersList.length,
      revenueByTier: {
        Platinum: Math.round(totalRevenue * 0.62),
        Gold: Math.round(totalRevenue * 0.26),
        Silver: Math.round(totalRevenue * 0.12)
      },
      monthlyTrend: [
        { month: "Jan", revenue: 145e3 },
        { month: "Feb", revenue: 182e3 },
        { month: "Mar", revenue: 21e4 },
        { month: "Apr", revenue: 245e3 },
        { month: "May", revenue: totalRevenue }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate sales report" });
  }
});
router.get("/activity-logs", requireAdmin, async (req, res) => {
  try {
    const { filter, search, limit } = req.query;
    const maxLimit = Math.min(Number(limit) || 200, 500);
    let eventTypeFilter = null;
    if (filter === "registration" || filter === "registrations") {
      eventTypeFilter = "Registration";
    } else if (filter === "login" || filter === "logins" || filter === "success_login") {
      eventTypeFilter = "Login";
    } else if (filter === "failed_login" || filter === "failed" || filter === "failed_logins") {
      eventTypeFilter = "Failed Login";
    }
    if (isMongoConnected()) {
      try {
        const query = {};
        if (eventTypeFilter) {
          query.eventType = eventTypeFilter;
        }
        if (search && typeof search === "string" && search.trim()) {
          const s = search.trim();
          query.$or = [
            { userName: { $regex: s, $options: "i" } },
            { email: { $regex: s, $options: "i" } },
            { ipAddress: { $regex: s, $options: "i" } },
            { deviceInfo: { $regex: s, $options: "i" } },
            { details: { $regex: s, $options: "i" } }
          ];
        }
        const logs = await ActivityLog_default.find(query).sort({ createdAt: -1 }).limit(maxLimit).lean();
        return res.json({
          success: true,
          count: logs.length,
          storage: "mongodb",
          database: "alikendshop",
          collection: "activity_logs",
          logs: logs.map((l) => ({
            ...l,
            _id: String(l._id)
          }))
        });
      } catch (dbErr) {
        console.warn("\u26A0\uFE0F [ACTIVITY LOGS QUERY ERROR] Falling back to memory store:", dbErr.message);
      }
    }
    let memLogs = [...memoryStore.activityLogs || []];
    if (eventTypeFilter) {
      memLogs = memLogs.filter((l) => l.eventType === eventTypeFilter);
    }
    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim().toLowerCase();
      memLogs = memLogs.filter(
        (l) => l.userName && l.userName.toLowerCase().includes(s) || l.email && l.email.toLowerCase().includes(s) || l.ipAddress && l.ipAddress.toLowerCase().includes(s) || l.deviceInfo && l.deviceInfo.toLowerCase().includes(s) || l.details && l.details.toLowerCase().includes(s)
      );
    }
    memLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    memLogs = memLogs.slice(0, maxLimit);
    return res.json({
      success: true,
      count: memLogs.length,
      storage: "in-memory-fallback",
      database: "alikendshop",
      collection: "activity_logs",
      logs: memLogs
    });
  } catch (err) {
    console.error("\u{1F4A5} [ACTIVITY LOGS ERROR]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve activity logs" });
  }
});
router.post("/activity-logs", async (req, res) => {
  try {
    const { eventType, userName, email, status, details, ipAddress, deviceInfo, browser, os } = req.body;
    if (!eventType || !email) {
      return res.status(400).json({ error: "eventType and email are required" });
    }
    const recorded = await logActivity(
      {
        eventType,
        userName: userName || email.split("@")[0],
        email,
        status: status || (eventType === "Failed Login" ? "failed" : "success"),
        details,
        ipAddress,
        deviceInfo,
        browser,
        os
      },
      req
    );
    return res.status(201).json({
      success: true,
      message: "Activity event recorded successfully",
      log: recorded
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Could not log activity" });
  }
});
router.delete("/activity-logs", requireAdmin, requireSuperAdmin, async (_req, res) => {
  try {
    memoryStore.activityLogs = [];
    if (isMongoConnected()) {
      await ActivityLog_default.deleteMany({});
    }
    return res.json({ success: true, message: "Activity logs cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
router.get("/seller-withdrawals", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && typeof status === "string") {
      const cleanStatus = status.toLowerCase().trim();
      if (["pending", "approved", "rejected"].includes(cleanStatus)) {
        filter.status = cleanStatus;
      }
    }
    let withdrawals = [];
    if (isMongoConnected()) {
      try {
        withdrawals = await SellerWithdrawal_default.find(filter).sort({ requestedAt: -1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB fetch seller withdrawals fallback:", err);
      }
    }
    if (!withdrawals || withdrawals.length === 0) {
      withdrawals = (memoryStore.sellerWithdrawals || []).filter((w) => {
        if (filter.status) return w.status === filter.status;
        return true;
      });
    }
    return res.json({
      success: true,
      count: withdrawals.length,
      withdrawals
    });
  } catch (err) {
    console.error("Admin fetch seller withdrawals error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch seller withdrawal requests"
    });
  }
});
router.patch("/seller-withdrawals/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminEmail = req.admin?.email || "admin@alikend.com";
    let withdrawal = null;
    if (isMongoConnected()) {
      try {
        const existing = await SellerWithdrawal_default.findById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: "Withdrawal request not found." });
        }
        if (existing.status !== "pending") {
          return res.status(409).json({
            success: false,
            error: `Withdrawal request has already been processed with status '${existing.status}'.`
          });
        }
        withdrawal = await SellerWithdrawal_default.findOneAndUpdate(
          { _id: id, status: "pending" },
          {
            status: "approved",
            processedAt: /* @__PURE__ */ new Date(),
            processedByAdminEmail: adminEmail
          },
          { new: true }
        );
        if (!withdrawal) {
          return res.status(409).json({
            success: false,
            error: "Withdrawal request was already processed by another administrator."
          });
        }
        await Seller_default.findByIdAndUpdate(withdrawal.sellerId, {
          $inc: { pendingWithdrawals: -withdrawal.amount }
        });
      } catch (err) {
        console.warn("MongoDB approve seller withdrawal error:", err);
      }
    }
    const memIndex = (memoryStore.sellerWithdrawals || []).findIndex(
      (w) => String(w._id) === String(id)
    );
    if (memIndex !== -1) {
      const memW = memoryStore.sellerWithdrawals[memIndex];
      if (!withdrawal && memW.status !== "pending") {
        return res.status(409).json({
          success: false,
          error: `Withdrawal request has already been processed with status '${memW.status}'.`
        });
      }
      memW.status = "approved";
      memW.processedAt = /* @__PURE__ */ new Date();
      memW.processedByAdminEmail = adminEmail;
      const memSeller = (memoryStore.sellers || []).find(
        (s) => String(s._id) === String(memW.sellerId)
      );
      if (memSeller) {
        memSeller.pendingWithdrawals = Math.max(0, (memSeller.pendingWithdrawals || 0) - memW.amount);
      }
      if (!withdrawal) withdrawal = memW;
    }
    if (!withdrawal) {
      return res.status(404).json({ success: false, error: "Withdrawal request not found." });
    }
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Admin",
        email: adminEmail,
        details: `Approved seller withdrawal of \u20B9${withdrawal.amount} for ${withdrawal.sellerShopName} (${withdrawal.sellerEmail})`
      },
      req
    ).catch(() => {
    });
    console.log(
      `\u2705 [SELLER WITHDRAWAL APPROVED] \u20B9${withdrawal.amount} for ${withdrawal.sellerShopName} by ${adminEmail}.`
    );
    return res.json({
      success: true,
      message: "Withdrawal request approved and marked as completed.",
      withdrawal
    });
  } catch (err) {
    console.error("Admin approve seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to approve seller withdrawal request"
    });
  }
});
router.patch("/seller-withdrawals/:id/reject", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, reason } = req.body;
    const adminEmail = req.admin?.email || "admin@alikend.com";
    const finalReason = String(rejectionReason || reason || "Declined by administrator").trim();
    let withdrawal = null;
    if (isMongoConnected()) {
      try {
        const existing = await SellerWithdrawal_default.findById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: "Withdrawal request not found." });
        }
        if (existing.status !== "pending") {
          return res.status(409).json({
            success: false,
            error: `Withdrawal request has already been processed with status '${existing.status}'.`
          });
        }
        withdrawal = await SellerWithdrawal_default.findOneAndUpdate(
          { _id: id, status: "pending" },
          {
            status: "rejected",
            rejectionReason: finalReason,
            processedAt: /* @__PURE__ */ new Date(),
            processedByAdminEmail: adminEmail
          },
          { new: true }
        );
        if (!withdrawal) {
          return res.status(409).json({
            success: false,
            error: "Withdrawal request was already processed by another administrator."
          });
        }
        await Seller_default.findByIdAndUpdate(withdrawal.sellerId, {
          $inc: {
            pendingWithdrawals: -withdrawal.amount,
            walletBalance: withdrawal.amount
          }
        });
      } catch (err) {
        console.warn("MongoDB reject seller withdrawal error:", err);
      }
    }
    const memIndex = (memoryStore.sellerWithdrawals || []).findIndex(
      (w) => String(w._id) === String(id)
    );
    if (memIndex !== -1) {
      const memW = memoryStore.sellerWithdrawals[memIndex];
      if (!withdrawal && memW.status !== "pending") {
        return res.status(409).json({
          success: false,
          error: `Withdrawal request has already been processed with status '${memW.status}'.`
        });
      }
      memW.status = "rejected";
      memW.rejectionReason = finalReason;
      memW.processedAt = /* @__PURE__ */ new Date();
      memW.processedByAdminEmail = adminEmail;
      const memSeller = (memoryStore.sellers || []).find(
        (s) => String(s._id) === String(memW.sellerId)
      );
      if (memSeller) {
        memSeller.pendingWithdrawals = Math.max(0, (memSeller.pendingWithdrawals || 0) - memW.amount);
        memSeller.walletBalance = (memSeller.walletBalance || 0) + memW.amount;
      }
      if (!withdrawal) withdrawal = memW;
    }
    if (!withdrawal) {
      return res.status(404).json({ success: false, error: "Withdrawal request not found." });
    }
    await logActivity(
      {
        eventType: "Login",
        status: "failed",
        userName: req.admin?.name || "Admin",
        email: adminEmail,
        details: `Rejected seller withdrawal of \u20B9${withdrawal.amount} for ${withdrawal.sellerShopName}. Reason: ${finalReason}`
      },
      req
    ).catch(() => {
    });
    console.log(
      `\u274C [SELLER WITHDRAWAL REJECTED] \u20B9${withdrawal.amount} refunded to ${withdrawal.sellerShopName} by ${adminEmail}. Reason: ${finalReason}`
    );
    return res.json({
      success: true,
      message: "Withdrawal request rejected. Funds have been refunded to seller wallet balance.",
      withdrawal
    });
  } catch (err) {
    console.error("Admin reject seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to reject seller withdrawal request"
    });
  }
});
var auth_default = router;

// backend/routes/userAuth.ts
import { Router as Router2 } from "express";
import bcrypt3 from "bcryptjs";
import jwt3 from "jsonwebtoken";

// backend/models/Customer.ts
import mongoose11, { Schema as Schema10 } from "mongoose";
var CustomerSchema = new Schema10(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    ordersCount: { type: Number, default: 0 },
    lifetimeSpend: { type: Number, default: 0 }
  },
  { timestamps: true }
);
var Customer_default = mongoose11.model("Customer", CustomerSchema);

// backend/models/OtpVerification.ts
import mongoose12, { Schema as Schema11 } from "mongoose";
var OtpVerificationSchema = new Schema11(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true, trim: true },
    purpose: {
      type: String,
      enum: ["registration", "verification", "forgot_password", "login"],
      default: "verification"
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
      // TTL index: automatically purges document at expiresAt
    }
  },
  {
    timestamps: true,
    collection: "otp_verifications"
  }
);
var OtpVerification = mongoose12.models.OtpVerification || mongoose12.model("OtpVerification", OtpVerificationSchema, "otp_verifications");
var OtpVerification_default = OtpVerification;

// backend/services/mailer.ts
import nodemailer from "nodemailer";
function getMailerTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // Direct SSL handshake is faster and more reliable than STARTTLS on 587
    auth: {
      user,
      pass
    },
    connectionTimeout: 8e3,
    // 8s connection timeout
    greetingTimeout: 5e3,
    // 5s greeting timeout
    socketTimeout: 1e4,
    // 10s socket timeout
    tls: {
      rejectUnauthorized: false
    }
  });
}
async function sendOtpEmail(toEmail, otpCode, purpose = "verification") {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  const startTimestamp = Date.now();
  const startTimeIso = new Date(startTimestamp).toISOString();
  console.log(`\u23F1\uFE0F [OTP GENERATED at ${startTimeIso}] Recipient: ${toEmail} | Purpose: ${purpose} | Code: [REDACTED]`);
  const purposeTitles = {
    registration: "Account Registration Verification",
    forgot_password: "Password Reset Authorization",
    login: "Two-Factor Authentication",
    verification: "Identity Verification"
  };
  const subjectTitle = purposeTitles[purpose] || "Verification Code";
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #0F1A3C; padding: 24px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">
          ALIKE<span style="color: #F5A623;">-ND</span>
        </h1>
        <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">
          Luxury Shopping Platform
        </p>
      </div>
      <div style="padding: 28px 24px; color: #1e293b;">
        <h2 style="font-size: 17px; font-weight: 700; color: #0F1A3C; margin-top: 0; margin-bottom: 12px;">
          ${subjectTitle}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
          Use the following 6-digit One-Time Password (OTP) to complete your verification. This code is strictly valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #F5A623; border-radius: 12px; padding: 14px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F1A3C; font-family: monospace;">
              ${otpCode}
            </span>
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 14px;">
          \u26A0\uFE0F <strong>Security Notice:</strong> Never share this OTP with anyone. Alike-ND representatives will never ask for your verification code.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          If you did not request this verification code, you can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">
          &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Alike-ND Ecommerce Platform. All rights reserved.
        </p>
      </div>
    </div>
  `;
  const textContent = `Your Alike-ND verification code is: ${otpCode}. It expires in 10 minutes. Do not share this code with anyone.`;
  if (!user || !pass) {
    console.warn("\u26A0\uFE0F [GMAIL SMTP WARNING] GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment.");
    console.warn(`\u{1F511} [DEV/TEST OTP] Verification code generated for ${toEmail} (Expires in 10 mins) [CODE REDACTED IN LOGS]`);
    return {
      sent: false,
      mode: "development_logged",
      code: otpCode,
      message: "GMAIL_USER and GMAIL_APP_PASSWORD not configured. OTP generated."
    };
  }
  try {
    const transport = getMailerTransporter();
    if (!transport) {
      throw new Error("Could not initialize Gmail SMTP transport");
    }
    const info = await transport.sendMail({
      from: `"Alike-ND Security" <${user}>`,
      replyTo: user,
      to: toEmail,
      subject: `Your Alike-ND OTP: ${otpCode} (${subjectTitle})`,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high"
      }
    });
    const elapsedMs = Date.now() - startTimestamp;
    const sentTimeIso = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2705 [GMAIL SMTP SENT at ${sentTimeIso} in ${elapsedMs}ms] Successfully sent email to ${toEmail}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      mode: "gmail_smtp",
      messageId: info.messageId,
      message: "OTP successfully dispatched via Gmail SMTP",
      elapsedMs,
      sentAt: sentTimeIso
    };
  } catch (err) {
    console.error("\u274C [GMAIL SMTP ERROR]:", err.message || err);
    console.warn(`\u{1F511} [FALLBACK LOG] Verification code generated for ${toEmail} [CODE REDACTED IN LOGS]`);
    return {
      sent: false,
      mode: "error_logged",
      code: otpCode,
      error: err.message || "Failed to send email via Gmail SMTP"
    };
  }
}

// backend/routes/userAuth.ts
var router2 = Router2();
router2.get("/status", async (_req, res) => {
  const dbInfo = getMongoDbInfo();
  let userCount = 0;
  if (isMongoConnected()) {
    try {
      userCount = await User_default.countDocuments();
    } catch (e) {
      console.warn("Could not query user count:", e.message);
    }
  } else {
    userCount = memoryStore.users.length;
  }
  return res.json({
    ...dbInfo,
    targetDatabase: "alikendshop",
    targetCollection: "users",
    totalUsersCount: userCount
  });
});
router2.post("/reconnect", async (_req, res) => {
  console.log("\u{1F504} [MONGODB RECONNECT] Received explicit reconnect request from client...");
  try {
    await connectMongoDB(true);
    const dbInfo = getMongoDbInfo();
    return res.json({
      success: dbInfo.connected,
      ...dbInfo
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || String(err)
    });
  }
});
router2.post("/otp/send", async (req, res) => {
  try {
    const { email, purpose = "verification" } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address format." });
    }
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    if (isMongoConnected()) {
      try {
        await OtpVerification_default.deleteMany({ email: cleanEmail, purpose });
        await OtpVerification_default.create({
          email: cleanEmail,
          otp: otpCode,
          purpose,
          expiresAt
        });
      } catch (dbErr) {
        console.warn("MongoDB OTP write warning:", dbErr.message);
      }
    }
    if (!memoryStore.otps) {
      memoryStore.otps = [];
    }
    memoryStore.otps = memoryStore.otps.filter(
      (o) => !(o.email === cleanEmail && o.purpose === purpose)
    );
    memoryStore.otps.push({
      email: cleanEmail,
      otp: otpCode,
      purpose,
      expiresAt,
      createdAt: /* @__PURE__ */ new Date()
    });
    const otpGenTime = (/* @__PURE__ */ new Date()).toISOString();
    sendOtpEmail(cleanEmail, otpCode, purpose).then((mRes) => {
      console.log(`\u2705 [BG OTP DISPATCH COMPLETE at ${(/* @__PURE__ */ new Date()).toISOString()}] To: ${cleanEmail} | Mode: ${mRes.mode}`);
    }).catch((err) => {
      console.error(`\u{1F4A5} [BG OTP DISPATCH FAILED] To: ${cleanEmail}:`, err.message || err);
    });
    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime
    });
  } catch (err) {
    console.error("\u{1F4A5} [OTP SEND ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch verification code." });
  }
});
router2.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp, purpose = "verification" } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const now = /* @__PURE__ */ new Date();
    let isMatch = false;
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification_default.findOne({
          email: cleanEmail,
          otp: cleanOtp,
          expiresAt: { $gt: now }
        });
        if (record) {
          isMatch = true;
          await OtpVerification_default.deleteOne({ _id: record._id });
        }
      } catch (dbErr) {
        console.warn("MongoDB OTP verify warning:", dbErr.message);
      }
    }
    if (!isMatch && memoryStore.otps) {
      const idx = memoryStore.otps.findIndex(
        (o) => o.email === cleanEmail && o.otp === cleanOtp && new Date(o.expiresAt) > now
      );
      if (idx >= 0) {
        isMatch = true;
        memoryStore.otps.splice(idx, 1);
      }
    }
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code. Please check the code or request a new one."
      });
    }
    return res.json({
      success: true,
      message: "Email verification successful.",
      email: cleanEmail
    });
  } catch (err) {
    console.error("\u{1F4A5} [OTP VERIFY ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify OTP code." });
  }
});
router2.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ error: "Please provide your registered email address." });
    }
    const cleanEmail = String(identifier).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: "Password reset is only available via email. Please provide a valid email address."
      });
    }
    let userEmail = null;
    let userName = "Valued Customer";
    if (isMongoConnected()) {
      try {
        const user = await User_default.findOne({ email: cleanEmail });
        if (user) {
          userEmail = user.email;
          userName = user.fullName || "Valued Customer";
        }
      } catch (e) {
        console.warn("Mongo find user for forgot-password warning:", e.message);
      }
    }
    if (!userEmail) {
      const memUser = (memoryStore.users || []).find(
        (u) => u.email && u.email.toLowerCase().trim() === cleanEmail
      );
      if (memUser) {
        userEmail = memUser.email;
        userName = memUser.fullName || "Valued Customer";
      }
    }
    if (!userEmail) {
      return res.status(404).json({
        error: "No account found with this email address, or this account was registered using a mobile number and does not support email-based password reset."
      });
    }
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    if (isMongoConnected()) {
      try {
        await OtpVerification_default.deleteMany({ email: userEmail, purpose: "forgot_password" });
        await OtpVerification_default.create({
          email: userEmail,
          otp: otpCode,
          purpose: "forgot_password",
          expiresAt
        });
      } catch (e) {
        console.warn("Mongo OTP create warning:", e.message);
      }
    }
    if (!memoryStore.otps) memoryStore.otps = [];
    memoryStore.otps = memoryStore.otps.filter(
      (o) => !(o.email === userEmail && o.purpose === "forgot_password")
    );
    memoryStore.otps.push({
      email: userEmail,
      otp: otpCode,
      purpose: "forgot_password",
      expiresAt,
      createdAt: /* @__PURE__ */ new Date()
    });
    const otpGenTime = (/* @__PURE__ */ new Date()).toISOString();
    sendOtpEmail(userEmail, otpCode, "forgot_password").then((mRes) => {
      console.log(`\u2705 [BG FORGOT-PW OTP DISPATCH COMPLETE at ${(/* @__PURE__ */ new Date()).toISOString()}] To: ${userEmail} | Mode: ${mRes.mode}`);
    }).catch((err) => {
      console.error(`\u{1F4A5} [BG FORGOT-PW OTP DISPATCH FAILED] To: ${userEmail}:`, err.message || err);
    });
    return res.json({
      success: true,
      message: `Verification code sent to ${userEmail}. Code valid for 10 minutes. Check your inbox and spam folder.`,
      email: userEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime
    });
  } catch (err) {
    console.error("\u{1F4A5} [FORGOT PASSWORD SEND OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to send reset code." });
  }
});
router2.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and 6-digit OTP code are required." });
    }
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const now = /* @__PURE__ */ new Date();
    let isMatch = false;
    let verifiedEmail = cleanId;
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification_default.findOne({
          $or: [{ email: cleanId }, { otp: cleanOtp }],
          otp: cleanOtp,
          purpose: "forgot_password",
          expiresAt: { $gt: now }
        });
        if (record) {
          isMatch = true;
          verifiedEmail = record.email;
        }
      } catch (e) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }
    if (!isMatch && memoryStore.otps) {
      const found = memoryStore.otps.find(
        (o) => (o.email === cleanId || o.otp === cleanOtp) && o.otp === cleanOtp && o.purpose === "forgot_password" && new Date(o.expiresAt) > now
      );
      if (found) {
        isMatch = true;
        verifiedEmail = found.email;
      }
    }
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP code. Please enter the correct 6-digit code or request a new one."
      });
    }
    return res.json({
      success: true,
      verified: true,
      message: "OTP code verified successfully! You may now enter your new password.",
      email: verifiedEmail
    });
  } catch (err) {
    console.error("\u{1F4A5} [FORGOT PASSWORD VERIFY OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify reset code." });
  }
});
router2.post("/forgot-password/reset", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: "Identifier, OTP code, and new password are required." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const now = /* @__PURE__ */ new Date();
    let isMatch = false;
    let verifiedEmail = cleanId;
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification_default.findOne({
          $or: [{ email: cleanId }, { otp: cleanOtp }],
          otp: cleanOtp,
          purpose: "forgot_password",
          expiresAt: { $gt: now }
        });
        if (record) {
          isMatch = true;
          verifiedEmail = record.email;
          await OtpVerification_default.deleteOne({ _id: record._id });
        }
      } catch (e) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }
    if (!isMatch && memoryStore.otps) {
      const idx = memoryStore.otps.findIndex(
        (o) => (o.email === cleanId || o.otp === cleanOtp) && o.otp === cleanOtp && o.purpose === "forgot_password" && new Date(o.expiresAt) > now
      );
      if (idx >= 0) {
        isMatch = true;
        verifiedEmail = memoryStore.otps[idx].email;
        memoryStore.otps.splice(idx, 1);
      }
    }
    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid or expired OTP code. Please request a new verification code."
      });
    }
    const newHash = await bcrypt3.hash(newPassword, 10);
    if (isMongoConnected()) {
      try {
        await User_default.updateOne(
          {
            $or: [
              { email: verifiedEmail },
              { email: cleanId },
              { mobileNumber: cleanId },
              { phone: cleanId }
            ]
          },
          { $set: { passwordHash: newHash } }
        );
      } catch (e) {
        console.warn("Mongo update password error:", e.message);
      }
    }
    const memIdx = memoryStore.users.findIndex(
      (u) => u.email === verifiedEmail || u.email === cleanId || u.mobileNumber === cleanId || u.phone === cleanId
    );
    if (memIdx >= 0) {
      memoryStore.users[memIdx].passwordHash = newHash;
    }
    const targetAdminEmails = [verifiedEmail.toLowerCase().trim(), cleanId.toLowerCase().trim()];
    if (isMongoConnected()) {
      try {
        await Admin_default.updateMany(
          { email: { $in: targetAdminEmails } },
          { $set: { passwordHash: newHash } }
        );
      } catch (adminDbErr) {
        console.warn("Mongo update admin password error:", adminDbErr.message);
      }
    }
    for (const em of targetAdminEmails) {
      syncAdminPasswordToMemoryStore(em, newHash);
    }
    return res.json({
      success: true,
      message: "Password reset successful! You may now sign in with your new password."
    });
  } catch (err) {
    console.error("\u{1F4A5} [FORGOT PASSWORD RESET ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to reset password." });
  }
});
router2.post("/register", async (req, res) => {
  console.log("==================================================");
  console.log("\u{1F4DD} [REGISTRATION INCOMING REQUEST]");
  console.log("Time:", (/* @__PURE__ */ new Date()).toISOString());
  console.log("Payload:", {
    fullName: req.body?.fullName,
    email: req.body?.email,
    country: req.body?.country,
    mobileNumber: req.body?.mobileNumber,
    hasPassword: !!req.body?.password
  });
  try {
    const { fullName, email, country, mobileNumber, password, registrationMethod } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const cleanMobile = String(mobileNumber || "").trim();
    let cleanEmail = email ? String(email).toLowerCase().trim() : "";
    if (!cleanEmail && !cleanMobile) {
      return res.status(400).json({
        error: "Please provide either a mobile number or a Gmail/email address."
      });
    }
    if (!cleanEmail && cleanMobile) {
      const digits = cleanMobile.replace(/\D/g, "");
      cleanEmail = `${digits || Date.now()}@customer.alike.com`;
    }
    const cleanCountry = String(country || "Bangladesh").trim();
    const cleanName = String(fullName || cleanEmail.split("@")[0] || cleanMobile).trim();
    const phone = cleanMobile ? `${cleanCountry} ${cleanMobile}` : "";
    console.log(`\u{1F50D} [REGISTRATION CHECK] Checking if user exists (email: ${cleanEmail}, mobile: ${cleanMobile})...`);
    if (isMongoConnected()) {
      try {
        const query = [{ email: cleanEmail }];
        if (cleanMobile) {
          query.push({ mobileNumber: cleanMobile });
          query.push({ phone: { $regex: cleanMobile.slice(-8) } });
        }
        const existingMongoUser = await User_default.findOne({ $or: query });
        if (existingMongoUser) {
          const isPhoneConflict = cleanMobile && existingMongoUser.mobileNumber === cleanMobile;
          const msg = isPhoneConflict ? "An account with this mobile number already exists." : "An account with this email address already exists.";
          console.warn(`\u26A0\uFE0F [REGISTRATION REJECTED] ${msg}`);
          await logActivity(
            {
              eventType: "Registration",
              status: "failed",
              userName: cleanName,
              email: cleanEmail,
              details: `Registration rejected: ${msg}`
            },
            req
          );
          return res.status(400).json({ error: msg });
        }
        const passwordHash2 = await bcrypt3.hash(password, 10);
        console.log(`\u{1F4BE} [REGISTRATION MONGODB] Saving document to database 'alikendshop', collection 'users'...`);
        const newUser = await User_default.create({
          fullName: cleanName,
          email: cleanEmail,
          country: cleanCountry,
          mobileNumber: cleanMobile,
          phone,
          passwordHash: passwordHash2,
          tier: "Silver",
          verified: true
        });
        console.log(`\u2705 [REGISTRATION MONGODB SUCCESS] User document created successfully! ID: ${newUser._id}`);
        try {
          const existingCustomer = await Customer_default.findOne({ email: cleanEmail });
          if (!existingCustomer) {
            await Customer_default.create({
              name: cleanName,
              email: cleanEmail,
              tier: "Silver",
              ordersCount: 0,
              lifetimeSpend: 0
            });
            console.log(`\u2728 [SYNC CUSTOMER] Added to customer roster for admin panel: ${cleanEmail}`);
          }
        } catch (cErr) {
          console.warn("Customer sync notice:", cErr?.message);
        }
        await logActivity(
          {
            eventType: "Registration",
            status: "success",
            userName: newUser.fullName,
            email: newUser.email,
            details: "New account registered successfully in alikendshop.users"
          },
          req
        );
        const token2 = jwt3.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "30d" });
        return res.status(201).json({
          success: true,
          message: "Registration successful and saved to MongoDB alikendshop.users",
          user: {
            _id: newUser._id,
            name: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone || `${newUser.country} ${newUser.mobileNumber}`,
            country: newUser.country,
            mobileNumber: newUser.mobileNumber,
            tier: newUser.tier
          },
          token: token2,
          storage: "mongodb",
          database: "alikendshop",
          collection: "users"
        });
      } catch (dbError) {
        console.error("\u274C [REGISTRATION MONGODB ERROR]:", dbError);
      }
    } else {
      console.warn("\u26A0\uFE0F [REGISTRATION NOTICE] MongoDB is not connected. MONGO_URI may be missing or invalid. Falling back to in-memory store.");
    }
    const existingMemUser = memoryStore.users.find((u) => u.email === cleanEmail);
    if (existingMemUser) {
      console.warn(`\u26A0\uFE0F [REGISTRATION REJECTED] Email ${cleanEmail} already exists in memory store.`);
      await logActivity(
        {
          eventType: "Registration",
          status: "failed",
          userName: cleanName,
          email: cleanEmail,
          details: "Registration rejected: Email already exists in memory store"
        },
        req
      );
      return res.status(400).json({ error: "An account with this email address already exists." });
    }
    const passwordHash = await bcrypt3.hash(password, 10);
    const newMemUser = {
      _id: `user_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      country: cleanCountry,
      mobileNumber: cleanMobile,
      phone,
      passwordHash,
      tier: "Silver",
      verified: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.users.push(newMemUser);
    const existingMemCust = memoryStore.customers.find((c) => c.email === cleanEmail);
    if (!existingMemCust) {
      memoryStore.customers.push({
        _id: `cust_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        tier: "Silver",
        ordersCount: 0,
        lifetimeSpend: 0,
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    console.log(`\u2139\uFE0F [REGISTRATION MEMORY SUCCESS] Saved to in-memory store. Total in-memory users: ${memoryStore.users.length}`);
    await logActivity(
      {
        eventType: "Registration",
        status: "success",
        userName: newMemUser.fullName,
        email: newMemUser.email,
        details: "New account registered (in-memory mode)"
      },
      req
    );
    const token = jwt3.sign({ userId: newMemUser._id, email: newMemUser.email }, JWT_SECRET, { expiresIn: "30d" });
    return res.status(201).json({
      success: true,
      message: "Registration completed (in-memory mode, MongoDB currently offline)",
      user: {
        _id: newMemUser._id,
        name: newMemUser.fullName,
        email: newMemUser.email,
        phone: newMemUser.phone,
        country: newMemUser.country,
        mobileNumber: newMemUser.mobileNumber,
        tier: newMemUser.tier
      },
      token,
      storage: "in-memory-fallback",
      database: "alikendshop",
      collection: "users"
    });
  } catch (err) {
    console.error("\u{1F4A5} [REGISTRATION FATAL ERROR]:", err);
    return res.status(500).json({
      error: err.message || "Registration encountered an internal server error"
    });
  }
});
router2.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Phone and password are required" });
    }
    const cleanId = String(identifier).toLowerCase().trim();
    if (!isMongoConnected()) {
      return res.status(503).json({
        error: "Database is currently connecting. Please try again in a moment."
      });
    }
    const user = await User_default.findOne({
      $or: [
        { email: cleanId },
        { mobileNumber: identifier },
        { phone: identifier }
      ]
    });
    if (!user) {
      console.warn(`\u26A0\uFE0F [LOGIN REJECTED] No MongoDB user document found for identifier: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: "Unregistered User",
          email: cleanId,
          details: "Login failed: No account found in alikendshop.users"
        },
        req
      );
      return res.status(404).json({
        success: false,
        error: "No account found, please register first."
      });
    }
    if (user.isBlocked) {
      console.warn(`\u26D4 [LOGIN BLOCKED] Blocked account attempted login: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: user.fullName,
          email: user.email,
          details: "Login blocked: Account has been suspended by administrator"
        },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended or blocked by an administrator. Please contact support."
      });
    }
    const isPasswordValid = await bcrypt3.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.warn(`\u26A0\uFE0F [LOGIN REJECTED] Incorrect password for MongoDB user: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: user.fullName,
          email: user.email,
          details: "Login failed: Incorrect password provided"
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Incorrect password. Please verify your credentials and try again."
      });
    }
    console.log(`\u2705 [LOGIN SUCCESS] User authenticated in MongoDB alikendshop.users: ${user.email} (ID: ${user._id})`);
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: user.fullName,
        email: user.email,
        details: "Password authentication verified in alikendshop.users"
      },
      req
    );
    const token = jwt3.sign({ userId: user._id, email: user.email, role: "customer" }, JWT_SECRET, { expiresIn: "30d" });
    let adminToken = null;
    let isAdmin = false;
    let adminRole = "superadmin";
    try {
      const adminDoc = await Admin_default.findOne({ email: user.email.toLowerCase().trim() });
      if (adminDoc && adminDoc.isActive !== false) {
        isAdmin = true;
        adminRole = adminDoc.role || "superadmin";
        adminToken = jwt3.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        console.log(`\u{1F451} [ADMIN PRIVILEGE DETECTED] Auto-minted admin token on login for: ${user.email}`);
      }
    } catch (e) {
      console.warn("Admin check warning:", e);
    }
    let isSeller = false;
    let sellerStatus = null;
    let sellerShopName = null;
    try {
      const sellerDoc = await Seller_default.findOne({ email: user.email.toLowerCase().trim() });
      if (sellerDoc) {
        sellerStatus = sellerDoc.status;
        isSeller = sellerDoc.status === "approved";
        sellerShopName = sellerDoc.shopName;
      } else {
        const memSeller = (memoryStore.sellers || []).find((s) => s.email?.toLowerCase() === user.email.toLowerCase().trim());
        if (memSeller) {
          sellerStatus = memSeller.status;
          isSeller = memSeller.status === "approved";
          sellerShopName = memSeller.shopName || null;
        }
      }
    } catch (sErr) {
      console.warn("Seller status lookup warning:", sErr);
    }
    return res.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.fullName,
        email: user.email,
        phone: user.phone || `${user.country} ${user.mobileNumber}`,
        country: user.country,
        mobileNumber: user.mobileNumber,
        tier: user.tier
      },
      token,
      isAdmin,
      adminRole,
      adminToken,
      isSeller,
      sellerStatus,
      sellerShopName,
      database: "alikendshop",
      collection: "users"
    });
  } catch (err) {
    console.error("\u{1F4A5} [LOGIN ERROR]:", err);
    res.status(500).json({ error: err.message || "Login failed due to an internal server error" });
  }
});
router2.post("/google", async (req, res) => {
  try {
    const { email, googleId, name, autoRegister } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required for Google authentication" });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name || cleanEmail.split("@")[0] || "Google Member").trim();
    console.log(`\u{1F50D} [GOOGLE AUTH] Verifying user account for: ${cleanEmail} (googleId: ${googleId || "none"})`);
    let existingUser = null;
    if (isMongoConnected()) {
      try {
        existingUser = await User_default.findOne({
          $or: [
            { email: cleanEmail },
            { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
          ]
        });
      } catch (dbErr) {
        console.warn("MongoDB Google lookup error:", dbErr?.message);
      }
    }
    if (!existingUser) {
      existingUser = (memoryStore.users || []).find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );
    }
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({
          success: false,
          error: "Your account has been suspended or blocked by an administrator. Please contact support."
        });
      }
      const token = jwt3.sign(
        { userId: String(existingUser._id), email: existingUser.email, role: "customer" },
        JWT_SECRET,
        { expiresIn: "30d" }
      );
      let adminToken = null;
      try {
        const adminDoc = await Admin_default.findOne({ email: cleanEmail });
        if (adminDoc && adminDoc.isActive !== false) {
          const adminRole = resolveAdminRole(adminDoc.role, cleanEmail);
          adminToken = jwt3.sign(
            { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
        }
      } catch (_e) {
      }
      await logActivity(
        {
          eventType: "Login",
          status: "success",
          userName: existingUser.fullName || cleanName,
          email: existingUser.email,
          details: "Google authentication verified in alikendshop.users"
        },
        req
      );
      return res.json({
        success: true,
        isExisting: true,
        isNew: false,
        token,
        adminToken,
        user: {
          _id: String(existingUser._id),
          name: existingUser.fullName || cleanName,
          email: existingUser.email,
          phone: existingUser.phone || existingUser.mobileNumber || "",
          tier: existingUser.tier || "Silver",
          country: existingUser.country || "Bangladesh"
        }
      });
    }
    if (autoRegister) {
      const randomPassword = `G_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const passwordHash = await bcrypt3.hash(randomPassword, 10);
      let newUser = null;
      if (isMongoConnected()) {
        try {
          const userDoc = new User_default({
            fullName: cleanName,
            email: cleanEmail,
            country: "Bangladesh",
            mobileNumber: "",
            phone: "",
            passwordHash,
            tier: "Silver",
            verified: true,
            isBlocked: false
          });
          await userDoc.save();
          newUser = userDoc;
        } catch (saveErr) {
          console.warn("MongoDB auto-register save error:", saveErr?.message);
        }
      }
      if (!newUser) {
        newUser = {
          _id: `user_g_${Date.now()}`,
          fullName: cleanName,
          email: cleanEmail,
          country: "Bangladesh",
          mobileNumber: "",
          phone: "",
          passwordHash,
          tier: "Silver",
          verified: true,
          isBlocked: false,
          createdAt: /* @__PURE__ */ new Date()
        };
        memoryStore.users.push(newUser);
      }
      const token = jwt3.sign(
        { userId: String(newUser._id), email: newUser.email, role: "customer" },
        JWT_SECRET,
        { expiresIn: "30d" }
      );
      await logActivity(
        {
          eventType: "Registration",
          status: "success",
          userName: newUser.fullName,
          email: newUser.email,
          details: "New user registered via Google OAuth in alikendshop.users"
        },
        req
      );
      return res.json({
        success: true,
        isExisting: false,
        isNew: true,
        token,
        user: {
          _id: String(newUser._id),
          name: newUser.fullName,
          email: newUser.email,
          phone: "",
          tier: "Silver",
          country: "Bangladesh"
        }
      });
    }
    return res.json({
      success: true,
      isExisting: false,
      isNew: true,
      message: "No account found in alikendshop.users. Registration required."
    });
  } catch (err) {
    console.error("\u{1F4A5} [GOOGLE AUTH ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Google authentication failed" });
  }
});
router2.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt3.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }
    if (!isMongoConnected()) {
      return res.status(503).json({ valid: false, error: "Database offline" });
    }
    const user = await User_default.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ valid: false, error: "User document no longer exists in database" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ valid: false, error: "Account has been suspended by an administrator." });
    }
    let adminToken = null;
    let isAdmin = false;
    try {
      const adminDoc = await Admin_default.findOne({ email: user.email.toLowerCase().trim() });
      if (adminDoc && adminDoc.isActive !== false) {
        isAdmin = true;
        adminToken = jwt3.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminDoc.role || "superadmin" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
      }
    } catch (e) {
    }
    let isSeller = false;
    let sellerStatus = null;
    let sellerShopName = null;
    try {
      const sellerDoc = await Seller_default.findOne({ email: user.email.toLowerCase().trim() });
      if (sellerDoc) {
        sellerStatus = sellerDoc.status;
        isSeller = sellerDoc.status === "approved";
        sellerShopName = sellerDoc.shopName;
      } else {
        const memSeller = (memoryStore.sellers || []).find((s) => s.email?.toLowerCase() === user.email.toLowerCase().trim());
        if (memSeller) {
          sellerStatus = memSeller.status;
          isSeller = memSeller.status === "approved";
          sellerShopName = memSeller.shopName || null;
        }
      }
    } catch (sErr) {
    }
    return res.json({
      valid: true,
      user: {
        _id: String(user._id),
        name: user.fullName,
        email: user.email,
        phone: user.phone || `${user.country} ${user.mobileNumber}`,
        country: user.country,
        mobileNumber: user.mobileNumber,
        tier: user.tier
      },
      isAdmin,
      adminToken,
      isSeller,
      sellerStatus,
      sellerShopName
    });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});
var userAuth_default = router2;

// backend/routes/products.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(requireAdmin);
router3.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const products = await Product_default.find().sort({ createdAt: -1 });
        if (products && products.length > 0) {
          const sanitized = products.map((p) => {
            const doc = p.toObject();
            return {
              ...doc,
              sellerId: doc.sellerId || "admin",
              sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : doc.brand || "Atelier")
            };
          });
          return res.json(sanitized);
        }
      } catch (err) {
        console.warn("MongoDB fetch products failed, using in-memory store:", err);
      }
    }
    const sanitizedMem = memoryStore.products.map((p) => ({
      ...p,
      sellerId: p.sellerId || "admin",
      sellerShopName: p.sellerShopName || "ALIKE-ND Official"
    }));
    return res.json(sanitizedMem);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});
router3.post("/", async (req, res) => {
  try {
    const {
      name,
      brand = "Alike Sovereign",
      category,
      subCategory = "",
      eligibleFor20MinDelivery,
      price,
      mrp,
      rating = 4.8,
      reviewsCount = 120,
      stock = 10,
      stockStatus = "In Stock",
      badge = "",
      isFlashSale = false,
      image = "",
      images = [],
      description = "",
      specifications = {},
      isWholesale = false,
      wholesalePrice = 0,
      wholesaleMinQty = 1,
      colors = [],
      sizes = [],
      emoji = "\u{1F4E6}",
      sellerId = "admin",
      sellerShopName = "ALIKE-ND Official"
    } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "Product name and category are required" });
    }
    const numericPrice = Number(price) || 0;
    const numericMrp = mrp !== void 0 && mrp !== null ? Number(mrp) : numericPrice;
    const numericStock = Number(stock) || 0;
    const is20Min = eligibleFor20MinDelivery !== void 0 ? Boolean(eligibleFor20MinDelivery) : category.trim() === "grocery" || category.trim() === "food_delivery" || category.trim() === "delivery";
    let createdProduct = null;
    if (isMongoConnected()) {
      try {
        createdProduct = await Product_default.create({
          name: name.trim(),
          brand: brand.trim(),
          category: category.trim(),
          subCategory: String(subCategory || "").trim(),
          eligibleFor20MinDelivery: is20Min,
          price: numericPrice,
          mrp: numericMrp,
          rating: Number(rating) || 4.8,
          reviewsCount: Number(reviewsCount) || 120,
          stock: numericStock,
          stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
          badge,
          isFlashSale: Boolean(isFlashSale),
          image: image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
          images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600"],
          description,
          specifications,
          isWholesale: Boolean(isWholesale),
          wholesalePrice: Number(wholesalePrice) || 0,
          wholesaleMinQty: Number(wholesaleMinQty) || 1,
          colors,
          sizes,
          emoji: emoji || "\u{1F4E6}",
          sellerId: sellerId || "admin",
          sellerShopName: sellerShopName || "ALIKE-ND Official"
        });
      } catch (err) {
        console.warn("MongoDB create product failed, storing in-memory:", err);
      }
    }
    const newProd = {
      _id: createdProduct ? String(createdProduct._id) : `prod_${Date.now()}`,
      id: Date.now(),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      subCategory: String(subCategory || "").trim(),
      eligibleFor20MinDelivery: is20Min,
      price: numericPrice,
      mrp: numericMrp,
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 120,
      stock: numericStock,
      stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
      badge,
      isFlashSale: Boolean(isFlashSale),
      image: image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
      images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600"],
      description,
      specifications,
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      colors,
      sizes,
      emoji: emoji || "\u{1F4E6}",
      sellerId: sellerId || "admin",
      sellerShopName: sellerShopName || "ALIKE-ND Official",
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.products.unshift(newProd);
    return res.status(201).json(createdProduct || newProd);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});
router3.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updateData = {};
    if (body.name !== void 0) updateData.name = body.name.trim();
    if (body.brand !== void 0) updateData.brand = body.brand.trim();
    if (body.category !== void 0) updateData.category = body.category.trim();
    if (body.subCategory !== void 0) updateData.subCategory = body.subCategory.trim();
    if (body.eligibleFor20MinDelivery !== void 0) updateData.eligibleFor20MinDelivery = Boolean(body.eligibleFor20MinDelivery);
    if (body.price !== void 0) updateData.price = Number(body.price);
    if (body.mrp !== void 0) updateData.mrp = Number(body.mrp);
    if (body.rating !== void 0) updateData.rating = Number(body.rating);
    if (body.reviewsCount !== void 0) updateData.reviewsCount = Number(body.reviewsCount);
    if (body.stock !== void 0) updateData.stock = Number(body.stock);
    if (body.stockStatus !== void 0) updateData.stockStatus = body.stockStatus;
    if (body.badge !== void 0) updateData.badge = body.badge;
    if (body.isFlashSale !== void 0) updateData.isFlashSale = Boolean(body.isFlashSale);
    if (body.image !== void 0) updateData.image = body.image;
    if (body.images !== void 0) updateData.images = body.images;
    if (body.description !== void 0) updateData.description = body.description;
    if (body.specifications !== void 0) updateData.specifications = body.specifications;
    if (body.isWholesale !== void 0) updateData.isWholesale = Boolean(body.isWholesale);
    if (body.wholesalePrice !== void 0) updateData.wholesalePrice = Number(body.wholesalePrice);
    if (body.wholesaleMinQty !== void 0) updateData.wholesaleMinQty = Number(body.wholesaleMinQty);
    if (body.colors !== void 0) updateData.colors = body.colors;
    if (body.sizes !== void 0) updateData.sizes = body.sizes;
    if (body.emoji !== void 0) updateData.emoji = body.emoji;
    let updatedMongo = null;
    if (isMongoConnected()) {
      try {
        updatedMongo = await Product_default.findByIdAndUpdate(id, updateData, { new: true });
      } catch (err) {
        console.warn("MongoDB update product failed, checking in-memory store:", err);
      }
    }
    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      };
      return res.json(updatedMongo || memoryStore.products[index]);
    }
    if (updatedMongo) {
      return res.json(updatedMongo);
    }
    return res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});
router3.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        await Product_default.findByIdAndDelete(id);
      } catch (err) {
        console.warn("MongoDB delete product failed, checking in-memory store:", err);
      }
    }
    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      memoryStore.products.splice(index, 1);
    }
    return res.json({ ok: true, message: "Product removed from catalog" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});
var products_default = router3;

// backend/routes/orders.ts
import { Router as Router4 } from "express";

// backend/services/sellerWallet.ts
import mongoose13 from "mongoose";
async function creditSellerWalletsForOrder(order) {
  if (!order) return;
  if (order.walletCredited) {
    return;
  }
  if (order.status !== "delivered") {
    return;
  }
  try {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
      order.walletCredited = true;
      if (typeof order.save === "function") {
        await order.save().catch(() => {
        });
      } else if (order._id && isMongoConnected()) {
        await Order_default.findByIdAndUpdate(order._id, { walletCredited: true }).catch(() => {
        });
      }
      return;
    }
    const commissionRate = typeof order.commissionRate === "number" ? order.commissionRate : 5;
    const commissionPercent = Math.max(0, Math.min(100, commissionRate));
    const productIds = items.map((it) => it.productId).filter((id) => id !== void 0 && id !== null && id !== "");
    let dbProducts = [];
    if (isMongoConnected() && productIds.length > 0) {
      try {
        const validObjectIds = productIds.filter((id) => mongoose13.isValidObjectId(id));
        const validNumericIds = productIds.map((id) => Number(id)).filter((n) => !isNaN(n));
        const orConditions = [];
        if (validObjectIds.length > 0) orConditions.push({ _id: { $in: validObjectIds } });
        if (validNumericIds.length > 0) orConditions.push({ id: { $in: validNumericIds } });
        if (orConditions.length > 0) {
          dbProducts = await Product_default.find({ $or: orConditions }).lean();
        }
      } catch (err) {
        console.warn("MongoDB product lookup notice during seller wallet crediting:", err);
      }
    }
    const productMap = /* @__PURE__ */ new Map();
    for (const p of dbProducts) {
      if (p._id) productMap.set(String(p._id), p);
      if (p.id !== void 0 && p.id !== null) productMap.set(String(p.id), p);
    }
    for (const p of memoryStore.products || []) {
      if (p._id && !productMap.has(String(p._id))) productMap.set(String(p._id), p);
      if (p.id !== void 0 && p.id !== null && !productMap.has(String(p.id))) productMap.set(String(p.id), p);
    }
    const sellerPayoutMap = {};
    for (const item of items) {
      const product = productMap.get(String(item.productId));
      const sellerId = product?.sellerId ? String(product.sellerId) : null;
      if (!sellerId || sellerId === "admin" || sellerId === "platform") {
        continue;
      }
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.qty) || 1;
      const itemTotal = itemPrice * itemQty;
      const itemCommission = Math.round(itemTotal * commissionPercent / 100);
      const itemPayout = Math.max(0, itemTotal - itemCommission);
      if (itemPayout > 0) {
        sellerPayoutMap[sellerId] = (sellerPayoutMap[sellerId] || 0) + itemPayout;
      }
    }
    for (const [sellerId, payout] of Object.entries(sellerPayoutMap)) {
      if (payout <= 0) continue;
      if (isMongoConnected()) {
        try {
          if (mongoose13.isValidObjectId(sellerId)) {
            await Seller_default.findByIdAndUpdate(sellerId, {
              $inc: { walletBalance: payout, totalEarnings: payout }
            });
          } else {
            await Seller_default.updateOne(
              { $or: [{ _id: sellerId }, { email: sellerId }] },
              { $inc: { walletBalance: payout, totalEarnings: payout } }
            );
          }
        } catch (dbErr) {
          console.warn(`MongoDB wallet crediting failed for seller ${sellerId}:`, dbErr?.message || dbErr);
        }
      }
      const memSeller = (memoryStore.sellers || []).find(
        (s) => s._id === sellerId || s.email && s.email.toLowerCase() === sellerId.toLowerCase()
      );
      if (memSeller) {
        memSeller.walletBalance = (memSeller.walletBalance || 0) + payout;
        memSeller.totalEarnings = (memSeller.totalEarnings || 0) + payout;
      }
      console.log(
        `\u{1F4B0} [SELLER WALLET CREDITED] Seller ${sellerId} received \u20B9${payout} payout for Order ${order.orderNumber || order._id}`
      );
    }
    order.walletCredited = true;
    if (typeof order.save === "function") {
      await order.save();
    } else if (order._id) {
      if (isMongoConnected()) {
        try {
          await Order_default.findByIdAndUpdate(order._id, { walletCredited: true });
        } catch (saveErr) {
          console.warn("MongoDB order walletCredited update notice:", saveErr);
        }
      }
      const memOrder = (memoryStore.orders || []).find(
        (o) => o._id === order._id || o.orderNumber === order.orderNumber
      );
      if (memOrder) {
        memOrder.walletCredited = true;
      }
    }
  } catch (err) {
    console.warn("creditSellerWalletsForOrder helper error:", err?.message || err);
  }
}

// backend/services/orderAutomation.ts
var AUTOMATION_INTERVALS = {
  // Interval from Approved/Processing to Shipped: 30 Minutes
  APPROVED_TO_SHIPPED_MINUTES: 30,
  // Interval from Shipped to Delivered: 60 Minutes (1 Hour)
  SHIPPED_TO_DELIVERED_MINUTES: 60
};
async function progressOrderStatuses() {
  let updatedCount = 0;
  const now = Date.now();
  const approvedToShippedMs = AUTOMATION_INTERVALS.APPROVED_TO_SHIPPED_MINUTES * 60 * 1e3;
  const shippedToDeliveredMs = AUTOMATION_INTERVALS.SHIPPED_TO_DELIVERED_MINUTES * 60 * 1e3;
  if (isMongoConnected()) {
    try {
      const activeOrders = await Order_default.find({
        status: { $in: ["pending", "processing", "shipped"] },
        manualOverride: { $ne: true }
      });
      for (const order of activeOrders) {
        let changed = false;
        const createdAtTime = order.createdAt ? new Date(order.createdAt).getTime() : now;
        const approvedAtTime = order.approvedAt ? new Date(order.approvedAt).getTime() : createdAtTime;
        const shippedAtTime = order.shippedAt ? new Date(order.shippedAt).getTime() : null;
        if (order.status === "pending") {
          order.status = "processing";
          order.trackingStep = 2;
          order.approvedAt = order.approvedAt || new Date(createdAtTime);
          changed = true;
        }
        if (order.status === "processing") {
          const effectiveApprovedTime = order.approvedAt ? new Date(order.approvedAt).getTime() : approvedAtTime;
          if (now - effectiveApprovedTime >= approvedToShippedMs) {
            order.status = "shipped";
            order.trackingStep = 3;
            order.shippedAt = new Date(effectiveApprovedTime + approvedToShippedMs);
            changed = true;
          }
        }
        if (order.status === "shipped") {
          const effectiveShippedTime = order.shippedAt ? new Date(order.shippedAt).getTime() : shippedAtTime || (order.approvedAt ? new Date(order.approvedAt).getTime() + approvedToShippedMs : now);
          if (now - effectiveShippedTime >= shippedToDeliveredMs) {
            order.status = "delivered";
            order.trackingStep = 4;
            order.deliveredAt = new Date(effectiveShippedTime + shippedToDeliveredMs);
            changed = true;
          }
        }
        if (changed) {
          await order.save();
          if (order.status === "delivered") {
            await creditSellerWalletsForOrder(order).catch((err) => {
              console.warn("Automation wallet crediting notice (MongoDB):", err);
            });
          }
          updatedCount++;
        }
      }
    } catch (err) {
      console.warn("MongoDB order status automation notice:", err?.message || err);
    }
  }
  if (Array.isArray(memoryStore.orders)) {
    for (const memOrder of memoryStore.orders) {
      const o = memOrder;
      if (o.manualOverride === true || o.status === "cancelled" || o.status === "delivered") {
        continue;
      }
      const createdTime = o.createdAt ? new Date(o.createdAt).getTime() : now;
      const approvedTime = o.approvedAt ? new Date(o.approvedAt).getTime() : createdTime;
      if (o.status === "pending") {
        o.status = "processing";
        o.trackingStep = 2;
        o.approvedAt = o.approvedAt || new Date(createdTime);
        updatedCount++;
      }
      if (o.status === "processing") {
        const effApproved = o.approvedAt ? new Date(o.approvedAt).getTime() : approvedTime;
        if (now - effApproved >= approvedToShippedMs) {
          o.status = "shipped";
          o.trackingStep = 3;
          o.shippedAt = new Date(effApproved + approvedToShippedMs);
          updatedCount++;
        }
      }
      if (o.status === "shipped") {
        const effShipped = o.shippedAt ? new Date(o.shippedAt).getTime() : o.approvedAt ? new Date(o.approvedAt).getTime() + approvedToShippedMs : now;
        if (now - effShipped >= shippedToDeliveredMs) {
          o.status = "delivered";
          o.trackingStep = 4;
          o.deliveredAt = new Date(effShipped + shippedToDeliveredMs);
          updatedCount++;
          await creditSellerWalletsForOrder(o).catch((err) => {
            console.warn("Automation wallet crediting notice (Memory):", err);
          });
        }
      }
    }
  }
  return { updatedCount };
}
var automationInterval = null;
function startOrderAutomationJob(intervalMs = 3e4) {
  if (automationInterval) clearInterval(automationInterval);
  progressOrderStatuses().catch(() => {
  });
  automationInterval = setInterval(() => {
    progressOrderStatuses().catch((err) => {
      console.warn("Background order progression job error:", err);
    });
  }, intervalMs);
  console.log(`\u23F1\uFE0F [ORDER AUTOMATION] Background scheduler active (${intervalMs / 1e3}s interval, Approved -> Shipped: ${AUTOMATION_INTERVALS.APPROVED_TO_SHIPPED_MINUTES}m, Shipped -> Delivered: ${AUTOMATION_INTERVALS.SHIPPED_TO_DELIVERED_MINUTES}m)`);
}

// backend/routes/orders.ts
var router4 = Router4();
router4.use(requireAdmin);
router4.get("/", async (_req, res) => {
  try {
    await progressOrderStatuses().catch(() => {
    });
    if (isMongoConnected()) {
      try {
        const orders = await Order_default.find().sort({ createdAt: -1 });
        return res.json(orders);
      } catch (err) {
        console.warn("MongoDB fetch orders failed, using in-memory store:", err);
      }
    }
    return res.json(memoryStore.orders);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});
router4.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Must be pending, processing, shipped, delivered, or cancelled." });
    }
    const stepMap = {
      pending: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: 0
    };
    const trackingStep = stepMap[status] ?? 2;
    const updateFields = {
      status,
      trackingStep,
      manualOverride: true
      // Preserve manual admin intervention
    };
    if (status === "processing") updateFields.approvedAt = /* @__PURE__ */ new Date();
    if (status === "shipped") updateFields.shippedAt = /* @__PURE__ */ new Date();
    if (status === "delivered") updateFields.deliveredAt = /* @__PURE__ */ new Date();
    if (isMongoConnected()) {
      try {
        const order = await Order_default.findByIdAndUpdate(id, updateFields, { new: true });
        if (order) {
          if (status === "delivered") {
            await creditSellerWalletsForOrder(order).catch((err) => {
              console.warn("Wallet crediting notice (admin manual route):", err);
            });
          }
          return res.json(order);
        }
      } catch (err) {
        console.warn("MongoDB update order status failed, checking in-memory store:", err);
      }
    }
    const index = memoryStore.orders.findIndex((o) => o._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    Object.assign(memoryStore.orders[index], updateFields);
    if (status === "delivered") {
      await creditSellerWalletsForOrder(memoryStore.orders[index]).catch((err) => {
        console.warn("Wallet crediting notice (memory store):", err);
      });
    }
    return res.json(memoryStore.orders[index]);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update order status" });
  }
});
var orders_default = router4;

// backend/routes/sellers.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.use(requireAdmin);
router5.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const sellers = await Seller_default.find().select("-password").sort({ createdAt: -1 });
        return res.json(sellers);
      } catch (err) {
        console.warn("MongoDB fetch sellers failed, using in-memory store:", err);
      }
    }
    return res.json(
      memoryStore.sellers.map((s) => {
        const { passwordHash, ...safe } = s;
        return safe;
      })
    );
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sellers" });
  }
});
router5.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "approved", "review", "suspended", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Must be pending, approved, review, suspended, or rejected." });
    }
    if (isMongoConnected()) {
      try {
        const seller = await Seller_default.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (seller) return res.json(seller);
      } catch (err) {
        console.warn("MongoDB update seller status failed, checking in-memory store:", err);
      }
    }
    const index = memoryStore.sellers.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Seller not found" });
    }
    memoryStore.sellers[index].status = status;
    const { passwordHash, ...safe } = memoryStore.sellers[index];
    return res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update seller status" });
  }
});
var sellers_default = router5;

// backend/routes/sellerPortal.ts
import { Router as Router6 } from "express";
import bcrypt4 from "bcryptjs";
import jwt4 from "jsonwebtoken";
async function requireSellerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required: Please log in to your seller account."
    });
  }
  const token = header.slice(7);
  let payload;
  try {
    payload = jwt4.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired seller session token. Please sign in again."
    });
  }
  if (!payload || !payload.sellerId || payload.role !== "seller") {
    return res.status(403).json({
      success: false,
      error: "Access denied: Seller authentication token required."
    });
  }
  if (isMongoConnected()) {
    try {
      const sellerDoc = await Seller_default.findById(payload.sellerId);
      if (sellerDoc) {
        if (sellerDoc.status !== "approved") {
          return res.status(403).json({
            success: false,
            status: sellerDoc.status,
            error: sellerDoc.status === "pending" ? "Your seller application is pending administrator approval." : `Your seller account is ${sellerDoc.status}. Only approved sellers can manage products.`
          });
        }
        req.sellerId = String(sellerDoc._id);
        req.seller = {
          _id: String(sellerDoc._id),
          shopName: sellerDoc.shopName || sellerDoc.storefront,
          storefront: sellerDoc.storefront || sellerDoc.shopName,
          ownerName: sellerDoc.ownerName,
          email: sellerDoc.email || sellerDoc.ownerEmail,
          mobileNumber: sellerDoc.mobileNumber || "",
          businessAddress: sellerDoc.businessAddress || "",
          status: sellerDoc.status,
          listingsCount: sellerDoc.listingsCount || 0
        };
        return next();
      }
    } catch (e) {
      console.warn("MongoDB seller lookup failed, trying memory store:", e?.message);
    }
  }
  const memSeller = (memoryStore.sellers || []).find(
    (s) => s._id === payload.sellerId || s.email && s.email.toLowerCase() === (payload.email || "").toLowerCase()
  );
  if (memSeller) {
    if (memSeller.status !== "approved") {
      return res.status(403).json({
        success: false,
        status: memSeller.status,
        error: memSeller.status === "pending" ? "Your seller application is pending administrator approval." : `Your seller account is ${memSeller.status}. Only approved sellers can manage products.`
      });
    }
    req.sellerId = memSeller._id;
    req.seller = {
      _id: memSeller._id,
      shopName: memSeller.shopName || memSeller.storefront,
      storefront: memSeller.storefront || memSeller.shopName || "",
      ownerName: memSeller.ownerName,
      email: memSeller.email || memSeller.ownerEmail || "",
      mobileNumber: memSeller.mobileNumber || "",
      businessAddress: memSeller.businessAddress || "",
      status: memSeller.status,
      listingsCount: memSeller.listingsCount || 0
    };
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Access denied: Seller account not found."
  });
}
var router6 = Router6();
router6.get("/status-check", async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    if (!email) {
      return res.json({ isSeller: false, status: null });
    }
    if (isMongoConnected()) {
      try {
        const seller = await Seller_default.findOne({ email });
        if (seller) {
          return res.json({
            isSeller: seller.status === "approved",
            status: seller.status,
            shopName: seller.shopName
          });
        }
      } catch (e) {
        console.warn("Seller status check mongo error:", e);
      }
    }
    const memSeller = (memoryStore.sellers || []).find((s) => s.email?.toLowerCase() === email);
    if (memSeller) {
      return res.json({
        isSeller: memSeller.status === "approved",
        status: memSeller.status,
        shopName: memSeller.shopName
      });
    }
    return res.json({ isSeller: false, status: null });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to check seller status" });
  }
});
router6.post("/register", async (req, res) => {
  try {
    const { shopName, ownerName, mobileNumber, email, password, businessAddress } = req.body;
    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ error: "Shop name is required." });
    }
    if (!ownerName || !ownerName.trim()) {
      return res.status(400).json({ error: "Owner name is required." });
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ error: "Mobile number is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (!businessAddress || !businessAddress.trim()) {
      return res.status(400).json({ error: "Business address is required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanShopName = shopName.trim();
    const cleanOwnerName = ownerName.trim();
    const cleanMobile = mobileNumber.trim();
    const cleanAddress = businessAddress.trim();
    if (isMongoConnected()) {
      try {
        const existing = await Seller_default.findOne({
          $or: [{ email: cleanEmail }, { ownerEmail: cleanEmail }]
        });
        if (existing) {
          return res.status(409).json({
            error: "A seller account or application with this email address already exists."
          });
        }
      } catch (err) {
        console.warn("MongoDB check existing seller error:", err);
      }
    }
    const memExisting = (memoryStore.sellers || []).find(
      (s) => s.email && s.email.toLowerCase() === cleanEmail || s.ownerEmail && s.ownerEmail.toLowerCase() === cleanEmail
    );
    if (memExisting) {
      return res.status(409).json({
        error: "A seller account or application with this email address already exists."
      });
    }
    const salt = await bcrypt4.genSalt(10);
    const passwordHash = await bcrypt4.hash(password, salt);
    let createdSeller = null;
    if (isMongoConnected()) {
      try {
        createdSeller = await Seller_default.create({
          shopName: cleanShopName,
          storefront: cleanShopName,
          ownerName: cleanOwnerName,
          ownerEmail: cleanEmail,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          businessAddress: cleanAddress,
          password: passwordHash,
          status: "pending",
          listingsCount: 0
        });
      } catch (err) {
        console.warn("MongoDB save seller application failed, falling back to memory:", err?.message);
      }
    }
    const newId = createdSeller ? String(createdSeller._id) : `seller_${Date.now()}`;
    const newSellerData = {
      _id: newId,
      shopName: cleanShopName,
      storefront: cleanShopName,
      ownerName: cleanOwnerName,
      ownerEmail: cleanEmail,
      email: cleanEmail,
      mobileNumber: cleanMobile,
      businessAddress: cleanAddress,
      passwordHash,
      listingsCount: 0,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.sellers.unshift(newSellerData);
    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully! Your application is currently pending administrator approval.",
      seller: {
        _id: newId,
        shopName: cleanShopName,
        ownerName: cleanOwnerName,
        email: cleanEmail,
        mobileNumber: cleanMobile,
        businessAddress: cleanAddress,
        status: "pending"
      }
    });
  } catch (err) {
    console.error("Seller register error:", err);
    return res.status(500).json({ error: err.message || "Failed to submit seller registration" });
  }
});
router6.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    let sellerDoc = null;
    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller_default.findOne({
          $or: [{ email: cleanEmail }, { ownerEmail: cleanEmail }]
        });
      } catch (err) {
        console.warn("MongoDB find seller for login failed:", err);
      }
    }
    let sellerRecord = sellerDoc;
    let storedHash = sellerDoc?.password;
    if (!sellerRecord) {
      const mem = (memoryStore.sellers || []).find(
        (s) => s.email && s.email.toLowerCase() === cleanEmail || s.ownerEmail && s.ownerEmail.toLowerCase() === cleanEmail
      );
      if (mem) {
        sellerRecord = mem;
        storedHash = mem.passwordHash;
      }
    }
    if (!sellerRecord) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!storedHash) {
      return res.status(401).json({ error: "No password set for this seller account. Please contact support or reset password." });
    }
    const isValid = await bcrypt4.compare(password, storedHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (sellerRecord.status === "pending") {
      return res.status(403).json({
        success: false,
        status: "pending",
        error: "Your seller application is pending administrator approval. Please wait for an administrator to approve your account before logging in."
      });
    }
    if (sellerRecord.status === "rejected") {
      return res.status(403).json({
        success: false,
        status: "rejected",
        error: "Your seller registration was rejected by the administrator. Please contact support for inquiries."
      });
    }
    if (sellerRecord.status === "suspended") {
      return res.status(403).json({
        success: false,
        status: "suspended",
        error: "Your seller account is currently suspended. Please contact platform administration."
      });
    }
    if (sellerRecord.status !== "approved") {
      return res.status(403).json({
        success: false,
        status: sellerRecord.status,
        error: `Your seller account is currently in '${sellerRecord.status}' status. Only approved sellers can access the dashboard.`
      });
    }
    const sellerId = String(sellerRecord._id);
    const shopName = sellerRecord.shopName || sellerRecord.storefront || "Seller Atelier";
    const token = jwt4.sign(
      {
        sellerId,
        role: "seller",
        email: sellerRecord.email || sellerRecord.ownerEmail,
        shopName
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      seller: {
        _id: sellerId,
        shopName,
        storefront: shopName,
        ownerName: sellerRecord.ownerName,
        email: sellerRecord.email || sellerRecord.ownerEmail,
        mobileNumber: sellerRecord.mobileNumber || "",
        businessAddress: sellerRecord.businessAddress || "",
        status: sellerRecord.status,
        listingsCount: sellerRecord.listingsCount || 0
      }
    });
  } catch (err) {
    console.error("Seller login error:", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});
router6.get("/me", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    let productCount = 0;
    if (isMongoConnected()) {
      try {
        productCount = await Product_default.countDocuments({ sellerId });
      } catch (e) {
        console.warn("Count seller products in MongoDB error:", e);
      }
    }
    if (!productCount) {
      productCount = (memoryStore.products || []).filter((p) => p.sellerId === sellerId).length;
    }
    return res.json({
      seller: {
        ...req.seller,
        listingsCount: productCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch seller profile" });
  }
});
router6.get("/products", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    if (isMongoConnected()) {
      try {
        const products = await Product_default.find({ sellerId }).sort({ createdAt: -1 });
        return res.json(products);
      } catch (err) {
        console.warn("MongoDB fetch seller products failed, using in-memory store:", err);
      }
    }
    const sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
    return res.json(sellerProducts);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch seller products" });
  }
});
router6.post("/products", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const sellerShopName = req.seller?.shopName || req.seller?.storefront || "Seller Atelier";
    const {
      name,
      brand,
      category,
      subCategory = "",
      eligibleFor20MinDelivery,
      price,
      mrp,
      stock = 10,
      stockStatus = "In Stock",
      badge = "",
      image = "",
      images = [],
      description = "",
      specifications = {},
      isWholesale = false,
      wholesalePrice = 0,
      wholesaleMinQty = 1,
      colors = [],
      sizes = [],
      emoji = "\u{1F4E6}"
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Product category is required" });
    }
    const numericPrice = Number(price) || 0;
    const numericMrp = mrp !== void 0 && mrp !== null ? Number(mrp) : numericPrice;
    const numericStock = Number(stock) || 0;
    const resolvedBrand = brand && brand.trim() ? brand.trim() : sellerShopName;
    const is20Min = eligibleFor20MinDelivery !== void 0 ? Boolean(eligibleFor20MinDelivery) : category.trim() === "grocery" || category.trim() === "food_delivery" || category.trim() === "delivery";
    let createdProduct = null;
    if (isMongoConnected()) {
      try {
        createdProduct = await Product_default.create({
          name: name.trim(),
          brand: resolvedBrand,
          category: category.trim(),
          subCategory: String(subCategory || "").trim(),
          eligibleFor20MinDelivery: is20Min,
          price: numericPrice,
          mrp: numericMrp,
          rating: 5,
          reviewsCount: 1,
          stock: numericStock,
          stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
          badge,
          isFlashSale: false,
          image: image || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&auto=format&fit=crop&q=60",
          images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&auto=format&fit=crop&q=60"],
          description: description || "",
          specifications: specifications || {},
          isWholesale: Boolean(isWholesale),
          wholesalePrice: Number(wholesalePrice) || 0,
          wholesaleMinQty: Number(wholesaleMinQty) || 1,
          colors: Array.isArray(colors) ? colors : [],
          sizes: Array.isArray(sizes) ? sizes : [],
          emoji: emoji || "\u{1F4E6}",
          sellerId,
          sellerShopName
        });
        await Seller_default.findByIdAndUpdate(sellerId, { $inc: { listingsCount: 1 } });
      } catch (err) {
        console.warn("MongoDB create seller product failed, storing in-memory:", err);
      }
    }
    const newProd = {
      _id: createdProduct ? String(createdProduct._id) : `prod_seller_${Date.now()}`,
      id: Date.now(),
      name: name.trim(),
      brand: resolvedBrand,
      category: category.trim(),
      subCategory: String(subCategory || "").trim(),
      eligibleFor20MinDelivery: is20Min,
      price: numericPrice,
      mrp: numericMrp,
      rating: 5,
      reviewsCount: 1,
      stock: numericStock,
      stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
      badge,
      isFlashSale: false,
      image: image || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&auto=format&fit=crop&q=60",
      images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&auto=format&fit=crop&q=60"],
      description: description || "",
      specifications: specifications || {},
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      emoji: emoji || "\u{1F4E6}",
      sellerId,
      sellerShopName,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.products.unshift(newProd);
    const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
    if (memSeller) {
      memSeller.listingsCount = (memSeller.listingsCount || 0) + 1;
    }
    return res.status(201).json(createdProduct || newProd);
  } catch (err) {
    console.error("Seller create product error:", err);
    return res.status(500).json({ error: err.message || "Failed to create product" });
  }
});
router6.put("/products/:id", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const { id } = req.params;
    const body = req.body;
    if (isMongoConnected()) {
      try {
        const existing = await Product_default.findById(id);
        if (existing) {
          if (existing.sellerId !== sellerId) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own products." });
          }
          const updateData = {};
          if (body.name !== void 0) updateData.name = body.name.trim();
          if (body.brand !== void 0) updateData.brand = body.brand.trim();
          if (body.category !== void 0) updateData.category = body.category.trim();
          if (body.subCategory !== void 0) updateData.subCategory = body.subCategory.trim();
          if (body.eligibleFor20MinDelivery !== void 0) updateData.eligibleFor20MinDelivery = Boolean(body.eligibleFor20MinDelivery);
          if (body.price !== void 0) updateData.price = Number(body.price);
          if (body.mrp !== void 0) updateData.mrp = Number(body.mrp);
          if (body.stock !== void 0) updateData.stock = Number(body.stock);
          if (body.stockStatus !== void 0) updateData.stockStatus = body.stockStatus;
          if (body.badge !== void 0) updateData.badge = body.badge;
          if (body.image !== void 0) updateData.image = body.image;
          if (body.images !== void 0) updateData.images = body.images;
          if (body.description !== void 0) updateData.description = body.description;
          if (body.specifications !== void 0) updateData.specifications = body.specifications;
          if (body.isWholesale !== void 0) updateData.isWholesale = Boolean(body.isWholesale);
          if (body.wholesalePrice !== void 0) updateData.wholesalePrice = Number(body.wholesalePrice);
          if (body.wholesaleMinQty !== void 0) updateData.wholesaleMinQty = Number(body.wholesaleMinQty);
          if (body.colors !== void 0) updateData.colors = body.colors;
          if (body.sizes !== void 0) updateData.sizes = body.sizes;
          const updated = await Product_default.findByIdAndUpdate(id, updateData, { new: true });
          return res.json(updated);
        }
      } catch (err) {
        console.warn("MongoDB seller update product error:", err);
      }
    }
    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      const prod = memoryStore.products[index];
      if (prod.sellerId !== sellerId) {
        return res.status(403).json({ error: "Unauthorized: You can only edit your own products." });
      }
      memoryStore.products[index] = {
        ...prod,
        ...body,
        updatedAt: /* @__PURE__ */ new Date()
      };
      return res.json(memoryStore.products[index]);
    }
    return res.status(404).json({ error: "Product not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to update product" });
  }
});
router6.delete("/products/:id", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        const existing = await Product_default.findById(id);
        if (existing) {
          if (existing.sellerId !== sellerId) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own products." });
          }
          await Product_default.findByIdAndDelete(id);
          await Seller_default.findByIdAndUpdate(sellerId, { $inc: { listingsCount: -1 } });
        }
      } catch (err) {
        console.warn("MongoDB seller delete product error:", err);
      }
    }
    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      const prod = memoryStore.products[index];
      if (prod.sellerId !== sellerId) {
        return res.status(403).json({ error: "Unauthorized: You can only delete your own products." });
      }
      memoryStore.products.splice(index, 1);
      const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
      if (memSeller && memSeller.listingsCount > 0) {
        memSeller.listingsCount -= 1;
      }
    }
    return res.json({ ok: true, message: "Product deleted from your seller catalog." });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});
router6.get("/wallet", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    let walletBalance = 0;
    let totalEarnings = 0;
    let pendingWithdrawals = 0;
    if (isMongoConnected()) {
      try {
        const sellerDoc = await Seller_default.findById(sellerId).lean();
        if (sellerDoc) {
          walletBalance = Number(sellerDoc.walletBalance) || 0;
          totalEarnings = Number(sellerDoc.totalEarnings) || 0;
          pendingWithdrawals = Number(sellerDoc.pendingWithdrawals) || 0;
        }
      } catch (err) {
        console.warn("MongoDB seller fetch in /wallet error:", err);
      }
    }
    if (walletBalance === 0 && totalEarnings === 0) {
      const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
      if (memSeller) {
        walletBalance = Number(memSeller.walletBalance) || 0;
        totalEarnings = Number(memSeller.totalEarnings) || 0;
        pendingWithdrawals = Number(memSeller.pendingWithdrawals) || 0;
      }
    }
    let sellerProducts = [];
    if (isMongoConnected()) {
      try {
        sellerProducts = await Product_default.find({ sellerId }).select("_id id name price image").lean();
      } catch (err) {
        console.warn("MongoDB seller products query in /wallet error:", err);
        sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
      }
    } else {
      sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
    }
    const sellerProductMap = /* @__PURE__ */ new Map();
    for (const p of sellerProducts) {
      if (p._id) sellerProductMap.set(String(p._id), p);
      if (p.id !== void 0 && p.id !== null) sellerProductMap.set(String(p.id), p);
    }
    let deliveredOrders = [];
    if (isMongoConnected()) {
      try {
        deliveredOrders = await Order_default.find({ status: "delivered" }).sort({ deliveredAt: -1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB orders query in /wallet error:", err);
        deliveredOrders = (memoryStore.orders || []).filter((o) => o.status === "delivered");
      }
    } else {
      deliveredOrders = (memoryStore.orders || []).filter((o) => o.status === "delivered");
    }
    const ledger = [];
    for (const ord of deliveredOrders) {
      const items = Array.isArray(ord.items) ? ord.items : [];
      const sellerItems = items.filter((it) => sellerProductMap.has(String(it.productId)));
      if (sellerItems.length === 0) continue;
      const commissionRate = typeof ord.commissionRate === "number" ? ord.commissionRate : 5;
      const commissionPercent = Math.max(0, Math.min(100, commissionRate));
      let orderSellerGross = 0;
      let orderSellerCommission = 0;
      let orderSellerPayout = 0;
      const itemBreakdown = sellerItems.map((it) => {
        const itemPrice = Number(it.price) || 0;
        const itemQty = Number(it.qty) || 1;
        const itemGross = itemPrice * itemQty;
        const itemCommission = Math.round(itemGross * commissionPercent / 100);
        const itemPayout = Math.max(0, itemGross - itemCommission);
        orderSellerGross += itemGross;
        orderSellerCommission += itemCommission;
        orderSellerPayout += itemPayout;
        return {
          productId: it.productId,
          name: it.name,
          qty: itemQty,
          price: itemPrice,
          total: itemGross,
          commissionDeducted: itemCommission,
          netPayout: itemPayout
        };
      });
      ledger.push({
        _id: String(ord._id || ord.orderNumber),
        orderNumber: ord.orderNumber || "AN-UNKNOWN",
        deliveredAt: ord.deliveredAt ? new Date(ord.deliveredAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        orderDate: ord.createdAt ? new Date(ord.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        memberName: ord.memberName || "Client",
        orderTotal: ord.total || 0,
        commissionRate,
        sellerGross: orderSellerGross,
        commissionDeducted: orderSellerCommission,
        sellerPayout: orderSellerPayout,
        walletCredited: Boolean(ord.walletCredited),
        items: itemBreakdown
      });
    }
    return res.json({
      success: true,
      sellerId,
      walletBalance,
      totalEarnings,
      pendingWithdrawals,
      ledger
    });
  } catch (err) {
    console.error("Failed to load seller wallet:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve seller wallet" });
  }
});
router6.post("/wallet/withdraw", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const { amount, payoutDetails, note } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid withdrawal amount. Must be a positive number greater than 0."
      });
    }
    let sellerDoc = null;
    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller_default.findById(sellerId);
      } catch (err) {
        console.warn("MongoDB seller lookup in withdraw error:", err);
      }
    }
    if (!sellerDoc) {
      sellerDoc = (memoryStore.sellers || []).find((s) => s._id === sellerId);
    }
    if (!sellerDoc) {
      return res.status(404).json({ success: false, error: "Seller profile not found." });
    }
    const currentBalance = Number(sellerDoc.walletBalance) || 0;
    if (currentBalance < numAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Your available wallet balance is \u20B9${currentBalance.toLocaleString()}, but you requested \u20B9${numAmount.toLocaleString()}.`,
        currentBalance
      });
    }
    let updatedSeller = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller_default.findOneAndUpdate(
          {
            _id: sellerId,
            walletBalance: { $gte: numAmount }
          },
          {
            $inc: {
              walletBalance: -numAmount,
              pendingWithdrawals: numAmount
            }
          },
          { new: true }
        );
      } catch (err) {
        console.warn("MongoDB atomic seller balance update error:", err);
      }
    }
    const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
    if (memSeller) {
      memSeller.walletBalance = Math.max(0, (memSeller.walletBalance || 0) - numAmount);
      memSeller.pendingWithdrawals = (memSeller.pendingWithdrawals || 0) + numAmount;
      if (!updatedSeller) {
        updatedSeller = memSeller;
      }
    }
    if (!updatedSeller) {
      return res.status(400).json({
        success: false,
        error: "Failed to deduct funds. Balance may have changed or is insufficient."
      });
    }
    let withdrawalRecord = null;
    if (isMongoConnected()) {
      try {
        withdrawalRecord = await SellerWithdrawal_default.create({
          sellerId: updatedSeller._id,
          sellerEmail: updatedSeller.email,
          sellerShopName: updatedSeller.shopName,
          amount: numAmount,
          payoutDetails: payoutDetails ? String(payoutDetails).trim() : "",
          note: note ? String(note).trim() : "",
          status: "pending",
          requestedAt: /* @__PURE__ */ new Date()
        });
      } catch (dbErr) {
        console.error("MongoDB failed to create SellerWithdrawal:", dbErr);
        await Seller_default.findByIdAndUpdate(sellerId, {
          $inc: { walletBalance: numAmount, pendingWithdrawals: -numAmount }
        }).catch(() => {
        });
        return res.status(500).json({
          success: false,
          error: "Failed to record withdrawal request. Your wallet balance has been restored."
        });
      }
    }
    const memWithdrawal = {
      _id: withdrawalRecord ? String(withdrawalRecord._id) : `sw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sellerId: String(updatedSeller._id),
      sellerEmail: updatedSeller.email,
      sellerShopName: updatedSeller.shopName,
      amount: numAmount,
      payoutDetails: payoutDetails ? String(payoutDetails).trim() : "",
      note: note ? String(note).trim() : "",
      status: "pending",
      requestedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    (memoryStore.sellerWithdrawals = memoryStore.sellerWithdrawals || []).unshift(memWithdrawal);
    const finalRecord = withdrawalRecord || memWithdrawal;
    console.log(
      `\u{1F4B8} [SELLER WITHDRAWAL REQUESTED] Seller ${updatedSeller.shopName} (${updatedSeller.email}) requested \u20B9${numAmount}. Status: PENDING.`
    );
    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully and is awaiting admin approval.",
      withdrawal: finalRecord,
      walletBalance: updatedSeller.walletBalance,
      pendingWithdrawals: updatedSeller.pendingWithdrawals
    });
  } catch (err) {
    console.error("Seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to process withdrawal request"
    });
  }
});
router6.get("/wallet/withdrawals", requireSellerAuth, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const sellerEmail = req.seller?.email;
    let withdrawals = [];
    if (isMongoConnected()) {
      try {
        const orConditions = [{ sellerId }];
        if (sellerEmail) {
          orConditions.push({ sellerEmail: sellerEmail.toLowerCase().trim() });
        }
        withdrawals = await SellerWithdrawal_default.find({ $or: orConditions }).sort({ requestedAt: -1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB seller withdrawals query fallback:", err);
      }
    }
    if (!withdrawals || withdrawals.length === 0) {
      withdrawals = (memoryStore.sellerWithdrawals || []).filter(
        (w) => String(w.sellerId) === String(sellerId) || sellerEmail && w.sellerEmail?.toLowerCase() === sellerEmail.toLowerCase()
      );
    }
    return res.json({
      success: true,
      withdrawals
    });
  } catch (err) {
    console.error("Failed to fetch seller withdrawals:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch withdrawal history"
    });
  }
});
var sellerPortal_default = router6;

// backend/routes/customers.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.use(requireAdmin);
router7.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const users = await User_default.find().sort({ createdAt: -1 });
        const orders = await Order_default.find().lean();
        const formattedUsers = users.map((u) => {
          const userOrders = orders.filter(
            (o) => o.memberName?.toLowerCase() === u.fullName?.toLowerCase() || o.memberEmail?.toLowerCase() === u.email?.toLowerCase()
          );
          const spend = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          return {
            _id: String(u._id),
            name: u.fullName,
            email: u.email,
            phone: u.phone || `${u.country} ${u.mobileNumber}`,
            country: u.country,
            mobileNumber: u.mobileNumber,
            tier: u.tier || "Silver",
            isBlocked: Boolean(u.isBlocked),
            verified: Boolean(u.verified),
            ordersCount: userOrders.length,
            lifetimeSpend: spend,
            createdAt: u.createdAt
          };
        });
        return res.json(formattedUsers);
      } catch (err) {
        console.warn("MongoDB fetch users failed, checking Customer collection or in-memory:", err);
      }
    }
    const memList = (memoryStore.users || []).map((u) => ({
      _id: u._id,
      name: u.fullName,
      email: u.email,
      phone: u.phone || `${u.country} ${u.mobileNumber}`,
      country: u.country,
      mobileNumber: u.mobileNumber,
      tier: u.tier,
      isBlocked: false,
      verified: true,
      ordersCount: 0,
      lifetimeSpend: 0,
      createdAt: u.createdAt
    }));
    return res.json(memList.length > 0 ? memList : memoryStore.customers);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch customer list" });
  }
});
router7.patch("/:id/block", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ error: "isBlocked boolean field is required" });
    }
    if (isMongoConnected()) {
      const updatedUser = await User_default.findByIdAndUpdate(id, { isBlocked }, { new: true });
      if (updatedUser) {
        console.log(`\u{1F6E1}\uFE0F [SUPER ADMIN ACTION] User ${updatedUser.email} isBlocked set to ${isBlocked}`);
        return res.json({
          success: true,
          message: `User ${updatedUser.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
          user: {
            _id: String(updatedUser._id),
            name: updatedUser.fullName,
            email: updatedUser.email,
            isBlocked: updatedUser.isBlocked,
            tier: updatedUser.tier
          }
        });
      }
    }
    const userInMem = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (userInMem) {
      return res.json({
        success: true,
        message: `User ${userInMem.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
        user: { ...userInMem, isBlocked }
      });
    }
    return res.status(404).json({ error: "User document not found in database" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update user block status" });
  }
});
router7.patch("/:id/tier", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;
    if (!["Silver", "Gold", "Platinum"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier value" });
    }
    if (isMongoConnected()) {
      const updatedUser = await User_default.findByIdAndUpdate(id, { tier }, { new: true });
      if (updatedUser) {
        return res.json({ success: true, user: updatedUser });
      }
    }
    return res.status(404).json({ error: "User document not found in database" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update member tier" });
  }
});
var customers_default = router7;

// backend/routes/banners.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.use(requireAdmin);
router8.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const banners = await Banner_default.find().sort({ order: 1, createdAt: 1 });
        if (banners && banners.length > 0) {
          return res.json(banners.map((b) => b.toObject ? b.toObject() : b));
        }
      } catch (err) {
        console.warn("MongoDB fetch banners error, falling back to memory:", err);
      }
    }
    const sortedMem = [...memoryStore.banners || []].sort((a, b) => a.order - b.order);
    return res.json(sortedMem);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch banners" });
  }
});
router8.post("/", async (req, res) => {
  try {
    const {
      imageUrl,
      title = "",
      subtitle = "",
      description = "",
      buttonText = "",
      link = "",
      order,
      active = true
    } = req.body;
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ error: "Image URL is required" });
    }
    let calculatedOrder = Number(order);
    if (isNaN(calculatedOrder)) {
      if (isMongoConnected()) {
        try {
          const maxOrderDoc = await Banner_default.findOne().sort({ order: -1 }).select("order");
          calculatedOrder = maxOrderDoc && typeof maxOrderDoc.order === "number" ? maxOrderDoc.order + 1 : 1;
        } catch {
          calculatedOrder = (memoryStore.banners?.length || 0) + 1;
        }
      } else {
        calculatedOrder = (memoryStore.banners?.length || 0) + 1;
      }
    }
    let createdDoc = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await Banner_default.create({
          imageUrl: imageUrl.trim(),
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          buttonText: buttonText.trim(),
          link: link.trim(),
          order: calculatedOrder,
          active: Boolean(active)
        });
      } catch (dbErr) {
        console.warn("MongoDB create banner fallback to memory:", dbErr);
      }
    }
    const newBanner = {
      _id: createdDoc ? String(createdDoc._id) : `ban_${Date.now()}`,
      imageUrl: imageUrl.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      buttonText: buttonText.trim(),
      link: link.trim(),
      order: calculatedOrder,
      active: Boolean(active),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (!memoryStore.banners) memoryStore.banners = [];
    memoryStore.banners.push(newBanner);
    return res.status(201).json(createdDoc ? createdDoc.toObject() : newBanner);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to create banner" });
  }
});
router8.put("/reorder", async (req, res) => {
  try {
    const { bannerIds } = req.body;
    if (!Array.isArray(bannerIds)) {
      return res.status(400).json({ error: "bannerIds array is required for reordering" });
    }
    if (isMongoConnected()) {
      try {
        const updateOps = bannerIds.map(
          (id, index) => Banner_default.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
        );
        await Promise.all(updateOps);
      } catch (err) {
        console.warn("MongoDB reorder banners error:", err);
      }
    }
    if (memoryStore.banners) {
      bannerIds.forEach((id, index) => {
        const item = memoryStore.banners.find((b) => b._id === id);
        if (item) item.order = index + 1;
      });
      memoryStore.banners.sort((a, b) => a.order - b.order);
    }
    return res.json({ success: true, message: "Banners reordered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to reorder banners" });
  }
});
router8.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        const doc = await Banner_default.findById(id);
        if (doc) {
          doc.active = !doc.active;
          await doc.save();
          return res.json(doc.toObject());
        }
      } catch (err) {
        console.warn("MongoDB toggle banner fallback to memory:", err);
      }
    }
    const item = (memoryStore.banners || []).find((b) => b._id === id);
    if (item) {
      item.active = !item.active;
      item.updatedAt = /* @__PURE__ */ new Date();
      return res.json(item);
    }
    return res.status(404).json({ error: "Banner not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to toggle banner status" });
  }
});
router8.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      imageUrl,
      title,
      subtitle,
      description,
      buttonText,
      link,
      order,
      active
    } = req.body;
    const updateData = {};
    if (imageUrl !== void 0) updateData.imageUrl = String(imageUrl).trim();
    if (title !== void 0) updateData.title = String(title).trim();
    if (subtitle !== void 0) updateData.subtitle = String(subtitle).trim();
    if (description !== void 0) updateData.description = String(description).trim();
    if (buttonText !== void 0) updateData.buttonText = String(buttonText).trim();
    if (link !== void 0) updateData.link = String(link).trim();
    if (order !== void 0) updateData.order = Number(order);
    if (active !== void 0) updateData.active = Boolean(active);
    if (isMongoConnected()) {
      try {
        const updated = await Banner_default.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) {
          return res.json(updated.toObject());
        }
      } catch (err) {
        console.warn("MongoDB update banner fallback to memory:", err);
      }
    }
    const item = (memoryStore.banners || []).find((b) => b._id === id);
    if (item) {
      Object.assign(item, updateData, { updatedAt: /* @__PURE__ */ new Date() });
      return res.json(item);
    }
    return res.status(404).json({ error: "Banner not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to update banner" });
  }
});
router8.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        await Banner_default.findByIdAndDelete(id);
      } catch (err) {
        console.warn("MongoDB delete banner fallback to memory:", err);
      }
    }
    if (memoryStore.banners) {
      const idx = memoryStore.banners.findIndex((b) => b._id === id);
      if (idx !== -1) {
        memoryStore.banners.splice(idx, 1);
      }
    }
    return res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to delete banner" });
  }
});
var banners_default = router8;

// backend/routes/commission.ts
import { Router as Router9 } from "express";

// backend/models/PlatformWithdrawal.ts
import mongoose14, { Schema as Schema12 } from "mongoose";
var PlatformWithdrawalSchema = new Schema12(
  {
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    adminEmail: { type: String, required: true },
    adminName: { type: String, default: "Super Admin" },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "Completed" }
  },
  { timestamps: true, collection: "platform_withdrawals" }
);
var PlatformWithdrawal_default = mongoose14.model("PlatformWithdrawal", PlatformWithdrawalSchema);

// backend/routes/commission.ts
var router9 = Router9();
async function getActiveCommissionRate() {
  if (isMongoConnected()) {
    try {
      const setting = await PlatformSetting_default.findOne({ key: "commission_settings" });
      if (setting && typeof setting.commissionRate === "number") {
        return setting.commissionRate;
      }
    } catch (err) {
      console.warn("MongoDB commission rate query notice:", err);
    }
  }
  return memoryStore.platformSettings?.commissionRate ?? 5;
}
router9.get("/", requireAdmin, requireSuperAdmin, async (_req, res) => {
  try {
    const activeRate = await getActiveCommissionRate();
    let ordersList = [];
    if (isMongoConnected()) {
      try {
        ordersList = await Order_default.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB order query error in commission route, using memoryStore:", err);
        ordersList = memoryStore.orders || [];
      }
    } else {
      ordersList = memoryStore.orders || [];
    }
    let calculatedTotalCommission = 0;
    const ledger = ordersList.map((ord) => {
      const orderTotal = Number(ord.total) || 0;
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : activeRate;
      const commissionAmount = typeof ord.commissionAmount === "number" && ord.commissionAmount > 0 ? ord.commissionAmount : Math.round(orderTotal * rate / 100);
      const sellerPayout = typeof ord.sellerPayout === "number" && ord.sellerPayout > 0 ? ord.sellerPayout : Math.max(0, orderTotal - commissionAmount);
      calculatedTotalCommission += commissionAmount;
      return {
        _id: String(ord._id || ord.orderNumber),
        orderNumber: ord.orderNumber || "AN-UNKNOWN",
        date: ord.createdAt ? new Date(ord.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        memberName: ord.memberName || "Valued Client",
        memberEmail: ord.memberEmail || "",
        total: orderTotal,
        commissionRate: rate,
        commissionAmount,
        sellerPayout,
        paymentMethod: ord.paymentMethod || "CARD",
        status: ord.status || "pending",
        commissionStatus: ord.commissionStatus || "credited"
      };
    });
    let withdrawalsList = [];
    if (isMongoConnected()) {
      try {
        withdrawalsList = await PlatformWithdrawal_default.find().sort({ date: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB withdrawal query error, using memoryStore:", err);
        withdrawalsList = memoryStore.platformWithdrawals || [];
      }
    } else {
      withdrawalsList = memoryStore.platformWithdrawals || [];
    }
    const mongoIds = new Set(withdrawalsList.map((w) => String(w._id)));
    for (const memW of memoryStore.platformWithdrawals || []) {
      if (!mongoIds.has(String(memW._id))) {
        withdrawalsList.push(memW);
      }
    }
    withdrawalsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalWithdrawn = withdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const runningBalance = Math.max(0, calculatedTotalCommission - totalWithdrawn);
    const formattedWithdrawals = withdrawalsList.map((w) => ({
      _id: String(w._id),
      amount: Number(w.amount) || 0,
      note: w.note || "",
      adminEmail: w.adminEmail || "superadmin@alikend.com",
      adminName: w.adminName || "Super Admin",
      date: w.date ? new Date(w.date).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      status: w.status || "Completed"
    }));
    return res.json({
      success: true,
      commissionRate: activeRate,
      totalCommissionEarned: calculatedTotalCommission,
      runningBalance,
      totalWithdrawn,
      totalOrdersCount: ledger.length,
      orders: ledger,
      withdrawals: formattedWithdrawals
    });
  } catch (err) {
    console.error("Commission fetch error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load commission data" });
  }
});
router9.patch("/settings", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { commissionRate } = req.body;
    const rateNum = Number(commissionRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return res.status(400).json({
        success: false,
        error: "Commission percentage must be a valid number between 0% and 100%"
      });
    }
    const roundedRate = Math.round(rateNum * 100) / 100;
    if (isMongoConnected()) {
      try {
        await PlatformSetting_default.findOneAndUpdate(
          { key: "commission_settings" },
          {
            commissionRate: roundedRate,
            updatedBy: req.admin?.email || "superadmin",
            updatedAt: /* @__PURE__ */ new Date()
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("MongoDB commission update error:", dbErr.message);
      }
    }
    if (!memoryStore.platformSettings) {
      memoryStore.platformSettings = {
        commissionRate: roundedRate,
        platformBalance: 0,
        totalCommissionEarned: 0,
        updatedAt: /* @__PURE__ */ new Date()
      };
    } else {
      memoryStore.platformSettings.commissionRate = roundedRate;
      memoryStore.platformSettings.updatedAt = /* @__PURE__ */ new Date();
    }
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Super Admin",
        email: req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system",
        details: `Updated Platform Global Commission Rate to ${roundedRate}%`
      },
      req
    );
    console.log(`\u{1F4B0} [COMMISSION UPDATE] Global commission rate set to ${roundedRate}% by ${req.admin?.email}`);
    return res.json({
      success: true,
      commissionRate: roundedRate,
      message: `Global platform commission rate successfully updated to ${roundedRate}%`
    });
  } catch (err) {
    console.error("Failed to update commission rate:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update commission settings" });
  }
});
router9.post("/withdraw", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const withdrawAmount = Math.round(Number(amount));
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Withdrawal amount must be a positive number greater than 0"
      });
    }
    let ordersList = [];
    if (isMongoConnected()) {
      try {
        ordersList = await Order_default.find().lean();
      } catch (err) {
        ordersList = memoryStore.orders || [];
      }
    } else {
      ordersList = memoryStore.orders || [];
    }
    const activeRate = await getActiveCommissionRate();
    let calculatedTotalCommission = 0;
    for (const ord of ordersList) {
      const orderTotal = Number(ord.total) || 0;
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : activeRate;
      const commissionAmount = typeof ord.commissionAmount === "number" && ord.commissionAmount > 0 ? ord.commissionAmount : Math.round(orderTotal * rate / 100);
      calculatedTotalCommission += commissionAmount;
    }
    let existingWithdrawals = [];
    if (isMongoConnected()) {
      try {
        existingWithdrawals = await PlatformWithdrawal_default.find().lean();
      } catch (err) {
        existingWithdrawals = memoryStore.platformWithdrawals || [];
      }
    } else {
      existingWithdrawals = memoryStore.platformWithdrawals || [];
    }
    const mongoIds = new Set(existingWithdrawals.map((w) => String(w._id)));
    for (const memW of memoryStore.platformWithdrawals || []) {
      if (!mongoIds.has(String(memW._id))) {
        existingWithdrawals.push(memW);
      }
    }
    const currentTotalWithdrawn = existingWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const currentRunningBalance = Math.max(0, calculatedTotalCommission - currentTotalWithdrawn);
    if (withdrawAmount > currentRunningBalance) {
      return res.status(400).json({
        success: false,
        error: `Withdrawal amount (\u20B9${withdrawAmount.toLocaleString("en-IN")}) cannot exceed current Platform Wallet Balance (\u20B9${currentRunningBalance.toLocaleString("en-IN")})`
      });
    }
    const adminEmail = req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system";
    const adminName = req.admin?.name || "Super Admin";
    const newRecord = {
      _id: `pw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount: withdrawAmount,
      note: typeof note === "string" ? note.trim() : "",
      adminEmail,
      adminName,
      date: /* @__PURE__ */ new Date(),
      status: "Completed"
    };
    if (isMongoConnected()) {
      try {
        const savedDoc = await PlatformWithdrawal_default.create({
          amount: withdrawAmount,
          note: newRecord.note,
          adminEmail,
          adminName,
          date: newRecord.date,
          status: "Completed"
        });
        newRecord._id = String(savedDoc._id);
      } catch (err) {
        console.warn("MongoDB PlatformWithdrawal create failed, using memoryStore:", err.message);
      }
    }
    if (!memoryStore.platformWithdrawals) {
      memoryStore.platformWithdrawals = [];
    }
    memoryStore.platformWithdrawals.unshift(newRecord);
    const newRunningBalance = currentRunningBalance - withdrawAmount;
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: adminName,
        email: adminEmail,
        details: `Platform Wallet Withdrawal logged: \u20B9${withdrawAmount.toLocaleString("en-IN")}${newRecord.note ? ` (Note: ${newRecord.note})` : ""}. New Platform Balance: \u20B9${newRunningBalance.toLocaleString("en-IN")}`
      },
      req
    );
    console.log(`\u{1F4B8} [PLATFORM WITHDRAWAL] \u20B9${withdrawAmount} withdrawn by ${adminEmail}. Note: ${newRecord.note || "None"}`);
    return res.json({
      success: true,
      message: `Successfully logged withdrawal of \u20B9${withdrawAmount.toLocaleString("en-IN")}`,
      withdrawal: {
        ...newRecord,
        date: newRecord.date.toISOString()
      },
      runningBalance: newRunningBalance,
      totalCommissionEarned: calculatedTotalCommission
    });
  } catch (err) {
    console.error("Platform withdrawal error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process withdrawal" });
  }
});
var commission_default = router9;

// backend/app.ts
dotenv.config({ override: true });
connectMongoDB().then(() => {
  startOrderAutomationJob(3e4);
}).catch((err) => {
  console.warn("MongoDB initial connection error:", err?.message || err);
  startOrderAutomationJob(3e4);
});
var app = express();
app.use(cors());
app.use(express.json());
app.get(["/api/health", "/health", "/healthz"], (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", userAuth_default);
app.use(["/api/sellers", "/api/seller"], sellerPortal_default);
app.get("/api/products", async (_req, res) => {
  try {
    let prods = [];
    if (isMongoConnected()) {
      try {
        prods = await Product_default.find().sort({ createdAt: -1 });
      } catch (e) {
        console.warn("MongoDB fetch storefront products fallback:", e);
      }
    }
    if (!prods || prods.length === 0) {
      prods = memoryStore.products;
    }
    const sanitized = prods.map((p) => {
      const doc = p && typeof p.toObject === "function" ? p.toObject() : { ...p };
      return {
        ...doc,
        sellerId: doc.sellerId || "admin",
        sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : doc.brand || "Atelier")
      };
    });
    return res.json(sanitized);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/banners", async (_req, res) => {
  try {
    let banners = [];
    if (isMongoConnected()) {
      try {
        banners = await Banner_default.find({ active: true }).sort({ order: 1, createdAt: 1 });
      } catch (e) {
        console.warn("MongoDB fetch storefront banners fallback:", e);
      }
    }
    if (!banners || banners.length === 0) {
      banners = (memoryStore.banners || []).filter((b) => b.active);
    }
    const sanitized = (banners || []).map((b) => {
      const doc = b && typeof b.toObject === "function" ? b.toObject() : { ...b };
      return doc;
    });
    return res.json(sanitized);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/orders", async (req, res) => {
  try {
    const {
      id,
      items = [],
      subtotal = 0,
      tax = 0,
      discount = 0,
      delivery = 0,
      total = 0,
      status = "pending",
      address = {},
      paymentMethod = "CARD",
      trackingStep = 1
    } = req.body;
    const orderNumber = id?.startsWith("ALK-") || id?.startsWith("AN-") ? id : `ALK-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const memberName = address?.name || "Valued Client";
    const memberEmail = address?.email || req.body.memberEmail || "";
    const formattedItems = (items || []).map((it) => ({
      productId: it.product?._id || it.product?.id || null,
      name: it.product?.name || it.name || "Luxury Product",
      qty: it.quantity || it.qty || 1,
      price: it.product?.price || it.price || 0,
      image: it.product?.image || it.image || "",
      color: it.selectedColor || it.color || "",
      size: it.selectedSize || it.size || ""
    }));
    const orderTotal = Number(total) || 0;
    const activeCommissionRate = await getActiveCommissionRate();
    const commissionAmount = Math.round(orderTotal * activeCommissionRate / 100);
    const sellerPayout = Math.max(0, orderTotal - commissionAmount);
    let createdDoc = null;
    const nowApprovedAt = /* @__PURE__ */ new Date();
    if (isMongoConnected()) {
      try {
        createdDoc = await Order_default.create({
          orderNumber,
          memberName,
          memberEmail,
          total: orderTotal,
          status: "processing",
          // Automatically approved on confirmed payment
          items: formattedItems,
          address: {
            name: address.name || "",
            phone: address.phone || "",
            street: address.street || "",
            city: address.city || "",
            state: address.state || "",
            zip: address.zip || ""
          },
          paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
          subtotal: Number(subtotal) || 0,
          tax: Number(tax) || 0,
          discount: Number(discount) || 0,
          delivery: Number(delivery) || 0,
          trackingStep: 2,
          // Step 2: Approved / Processing
          approvedAt: nowApprovedAt,
          commissionRate: activeCommissionRate,
          commissionAmount,
          sellerPayout,
          commissionStatus: "credited"
        });
        console.log(`\u2728 [ORDER PERSISTED & APPROVED] Order ${orderNumber} created and approved in alikendshop.orders for ${memberName} (Commission: \u20B9${commissionAmount} @ ${activeCommissionRate}%)`);
        try {
          await PlatformSetting_default.findOneAndUpdate(
            { key: "commission_settings" },
            {
              $inc: {
                platformBalance: commissionAmount,
                totalCommissionEarned: commissionAmount
              }
            },
            { upsert: true }
          );
        } catch (setErr) {
          console.warn("MongoDB PlatformSetting balance update notice:", setErr);
        }
      } catch (dbErr) {
        console.warn("MongoDB create order fallback to in-memory:", dbErr);
      }
    }
    if (memoryStore.platformSettings) {
      memoryStore.platformSettings.platformBalance += commissionAmount;
      memoryStore.platformSettings.totalCommissionEarned += commissionAmount;
    }
    const memoryOrder = {
      _id: createdDoc ? String(createdDoc._id) : `ord_${Date.now()}`,
      orderNumber,
      memberName,
      memberEmail,
      total: orderTotal,
      status: "processing",
      trackingStep: 2,
      approvedAt: nowApprovedAt,
      commissionRate: activeCommissionRate,
      commissionAmount,
      sellerPayout,
      commissionStatus: "credited",
      paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.orders.unshift(memoryOrder);
    return res.status(201).json({
      success: true,
      order: createdDoc || {
        ...memoryOrder,
        items: formattedItems,
        address,
        paymentMethod,
        subtotal,
        tax,
        discount,
        delivery
      }
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: err.message || "Failed to place order" });
  }
});
app.get("/api/orders/latest", async (_req, res) => {
  try {
    await progressOrderStatuses().catch(() => {
    });
    if (isMongoConnected()) {
      const latest = await Order_default.findOne().sort({ createdAt: -1 }).lean();
      if (latest) return res.json(latest);
    }
    const latestMem = memoryStore.orders[0];
    return res.json(latestMem || null);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/orders/user", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.json([]);
    }
    await progressOrderStatuses().catch(() => {
    });
    if (isMongoConnected()) {
      try {
        const userOrders = await Order_default.find({
          memberEmail: { $regex: new RegExp(`^${email}$`, "i") }
        }).sort({ createdAt: -1 }).lean();
        const formatted = userOrders.map((o) => ({
          id: o.orderNumber,
          date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          items: (o.items || []).map((it) => ({
            product: {
              id: it.productId || 1,
              name: it.name,
              price: it.price,
              image: it.image || ""
            },
            quantity: it.qty || 1,
            selectedColor: it.color || "",
            selectedSize: it.size || ""
          })),
          subtotal: o.subtotal || 0,
          tax: o.tax || 0,
          discount: o.discount || 0,
          delivery: o.delivery || 0,
          total: o.total || 0,
          status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : "Pending",
          address: o.address || {},
          paymentMethod: o.paymentMethod || "CARD",
          trackingStep: o.trackingStep || 1,
          memberEmail: o.memberEmail
        }));
        return res.json(formatted);
      } catch (dbErr) {
        console.warn("MongoDB user orders fetch fallback:", dbErr);
      }
    }
    const filteredMem = memoryStore.orders.filter((o) => o.memberEmail && o.memberEmail.toLowerCase() === email).map((o) => ({
      id: o.orderNumber,
      date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      items: (o.items || []).map((it) => ({
        product: {
          id: it.productId || 1,
          name: it.name,
          price: it.price,
          image: it.image || ""
        },
        quantity: it.qty || 1,
        selectedColor: it.color || "",
        selectedSize: it.size || ""
      })),
      subtotal: o.subtotal || 0,
      tax: o.tax || 0,
      discount: o.discount || 0,
      delivery: o.delivery || 0,
      total: o.total || 0,
      status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : "Pending",
      address: o.address || {},
      paymentMethod: o.paymentMethod || "CARD",
      trackingStep: o.trackingStep || 1,
      memberEmail: o.memberEmail
    }));
    return res.json(filteredMem);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch user orders" });
  }
});
app.use("/api/admin", auth_default);
app.use("/api/admin/products", products_default);
app.use("/api/admin/orders", orders_default);
app.use("/api/admin/sellers", sellers_default);
app.use("/api/admin/customers", customers_default);
app.use("/api/admin/banners", banners_default);
app.use("/api/admin/commission", commission_default);
app.post("/api/gemini/engine", async (req, res) => {
  try {
    const { mode, prompt, orderVolume, materialRarity, customizationText, lookbookTheme } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required on the server." });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    let systemInstruction = "";
    let userPrompt = prompt || "Introduce yourself as the ultimate Alike-ND Sovereign AI Engine.";
    if (mode === "concierge") {
      systemInstruction = `You are the elite AI concierge for Alike-ND. Your tone must be sophisticated, welcoming, and highly professional. Help wholesale buyers with their inquiries, guide them through our luxury collections (like silk, premium knitwear, and bespoke tailoring), and explain our Minimum Order Quantity (MOQ) process. Do not use casual slang; maintain the prestige of a high-end fashion guild. Respond in beautifully formatted markdown with clean bullet points and elegant structure.`;
    } else if (mode === "analyst") {
      systemInstruction = `You are an expert wholesale business analyst for Alike-ND. Your job is to process custom design requests from corporate clients. Evaluate if their requested customization matches our luxury atelier standards. Help calculate bulk pricing tiers based on order volume and material rarity (e.g., Cashmere, Egyptian Cotton), and politely inform them about our production timelines. Be realistic, numerical, precise, and professional. Show cost estimation equations or clear breakdowns. Respond in beautifully structured markdown.`;
      userPrompt = `Process Custom Design Request:
- Customization Details: ${customizationText || "Standard monogram embroidery on cuffs"}
- Target Order Volume: ${orderVolume || 100} units
- Chosen Material / Fabric Rarity: ${materialRarity || "Cashmere"}
- Additional Client Instructions: ${prompt || "None"}`;
    } else if (mode === "copywriter") {
      systemInstruction = `You are the chief creative copywriter for Alike-ND Sovereign Luxury Guild. Write breathtaking, high-end descriptions for our seasonal lookbooks. Focus heavily on heritage craftsmanship, sustainable premium textiles, and the exclusive nature of our wholesale atelier. Use elegant, typography-focused vocabulary that appeals to international fashion houses. Respond in beautiful, evocative, and poetically structured markdown.`;
      userPrompt = `Draft seasonal Lookbook Copy for:
- Collection Theme/Name: ${lookbookTheme || "Autumnal Mist Atelier"}
- Additional Copy Directives: ${prompt || "Emphasize fluid drapes and hand-woven stitching"}`;
    } else {
      systemInstruction = `You are the ultimate AI Engine for Alike-ND \u2014 Sovereign Luxury & Wholesale Atelier Guild. 
Your core operational parameters are:
1. TONE: Absolute refinement, elite, and business-focused (strictly no casual language).
2. CLIENTS: High-end international fashion buyers, boutiques, and corporate retail brands.
3. KNOWLEDGE: Expert in heritage craftsmanship, premium fabrics (Mulberry Silk, Cashmere, Velvet), and bulk B2B ordering tiers (MOQ).
4. MISSION: Professionally answer wholesale inquiries, generate high-end lookbook copy, and analyze custom atelier requests based on input metrics.`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    return res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini Engine error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during generation." });
  }
});
var app_default = app;
export {
  app_default as default
};
//# sourceMappingURL=index.js.map
