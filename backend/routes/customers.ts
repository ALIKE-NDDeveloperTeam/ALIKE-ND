import { Router } from "express";
import User from "../models/User";
import Customer from "../models/Customer";
import Order from "../models/Order";
import { requireAdmin, requireSuperAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

// GET /api/admin/customers - Fetch all registered users (Admins & Superadmins)
router.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const users = await User.find().sort({ createdAt: -1 });
        const orders = await Order.find().lean();

        // Map users with calculated order stats
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
            createdAt: u.createdAt,
          };
        });

        return res.json(formattedUsers);
      } catch (err) {
        console.warn("MongoDB fetch users failed, checking Customer collection or in-memory:", err);
      }
    }

    // In-memory fallback
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
      createdAt: u.createdAt,
    }));

    return res.json(memList.length > 0 ? memList : memoryStore.customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch customer list" });
  }
});

// PATCH /api/admin/customers/:id/block - Block or Unblock a customer account (SUPER ADMIN ONLY)
router.patch("/:id/block", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ error: "isBlocked boolean field is required" });
    }

    if (isMongoConnected()) {
      const updatedUser = await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
      if (updatedUser) {
        console.log(`🛡️ [SUPER ADMIN ACTION] User ${updatedUser.email} isBlocked set to ${isBlocked}`);
        return res.json({
          success: true,
          message: `User ${updatedUser.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
          user: {
            _id: String(updatedUser._id),
            name: updatedUser.fullName,
            email: updatedUser.email,
            isBlocked: updatedUser.isBlocked,
            tier: updatedUser.tier,
          },
        });
      }
    }

    // In-memory fallback
    const userInMem = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (userInMem) {
      return res.json({
        success: true,
        message: `User ${userInMem.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
        user: { ...userInMem, isBlocked },
      });
    }

    return res.status(404).json({ error: "User document not found in database" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user block status" });
  }
});

// PATCH /api/admin/customers/:id/tier - Update member loyalty tier (SUPER ADMIN ONLY)
router.patch("/:id/tier", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;
    if (!["Silver", "Gold", "Platinum"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier value" });
    }

    if (isMongoConnected()) {
      const updatedUser = await User.findByIdAndUpdate(id, { tier }, { new: true });
      if (updatedUser) {
        return res.json({ success: true, user: updatedUser });
      }
    }

    return res.status(404).json({ error: "User document not found in database" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update member tier" });
  }
});

export default router;


