import { Router } from "express";
import Seller, { SellerStatus } from "../models/Seller";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

// GET /api/admin/sellers
router.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const sellers = await Seller.find().select("-password").sort({ createdAt: -1 });
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
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch sellers" });
  }
});

// PATCH /api/admin/sellers/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "approved", "review", "suspended", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Must be pending, approved, review, suspended, or rejected." });
    }

    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (seller) return res.json(seller);
      } catch (err) {
        console.warn("MongoDB update seller status failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.sellers.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Seller not found" });
    }

    memoryStore.sellers[index].status = status as SellerStatus;
    const { passwordHash, ...safe } = memoryStore.sellers[index];
    return res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update seller status" });
  }
});

export default router;
