import { Router } from "express";
import Product from "../models/Product";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

// GET /api/admin/products
router.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const products = await Product.find().sort({ createdAt: -1 });
        if (products && products.length > 0) {
          const sanitized = products.map((p) => {
            const doc = p.toObject();
            return {
              ...doc,
              sellerId: doc.sellerId || "admin",
              sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : (doc.brand || "Atelier")),
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
      sellerShopName: p.sellerShopName || "ALIKE-ND Official",
    }));
    return res.json(sanitizedMem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

// POST /api/admin/products
router.post("/", async (req, res) => {
  try {
    const {
      name,
      brand = "Alike Sovereign",
      category,
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
      emoji = "📦",
      sellerId = "admin",
      sellerShopName = "ALIKE-ND Official",
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "Product name and category are required" });
    }

    const numericPrice = Number(price) || 0;
    const numericMrp = mrp !== undefined && mrp !== null ? Number(mrp) : numericPrice;
    const numericStock = Number(stock) || 0;

    let createdProduct: any = null;

    if (isMongoConnected()) {
      try {
        createdProduct = await Product.create({
          name: name.trim(),
          brand: brand.trim(),
          category: category.trim(),
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
          emoji: emoji || "📦",
          sellerId: sellerId || "admin",
          sellerShopName: sellerShopName || "ALIKE-ND Official",
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
      emoji: emoji || "📦",
      sellerId: sellerId || "admin",
      sellerShopName: sellerShopName || "ALIKE-ND Official",
      createdAt: new Date(),
    };

    memoryStore.products.unshift(newProd);
    return res.status(201).json(createdProduct || newProd);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// PUT /api/admin/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.brand !== undefined) updateData.brand = body.brand.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
    if (body.rating !== undefined) updateData.rating = Number(body.rating);
    if (body.reviewsCount !== undefined) updateData.reviewsCount = Number(body.reviewsCount);
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.isFlashSale !== undefined) updateData.isFlashSale = Boolean(body.isFlashSale);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.isWholesale !== undefined) updateData.isWholesale = Boolean(body.isWholesale);
    if (body.wholesalePrice !== undefined) updateData.wholesalePrice = Number(body.wholesalePrice);
    if (body.wholesaleMinQty !== undefined) updateData.wholesaleMinQty = Number(body.wholesaleMinQty);
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.emoji !== undefined) updateData.emoji = body.emoji;

    let updatedMongo: any = null;
    if (isMongoConnected()) {
      try {
        updatedMongo = await Product.findByIdAndUpdate(id, updateData, { new: true });
      } catch (err) {
        console.warn("MongoDB update product failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.json(updatedMongo || memoryStore.products[index]);
    }

    if (updatedMongo) {
      return res.json(updatedMongo);
    }

    return res.status(404).json({ error: "Product not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        await Product.findByIdAndDelete(id);
      } catch (err) {
        console.warn("MongoDB delete product failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      memoryStore.products.splice(index, 1);
    }

    return res.json({ ok: true, message: "Product removed from catalog" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

export default router;

