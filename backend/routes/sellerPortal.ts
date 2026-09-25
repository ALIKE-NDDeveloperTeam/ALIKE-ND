import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller, { ISeller, SellerStatus } from "../models/Seller";
import Product from "../models/Product";
import Order from "../models/Order";
import SellerWithdrawal from "../models/SellerWithdrawal";
import { isMongoConnected, memoryStore } from "../store";
import { JWT_SECRET, getJwtSecret } from "../middleware/auth";

export interface SellerAuthedRequest extends Request {
  sellerId?: string;
  seller?: {
    _id: string;
    shopName: string;
    storefront: string;
    ownerName: string;
    email: string;
    mobileNumber: string;
    businessAddress: string;
    status: SellerStatus;
    listingsCount: number;
  };
}

// Authentication middleware to protect seller dashboard & seller product management
export async function requireSellerAuth(req: SellerAuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(503).json({
      success: false,
      error: "Authentication service is temporarily misconfigured. Please contact support.",
    });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required: Please log in to your seller account.",
    });
  }

  const token = header.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired seller session token. Please sign in again.",
    });
  }

  if (!payload || !payload.sellerId || payload.role !== "seller") {
    return res.status(403).json({
      success: false,
      error: "Access denied: Seller authentication token required.",
    });
  }

  // 1. Check MongoDB
  if (isMongoConnected()) {
    try {
      const sellerDoc = await Seller.findById(payload.sellerId);
      if (sellerDoc) {
        if (sellerDoc.status !== "approved") {
          return res.status(403).json({
            success: false,
            status: sellerDoc.status,
            error:
              sellerDoc.status === "pending"
                ? "Your seller application is pending administrator approval."
                : `Your seller account is ${sellerDoc.status}. Only approved sellers can manage products.`,
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
          listingsCount: sellerDoc.listingsCount || 0,
        };
        return next();
      }
    } catch (e: any) {
      console.warn("MongoDB seller lookup failed, trying memory store:", e?.message);
    }
  }

  // 2. Check in-memory store
  const memSeller = (memoryStore.sellers || []).find(
    (s) => s._id === payload.sellerId || (s.email && s.email.toLowerCase() === (payload.email || "").toLowerCase())
  );

  if (memSeller) {
    if (memSeller.status !== "approved") {
      return res.status(403).json({
        success: false,
        status: memSeller.status,
        error:
          memSeller.status === "pending"
            ? "Your seller application is pending administrator approval."
            : `Your seller account is ${memSeller.status}. Only approved sellers can manage products.`,
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
      listingsCount: memSeller.listingsCount || 0,
    };
    return next();
  }

  return res.status(403).json({
    success: false,
    error: "Access denied: Seller account not found.",
  });
}

const router = Router();

// ==========================================
// 0. GET /api/sellers/status-check (Public)
// ==========================================
router.get("/status-check", async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    if (!email) {
      return res.json({ isSeller: false, status: null });
    }

    if (isMongoConnected()) {
      try {
        const seller = await Seller.findOne({ email });
        if (seller) {
          return res.json({
            isSeller: seller.status === "approved",
            status: seller.status,
            shopName: seller.shopName,
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
        shopName: memSeller.shopName,
      });
    }

    return res.json({ isSeller: false, status: null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to check seller status" });
  }
});

// ==========================================
// 1. POST /api/sellers/register (Public)
// ==========================================
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      shopName,
      ownerName,
      mobileNumber,
      email,
      password,
      businessAddress,
      panNumber,
      gstin,
      bankAccountHolderName,
      bankAccountNumber,
      bankIFSC,
      bankName,
    } = req.body;

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

    // KYC Field Validations
    if (!panNumber || !panNumber.trim()) {
      return res.status(400).json({ error: "PAN number is required for seller verification." });
    }
    const cleanPan = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      return res.status(400).json({ error: "Invalid PAN format. Expected format: ABCDE1234F (10 characters: 5 letters, 4 digits, 1 letter)." });
    }

    let cleanGstin = "";
    if (gstin && gstin.trim()) {
      cleanGstin = gstin.trim().toUpperCase();
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(cleanGstin)) {
        return res.status(400).json({ error: "Invalid GSTIN format. Expected format: 22ABCDE1234F1Z5 (15 characters)." });
      }
    }

    if (!bankAccountHolderName || !bankAccountHolderName.trim()) {
      return res.status(400).json({ error: "Bank account holder name is required." });
    }
    if (!bankAccountNumber || !bankAccountNumber.trim()) {
      return res.status(400).json({ error: "Bank account number is required." });
    }
    if (!bankIFSC || !bankIFSC.trim()) {
      return res.status(400).json({ error: "Bank IFSC code is required." });
    }
    const cleanIfsc = bankIFSC.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(cleanIfsc)) {
      return res.status(400).json({ error: "Invalid IFSC code format. Expected format: SBIN0001234 (11 characters: 4 letters, '0', 6 alphanumeric)." });
    }

    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ error: "Bank name is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanShopName = shopName.trim();
    const cleanOwnerName = ownerName.trim();
    const cleanMobile = mobileNumber.trim();
    const cleanAddress = businessAddress.trim();
    const cleanAccountHolder = bankAccountHolderName.trim();
    const cleanAccountNumber = bankAccountNumber.trim();
    const cleanBank = bankName.trim();

    // Check if seller email already exists
    if (isMongoConnected()) {
      try {
        const existing = await Seller.findOne({
          $or: [{ email: cleanEmail }, { ownerEmail: cleanEmail }],
        });
        if (existing) {
          return res.status(409).json({
            error: "A seller account or application with this email address already exists.",
          });
        }
      } catch (err) {
        console.warn("MongoDB check existing seller error:", err);
      }
    }

    const memExisting = (memoryStore.sellers || []).find(
      (s) => (s.email && s.email.toLowerCase() === cleanEmail) || (s.ownerEmail && s.ownerEmail.toLowerCase() === cleanEmail)
    );
    if (memExisting) {
      return res.status(409).json({
        error: "A seller account or application with this email address already exists.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let createdSeller: any = null;
    if (isMongoConnected()) {
      try {
        createdSeller = await Seller.create({
          shopName: cleanShopName,
          storefront: cleanShopName,
          ownerName: cleanOwnerName,
          ownerEmail: cleanEmail,
          email: cleanEmail,
          mobileNumber: cleanMobile,
          businessAddress: cleanAddress,
          panNumber: cleanPan,
          gstin: cleanGstin || undefined,
          bankAccountHolderName: cleanAccountHolder,
          bankAccountNumber: cleanAccountNumber,
          bankIFSC: cleanIfsc,
          bankName: cleanBank,
          kycVerified: false,
          password: passwordHash,
          status: "pending",
          listingsCount: 0,
        });
      } catch (err: any) {
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
      panNumber: cleanPan,
      gstin: cleanGstin || undefined,
      bankAccountHolderName: cleanAccountHolder,
      bankAccountNumber: cleanAccountNumber,
      bankIFSC: cleanIfsc,
      bankName: cleanBank,
      kycVerified: false,
      passwordHash,
      listingsCount: 0,
      status: "pending" as SellerStatus,
      createdAt: new Date(),
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
        panNumber: cleanPan,
        gstin: cleanGstin || undefined,
        bankAccountHolderName: cleanAccountHolder,
        bankAccountNumber: cleanAccountNumber,
        bankIFSC: cleanIfsc,
        bankName: cleanBank,
        kycVerified: false,
        status: "pending",
      },
    });
  } catch (err: any) {
    console.error("Seller register error:", err);
    return res.status(500).json({ error: err.message || "Failed to submit seller registration" });
  }
});

// ==========================================
// 2. POST /api/sellers/login (Public)
// ==========================================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    let sellerDoc: any = null;

    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller.findOne({
          $or: [{ email: cleanEmail }, { ownerEmail: cleanEmail }],
        });
      } catch (err) {
        console.warn("MongoDB find seller for login failed:", err);
      }
    }

    let sellerRecord: any = sellerDoc;
    let storedHash: string | undefined = sellerDoc?.password;

    if (!sellerRecord) {
      const mem = (memoryStore.sellers || []).find(
        (s) => (s.email && s.email.toLowerCase() === cleanEmail) || (s.ownerEmail && s.ownerEmail.toLowerCase() === cleanEmail)
      );
      if (mem) {
        sellerRecord = mem;
        storedHash = mem.passwordHash;
      }
    }

    if (!sellerRecord) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Enforce strict bcrypt authentication against stored hash
    if (!storedHash) {
      return res.status(401).json({ error: "No password set for this seller account. Please contact support or reset password." });
    }

    const isValid = await bcrypt.compare(password, storedHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // CHECK APPROVAL STATUS: Only "approved" sellers can log in and manage products!
    if (sellerRecord.status === "pending") {
      return res.status(403).json({
        success: false,
        status: "pending",
        error: "Your seller application is pending administrator approval. Please wait for an administrator to approve your account before logging in.",
      });
    }

    if (sellerRecord.status === "rejected") {
      return res.status(403).json({
        success: false,
        status: "rejected",
        error: "Your seller registration was rejected by the administrator. Please contact support for inquiries.",
      });
    }

    if (sellerRecord.status === "suspended") {
      return res.status(403).json({
        success: false,
        status: "suspended",
        error: "Your seller account is currently suspended. Please contact platform administration.",
      });
    }

    if (sellerRecord.status !== "approved") {
      return res.status(403).json({
        success: false,
        status: sellerRecord.status,
        error: `Your seller account is currently in '${sellerRecord.status}' status. Only approved sellers can access the dashboard.`,
      });
    }

    const sellerId = String(sellerRecord._id);
    const shopName = sellerRecord.shopName || sellerRecord.storefront || "Seller Atelier";

    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sellerId,
        role: "seller",
        email: sellerRecord.email || sellerRecord.ownerEmail,
        shopName,
      },
      secret,
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
        listingsCount: sellerRecord.listingsCount || 0,
      },
    });
  } catch (err: any) {
    console.error("Seller login error:", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

// ==========================================
// 3. GET /api/sellers/me (Protected)
// ==========================================
router.get("/me", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    let productCount = 0;

    if (isMongoConnected()) {
      try {
        productCount = await Product.countDocuments({ sellerId });
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
        listingsCount: productCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch seller profile" });
  }
});

// ==========================================
// 4. GET /api/sellers/products (Protected - ONLY their own products)
// ==========================================
router.get("/products", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;

    if (isMongoConnected()) {
      try {
        const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
        return res.json(products);
      } catch (err) {
        console.warn("MongoDB fetch seller products failed, using in-memory store:", err);
      }
    }

    const sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
    return res.json(sellerProducts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch seller products" });
  }
});

// ==========================================
// 5. POST /api/sellers/products (Protected - Creates product with sellerId)
// ==========================================
router.post("/products", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
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
      emoji = "📦",
      hsnCode = "",
      gstRate = 18,
      countryOfOrigin = "India",
      manufacturerDetails = "",
      packInfo = "",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Product category is required" });
    }

    const numericPrice = Number(price) || 0;
    const numericMrp = mrp !== undefined && mrp !== null ? Number(mrp) : numericPrice;
    const numericStock = Number(stock) || 0;
    const resolvedBrand = (brand && brand.trim()) ? brand.trim() : sellerShopName;
    const is20Min = eligibleFor20MinDelivery !== undefined
      ? Boolean(eligibleFor20MinDelivery)
      : (category.trim() === 'grocery' || category.trim() === 'food_delivery' || category.trim() === 'delivery');

    let createdProduct: any = null;

    if (isMongoConnected()) {
      try {
        createdProduct = await Product.create({
          name: name.trim(),
          brand: resolvedBrand,
          category: category.trim(),
          subCategory: String(subCategory || "").trim(),
          eligibleFor20MinDelivery: is20Min,
          price: numericPrice,
          mrp: numericMrp,
          rating: 5.0,
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
          emoji: emoji || "📦",
          sellerId,
          sellerShopName,
          hsnCode: String(hsnCode || "").trim(),
          gstRate: Number(gstRate) || 18,
          countryOfOrigin: String(countryOfOrigin || "India").trim(),
          manufacturerDetails: String(manufacturerDetails || "").trim(),
          packInfo: String(packInfo || "").trim(),
        });

        // Update seller listings count
        await Seller.findByIdAndUpdate(sellerId, { $inc: { listingsCount: 1 } });
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
      rating: 5.0,
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
      emoji: emoji || "📦",
      sellerId,
      sellerShopName,
      hsnCode: String(hsnCode || "").trim(),
      gstRate: Number(gstRate) || 18,
      countryOfOrigin: String(countryOfOrigin || "India").trim(),
      manufacturerDetails: String(manufacturerDetails || "").trim(),
      packInfo: String(packInfo || "").trim(),
      createdAt: new Date(),
    };

    memoryStore.products.unshift(newProd);

    // Update memory seller count
    const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
    if (memSeller) {
      memSeller.listingsCount = (memSeller.listingsCount || 0) + 1;
    }

    return res.status(201).json(createdProduct || newProd);
  } catch (err: any) {
    console.error("Seller create product error:", err);
    return res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// ==========================================
// 6. PUT /api/sellers/products/:id (Protected - Only their own product)
// ==========================================
router.put("/products/:id", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    const { id } = req.params;
    const body = req.body;

    // Verify ownership in MongoDB
    if (isMongoConnected()) {
      try {
        const existing = await Product.findById(id);
        if (existing) {
          if (existing.sellerId !== sellerId) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own products." });
          }

          const updateData: any = {};
          if (body.name !== undefined) updateData.name = body.name.trim();
          if (body.brand !== undefined) updateData.brand = body.brand.trim();
          if (body.category !== undefined) updateData.category = body.category.trim();
          if (body.subCategory !== undefined) updateData.subCategory = body.subCategory.trim();
          if (body.eligibleFor20MinDelivery !== undefined) updateData.eligibleFor20MinDelivery = Boolean(body.eligibleFor20MinDelivery);
          if (body.price !== undefined) updateData.price = Number(body.price);
          if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
          if (body.stock !== undefined) updateData.stock = Number(body.stock);
          if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus;
          if (body.badge !== undefined) updateData.badge = body.badge;
          if (body.image !== undefined) updateData.image = body.image;
          if (body.images !== undefined) updateData.images = body.images;
          if (body.description !== undefined) updateData.description = body.description;
          if (body.specifications !== undefined) updateData.specifications = body.specifications;
          if (body.isWholesale !== undefined) updateData.isWholesale = Boolean(body.isWholesale);
          if (body.wholesalePrice !== undefined) updateData.wholesalePrice = Number(body.wholesalePrice);
          if (body.wholesaleMinQty !== undefined) updateData.wholesaleMinQty = Number(body.wholesaleMinQty);
          if (body.colors !== undefined) updateData.colors = body.colors;
          if (body.sizes !== undefined) updateData.sizes = body.sizes;
          if (body.hsnCode !== undefined) updateData.hsnCode = String(body.hsnCode || "").trim();
          if (body.gstRate !== undefined) updateData.gstRate = Number(body.gstRate) || 18;
          if (body.countryOfOrigin !== undefined) updateData.countryOfOrigin = String(body.countryOfOrigin || "India").trim();
          if (body.manufacturerDetails !== undefined) updateData.manufacturerDetails = String(body.manufacturerDetails || "").trim();
          if (body.packInfo !== undefined) updateData.packInfo = String(body.packInfo || "").trim();

          const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
          return res.json(updated);
        }
      } catch (err) {
        console.warn("MongoDB seller update product error:", err);
      }
    }

    // Check memoryStore
    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      const prod = memoryStore.products[index];
      if (prod.sellerId !== sellerId) {
        return res.status(403).json({ error: "Unauthorized: You can only edit your own products." });
      }

      memoryStore.products[index] = {
        ...prod,
        ...body,
        updatedAt: new Date(),
      };
      return res.json(memoryStore.products[index]);
    }

    return res.status(404).json({ error: "Product not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

// ==========================================
// 7. DELETE /api/sellers/products/:id (Protected - Only their own product)
// ==========================================
router.delete("/products/:id", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        const existing = await Product.findById(id);
        if (existing) {
          if (existing.sellerId !== sellerId) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own products." });
          }

          await Product.findByIdAndDelete(id);
          await Seller.findByIdAndUpdate(sellerId, { $inc: { listingsCount: -1 } });
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

// ==========================================
// 8. GET /api/sellers/wallet (Protected - Seller's Available Balance, Lifetime Earnings & Orders Ledger)
// ==========================================
router.get("/wallet", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    let walletBalance = 0;
    let totalEarnings = 0;
    let pendingWithdrawals = 0;

    // 1. Fetch current seller financial balance
    if (isMongoConnected()) {
      try {
        const sellerDoc = await Seller.findById(sellerId).lean();
        if (sellerDoc) {
          walletBalance = Number(sellerDoc.walletBalance) || 0;
          totalEarnings = Number(sellerDoc.totalEarnings) || 0;
          pendingWithdrawals = Number(sellerDoc.pendingWithdrawals) || 0;
        }
      } catch (err) {
        console.warn("MongoDB seller fetch in /wallet error:", err);
      }
    }

    // In-memory fallback if not in MongoDB
    if (walletBalance === 0 && totalEarnings === 0) {
      const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
      if (memSeller) {
        walletBalance = Number((memSeller as any).walletBalance) || 0;
        totalEarnings = Number((memSeller as any).totalEarnings) || 0;
        pendingWithdrawals = Number((memSeller as any).pendingWithdrawals) || 0;
      }
    }

    // 2. Fetch all products owned by this seller
    let sellerProducts: any[] = [];
    if (isMongoConnected()) {
      try {
        sellerProducts = await Product.find({ sellerId }).select("_id id name price image").lean();
      } catch (err) {
        console.warn("MongoDB seller products query in /wallet error:", err);
        sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
      }
    } else {
      sellerProducts = (memoryStore.products || []).filter((p) => p.sellerId === sellerId);
    }

    const sellerProductMap = new Map<string, any>();
    for (const p of sellerProducts) {
      if (p._id) sellerProductMap.set(String(p._id), p);
      if (p.id !== undefined && p.id !== null) sellerProductMap.set(String(p.id), p);
    }

    // 3. Fetch delivered orders
    let deliveredOrders: any[] = [];
    if (isMongoConnected()) {
      try {
        deliveredOrders = await Order.find({ status: "delivered" })
          .sort({ deliveredAt: -1, createdAt: -1 })
          .lean();
      } catch (err) {
        console.warn("MongoDB orders query in /wallet error:", err);
        deliveredOrders = (memoryStore.orders || []).filter((o) => o.status === "delivered");
      }
    } else {
      deliveredOrders = (memoryStore.orders || []).filter((o) => o.status === "delivered");
    }

    // 4. Construct ledger of delivered orders with this seller's specific item earnings
    const ledger = [];
    for (const ord of deliveredOrders) {
      const items = Array.isArray(ord.items) ? ord.items : [];
      const sellerItems = items.filter((it: any) => sellerProductMap.has(String(it.productId)));
      if (sellerItems.length === 0) continue;

      const commissionRate = typeof ord.commissionRate === "number" ? ord.commissionRate : 5;
      const commissionPercent = Math.max(0, Math.min(100, commissionRate));

      let orderSellerGross = 0;
      let orderSellerCommission = 0;
      let orderSellerPayout = 0;

      const itemBreakdown = sellerItems.map((it: any) => {
        const itemPrice = Number(it.price) || 0;
        const itemQty = Number(it.qty) || 1;
        const itemGross = itemPrice * itemQty;
        const itemCommission = Math.round((itemGross * commissionPercent) / 100);
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
          netPayout: itemPayout,
        };
      });

      ledger.push({
        _id: String(ord._id || ord.orderNumber),
        orderNumber: ord.orderNumber || "AN-UNKNOWN",
        deliveredAt: ord.deliveredAt ? new Date(ord.deliveredAt).toISOString() : new Date().toISOString(),
        orderDate: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
        memberName: ord.memberName || "Client",
        orderTotal: ord.total || 0,
        commissionRate,
        sellerGross: orderSellerGross,
        commissionDeducted: orderSellerCommission,
        sellerPayout: orderSellerPayout,
        walletCredited: Boolean(ord.walletCredited),
        items: itemBreakdown,
      });
    }

    return res.json({
      success: true,
      sellerId,
      walletBalance,
      totalEarnings,
      pendingWithdrawals,
      ledger,
    });
  } catch (err: any) {
    console.error("Failed to load seller wallet:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve seller wallet" });
  }
});

// ==========================================
// 9. POST /api/seller/wallet/withdraw (Protected - Submit Withdrawal Request)
// ==========================================
router.post("/wallet/withdraw", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    const { amount, payoutDetails, note } = req.body;

    // Validate requested amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid withdrawal amount. Must be a positive number greater than 0.",
      });
    }

    // Lookup seller to verify existence, shop details, and current balance
    let sellerDoc: any = null;
    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller.findById(sellerId);
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
        error: `Insufficient balance. Your available wallet balance is ₹${currentBalance.toLocaleString()}, but you requested ₹${numAmount.toLocaleString()}.`,
        currentBalance,
      });
    }

    // Atomic balance update:
    // Decrement walletBalance by numAmount and increment pendingWithdrawals by numAmount
    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findOneAndUpdate(
          {
            _id: sellerId,
            walletBalance: { $gte: numAmount },
          },
          {
            $inc: {
              walletBalance: -numAmount,
              pendingWithdrawals: numAmount,
            },
          },
          { new: true }
        );
      } catch (err) {
        console.warn("MongoDB atomic seller balance update error:", err);
      }
    }

    // In-memory fallback or sync
    const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
    if (memSeller) {
      memSeller.walletBalance = Math.max(0, ((memSeller as any).walletBalance || 0) - numAmount);
      memSeller.pendingWithdrawals = ((memSeller as any).pendingWithdrawals || 0) + numAmount;
      if (!updatedSeller) {
        updatedSeller = memSeller;
      }
    }

    if (!updatedSeller) {
      return res.status(400).json({
        success: false,
        error: "Failed to deduct funds. Balance may have changed or is insufficient.",
      });
    }

    // Create the SellerWithdrawal record with status 'pending'
    let withdrawalRecord: any = null;
    if (isMongoConnected()) {
      try {
        withdrawalRecord = await SellerWithdrawal.create({
          sellerId: updatedSeller._id,
          sellerEmail: updatedSeller.email,
          sellerShopName: updatedSeller.shopName,
          amount: numAmount,
          payoutDetails: payoutDetails ? String(payoutDetails).trim() : "",
          note: note ? String(note).trim() : "",
          status: "pending",
          requestedAt: new Date(),
        });
      } catch (dbErr: any) {
        console.error("MongoDB failed to create SellerWithdrawal:", dbErr);
        // Rollback balance deduction if record creation fails
        await Seller.findByIdAndUpdate(sellerId, {
          $inc: { walletBalance: numAmount, pendingWithdrawals: -numAmount },
        }).catch(() => {});
        return res.status(500).json({
          success: false,
          error: "Failed to record withdrawal request. Your wallet balance has been restored.",
        });
      }
    }

    // Keep memoryStore in sync
    const memWithdrawal = {
      _id: withdrawalRecord ? String(withdrawalRecord._id) : `sw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sellerId: String(updatedSeller._id),
      sellerEmail: updatedSeller.email,
      sellerShopName: updatedSeller.shopName,
      amount: numAmount,
      payoutDetails: payoutDetails ? String(payoutDetails).trim() : "",
      note: note ? String(note).trim() : "",
      status: "pending" as const,
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (memoryStore.sellerWithdrawals = memoryStore.sellerWithdrawals || []).unshift(memWithdrawal);

    const finalRecord = withdrawalRecord || memWithdrawal;

    console.log(
      `💸 [SELLER WITHDRAWAL REQUESTED] Seller ${updatedSeller.shopName} (${updatedSeller.email}) requested ₹${numAmount}. Status: PENDING.`
    );

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully and is awaiting admin approval.",
      withdrawal: finalRecord,
      walletBalance: updatedSeller.walletBalance,
      pendingWithdrawals: updatedSeller.pendingWithdrawals,
    });
  } catch (err: any) {
    console.error("Seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to process withdrawal request",
    });
  }
});

// ==========================================
// 10. GET /api/seller/wallet/withdrawals (Protected - Seller's Withdrawal History)
// ==========================================
router.get("/wallet/withdrawals", requireSellerAuth, async (req: SellerAuthedRequest, res: Response) => {
  try {
    const sellerId = req.sellerId!;
    const sellerEmail = req.seller?.email;

    let withdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        const orConditions: any[] = [{ sellerId }];
        if (sellerEmail) {
          orConditions.push({ sellerEmail: sellerEmail.toLowerCase().trim() });
        }
        withdrawals = await SellerWithdrawal.find({ $or: orConditions })
          .sort({ requestedAt: -1, createdAt: -1 })
          .lean();
      } catch (err) {
        console.warn("MongoDB seller withdrawals query fallback:", err);
      }
    }

    if (!withdrawals || withdrawals.length === 0) {
      withdrawals = (memoryStore.sellerWithdrawals || []).filter(
        (w) => String(w.sellerId) === String(sellerId) || (sellerEmail && w.sellerEmail?.toLowerCase() === sellerEmail.toLowerCase())
      );
    }

    return res.json({
      success: true,
      withdrawals,
    });
  } catch (err: any) {
    console.error("Failed to fetch seller withdrawals:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch withdrawal history",
    });
  }
});

export default router;
