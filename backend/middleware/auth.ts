import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { isMongoConnected, memoryStore } from "../store";

const JWT_SECRET = process.env.JWT_SECRET || "alikend_luxury_secret_jwt_2026";

export interface AuthedRequest extends Request {
  adminId?: string;
  admin?: {
    _id: string;
    email: string;
    name: string;
    role: "superadmin" | "admin";
    isActive?: boolean;
  };
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required: Missing or invalid Authorization header.",
    });
  }

  const token = header.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired admin session token.",
    });
  }

  // Check if token is for a regular customer/user instead of an admin
  if (!payload || !payload.adminId || payload.role === "customer" || payload.userId) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Admin privileges required. Regular customer accounts cannot access admin routes.",
    });
  }

  // 1. Verify in MongoDB 'admins' collection
  if (isMongoConnected()) {
    try {
      const adminDoc = await Admin.findById(payload.adminId);
      if (adminDoc) {
        if (adminDoc.isActive === false) {
          return res.status(403).json({
            success: false,
            error: "Access denied: Admin account is inactive or suspended.",
          });
        }

        const role = adminDoc.role === "superadmin" || adminDoc.email.toLowerCase().trim() === "noyondey176@gmail.com"
          ? "superadmin"
          : "admin";

        req.adminId = String(adminDoc._id);
        req.admin = {
          _id: String(adminDoc._id),
          email: adminDoc.email,
          name: adminDoc.name,
          role,
          isActive: adminDoc.isActive,
        };
        return next();
      }
    } catch (dbErr: any) {
      console.warn("MongoDB admin lookup error:", dbErr?.message);
    }
  }

  // 2. Fallback check in memoryStore.admins
  const memAdmin = (memoryStore.admins || []).find(
    (a) => a.email.toLowerCase() === (payload.email || "").toLowerCase() || a._id === payload.adminId
  );
  if (memAdmin) {
    if (memAdmin.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Access denied: Admin account is inactive.",
      });
    }

    const role = memAdmin.role === "superadmin" || memAdmin.email.toLowerCase().trim() === "noyondey176@gmail.com"
      ? "superadmin"
      : "admin";

    req.adminId = memAdmin._id || "admin_mem";
    req.admin = {
      _id: memAdmin._id || "admin_mem",
      email: memAdmin.email,
      name: memAdmin.name,
      role,
      isActive: memAdmin.isActive,
    };
    return next();
  }

  return res.status(403).json({
    success: false,
    error: "Access denied: Admin account not found.",
  });
}

export function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  if (req.admin.role !== "superadmin" && req.admin.email.toLowerCase().trim() !== "noyondey176@gmail.com") {
    return res.status(403).json({
      success: false,
      error: "Access denied: Super Admin privilege required for this restricted action. Regular Admin accounts cannot perform this operation.",
    });
  }

  return next();
}

export { JWT_SECRET };


