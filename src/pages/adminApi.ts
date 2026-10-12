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
      headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
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

  getSellers: async () => {
    const res = await request("/sellers");
    return Array.isArray(res) ? res : (res?.sellers || []);
  },
  updateSellerStatus: (id: string, status: string) =>
    request(`/sellers/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  verifySellerKyc: (id: string, kycVerified: boolean) =>
    request(`/sellers/${id}/verify-kyc`, { method: "PATCH", body: JSON.stringify({ kycVerified }) }),

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
  createAdminUser: (data: {
    email: string;
    name: string;
    password: string;
    role?: string;
    phone?: string;
    department?: string;
    designation?: string;
  }) => request("/admin-users", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) => request(`/admin-users/${id}`, { method: "DELETE" }),
  resetAdminPassword: (id: string, newPassword: string) =>
    request(`/admin-users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword }) }),

  // Password Management for Current Admin
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request("/change-password", { method: "POST", body: JSON.stringify(data) }),

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

  // Flash Sale Management (Countdown & Products)
  getFlashSale: () => request("/flash-sale"),
  updateFlashSaleConfig: (data: { title?: string; subtitle?: string; bannerText?: string; targetEndTime?: string }) =>
    request("/flash-sale/config", { method: "PUT", body: JSON.stringify(data) }),
  addFlashSaleProduct: (data: { productId: string | number; flashPrice?: number; discountPercent?: number; isFeatured?: boolean; order?: number }) =>
    request("/flash-sale/products", { method: "POST", body: JSON.stringify(data) }),
  removeFlashSaleProduct: (id: string | number) =>
    request(`/flash-sale/products/${id}`, { method: "DELETE" }),

  // Category Management (Category Carousel Cards)
  getCategories: async (all: boolean = true) => {
    const res = await request(`/categories${all ? '?all=true' : ''}`);
    return Array.isArray(res) ? res : (res?.categories || []);
  },
  createCategory: (data: {
    titleEn: string;
    titleBn: string;
    imageUrl: string;
    badgeText?: string;
    badgeColor?: string;
    redirectUrl?: string;
    order?: number;
    isActive?: boolean;
  }) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) =>
    request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request(`/categories/${id}`, { method: "DELETE" }),
  reorderCategories: (items: Array<{ id: string; order: number }>) =>
    request("/categories/reorder", { method: "PUT", body: JSON.stringify({ items }) }),

  // Multi-Database & Cloud Storage Hub (MongoDB, Firebase, Supabase, Cloudinary, AWS S3, Appwrite)
  getDatabaseHubStatus: () => request("/database-hub/status"),
  updateDatabaseConfig: (data: any) =>
    request("/database-hub/config", { method: "POST", body: JSON.stringify(data) }),
  toggleDatabaseService: (providerId: string, enabled: boolean) =>
    request("/database-hub/toggle-service", { method: "POST", body: JSON.stringify({ providerId, enabled }) }),
  testDatabaseConnection: (providerId: string) =>
    request("/database-hub/test-connection", { method: "POST", body: JSON.stringify({ providerId }) }),
  syncDatabases: (fromProvider: string, toProvider: string, collections?: string[]) =>
    request("/database-hub/sync", { method: "POST", body: JSON.stringify({ fromProvider, toProvider, collections }) }),
  exportDatabaseBackup: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/database-hub/export-backup`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to export backup");
    return res.json();
  },
  restoreDatabaseBackup: (backupData: any) =>
    request("/database-hub/restore-backup", { method: "POST", body: JSON.stringify({ backupData }) }),

  // Central Customer Care & Hotline Management System
  getCustomerCareStats: () => request("/customer-care/stats"),
  getHotlines: () => request("/customer-care/hotlines"),
  createHotline: (data: any) =>
    request("/customer-care/hotlines", { method: "POST", body: JSON.stringify(data) }),
  updateHotline: (id: string, data: any) =>
    request(`/customer-care/hotlines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleHotline: (id: string) =>
    request(`/customer-care/hotlines/${id}/toggle`, { method: "PATCH" }),
  deleteHotline: (id: string) =>
    request(`/customer-care/hotlines/${id}`, { method: "DELETE" }),
  trackHotlineCall: (id: string) =>
    request(`/customer-care/hotlines/${id}/track-call`, { method: "POST" }),

  getCareTickets: (params?: { status?: string; priority?: string; category?: string; search?: string; agent?: string }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== "all") q.append("status", params.status);
    if (params?.priority && params.priority !== "all") q.append("priority", params.priority);
    if (params?.category && params.category !== "all") q.append("category", params.category);
    if (params?.agent && params.agent !== "all") q.append("agent", params.agent);
    if (params?.search && params.search.trim()) q.append("search", params.search.trim());
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request(`/customer-care/tickets${qs}`);
  },
  createCareTicket: (data: any) =>
    request("/customer-care/tickets", { method: "POST", body: JSON.stringify(data) }),
  getCareTicketDetails: (id: string) =>
    request(`/customer-care/tickets/${id}`),
  updateCareTicket: (id: string, data: any) =>
    request(`/customer-care/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  replyCareTicket: (id: string, data: { message: string; isInternalNote?: boolean; attachments?: any[] }) =>
    request(`/customer-care/tickets/${id}/reply`, { method: "POST", body: JSON.stringify(data) }),
  escalateCareTicket: (id: string, data: { reason?: string; targetDepartment?: string }) =>
    request(`/customer-care/tickets/${id}/escalate`, { method: "POST", body: JSON.stringify(data) }),

  getCareCustomers: (search?: string) => {
    const qs = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return request(`/customer-care/customers${qs}`);
  },
  getCareCustomerTimeline: (email: string) =>
    request(`/customer-care/customers/${encodeURIComponent(email)}/timeline`),

  getCareAgents: () => request("/customer-care/agents"),
  createCareAgent: (data: any) =>
    request("/customer-care/agents", { method: "POST", body: JSON.stringify(data) }),
  updateCareAgent: (id: string, data: any) =>
    request(`/customer-care/agents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCareAgent: (id: string) =>
    request(`/customer-care/agents/${id}`, { method: "DELETE" }),

  getCareKnowledgeBase: (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== "all") q.append("category", params.category);
    if (params?.search && params.search.trim()) q.append("search", params.search.trim());
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request(`/customer-care/knowledge-base${qs}`);
  },
  createKnowledgeArticle: (data: any) =>
    request("/customer-care/knowledge-base", { method: "POST", body: JSON.stringify(data) }),
  updateKnowledgeArticle: (id: string, data: any) =>
    request(`/customer-care/knowledge-base/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteKnowledgeArticle: (id: string) =>
    request(`/customer-care/knowledge-base/${id}`, { method: "DELETE" }),

  getCareCannedTemplates: () => request("/customer-care/templates"),
  getCareReports: () => request("/customer-care/reports"),
  getCareSettings: () => request("/customer-care/settings"),
  updateCareSettings: (data: any) =>
    request("/customer-care/settings", { method: "PUT", body: JSON.stringify(data) }),
  getCareAuditLogs: () => request("/customer-care/audit-logs"),

  setToken: (token: string) => localStorage.setItem("alikend_admin_token", token),
  clearToken: () => {
    localStorage.removeItem("alikend_admin_token");
    sessionStorage.removeItem("alikend_admin_token");
  },
  hasToken: () => !!getToken(),
};

