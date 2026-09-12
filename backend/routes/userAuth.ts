import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";
import Customer from "../models/Customer";
import Seller from "../models/Seller";
import OtpVerification from "../models/OtpVerification";
import { sendOtpEmail } from "../services/mailer";
import { isMongoConnected, memoryStore, getMongoDbInfo, connectMongoDB } from "../store";
import { logActivity } from "../utils/activityLogger";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "alikend_luxury_secret_jwt_2026";

// GET /api/auth/status - Check MongoDB connection status & target collection
router.get("/status", async (_req, res) => {
  const dbInfo = getMongoDbInfo();
  let userCount = 0;
  
  if (isMongoConnected()) {
    try {
      userCount = await User.countDocuments();
    } catch (e: any) {
      console.warn("Could not query user count:", e.message);
    }
  } else {
    userCount = memoryStore.users.length;
  }

  return res.json({
    ...dbInfo,
    targetDatabase: "alikendshop",
    targetCollection: "users",
    totalUsersCount: userCount,
  });
});

// POST /api/auth/reconnect - Trigger reconnection attempt to MongoDB Atlas
router.post("/reconnect", async (_req, res) => {
  console.log("🔄 [MONGODB RECONNECT] Received explicit reconnect request from client...");
  try {
    await connectMongoDB();
    const dbInfo = getMongoDbInfo();
    return res.json({
      success: dbInfo.connected,
      ...dbInfo,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

// ==========================================
// OTP Endpoints (via Gmail SMTP / nodemailer)
// ==========================================

// POST /api/auth/otp/send - Generate 6-digit OTP, store with 10-min expiry, send via Gmail SMTP
router.post("/otp/send", async (req, res) => {
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

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiry: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save in MongoDB if connected
    if (isMongoConnected()) {
      try {
        await OtpVerification.deleteMany({ email: cleanEmail, purpose });
        await OtpVerification.create({
          email: cleanEmail,
          otp: otpCode,
          purpose,
          expiresAt,
        });
      } catch (dbErr: any) {
        console.warn("MongoDB OTP write warning:", dbErr.message);
      }
    }

    // Also store in memoryStore for reliability
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
      createdAt: new Date(),
    });

    // Respond immediately so user isn't waiting on SMTP round-trip; send email in background
    const otpGenTime = new Date().toISOString();
    sendOtpEmail(cleanEmail, otpCode, purpose)
      .then((mRes) => {
        console.log(`✅ [BG OTP DISPATCH COMPLETE at ${new Date().toISOString()}] To: ${cleanEmail} | Mode: ${mRes.mode}`);
      })
      .catch((err) => {
        console.error(`💥 [BG OTP DISPATCH FAILED] To: ${cleanEmail}:`, err.message || err);
      });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime,
    });
  } catch (err: any) {
    console.error("💥 [OTP SEND ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch verification code." });
  }
});

// POST /api/auth/otp/verify - Verify submitted 6-digit OTP
router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp, purpose = "verification" } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const now = new Date();

    let isMatch = false;

    // Check MongoDB
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          email: cleanEmail,
          otp: cleanOtp,
          expiresAt: { $gt: now },
        });
        if (record) {
          isMatch = true;
          // Delete to prevent replay attacks
          await OtpVerification.deleteOne({ _id: record._id });
        }
      } catch (dbErr: any) {
        console.warn("MongoDB OTP verify warning:", dbErr.message);
      }
    }

    // Check memoryStore fallback if not matched yet
    if (!isMatch && memoryStore.otps) {
      const idx = memoryStore.otps.findIndex(
        (o) =>
          o.email === cleanEmail &&
          o.otp === cleanOtp &&
          new Date(o.expiresAt) > now
      );
      if (idx >= 0) {
        isMatch = true;
        memoryStore.otps.splice(idx, 1);
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code. Please check the code or request a new one.",
      });
    }

    return res.json({
      success: true,
      message: "Email verification successful.",
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error("💥 [OTP VERIFY ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify OTP code." });
  }
});

// POST /api/auth/forgot-password/send-otp - Send OTP for password recovery
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ error: "Please provide your email or phone number." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    let userEmail: string | null = null;
    let userName = "Valued Customer";

    // Find user by email or mobile
    if (isMongoConnected()) {
      try {
        const user = await User.findOne({
          $or: [
            { email: cleanId },
            { mobileNumber: cleanId },
            { phone: cleanId },
          ],
        });
        if (user) {
          userEmail = user.email;
          userName = user.fullName;
        }
      } catch (e: any) {
        console.warn("Mongo find user for forgot-password warning:", e.message);
      }
    }

    if (!userEmail) {
      const memUser = memoryStore.users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.mobileNumber === cleanId ||
          u.phone === cleanId
      );
      if (memUser) {
        userEmail = memUser.email;
        userName = memUser.fullName;
      }
    }

    // If identifier looks like an email, use it directly
    if (!userEmail && cleanId.includes("@")) {
      userEmail = cleanId;
    }

    if (!userEmail) {
      return res.status(404).json({
        error: "No account found matching this identifier. Please verify and try again.",
      });
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (isMongoConnected()) {
      try {
        await OtpVerification.deleteMany({ email: userEmail, purpose: "forgot_password" });
        await OtpVerification.create({
          email: userEmail,
          otp: otpCode,
          purpose: "forgot_password",
          expiresAt,
        });
      } catch (e: any) {
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
      createdAt: new Date(),
    });

    // Respond immediately so user isn't waiting on SMTP round-trip; send email in background
    const otpGenTime = new Date().toISOString();
    sendOtpEmail(userEmail, otpCode, "forgot_password")
      .then((mRes) => {
        console.log(`✅ [BG FORGOT-PW OTP DISPATCH COMPLETE at ${new Date().toISOString()}] To: ${userEmail} | Mode: ${mRes.mode}`);
      })
      .catch((err) => {
        console.error(`💥 [BG FORGOT-PW OTP DISPATCH FAILED] To: ${userEmail}:`, err.message || err);
      });

    return res.json({
      success: true,
      message: `Verification code sent to ${userEmail}. Code valid for 10 minutes. Check your inbox and spam folder.`,
      email: userEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime,
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD SEND OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to send reset code." });
  }
});

// POST /api/auth/forgot-password/verify-otp - Verify OTP before unlocking password fields
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and 6-digit OTP code are required." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const now = new Date();

    let isMatch = false;
    let verifiedEmail = cleanId;

    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          $or: [{ email: cleanId }, { otp: cleanOtp }],
          otp: cleanOtp,
          purpose: "forgot_password",
          expiresAt: { $gt: now },
        });
        if (record) {
          isMatch = true;
          verifiedEmail = record.email;
        }
      } catch (e: any) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }

    if (!isMatch && memoryStore.otps) {
      const found = memoryStore.otps.find(
        (o) =>
          (o.email === cleanId || o.otp === cleanOtp) &&
          o.otp === cleanOtp &&
          o.purpose === "forgot_password" &&
          new Date(o.expiresAt) > now
      );
      if (found) {
        isMatch = true;
        verifiedEmail = found.email;
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP code. Please enter the correct 6-digit code or request a new one.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: "OTP code verified successfully! You may now enter your new password.",
      email: verifiedEmail,
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD VERIFY OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify reset code." });
  }
});

// POST /api/auth/forgot-password/reset - Verify OTP and update password
router.post("/forgot-password/reset", async (req, res) => {
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
    const now = new Date();

    // Verify OTP
    let isMatch = false;
    let verifiedEmail = cleanId;

    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          $or: [{ email: cleanId }, { otp: cleanOtp }],
          otp: cleanOtp,
          purpose: "forgot_password",
          expiresAt: { $gt: now },
        });
        if (record) {
          isMatch = true;
          verifiedEmail = record.email;
          await OtpVerification.deleteOne({ _id: record._id });
        }
      } catch (e: any) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }

    if (!isMatch && memoryStore.otps) {
      const idx = memoryStore.otps.findIndex(
        (o) =>
          (o.email === cleanId || o.otp === cleanOtp) &&
          o.otp === cleanOtp &&
          o.purpose === "forgot_password" &&
          new Date(o.expiresAt) > now
      );
      if (idx >= 0) {
        isMatch = true;
        verifiedEmail = memoryStore.otps[idx].email;
        memoryStore.otps.splice(idx, 1);
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid or expired OTP code. Please request a new verification code.",
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password in Mongo
    if (isMongoConnected()) {
      try {
        await User.updateOne(
          {
            $or: [
              { email: verifiedEmail },
              { email: cleanId },
              { mobileNumber: cleanId },
              { phone: cleanId },
            ],
          },
          { $set: { passwordHash: newHash } }
        );
      } catch (e: any) {
        console.warn("Mongo update password error:", e.message);
      }
    }

    // Update in memoryStore
    const memIdx = memoryStore.users.findIndex(
      (u) =>
        u.email === verifiedEmail ||
        u.email === cleanId ||
        u.mobileNumber === cleanId ||
        u.phone === cleanId
    );
    if (memIdx >= 0) {
      memoryStore.users[memIdx].passwordHash = newHash;
    }

    return res.json({
      success: true,
      message: "Password reset successful! You may now sign in with your new password.",
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD RESET ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to reset password." });
  }
});


// POST /api/auth/register - Register new user directly into MongoDB
router.post("/register", async (req, res) => {
  console.log("==================================================");
  console.log("📝 [REGISTRATION INCOMING REQUEST]");
  console.log("Time:", new Date().toISOString());
  console.log("Payload:", {
    fullName: req.body?.fullName,
    email: req.body?.email,
    country: req.body?.country,
    mobileNumber: req.body?.mobileNumber,
    hasPassword: !!req.body?.password,
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
        error: "Please provide either a mobile number or a Gmail/email address.",
      });
    }

    if (!cleanEmail && cleanMobile) {
      // Auto-assign clean internal identifier for mobile-only registrations
      const digits = cleanMobile.replace(/\D/g, "");
      cleanEmail = `${digits || Date.now()}@customer.alike.com`;
    }

    const cleanCountry = String(country || "Bangladesh").trim();
    const cleanName = String(fullName || cleanEmail.split("@")[0] || cleanMobile).trim();
    const phone = cleanMobile ? `${cleanCountry} ${cleanMobile}` : "";

    console.log(`🔍 [REGISTRATION CHECK] Checking if user exists (email: ${cleanEmail}, mobile: ${cleanMobile})...`);

    // 1. If MongoDB is connected, save directly to MongoDB 'users' collection in 'alikendshop' database
    if (isMongoConnected()) {
      try {
        const query: any[] = [{ email: cleanEmail }];
        if (cleanMobile) {
          query.push({ mobileNumber: cleanMobile });
          query.push({ phone: { $regex: cleanMobile.slice(-8) } });
        }
        const existingMongoUser = await User.findOne({ $or: query });
        if (existingMongoUser) {
          const isPhoneConflict = cleanMobile && existingMongoUser.mobileNumber === cleanMobile;
          const msg = isPhoneConflict
            ? "An account with this mobile number already exists."
            : "An account with this email address already exists.";
          console.warn(`⚠️ [REGISTRATION REJECTED] ${msg}`);
          await logActivity(
            {
              eventType: "Registration",
              status: "failed",
              userName: cleanName,
              email: cleanEmail,
              details: `Registration rejected: ${msg}`,
            },
            req
          );
          return res.status(400).json({ error: msg });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        console.log(`💾 [REGISTRATION MONGODB] Saving document to database 'alikendshop', collection 'users'...`);
        
        const newUser = await User.create({
          fullName: cleanName,
          email: cleanEmail,
          country: cleanCountry,
          mobileNumber: cleanMobile,
          phone: phone,
          passwordHash: passwordHash,
          tier: "Silver",
          verified: true,
        });

        console.log(`✅ [REGISTRATION MONGODB SUCCESS] User document created successfully! ID: ${newUser._id}`);

        // Sync with Customer overview for Admin Panel
        try {
          const existingCustomer = await Customer.findOne({ email: cleanEmail });
          if (!existingCustomer) {
            await Customer.create({
              name: cleanName,
              email: cleanEmail,
              tier: "Silver",
              ordersCount: 0,
              lifetimeSpend: 0,
            });
            console.log(`✨ [SYNC CUSTOMER] Added to customer roster for admin panel: ${cleanEmail}`);
          }
        } catch (cErr: any) {
          console.warn("Customer sync notice:", cErr?.message);
        }

        // Record Activity Log automatically
        await logActivity(
          {
            eventType: "Registration",
            status: "success",
            userName: newUser.fullName,
            email: newUser.email,
            details: "New account registered successfully in alikendshop.users",
          },
          req
        );

        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "30d" });

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
            tier: newUser.tier,
          },
          token,
          storage: "mongodb",
          database: "alikendshop",
          collection: "users",
        });
      } catch (dbError: any) {
        console.error("❌ [REGISTRATION MONGODB ERROR]:", dbError);
        // If DB write failed, log and fallback to memory store while returning error details if needed
      }
    } else {
      console.warn("⚠️ [REGISTRATION NOTICE] MongoDB is not connected. MONGO_URI may be missing or invalid. Falling back to in-memory store.");
    }

    // 2. Fallback memory store if MongoDB is offline
    const existingMemUser = memoryStore.users.find((u) => u.email === cleanEmail);
    if (existingMemUser) {
      console.warn(`⚠️ [REGISTRATION REJECTED] Email ${cleanEmail} already exists in memory store.`);
      await logActivity(
        {
          eventType: "Registration",
          status: "failed",
          userName: cleanName,
          email: cleanEmail,
          details: "Registration rejected: Email already exists in memory store",
        },
        req
      );
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newMemUser = {
      _id: `user_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      country: cleanCountry,
      mobileNumber: cleanMobile,
      phone: phone,
      passwordHash: passwordHash,
      tier: "Silver" as const,
      verified: true,
      createdAt: new Date(),
    };

    memoryStore.users.push(newMemUser);
    
    // Also push to memory customers
    const existingMemCust = memoryStore.customers.find((c) => c.email === cleanEmail);
    if (!existingMemCust) {
      memoryStore.customers.push({
        _id: `cust_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        tier: "Silver",
        ordersCount: 0,
        lifetimeSpend: 0,
        createdAt: new Date(),
      });
    }

    console.log(`ℹ️ [REGISTRATION MEMORY SUCCESS] Saved to in-memory store. Total in-memory users: ${memoryStore.users.length}`);

    await logActivity(
      {
        eventType: "Registration",
        status: "success",
        userName: newMemUser.fullName,
        email: newMemUser.email,
        details: "New account registered (in-memory mode)",
      },
      req
    );

    const token = jwt.sign({ userId: newMemUser._id, email: newMemUser.email }, JWT_SECRET, { expiresIn: "30d" });

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
        tier: newMemUser.tier,
      },
      token,
      storage: "in-memory-fallback",
      database: "alikendshop",
      collection: "users",
    });
  } catch (err: any) {
    console.error("💥 [REGISTRATION FATAL ERROR]:", err);
    return res.status(500).json({
      error: err.message || "Registration encountered an internal server error",
    });
  }
});

// POST /api/auth/login - Strict User password authentication against MongoDB alikendshop.users
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Phone and password are required" });
    }

    const cleanId = String(identifier).toLowerCase().trim();

    if (!isMongoConnected()) {
      return res.status(503).json({
        error: "Database is currently connecting. Please try again in a moment.",
      });
    }

    // Query MongoDB alikendshop.users collection strictly
    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { mobileNumber: identifier },
        { phone: identifier },
      ],
    });

    // 1. If no matching user document exists in MongoDB, fail immediately
    if (!user) {
      console.warn(`⚠️ [LOGIN REJECTED] No MongoDB user document found for identifier: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: "Unregistered User",
          email: cleanId,
          details: "Login failed: No account found in alikendshop.users",
        },
        req
      );
      return res.status(404).json({
        success: false,
        error: "No account found, please register first.",
      });
    }

    // 2. Check if user account is blocked by admin
    if (user.isBlocked) {
      console.warn(`⛔ [LOGIN BLOCKED] Blocked account attempted login: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: user.fullName,
          email: user.email,
          details: "Login blocked: Account has been suspended by administrator",
        },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended or blocked by an administrator. Please contact support.",
      });
    }

    // 3. Check password against MongoDB bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.warn(`⚠️ [LOGIN REJECTED] Incorrect password for MongoDB user: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: user.fullName,
          email: user.email,
          details: "Login failed: Incorrect password provided",
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Incorrect password. Please verify your credentials and try again.",
      });
    }

    // 4. User authenticated successfully against MongoDB
    console.log(`✅ [LOGIN SUCCESS] User authenticated in MongoDB alikendshop.users: ${user.email} (ID: ${user._id})`);
    
    // Automatically record successful login in activity_logs collection
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: user.fullName,
        email: user.email,
        details: "Password authentication verified in alikendshop.users",
      },
      req
    );

    const token = jwt.sign({ userId: user._id, email: user.email, role: "customer" }, JWT_SECRET, { expiresIn: "30d" });

    // Check if this user is also registered as an Administrator in alikendshop.admins
    let adminToken: string | null = null;
    let isAdmin = false;
    let adminRole = "superadmin";

    try {
      const adminDoc = await Admin.findOne({ email: user.email.toLowerCase().trim() });
      if (adminDoc && adminDoc.isActive !== false) {
        isAdmin = true;
        adminRole = adminDoc.role || "superadmin";
        adminToken = jwt.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        console.log(`👑 [ADMIN PRIVILEGE DETECTED] Auto-minted admin token on login for: ${user.email}`);
      }
    } catch (e) {
      console.warn("Admin check warning:", e);
    }

    // Check if this user is an approved Seller
    let isSeller = false;
    let sellerStatus: string | null = null;
    let sellerShopName: string | null = null;
    try {
      const sellerDoc = await Seller.findOne({ email: user.email.toLowerCase().trim() });
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
        tier: user.tier,
      },
      token,
      isAdmin,
      adminRole,
      adminToken,
      isSeller,
      sellerStatus,
      sellerShopName,
      database: "alikendshop",
      collection: "users",
    });
  } catch (err: any) {
    console.error("💥 [LOGIN ERROR]:", err);
    res.status(500).json({ error: err.message || "Login failed due to an internal server error" });
  }
});

// POST /api/auth/google - Authenticate or verify Google account against MongoDB alikendshop.users
router.post("/google", async (req, res) => {
  try {
    const { email, googleId, name, autoRegister } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required for Google authentication" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name || cleanEmail.split("@")[0] || "Google Member").trim();

    console.log(`🔍 [GOOGLE AUTH] Verifying user account for: ${cleanEmail} (googleId: ${googleId || "none"})`);

    let existingUser: any = null;

    if (isMongoConnected()) {
      try {
        existingUser = await User.findOne({
          $or: [
            { email: cleanEmail },
            { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
          ],
        });
      } catch (dbErr: any) {
        console.warn("MongoDB Google lookup error:", dbErr?.message);
      }
    }

    if (!existingUser) {
      existingUser = (memoryStore.users || []).find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );
    }

    // 1. If user already exists in database, log them in directly
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({
          success: false,
          error: "Your account has been suspended or blocked by an administrator. Please contact support.",
        });
      }

      const token = jwt.sign(
        { userId: String(existingUser._id), email: existingUser.email, role: "customer" },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Check admin status
      let adminToken: string | null = null;
      try {
        const adminDoc = await Admin.findOne({ email: cleanEmail });
        if (adminDoc && adminDoc.isActive !== false) {
          const adminRole = adminDoc.role || (cleanEmail === "noyondey176@gmail.com" ? "superadmin" : "admin");
          adminToken = jwt.sign(
            { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
        }
      } catch (_e) {}

      await logActivity(
        {
          eventType: "Login",
          status: "success",
          userName: existingUser.fullName || cleanName,
          email: existingUser.email,
          details: "Google authentication verified in alikendshop.users",
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
          country: existingUser.country || "Bangladesh",
        },
      });
    }

    // 2. User does not exist in database
    if (autoRegister) {
      // Auto-register new Google user in database
      const randomPassword = `G_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      let newUser: any = null;

      if (isMongoConnected()) {
        try {
          const userDoc = new User({
            fullName: cleanName,
            email: cleanEmail,
            country: "Bangladesh",
            mobileNumber: "",
            phone: "",
            passwordHash,
            tier: "Silver",
            verified: true,
            isBlocked: false,
          });
          await userDoc.save();
          newUser = userDoc;
        } catch (saveErr: any) {
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
          createdAt: new Date(),
        };
        memoryStore.users.push(newUser);
      }

      const token = jwt.sign(
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
          details: "New user registered via Google OAuth in alikendshop.users",
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
          country: "Bangladesh",
        },
      });
    }

    // If not autoRegister, inform frontend that user is not yet registered
    return res.json({
      success: true,
      isExisting: false,
      isNew: true,
      message: "No account found in alikendshop.users. Registration required.",
    });
  } catch (err: any) {
    console.error("💥 [GOOGLE AUTH ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Google authentication failed" });
  }
});

// GET /api/auth/me - Verify current session against live MongoDB alikendshop.users
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({ valid: false, error: "Database offline" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ valid: false, error: "User document no longer exists in database" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ valid: false, error: "Account has been suspended by an administrator." });
    }

    let adminToken: string | null = null;
    let isAdmin = false;
    try {
      const adminDoc = await Admin.findOne({ email: user.email.toLowerCase().trim() });
      if (adminDoc && adminDoc.isActive !== false) {
        isAdmin = true;
        adminToken = jwt.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminDoc.role || "superadmin" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
      }
    } catch (e) {}

    let isSeller = false;
    let sellerStatus: string | null = null;
    let sellerShopName: string | null = null;
    try {
      const sellerDoc = await Seller.findOne({ email: user.email.toLowerCase().trim() });
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
    } catch (sErr) {}

    return res.json({
      valid: true,
      user: {
        _id: String(user._id),
        name: user.fullName,
        email: user.email,
        phone: user.phone || `${user.country} ${user.mobileNumber}`,
        country: user.country,
        mobileNumber: user.mobileNumber,
        tier: user.tier,
      },
      isAdmin,
      adminToken,
      isSeller,
      sellerStatus,
      sellerShopName,
    });
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

export default router;
