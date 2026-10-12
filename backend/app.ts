import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

import authRoutes from "./routes/auth";
import userAuthRoutes from "./routes/userAuth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import sellerRoutes from "./routes/sellers";
import sellerPortalRoutes from "./routes/sellerPortal";
import customerRoutes from "./routes/customers";
import bannerRoutes from "./routes/banners";
import commissionRoutes, { getActiveCommissionRate } from "./routes/commission";
import flashSaleRoutes from "./routes/flashSale";
import categoryRoutes from "./routes/categories";
import databaseHubRoutes from "./routes/databaseHub";
import customerCareRoutes from "./routes/customerCare";
import { requireAdmin, requireCustomerAuth, CustomerAuthedRequest } from "./middleware/auth";
import { connectMongoDB, isMongoConnected, memoryStore } from "./store";
import { startOrderAutomationJob, progressOrderStatuses } from "./services/orderAutomation";
import { dispatchOrderNotificationEmails } from "./services/mailer";
import Product from "./models/Product";
import Order from "./models/Order";
import Banner from "./models/Banner";
import PlatformSetting from "./models/PlatformSetting";

dotenv.config({ override: true });

// Initialize MongoDB connection safely with graceful fallback
connectMongoDB()
  .then(() => {
    // Start background order progression scheduler
    startOrderAutomationJob(30000);
  })
  .catch((err) => {
    console.warn("MongoDB initial connection error:", err?.message || err);
    startOrderAutomationJob(30000);
  });

const app = express();

// Configurable CORS origins with fallback to local development defaults
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));
if (process.env.APP_URL) {
  const cleanAppUrl = process.env.APP_URL.trim();
  if (cleanAppUrl && !allowedOrigins.includes(cleanAppUrl)) {
    allowedOrigins.push(cleanAppUrl);
  }
}

const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return true;
  const clean = origin.replace(/\/$/, "").toLowerCase();

  // Allow localhost / loopback on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
    return true;
  }

  // Allow all Google Cloud Run dev and shared preview environments (*.run.app)
  if (/^https?:\/\/.*\.run\.app$/.test(clean)) {
    return true;
  }

  // Allow Google AI Studio iframe domains
  if (/^https?:\/\/.*\.googleusercontent\.com$/.test(clean) || /^https?:\/\/.*\.google\.com$/.test(clean)) {
    return true;
  }

  // Allow all Vercel deployments (*.vercel.app)
  if (/^https?:\/\/.*\.vercel\.app$/.test(clean)) {
    return true;
  }

  // Allow any explicitly configured origin
  return allowedOrigins.some((allowed) => allowed.replace(/\/$/, "").toLowerCase() === clean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, same-origin) or matching origins
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }
      // Silently disallow untrusted third-party origins without throwing a 500 error
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// Health check endpoints for ingress and container probes
app.get(["/api/health", "/health", "/healthz"], (_req, res) => {
  res.json({ status: "ok" });
});

// Public User Authentication & Registration Routes (MongoDB 'users' collection)
app.use("/api/auth", userAuthRoutes);

// Public & Authenticated Multi-Seller Marketplace Routes (Registration, Login, My Products, Wallet)
app.use(["/api/sellers", "/api/seller"], sellerPortalRoutes);

// Public Storefront Products Route (Synced with Super Admin / Admin catalog)
app.get("/api/products", async (_req, res) => {
  try {
    let prods: any[] = [];
    if (isMongoConnected()) {
      try {
        prods = await Product.find().sort({ createdAt: -1 });
      } catch (e) {
        console.warn("MongoDB fetch storefront products fallback:", e);
      }
    }
    if (!prods || prods.length === 0) {
      prods = memoryStore.products;
    }
    const sanitized = prods.map((p: any) => {
      const doc = p && typeof p.toObject === "function" ? p.toObject() : { ...p };
      return {
        ...doc,
        sellerId: doc.sellerId || "admin",
        sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : (doc.brand || "Atelier")),
      };
    });
    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public Hero Carousel Banners Route (Dynamic banners sorted by order, active only)
app.get("/api/banners", async (_req, res) => {
  try {
    let banners: any[] = [];
    if (isMongoConnected()) {
      try {
        banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: 1 });
      } catch (e) {
        console.warn("MongoDB fetch storefront banners fallback:", e);
      }
    }
    if (!banners || banners.length === 0) {
      banners = (memoryStore.banners || []).filter((b) => b.active);
    }
    const sanitized = (banners || []).map((b: any) => {
      const doc = b && typeof b.toObject === "function" ? b.toObject() : { ...b };
      let finalImg = doc.imageUrl || "";
      if (!finalImg || finalImg.includes("photo-1580907115718-4c8abd021ae5")) {
        finalImg = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80";
      }
      return {
        ...doc,
        imageUrl: finalImg,
        linkUrl: doc.linkUrl || doc.link || "",
        link: doc.link || doc.linkUrl || "",
        isActive: doc.active !== false && doc.isActive !== false,
        active: doc.active !== false && doc.isActive !== false,
        isCenterFeatured: Boolean(doc.isCenterFeatured),
      };
    });
    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Rate limiter to prevent order spam and email flood (Task 5: max 20 requests per 15 minutes per IP)
const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many order requests from this IP address. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Orders Placement Route (Persists customer orders to MongoDB 'orders' collection)
app.post("/api/orders", orderRateLimiter, async (req, res) => {
  try {
    const {
      items = [],
      address = {},
      paymentMethod = "CARD",
      memberEmail: rawMemberEmail,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one valid item." });
    }

    if (!address || !address.name || !address.street || !address.city) {
      return res.status(400).json({ error: "Complete delivery address is required." });
    }

    // Problem #26: Securely generate collision-resistant order ID on server (do not trust client ID)
    const orderNumber = `ALK-${Date.now().toString().slice(-6)}${crypto.randomInt(100, 999)}`;
    const memberName = String(address.name || "Valued Client").trim();
    const memberEmail = String(address.email || rawMemberEmail || "").trim().toLowerCase();

    // Look up real product prices from DB where possible (Problem #6)
    const productIds = items
      .map((it: any) => it.product?._id || it.product?.id || it.productId)
      .filter(Boolean);

    let dbProductMap = new Map<string, any>();
    if (isMongoConnected() && productIds.length > 0) {
      try {
        const found = await Product.find({
          $or: [
            { _id: { $in: productIds.filter((p: any) => typeof p === "string" && p.length === 24) } },
            { id: { $in: productIds.map((p: any) => Number(p)).filter((n: number) => !isNaN(n)) } },
          ],
        }).lean();
        for (const p of found) {
          if (p._id) dbProductMap.set(String(p._id), p);
          if (p.id) dbProductMap.set(String(p.id), p);
        }
      } catch (e) {
        console.warn("Product price verification warning:", e);
      }
    }

    // Format items with verified or trusted positive price
    let calculatedSubtotal = 0;
    const formattedItems = items.map((it: any) => {
      const pid = it.product?._id || it.product?.id || it.productId || null;
      const matched = pid ? dbProductMap.get(String(pid)) : null;
      const verifiedPrice = matched ? Number(matched.price) : Math.max(0, Number(it.product?.price || it.price || 0));
      const qty = Math.max(1, Math.floor(Number(it.quantity || it.qty || 1)));
      calculatedSubtotal += verifiedPrice * qty;

      return {
        productId: pid,
        name: String(matched?.name || it.product?.name || it.name || "Luxury Product").trim(),
        qty,
        price: verifiedPrice,
        image: it.product?.image || it.image || matched?.image || "",
        color: it.selectedColor || it.color || "",
        size: it.selectedSize || it.size || "",
      };
    });

    const calculatedTax = Math.round(calculatedSubtotal * 0.18);
    const calculatedDelivery = calculatedSubtotal > 50000 ? 0 : 250;
    const calculatedDiscount = 0;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedDelivery - calculatedDiscount;

    const subtotal = calculatedSubtotal;
    const tax = calculatedTax;
    const delivery = calculatedDelivery;
    const discount = calculatedDiscount;
    const orderTotal = calculatedTotal;

    const activeCommissionRate = await getActiveCommissionRate();
    const commissionAmount = Math.round((calculatedTotal * activeCommissionRate) / 100);
    const sellerPayout = Math.max(0, calculatedTotal - commissionAmount);

    let createdDoc: any = null;
    const nowApprovedAt = new Date();

    if (isMongoConnected()) {
      try {
        createdDoc = await Order.create({
          orderNumber,
          memberName,
          memberEmail,
          total: calculatedTotal,
          status: "processing", // Automatically approved on confirmed payment
          items: formattedItems,
          address: {
            name: String(address.name || ""),
            phone: String(address.phone || ""),
            street: String(address.street || ""),
            city: String(address.city || ""),
            state: String(address.state || ""),
            zip: String(address.zip || ""),
          },
          paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          discount: 0,
          delivery: calculatedDelivery,
          trackingStep: 2, // Step 2: Approved / Processing
          approvedAt: nowApprovedAt,
          commissionRate: activeCommissionRate,
          commissionAmount,
          sellerPayout,
          commissionStatus: "credited",
        });
        console.log(`✨ [ORDER PERSISTED & APPROVED] Order ${orderNumber} created in alikendshop.orders for ${memberName}`);

        // Credit to platform balance in MongoDB
        try {
          await PlatformSetting.findOneAndUpdate(
            { key: "commission_settings" },
            {
              $inc: {
                platformBalance: commissionAmount,
                totalCommissionEarned: commissionAmount,
              },
            },
            { upsert: true }
          );
        } catch (setErr) {
          console.warn("MongoDB PlatformSetting balance update notice:", setErr);
        }
      } catch (dbErr: any) {
        console.error("MongoDB order persistence error:", dbErr);
        if (process.env.NODE_ENV === "production") {
          return res.status(500).json({ error: "Failed to persist order to database. Please try again." });
        }
      }
    }

    // Update in-memory platform wallet
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
      status: "processing" as const,
      trackingStep: 2,
      approvedAt: nowApprovedAt,
      commissionRate: activeCommissionRate,
      commissionAmount,
      sellerPayout,
      commissionStatus: "credited" as const,
      paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
      createdAt: new Date(),
    };

    memoryStore.orders.unshift(memoryOrder);

    // Asynchronously dispatch real-time Seller/Admin Order Alert and Customer Confirmation emails
    dispatchOrderNotificationEmails({
      orderNumber,
      id: orderNumber,
      memberName,
      memberEmail,
      total: orderTotal,
      items: formattedItems,
      address,
      paymentMethod,
      subtotal,
      tax,
      discount,
      delivery,
      sellerPayout,
      commissionAmount,
    }).catch((mailErr) => {
      console.warn("Order notification email dispatch notice:", mailErr);
    });

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
        delivery,
      },
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: err.message || "Failed to place order" });
  }
});

// Dedicated Real-time Order Notification Dispatch Route (Protected with requireAdmin to prevent public email spam abuse)
app.post("/api/orders/notify", requireAdmin as any, async (req, res) => {
  try {
    const result = await dispatchOrderNotificationEmails(req.body);
    return res.json(result);
  } catch (err: any) {
    console.error("Manual order notify error:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch order notification" });
  }
});

// Get most recent order details (Protected with requireAdmin to prevent customer data leak)
app.get("/api/orders/latest", requireAdmin as any, async (_req, res) => {
  try {
    await progressOrderStatuses().catch(() => {});
    if (isMongoConnected()) {
      const latest = await Order.findOne().sort({ createdAt: -1 }).lean();
      if (latest) return res.json(latest);
    }
    const latestMem = memoryStore.orders[0];
    return res.json(latestMem || null);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/user - Fetch orders specifically for the logged-in customer (Protected with requireCustomerAuth to prevent IDOR)
app.get("/api/orders/user", requireCustomerAuth as any, async (req: CustomerAuthedRequest, res) => {
  try {
    const verifiedEmail = req.userEmail || req.user?.email;
    if (!verifiedEmail) {
      return res.status(401).json({ success: false, error: "Authentication required to access customer orders" });
    }

    const email = verifiedEmail.toLowerCase().trim();

    // Trigger real-time progression so user sees freshest status on refresh
    await progressOrderStatuses().catch(() => {});

    if (isMongoConnected()) {
      try {
        const userOrders = await Order.find({
          memberEmail: email,
        }).sort({ createdAt: -1 }).lean();

        const formatted = userOrders.map((o: any) => ({
          id: o.orderNumber,
          date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          items: (o.items || []).map((it: any) => ({
            product: {
              id: it.productId || 1,
              name: it.name,
              price: it.price,
              image: it.image || "",
            },
            quantity: it.qty || 1,
            selectedColor: it.color || "",
            selectedSize: it.size || "",
          })),
          subtotal: o.subtotal || 0,
          tax: o.tax || 0,
          discount: o.discount || 0,
          delivery: o.delivery || 0,
          total: o.total || 0,
          status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : "Pending",
          address: o.address || {},
          paymentMethod: o.paymentMethod || "CARD",
          trackingStep: o.trackingStep || 1,
          memberEmail: o.memberEmail,
        }));
        return res.json(formatted);
      } catch (dbErr) {
        console.warn("MongoDB user orders fetch fallback:", dbErr);
      }
    }

    const filteredMem = (memoryStore.orders as any[])
      .filter((o: any) => o.memberEmail && o.memberEmail.toLowerCase() === email)
      .map((o: any) => ({
        id: o.orderNumber,
        date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        items: (o.items || []).map((it: any) => ({
          product: {
            id: it.productId || 1,
            name: it.name,
            price: it.price,
            image: it.image || "",
          },
          quantity: it.qty || 1,
          selectedColor: it.color || "",
          selectedSize: it.size || "",
        })),
        subtotal: o.subtotal || 0,
        tax: o.tax || 0,
        discount: o.discount || 0,
        delivery: o.delivery || 0,
        total: o.total || 0,
        status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : "Pending",
        address: o.address || {},
        paymentMethod: o.paymentMethod || "CARD",
        trackingStep: o.trackingStep || 1,
        memberEmail: o.memberEmail,
      }));
    return res.json(filteredMem);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch user orders" });
  }
});

// Public Flash Sale Route
app.use("/api/flash-sale", flashSaleRoutes);

// MongoDB-backed Admin Panel Routes
app.use("/api/admin", authRoutes);          // POST /api/admin/login
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/sellers", sellerRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/commission", commissionRoutes);
app.use("/api/admin/flash-sale", flashSaleRoutes);
app.use("/api/admin/database-hub", databaseHubRoutes);
app.use("/api/admin/customer-care", customerCareRoutes);
app.use(["/api/hotlines", "/api/support"], customerCareRoutes);
app.use(["/api/categories", "/api/admin/categories"], categoryRoutes);

// Track Gemini request counts per IP to prevent quota starvation
const geminiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

// API Route for Gemini AI Sovereign Engine (Rate limited and prompt length validated)
app.post("/api/gemini/engine", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
    const now = Date.now();
    const rateData = geminiRateLimitMap.get(clientIp);

    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= 20) {
        return res.status(429).json({
          error: "Rate limit exceeded for AI Sovereign Engine. Please wait a few moments before trying again.",
        });
      }
      rateData.count += 1;
    } else {
      geminiRateLimitMap.set(clientIp, { count: 1, resetAt: now + 60000 }); // 20 requests per minute
    }

    const { mode, prompt, orderVolume, materialRarity, customizationText, lookbookTheme } = req.body;
    
    // Validate maximum input lengths to prevent prompt injection or billing exhaustion
    if (prompt && String(prompt).length > 2000) {
      return res.status(400).json({ error: "Prompt exceeds maximum allowed length of 2000 characters." });
    }
    if (customizationText && String(customizationText).length > 1000) {
      return res.status(400).json({ error: "Customization text exceeds maximum length of 1000 characters." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required on the server." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
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
      systemInstruction = `You are the ultimate AI Engine for Alike-ND — Sovereign Luxury & Wholesale Atelier Guild. 
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
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error("Gemini Engine error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during generation." });
  }
});

export default app;
