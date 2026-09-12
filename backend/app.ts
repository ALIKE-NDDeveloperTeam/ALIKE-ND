import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import { connectMongoDB, isMongoConnected, memoryStore } from "./store";
import { startOrderAutomationJob, progressOrderStatuses } from "./services/orderAutomation";
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

app.use(cors());
app.use(express.json());

// Health check endpoints for ingress and container probes
app.get(["/api/health", "/health", "/healthz"], (_req, res) => {
  res.json({ status: "ok" });
});

// Public User Authentication & Registration Routes (MongoDB 'users' collection)
app.use("/api/auth", userAuthRoutes);

// Public & Authenticated Multi-Seller Marketplace Routes (Registration, Login, My Products)
app.use("/api/sellers", sellerPortalRoutes);

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
      return doc;
    });
    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public Orders Placement Route (Persists customer orders to MongoDB 'orders' collection)
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
      trackingStep = 1,
    } = req.body;

    const orderNumber = id?.startsWith("ALK-") || id?.startsWith("AN-") ? id : `ALK-${Math.floor(100000 + Math.random() * 900000)}`;
    const memberName = address?.name || "Valued Client";
    const memberEmail = address?.email || req.body.memberEmail || "";

    // Format items for storage
    const formattedItems = (items || []).map((it: any) => ({
      productId: it.product?._id || it.product?.id || null,
      name: it.product?.name || it.name || "Luxury Product",
      qty: it.quantity || it.qty || 1,
      price: it.product?.price || it.price || 0,
      image: it.product?.image || it.image || "",
      color: it.selectedColor || it.color || "",
      size: it.selectedSize || it.size || "",
    }));

    const orderTotal = Number(total) || 0;
    const activeCommissionRate = await getActiveCommissionRate();
    const commissionAmount = Math.round((orderTotal * activeCommissionRate) / 100);
    const sellerPayout = Math.max(0, orderTotal - commissionAmount);

    let createdDoc: any = null;

    const nowApprovedAt = new Date();

    if (isMongoConnected()) {
      try {
        createdDoc = await Order.create({
          orderNumber,
          memberName,
          memberEmail,
          total: orderTotal,
          status: "processing", // Automatically approved on confirmed payment
          items: formattedItems,
          address: {
            name: address.name || "",
            phone: address.phone || "",
            street: address.street || "",
            city: address.city || "",
            state: address.state || "",
            zip: address.zip || "",
          },
          paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
          subtotal: Number(subtotal) || 0,
          tax: Number(tax) || 0,
          discount: Number(discount) || 0,
          delivery: Number(delivery) || 0,
          trackingStep: 2, // Step 2: Approved / Processing
          approvedAt: nowApprovedAt,
          commissionRate: activeCommissionRate,
          commissionAmount,
          sellerPayout,
          commissionStatus: "credited",
        });
        console.log(`✨ [ORDER PERSISTED & APPROVED] Order ${orderNumber} created and approved in alikendshop.orders for ${memberName} (Commission: ₹${commissionAmount} @ ${activeCommissionRate}%)`);

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
      } catch (dbErr) {
        console.warn("MongoDB create order fallback to in-memory:", dbErr);
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

// Get most recent order details
app.get("/api/orders/latest", async (_req, res) => {
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

// GET /api/orders/user?email=... - Fetch orders specifically for the logged-in customer
app.get("/api/orders/user", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.json([]);
    }

    // Trigger real-time progression so user sees freshest status on refresh
    await progressOrderStatuses().catch(() => {});

    if (isMongoConnected()) {
      try {
        const userOrders = await Order.find({
          memberEmail: { $regex: new RegExp(`^${email}$`, "i") }
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

// MongoDB-backed Admin Panel Routes
app.use("/api/admin", authRoutes);          // POST /api/admin/login
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/sellers", sellerRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/commission", commissionRoutes);

// API Route for Gemini AI Sovereign Engine
app.post("/api/gemini/engine", async (req, res) => {
  try {
    const { mode, prompt, orderVolume, materialRarity, customizationText, lookbookTheme } = req.body;
    
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
