const API_BASE = "/api/admin";

function getToken() {
  return localStorage.getItem("alikend_admin_token") || sessionStorage.getItem("alikend_admin_token");
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
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const adminApi = {
  login: (email: string, password: string) =>
    request("/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  bridgeLogin: (userToken?: string, email?: string) =>
    request("/bridge-login", {
      method: "POST",
      body: JSON.stringify({ userToken, email }),
    }),

  getMe: () => request("/me"),
  getStats: () => request("/stats"),

  getProducts: () => request("/products"),
  createProduct: (data: unknown) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: unknown) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: "DELETE" }),

  getOrders: () => request("/orders"),
  updateOrderStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  getSellers: () => request("/sellers"),
  updateSellerStatus: (id: string, status: string) =>
    request(`/sellers/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  getCustomers: () => request("/customers"),
  blockCustomer: (id: string, isBlocked: boolean) =>
    request(`/customers/${id}/block`, { method: "PATCH", body: JSON.stringify({ isBlocked }) }),
  updateCustomerTier: (id: string, tier: string) =>
    request(`/customers/${id}/tier`, { method: "PATCH", body: JSON.stringify({ tier }) }),

  getActivityLogs: async (filter?: string, search?: string) => {
    const params = new URLSearchParams();
    if (filter && filter !== "all") params.append("filter", filter);
    if (search && search.trim()) params.append("search", search.trim());
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await request(`/activity-logs${queryStr}`);
    return res?.logs || [];
  },
  createActivityLog: (data: unknown) =>
    request("/activity-logs", { method: "POST", body: JSON.stringify(data) }),
  clearActivityLogs: () =>
    request("/activity-logs", { method: "DELETE" }),

  // Superadmin Exclusive Admin Management
  getAdminUsers: () => request("/admin-users"),
  createAdminUser: (data: { email: string; name: string; password: string; role?: string }) =>
    request("/admin-users", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) => request(`/admin-users/${id}`, { method: "DELETE" }),

  // Superadmin Exclusive Sales & Revenue Reports
  getSalesReport: () => request("/reports"),

  // Superadmin Exclusive Platform Commission & Wallet
  getCommissionData: () => request("/commission"),
  updateCommissionRate: (commissionRate: number) =>
    request("/commission/settings", {
      method: "PATCH",
      body: JSON.stringify({ commissionRate }),
    }),
  withdrawPlatformFunds: (amount: number, note?: string) =>
    request("/commission/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    }),

  // Banner Management (Hero Carousel Slides)
  getBanners: () => request("/banners"),
  createBanner: (data: {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    link?: string;
    order?: number;
    active?: boolean;
  }) => request("/banners", { method: "POST", body: JSON.stringify(data) }),
  updateBanner: (id: string, data: any) =>
    request(`/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleBanner: (id: string) =>
    request(`/banners/${id}/toggle`, { method: "PATCH" }),
  deleteBanner: (id: string) =>
    request(`/banners/${id}`, { method: "DELETE" }),
  reorderBanners: (bannerIds: string[]) =>
    request("/banners/reorder", { method: "PUT", body: JSON.stringify({ bannerIds }) }),

  setToken: (token: string) => localStorage.setItem("alikend_admin_token", token),
  clearToken: () => {
    localStorage.removeItem("alikend_admin_token");
    sessionStorage.removeItem("alikend_admin_token");
  },
  hasToken: () => !!getToken(),
};

