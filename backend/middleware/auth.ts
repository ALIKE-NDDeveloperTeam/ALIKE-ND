import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { isMongoConnected, memoryStore } from "../store";

// Lazy getter for JWT_SECRET - never crashes the entire server/serverless function at module load time.
// Public, unauthenticated routes (browsing products, homepage, etc.) remain fully functional even if JWT_SECRET is unconfigured.
export function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

// Log a prominent warning at server startup if JWT_SECRET is missing without crashing the process
if (!getJwtSecret()) {
  console.error(
    "\n===============================================================================\n" +
    "⚠️  CRITICAL CONFIGURATION WARNING: JWT_SECRET environment variable is not set!\n" +
    "    - Public routes (products, categories, homepage) will continue to work.\n" +
    "    - Authenticated routes and token operations will return HTTP 503 JSON errors.\n" +
    "    - ACTION: Set JWT_SECRET in your Vercel or production Environment Variables.\n" +
    "===============================================================================\n"
  );
}

// Dynamic proxy export for backward compatibility with existing imports: `import { JWT_SECRET } from ...`
// Reading JWT_SECRET at runtime resolves to process.env.JWT_SECRET lazily.
export const JWT_SECRET: string = new Proxy(
  {},
  {
    get(_target, prop) {
      const secret = getJwtSecret();
      if (!secret) {
        throw new Error(
          "JWT_SECRET is not configured in environment variables. Authenticated operations cannot proceed."
        );
      }
      return (secret as any)[prop];
    },
    // Allows operations like `jwt.sign(..., JWT_SECRET)` or `String(JWT_SECRET)`
    toPrimitive() {
      const secret = getJwtSecret();
      if (!secret) {
        throw new Error(
          "JWT_SECRET is not configured in environment variables. Authenticated operations cannot proceed."
        );
      }
      return secret;
    },
    toString() {
      const secret = getJwtSecret();
      if (!secret) {
        throw new Error(
          "JWT_SECRET is not configured in environment variables. Authenticated operations cannot proceed."
        );
      }
      return secret;
    },
    valueOf() {
      const secret = getJwtSecret();
      if (!secret) {
        throw new Error(
          "JWT_SECRET is not configured in environment variables. Authenticated operations cannot proceed."
        );
      }
      return secret;
    }
  }
) as unknown as string;

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

export function isSuperAdminRole(recordOrRole?: { role?: string; email?: string } | string, emailFallback?: string): boolean {
  if (!recordOrRole) return false;

  let role: string | undefined;
  let email: string | undefined;

  if (typeof recordOrRole === "string") {
    role = recordOrRole;
    email = emailFallback;
  } else {
    role = recordOrRole.role;
    email = recordOrRole.email || emailFallback;
  }

  // 1. Primary check: Database role is explicitly "superadmin"
  if (role === "superadmin") {
    return true;
  }

  // 2. Backward compatibility fallback: Configurable environment variable (e.g. SUPERADMIN_EMAIL)
  const envSuperAdminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  if (envSuperAdminEmail && email) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === envSuperAdminEmail) {
      return true;
    }
  }

  return false;
}

export function resolveAdminRole(recordOrRole?: { role?: string; email?: string } | string, emailFallback?: string): "superadmin" | "admin" {
  return isSuperAdminRole(recordOrRole, emailFallback) ? "superadmin" : "admin";
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
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
      error: "Authentication required: Missing or invalid Authorization header.",
    });
  }

  const token = header.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
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

        const role = resolveAdminRole(adminDoc);

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

    const role = resolveAdminRole(memAdmin);

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

  if (!isSuperAdminRole(req.admin)) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Super Admin privilege required for this restricted action. Regular Admin accounts cannot perform this operation.",
    });
  }

  return next();
}


