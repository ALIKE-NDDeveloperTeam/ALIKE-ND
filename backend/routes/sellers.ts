import { Router } from "express";
import Seller, { SellerStatus } from "../models/Seller";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

// Helper to mask sensitive bank and PAN data
function maskSensitiveSeller(s: any, isSuperAdmin: boolean = false) {
  const doc = s && typeof s.toObject === "function" ? s.toObject() : { ...s };
  delete doc.password;
  delete doc.passwordHash;

  if (!doc._id && doc.id) {
    doc._id = String(doc.id);
  } else if (doc._id) {
    doc._id = String(doc._id);
  }

  if (!isSuperAdmin) {
    if (doc.bankAccountNumber) {
      const acc = String(doc.bankAccountNumber);
      doc.bankAccountNumber = acc.length > 4 ? `••••••••${acc.slice(-4)}` : "••••";
    }
    if (doc.panNumber) {
      const pan = String(doc.panNumber);
      doc.panNumber = pan.length > 4 ? `${pan.slice(0, 2)}••••••${pan.slice(-2)}` : "••••";
    }
  }
  return doc;
}

// GET /api/admin/sellers
router.get("/", async (req: any, res) => {
  try {
    const isSuper = req.admin?.role === "superadmin";
    if (isMongoConnected()) {
      try {
        const sellers = await Seller.find().select("-password").sort({ createdAt: -1 });
        const masked = sellers.map((s) => maskSensitiveSeller(s, isSuper));
        return res.json({ success: true, sellers: masked });
      } catch (err) {
        console.warn("MongoDB fetch sellers failed, using in-memory store:", err);
      }
    }
    return res.json({
      success: true,
      sellers: memoryStore.sellers.map((s) => maskSensitiveSeller(s, isSuper)),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch sellers" });
  }
});

// PATCH /api/admin/sellers/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "approved", "review", "suspended", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value. Must be pending, approved, review, suspended, or rejected." });
    }

    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (seller) return res.json({ success: true, seller, status: seller.status });
      } catch (err) {
        console.warn("MongoDB update seller status failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.sellers.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    memoryStore.sellers[index].status = status as SellerStatus;
    const { passwordHash, ...safe } = memoryStore.sellers[index];
    return res.json({ success: true, seller: safe, status: safe.status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller status" });
  }
});

// PATCH /api/admin/sellers/:id/verify-kyc
router.patch("/:id/verify-kyc", async (req, res) => {
  try {
    const { kycVerified } = req.body;
    const { id } = req.params;
    const verified = Boolean(kycVerified);

    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(id, { kycVerified: verified }, { new: true }).select("-password");
        if (seller) return res.json({ success: true, seller, kycVerified: seller.kycVerified });
      } catch (err) {
        console.warn("MongoDB update seller kycVerified failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.sellers.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    memoryStore.sellers[index].kycVerified = verified;
    const { passwordHash, ...safe } = memoryStore.sellers[index];
    return res.json({ success: true, seller: safe, kycVerified: safe.kycVerified });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller KYC verification status" });
  }
});

export default router;
