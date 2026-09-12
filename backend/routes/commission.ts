import { Router } from "express";
import Order from "../models/Order";
import PlatformSetting from "../models/PlatformSetting";
import PlatformWithdrawal from "../models/PlatformWithdrawal";
import { requireAdmin, requireSuperAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";

const router = Router();

// Helper to get active commission rate
export async function getActiveCommissionRate(): Promise<number> {
  if (isMongoConnected()) {
    try {
      const setting = await PlatformSetting.findOne({ key: "commission_settings" });
      if (setting && typeof setting.commissionRate === "number") {
        return setting.commissionRate;
      }
    } catch (err) {
      console.warn("MongoDB commission rate query notice:", err);
    }
  }
  return memoryStore.platformSettings?.commissionRate ?? 5;
}

// GET /api/admin/commission - Fetch platform earnings, commission wallet balance, orders ledger & withdrawal history
router.get("/", requireAdmin, requireSuperAdmin, async (_req: AuthedRequest, res) => {
  try {
    const activeRate = await getActiveCommissionRate();
    let ordersList: any[] = [];

    if (isMongoConnected()) {
      try {
        ordersList = await Order.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB order query error in commission route, using memoryStore:", err);
        ordersList = memoryStore.orders || [];
      }
    } else {
      ordersList = memoryStore.orders || [];
    }

    // Process all orders to compute real commission values
    let calculatedTotalCommission = 0;
    const ledger = ordersList.map((ord) => {
      const orderTotal = Number(ord.total) || 0;
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : activeRate;
      const commissionAmount =
        typeof ord.commissionAmount === "number" && ord.commissionAmount > 0
          ? ord.commissionAmount
          : Math.round((orderTotal * rate) / 100);
      const sellerPayout =
        typeof ord.sellerPayout === "number" && ord.sellerPayout > 0
          ? ord.sellerPayout
          : Math.max(0, orderTotal - commissionAmount);

      calculatedTotalCommission += commissionAmount;

      return {
        _id: String(ord._id || ord.orderNumber),
        orderNumber: ord.orderNumber || "AN-UNKNOWN",
        date: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
        memberName: ord.memberName || "Valued Client",
        memberEmail: ord.memberEmail || "",
        total: orderTotal,
        commissionRate: rate,
        commissionAmount,
        sellerPayout,
        paymentMethod: ord.paymentMethod || "CARD",
        status: ord.status || "pending",
        commissionStatus: ord.commissionStatus || "credited",
      };
    });

    // Fetch withdrawals from MongoDB or memoryStore
    let withdrawalsList: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawalsList = await PlatformWithdrawal.find().sort({ date: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB withdrawal query error, using memoryStore:", err);
        withdrawalsList = memoryStore.platformWithdrawals || [];
      }
    } else {
      withdrawalsList = memoryStore.platformWithdrawals || [];
    }

    // Merge memory withdrawals if any weren't in Mongo
    const mongoIds = new Set(withdrawalsList.map((w) => String(w._id)));
    for (const memW of memoryStore.platformWithdrawals || []) {
      if (!mongoIds.has(String(memW._id))) {
        withdrawalsList.push(memW);
      }
    }

    // Sort withdrawals newest first
    withdrawalsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalWithdrawn = withdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

    // Running balance is the total commission earned in the platform wallet minus internal withdrawals
    const runningBalance = Math.max(0, calculatedTotalCommission - totalWithdrawn);

    const formattedWithdrawals = withdrawalsList.map((w) => ({
      _id: String(w._id),
      amount: Number(w.amount) || 0,
      note: w.note || "",
      adminEmail: w.adminEmail || "superadmin@alikend.com",
      adminName: w.adminName || "Super Admin",
      date: w.date ? new Date(w.date).toISOString() : new Date().toISOString(),
      status: w.status || "Completed",
    }));

    return res.json({
      success: true,
      commissionRate: activeRate,
      totalCommissionEarned: calculatedTotalCommission,
      runningBalance,
      totalWithdrawn,
      totalOrdersCount: ledger.length,
      orders: ledger,
      withdrawals: formattedWithdrawals,
    });
  } catch (err: any) {
    console.error("Commission fetch error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load commission data" });
  }
});

// PATCH /api/admin/commission/settings - Super Admin sets global commission rate
router.patch("/settings", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const { commissionRate } = req.body;
    const rateNum = Number(commissionRate);

    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return res.status(400).json({
        success: false,
        error: "Commission percentage must be a valid number between 0% and 100%",
      });
    }

    const roundedRate = Math.round(rateNum * 100) / 100;

    // Update in MongoDB
    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "commission_settings" },
          {
            commissionRate: roundedRate,
            updatedBy: req.admin?.email || "superadmin",
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (dbErr: any) {
        console.warn("MongoDB commission update error:", dbErr.message);
      }
    }

    // Update in memoryStore
    if (!memoryStore.platformSettings) {
      memoryStore.platformSettings = {
        commissionRate: roundedRate,
        platformBalance: 0,
        totalCommissionEarned: 0,
        updatedAt: new Date(),
      };
    } else {
      memoryStore.platformSettings.commissionRate = roundedRate;
      memoryStore.platformSettings.updatedAt = new Date();
    }

    // Audit log
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Super Admin",
        email: req.admin?.email || "noyondey176@gmail.com",
        details: `Updated Platform Global Commission Rate to ${roundedRate}%`,
      },
      req
    );

    console.log(`💰 [COMMISSION UPDATE] Global commission rate set to ${roundedRate}% by ${req.admin?.email}`);

    return res.json({
      success: true,
      commissionRate: roundedRate,
      message: `Global platform commission rate successfully updated to ${roundedRate}%`,
    });
  } catch (err: any) {
    console.error("Failed to update commission rate:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update commission settings" });
  }
});

// POST /api/admin/commission/withdraw - Super Admin logs internal withdrawal from platform wallet balance
router.post("/withdraw", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const { amount, note } = req.body;
    const withdrawAmount = Math.round(Number(amount));

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Withdrawal amount must be a positive number greater than 0",
      });
    }

    // 1. Calculate lifetime commission earned across all orders
    let ordersList: any[] = [];
    if (isMongoConnected()) {
      try {
        ordersList = await Order.find().lean();
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
      const commissionAmount =
        typeof ord.commissionAmount === "number" && ord.commissionAmount > 0
          ? ord.commissionAmount
          : Math.round((orderTotal * rate) / 100);
      calculatedTotalCommission += commissionAmount;
    }

    // 2. Calculate existing withdrawals
    let existingWithdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        existingWithdrawals = await PlatformWithdrawal.find().lean();
      } catch (err) {
        existingWithdrawals = memoryStore.platformWithdrawals || [];
      }
    } else {
      existingWithdrawals = memoryStore.platformWithdrawals || [];
    }

    // Include any in-memory records
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
        error: `Withdrawal amount (₹${withdrawAmount.toLocaleString("en-IN")}) cannot exceed current Platform Wallet Balance (₹${currentRunningBalance.toLocaleString("en-IN")})`,
      });
    }

    const adminEmail = req.admin?.email || "noyondey176@gmail.com";
    const adminName = req.admin?.name || "Super Admin";
    const newRecord = {
      _id: `pw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount: withdrawAmount,
      note: typeof note === "string" ? note.trim() : "",
      adminEmail,
      adminName,
      date: new Date(),
      status: "Completed",
    };

    if (isMongoConnected()) {
      try {
        const savedDoc = await PlatformWithdrawal.create({
          amount: withdrawAmount,
          note: newRecord.note,
          adminEmail,
          adminName,
          date: newRecord.date,
          status: "Completed",
        });
        newRecord._id = String(savedDoc._id);
      } catch (err: any) {
        console.warn("MongoDB PlatformWithdrawal create failed, using memoryStore:", err.message);
      }
    }

    if (!memoryStore.platformWithdrawals) {
      memoryStore.platformWithdrawals = [];
    }
    memoryStore.platformWithdrawals.unshift(newRecord);

    const newRunningBalance = currentRunningBalance - withdrawAmount;

    // Log to activity logs
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: adminName,
        email: adminEmail,
        details: `Platform Wallet Withdrawal logged: ₹${withdrawAmount.toLocaleString("en-IN")}${newRecord.note ? ` (Note: ${newRecord.note})` : ""}. New Platform Balance: ₹${newRunningBalance.toLocaleString("en-IN")}`,
      },
      req
    );

    console.log(`💸 [PLATFORM WITHDRAWAL] ₹${withdrawAmount} withdrawn by ${adminEmail}. Note: ${newRecord.note || "None"}`);

    return res.json({
      success: true,
      message: `Successfully logged withdrawal of ₹${withdrawAmount.toLocaleString("en-IN")}`,
      withdrawal: {
        ...newRecord,
        date: newRecord.date.toISOString(),
      },
      runningBalance: newRunningBalance,
      totalCommissionEarned: calculatedTotalCommission,
    });
  } catch (err: any) {
    console.error("Platform withdrawal error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process withdrawal" });
  }
});

export default router;
