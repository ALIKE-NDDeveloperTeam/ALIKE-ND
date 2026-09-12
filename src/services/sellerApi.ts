import { SellerProfile } from "../types";

const API_BASE = "/api/sellers";

export interface RegisterSellerPayload {
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  email: string;
  businessAddress: string;
  password?: string;
}

export interface SellerProductPayload {
  name: string;
  brand?: string;
  price: number;
  mrp: number;
  category?: string;
  image?: string;
  images?: string[];
  description?: string;
  stock?: number;
  stockStatus?: string;
  specifications?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
}

function getToken(): string | null {
  try {
    return localStorage.getItem("alike_seller_token");
  } catch {
    return null;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || body.message || `Request failed (${res.status})`);
  }
  return body;
}

export const sellerApi = {
  getToken,
  setToken: (token: string) => {
    try {
      localStorage.setItem("alike_seller_token", token);
    } catch {}
  },
  clearToken: () => {
    try {
      localStorage.removeItem("alike_seller_token");
      localStorage.removeItem("alike_seller_profile");
    } catch {}
  },
  getStoredProfile: (): SellerProfile | null => {
    try {
      const raw = localStorage.getItem("alike_seller_profile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setStoredProfile: (profile: SellerProfile) => {
    try {
      localStorage.setItem("alike_seller_profile", JSON.stringify(profile));
    } catch {}
  },

  register: (payload: RegisterSellerPayload) =>
    request("/register", { method: "POST", body: JSON.stringify(payload) }),

  login: async (email: string, password: string) => {
    const res = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      sellerApi.setToken(res.token);
    }
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  getMe: () => request("/me"),

  getMyProducts: () => request("/products"),

  createProduct: (product: SellerProductPayload) =>
    request("/products", { method: "POST", body: JSON.stringify(product) }),

  updateProduct: (id: number | string, product: Partial<SellerProductPayload>) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(product) }),

  deleteProduct: (id: number | string) =>
    request(`/products/${id}`, { method: "DELETE" }),
};
