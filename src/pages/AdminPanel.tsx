import React, { useEffect, useState, FormEvent } from "react";
import "../styles/AdminPanel.css";
import { adminApi } from "./adminApi";
import { 
  Product, 
  Order, 
  Seller, 
  Customer, 
  OrderStatus, 
  SellerStatus, 
  AdminStats, 
  AdminProfile, 
  ActivityLogEvent,
  AdminAccount,
  SalesReport,
  Banner,
  CommissionData
} from "./adminTypes";
import BannerManagement from "./admin/BannerManagement";
import CommissionWallet from "./admin/CommissionWallet";
import Logo from "../components/Logo";
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Store, 
  Users, 
  BarChart3, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Unlock, 
  Search, 
  RefreshCw, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  UserPlus,
  LogIn,
  ShieldAlert,
  Clock,
  Laptop,
  Globe,
  Copy,
  Check,
  Filter,
  Menu,
  X,
  Sparkles,
  Home,
  Flame,
  Star,
  Tag,
  Briefcase,
  Layers,
  ArrowRight,
  Shield,
  Crown,
  Lock,
  Eye,
  Key,
  Phone,
  MapPin,
  Mail,
  Wallet
} from "lucide-react";

export type Section = "dashboard" | "products" | "orders" | "sellers" | "customers" | "banners" | "reports" | "adminUsers" | "activity" | "commission";

const SEAL_LABEL: Record<string, string> = {
  pending: "Pending Approval",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  approved: "Approved",
  review: "In Review",
  suspended: "Suspended",
  rejected: "Rejected",
  blocked: "Blocked",
  active: "Active",
};

function Seal({ status }: { status: string }) {
  const getBadgeClass = () => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "suspended":
        return "bg-neutral-200 text-neutral-800 border-neutral-400";
      case "review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-300";
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass()}`}>
      {SEAL_LABEL[status] || status}
    </span>
  );
}

interface AdminPanelProps {
  onNavigateHome?: () => void;
  user?: { email?: string; name?: string; _id?: string; tier?: string } | null;
  onProductsChange?: (products: Product[]) => void;
  initialAdmin?: { _id?: string; name: string; email: string; role: string } | null;
}

export default function AdminPanel({
  onNavigateHome,
  user,
  onProductsChange,
  initialAdmin,
}: AdminPanelProps) {
  const [loggedIn, setLoggedIn] = useState(adminApi.hasToken() || !!initialAdmin);
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(
    initialAdmin
      ? {
          _id: initialAdmin._id || "admin_init",
          name: initialAdmin.name,
          email: initialAdmin.email,
          role: initialAdmin.role === "superadmin" ? "superadmin" : "admin",
        }
      : null
  );
  const [loginEmail, setLoginEmail] = useState(user?.email || "noyondey176@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(true);

  const [section, setSection] = useState<Section>("dashboard");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminAccount[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [isUpdatingCommissionRate, setIsUpdatingCommissionRate] = useState(false);

  // Search and Filter states
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodFlashFilter, setProdFlashFilter] = useState<"all" | "flash" | "regular">("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("");
  const [custSearch, setCustSearch] = useState("");
  const [custTierFilter, setCustTierFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "registration" | "login" | "failed_login">("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Product modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmProductNameInput, setConfirmProductNameInput] = useState("");
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Admin Accounts Management Modal State (Super Admin Only)
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "superadmin">("admin");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Admin Deletion with Type-To-Confirm
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);
  const [confirmAdminEmailInput, setConfirmAdminEmailInput] = useState("");
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  const isSuperAdmin = Boolean(
    currentAdmin &&
    (currentAdmin.role === "superadmin" || currentAdmin.email?.toLowerCase().trim() === "noyondey176@gmail.com")
  );

  // Strictly redirect away from superadmin-only sections if logged in as regular admin
  useEffect(() => {
    if (!isSuperAdmin && (section === "commission" || section === "reports" || section === "adminUsers")) {
      setSection("dashboard");
    }
  }, [isSuperAdmin, section]);

  // Validate admin token or bridge from active user session against MongoDB alikendshop.admins on load
  useEffect(() => {
    let isMounted = true;

    async function authenticateAdmin() {
      setIsAutoChecking(true);
      setLoginError("");

      // 0. Use initialAdmin prop if supplied directly by parent view transition
      if (initialAdmin && isMounted) {
        const formattedAdmin: AdminProfile = {
          _id: initialAdmin._id || "admin_init",
          name: initialAdmin.name,
          email: initialAdmin.email,
          role: initialAdmin.role === "superadmin" ? "superadmin" : "admin",
        };
        setCurrentAdmin(formattedAdmin);
        setLoggedIn(true);
        setIsAutoChecking(false);
        loadAll(formattedAdmin);
        return;
      }

      // 1. Try existing admin token
      if (adminApi.hasToken()) {
        try {
          const res = await adminApi.getMe();
          if (res && res.valid && res.admin && isMounted) {
            setCurrentAdmin(res.admin);
            setLoggedIn(true);
            setIsAutoChecking(false);
            loadAll(res.admin);
            return;
          }
        } catch {
          console.warn("Existing admin token invalid or expired.");
          adminApi.clearToken();
        }
      }

      // 2. If user is currently authenticated in the app
      const userToken = localStorage.getItem("alike_user_token");
      const userStorage = localStorage.getItem("alike_user");
      let activeEmail = user?.email;
      if (!activeEmail && userStorage) {
        try { activeEmail = JSON.parse(userStorage)?.email; } catch {}
      }

      if (activeEmail || userToken) {
        try {
          const bridgeRes = await adminApi.bridgeLogin(userToken || undefined, activeEmail);
          if (bridgeRes && bridgeRes.success && bridgeRes.token && isMounted) {
            adminApi.setToken(bridgeRes.token);
            setCurrentAdmin(bridgeRes.admin);
            setLoggedIn(true);
            setIsAutoChecking(false);
            loadAll(bridgeRes.admin);
            return;
          }
        } catch (bridgeErr) {
          console.log("No automatic admin privileges for user:", activeEmail);
        }
      }

      if (isMounted) {
        if (activeEmail) setLoginEmail(activeEmail);
        setLoggedIn(false);
        setIsAutoChecking(false);
      }
    }

    authenticateAdmin();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function loadAll(activeAdmin?: AdminProfile | null) {
    setLoading(true);
    setError("");
    try {
      const [p, o, s, c, st, logs, bList] = await Promise.all([
        adminApi.getProducts().catch(() => []),
        adminApi.getOrders().catch(() => []),
        adminApi.getSellers().catch(() => []),
        adminApi.getCustomers().catch(() => []),
        adminApi.getStats().catch(() => null),
        adminApi.getActivityLogs().catch(() => []),
        adminApi.getBanners().catch(() => []),
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setSellers(s || []);
      setCustomers(c || []);
      setActivityLogs(logs || []);
      setBanners(bList || []);
      if (st) setStats(st);

      // Load SuperAdmin exclusive datasets ONLY if role is superadmin
      const effectiveAdmin = activeAdmin !== undefined ? activeAdmin : currentAdmin;
      const isSuper = effectiveAdmin?.role === "superadmin" || effectiveAdmin?.email?.toLowerCase() === "noyondey176@gmail.com";
      if (isSuper) {
        try {
          const adminsList = await adminApi.getAdminUsers();
          setAdminUsers(adminsList || []);
        } catch (e) {
          console.warn("Could not load admin users list:", e);
        }
        try {
          const rep = await adminApi.getSalesReport();
          setSalesReport(rep);
        } catch (e) {
          console.warn("Could not load sales report:", e);
        }
        try {
          const comm = await adminApi.getCommissionData();
          setCommissionData(comm);
        } catch (e) {
          console.warn("Could not load commission data:", e);
        }
      } else {
        // Clear any superadmin data for non-superadmin
        setAdminUsers([]);
        setSalesReport(null);
        setCommissionData(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load database records");
    } finally {
      setLoading(false);
    }
  }

  async function loadCommission() {
    try {
      const data = await adminApi.getCommissionData();
      if (data) {
        setCommissionData(data);
      }
    } catch (err: any) {
      console.warn("Failed to load commission data:", err);
    }
  }

  async function handleUpdateCommissionRate(newRate: number) {
    setIsUpdatingCommissionRate(true);
    try {
      const res = await adminApi.updateCommissionRate(newRate);
      flashSuccess(res?.message || `Platform commission rate updated to ${newRate}%`);
      await loadCommission();
    } catch (err: any) {
      setError(err?.message || "Failed to update commission rate");
    } finally {
      setIsUpdatingCommissionRate(false);
    }
  }

  // Load superadmin items when switching tabs if needed, and kick non-superadmin back to dashboard
  useEffect(() => {
    if (loggedIn && isSuperAdmin) {
      if (section === "adminUsers" && adminUsers.length === 0) {
        adminApi.getAdminUsers().then(res => setAdminUsers(res || [])).catch(() => {});
      }
      if (section === "reports" && !salesReport) {
        adminApi.getSalesReport().then(res => setSalesReport(res)).catch(() => {});
      }
      if (section === "commission") {
        loadCommission();
      }
    } else if (loggedIn && !isSuperAdmin) {
      if (section === "adminUsers" || section === "reports" || section === "commission") {
        setSection("dashboard");
      }
    }
  }, [section, loggedIn, isSuperAdmin]);

  function flashSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);
    try {
      const res = await adminApi.login(loginEmail, loginPassword);
      if (res.success && res.token) {
        adminApi.setToken(res.token);
        localStorage.setItem("alikend_admin_token", res.token);
        setCurrentAdmin(res.admin);
        setLoggedIn(true);
        setLoginPassword("");
        loadAll(res.admin);
      } else {
        setLoginError(res.error || "Admin authentication failed.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid admin email or password");
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  function handleLogout() {
    adminApi.clearToken();
    localStorage.removeItem("alikend_admin_token");
    setCurrentAdmin(null);
    setLoggedIn(false);
  }

  // --- Products: Add, Edit, Delete ---
  async function handleSaveProduct(data: Omit<Product, "_id">) {
    try {
      let updatedList: Product[] = [];
      if (editingProduct) {
        const updated = await adminApi.updateProduct(editingProduct._id, data);
        updatedList = products.map((p) => (p._id === updated._id ? updated : p));
        setProducts(updatedList);
        flashSuccess(`Product "${updated.name}" updated successfully.`);
      } else {
        const created = await adminApi.createProduct(data);
        updatedList = [created, ...products];
        setProducts(updatedList);
        flashSuccess(`Product "${created.name}" created and synced to MongoDB.`);
      }
      setModalOpen(false);
      setEditingProduct(null);

      // Sync changes back to parent and Homepage state
      if (onProductsChange) {
        onProductsChange(updatedList);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save product listing");
    }
  }

  function handleDeleteProduct(id: string, name: string) {
    setProductToDelete({ id, name });
    setConfirmProductNameInput("");
  }

  async function handleConfirmDeleteProduct() {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await adminApi.deleteProduct(productToDelete.id);
      const updatedList = products.filter((p) => (p._id && p._id !== productToDelete.id) && String(p.id) !== productToDelete.id);
      setProducts(updatedList);
      flashSuccess(`Product "${productToDelete.name}" permanently deleted from catalog.`);
      if (onProductsChange) {
        onProductsChange(updatedList);
      }
      setProductToDelete(null);
      setConfirmProductNameInput("");
    } catch (err: any) {
      alert(err.message || "Failed to remove product");
    } finally {
      setIsDeletingProduct(false);
    }
  }

  // --- Orders: Status Transitions ---
  async function handleOrderStatus(id: string, status: OrderStatus) {
    setActionLoadingId(id);
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      flashSuccess(`Order status updated to "${SEAL_LABEL[status]}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setActionLoadingId(null);
    }
  }

  // --- Sellers: Approve, Review, Suspend, Reject ---
  async function handleSellerStatus(id: string, status: SellerStatus) {
    setActionLoadingId(id);
    try {
      const updated = await adminApi.updateSellerStatus(id, status);
      setSellers((prev) => prev.map((s) => (s._id === id ? updated : s)));
      flashSuccess(`Seller storefront status set to "${SEAL_LABEL[status]}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update seller status");
    } finally {
      setActionLoadingId(null);
    }
  }

  // --- Users/Customers: Block/Unblock & Loyalty Tier (Super Admin Exclusive) ---
  async function handleToggleUserBlock(customer: Customer) {
    if (!isSuperAdmin) {
      alert("Permission Denied: Only Super Administrators can block or unblock customer accounts.");
      return;
    }
    const nextState = !customer.isBlocked;
    const confirmPrompt = nextState
      ? `Are you sure you want to BLOCK customer "${customer.name}" (${customer.email})?`
      : `Unblock customer "${customer.name}" (${customer.email}) and restore normal account access?`;

    if (!confirm(confirmPrompt)) return;

    setActionLoadingId(customer._id);
    try {
      const res = await adminApi.blockCustomer(customer._id, nextState);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, isBlocked: nextState } : c))
        );
        flashSuccess(res.message || `Customer account ${nextState ? "blocked" : "unblocked"}.`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update customer account block status");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdateTier(id: string, tier: string) {
    if (!isSuperAdmin) {
      alert("Permission Denied: Only Super Administrators can modify customer loyalty tiers.");
      return;
    }
    try {
      await adminApi.updateCustomerTier(id, tier);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? { ...c, tier: tier as any } : c))
      );
      flashSuccess(`Customer tier updated to ${tier}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update tier");
    }
  }

  // --- Admin Accounts Management (Super Admin Exclusive) ---
  async function handleCreateAdminAccount(e: FormEvent) {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      alert("Email and password are required.");
      return;
    }
    setCreatingAdmin(true);
    try {
      const created = await adminApi.createAdminUser({
        name: newAdminName.trim() || (newAdminRole === "superadmin" ? "Super Admin" : "Operations Admin"),
        email: newAdminEmail.trim().toLowerCase(),
        password: newAdminPassword.trim(),
        role: newAdminRole,
      });
      setAdminUsers((prev) => [created, ...prev]);
      flashSuccess(`New admin account created: ${created.email} [${created.role}]`);
      setCreateAdminModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminRole("admin");
    } catch (err: any) {
      alert(err.message || "Failed to create administrator account");
    } finally {
      setCreatingAdmin(false);
    }
  }

  function initiateDeleteAdmin(account: AdminAccount) {
    if (account.email.toLowerCase() === "noyondey176@gmail.com") {
      alert("Master Super Administrator account (noyondey176@gmail.com) is permanently protected and cannot be deleted.");
      return;
    }
    setAdminToDelete(account);
    setConfirmAdminEmailInput("");
  }

  async function handleConfirmDeleteAdmin() {
    if (!adminToDelete) return;
    if (adminToDelete.email.toLowerCase() === "noyondey176@gmail.com") {
      alert("Master Super Administrator account is permanently protected and cannot be deleted.");
      setAdminToDelete(null);
      return;
    }
    if (confirmAdminEmailInput.trim().toLowerCase() !== adminToDelete.email.trim().toLowerCase()) {
      alert("Entered email does not match the administrator account email.");
      return;
    }

    setIsDeletingAdmin(true);
    try {
      await adminApi.deleteAdminUser(adminToDelete._id);
      setAdminUsers((prev) => prev.filter((a) => a._id !== adminToDelete._id));
      flashSuccess(`Administrator account ${adminToDelete.email} revoked and removed.`);
      setAdminToDelete(null);
      setConfirmAdminEmailInput("");
    } catch (err: any) {
      alert(err.message || "Failed to delete admin account");
    } finally {
      setIsDeletingAdmin(false);
    }
  }

  function handleCopyEmail(email: string, id: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  }

  // Seamless session validation loading state
  if (isAutoChecking && !loggedIn) {
    return (
      <div className="ap-root flex items-center justify-center min-h-[600px] p-6">
        <div className="bg-white/95 border border-purple-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900 text-purple-200 flex items-center justify-center shadow-lg animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 tracking-wide">Administrator Portal</h2>
          <p className="text-xs text-neutral-600 font-medium">
            Verifying administrative credentials against alikendshop.admins...
          </p>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full animate-pulse w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Admin Login Screen
  if (!loggedIn) {
    return (
      <div className="ap-root">
        <div className="ap-login-wrap flex flex-col items-center justify-center p-4">
          <div className="ap-login-card shadow-2xl border border-white/10 w-full max-w-md bg-white text-neutral-900 rounded-2xl p-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-amber-400 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>

            <div className="ap-login-mark text-center text-2xl font-serif font-bold text-neutral-900">
              ALIKE ND
            </div>
            <div className="ap-login-sub text-center text-xs tracking-widest text-neutral-500 font-mono mt-1 mb-6">
              Administrative Control Console
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Database Authentication:</span>
                Authenticates strictly against <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">alikendshop.admins</code>. Supports both Super Admin and Regular Admin roles.
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Admin Email
                </label>
                <input
                  className="ap-input font-mono"
                  type="email"
                  placeholder="noyondey176@gmail.com or admin234@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Admin Password
                </label>
                <input
                  className="ap-input"
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="ap-btn ap-btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 font-medium tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                type="submit"
                disabled={isSubmittingLogin}
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Sign In to Admin Console
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-neutral-600 hover:text-neutral-950 hover:underline cursor-pointer"
              >
                ← Return to Galleria Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter computations
  const categories = [...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    const matchSearch = !prodSearch || 
      p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(prodSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(prodSearch.toLowerCase()));
    
    const matchCat = !prodCategory || p.category === prodCategory;

    let matchFlash = true;
    if (prodFlashFilter === "flash") {
      matchFlash = p.badge === "SALE" || p.isFlashSale === true;
    } else if (prodFlashFilter === "regular") {
      matchFlash = p.badge !== "SALE" && !p.isFlashSale;
    }

    return matchSearch && matchCat && matchFlash;
  });

  const filteredOrders = orders.filter(
    (o) =>
      (!orderSearch ||
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.memberName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.memberEmail && o.memberEmail.toLowerCase().includes(orderSearch.toLowerCase()))) &&
      (!orderStatusFilter || o.status === orderStatusFilter)
  );

  const filteredSellers = sellers.filter((s) => {
    const q = sellerSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      (s.shopName && s.shopName.toLowerCase().includes(q)) ||
      (s.storefront && s.storefront.toLowerCase().includes(q)) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.ownerEmail && s.ownerEmail.toLowerCase().includes(q)) ||
      (s.mobileNumber && s.mobileNumber.toLowerCase().includes(q)) ||
      (s.businessAddress && s.businessAddress.toLowerCase().includes(q));

    const matchStatus = !sellerStatusFilter || s.status === sellerStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      (!custSearch ||
        c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(custSearch.toLowerCase()) ||
        (c.phone && c.phone.toLowerCase().includes(custSearch.toLowerCase()))) &&
      (!custTierFilter || c.tier === custTierFilter)
  );

  const filteredActivityLogs = activityLogs.filter((log) => {
    if (activityFilter === "registration" && log.eventType !== "Registration") return false;
    if (activityFilter === "login" && log.eventType !== "Login") return false;
    if (activityFilter === "failed_login" && log.eventType !== "Failed Login") return false;

    if (activitySearch && activitySearch.trim()) {
      const q = activitySearch.trim().toLowerCase();
      const matchName = log.userName?.toLowerCase().includes(q);
      const matchEmail = log.email?.toLowerCase().includes(q);
      const matchIp = log.ipAddress?.toLowerCase().includes(q);
      const matchDevice = log.deviceInfo?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchIp && !matchDevice && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="ap-root">
      {/* Top Role Indicator Banner */}
      <div className={`w-full px-6 py-2 flex items-center justify-between text-xs border-b ${
        isSuperAdmin
          ? 'bg-[#1e0a24] text-amber-300 border-amber-500/20'
          : 'bg-[#0f1d38] text-sky-300 border-sky-500/20'
      }`}>
        <div className="flex items-center gap-2 font-mono">
          {isSuperAdmin ? <Crown className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-sky-400" />}
          <span className="font-bold uppercase tracking-wider">
            {isSuperAdmin ? "Super Admin Master Console" : "Operations Staff Admin Console"}
          </span>
          <span className="opacity-40">|</span>
          <span className="text-[11px] opacity-90">
            {currentAdmin?.name || currentAdmin?.email} ({currentAdmin?.role || "admin"})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
            isSuperAdmin ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
          }`}>
            {isSuperAdmin ? "Full Root Access" : "Limited Permissions"}
          </span>
        </div>
      </div>

      <div className="ap-app">
        {/* Mobile Backdrop */}
        <div
          className={`ap-sidebar-backdrop ${mobileSidebarOpen ? "active" : ""}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`ap-sidebar ${mobileSidebarOpen ? "open" : ""}`}>
          <div className="ap-brand">
            <div className="ap-brand-row items-center gap-2">
              <Logo size="sm" isLightMode={false} />
            </div>
            <div className="ap-brand-sub">
              {isSuperAdmin ? "Super Administrator" : "Operations Admin"}
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <div
              className={`ap-nav-item ${section === "dashboard" ? "active" : ""}`}
              onClick={() => { setSection("dashboard"); setMobileSidebarOpen(false); }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </div>

            <div
              className={`ap-nav-item ${section === "products" ? "active" : ""}`}
              onClick={() => { setSection("products"); setMobileSidebarOpen(false); }}
            >
              <Package className="w-4 h-4" />
              <span>Products & Flash Sales</span>
            </div>

            <div
              className={`ap-nav-item ${section === "orders" ? "active" : ""}`}
              onClick={() => { setSection("orders"); setMobileSidebarOpen(false); }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </div>

            <div
              className={`ap-nav-item ${section === "sellers" ? "active" : ""}`}
              onClick={() => { setSection("sellers"); setMobileSidebarOpen(false); }}
            >
              <Store className="w-4 h-4" />
              <span>Sellers ({sellers.length})</span>
            </div>

            <div
              className={`ap-nav-item ${section === "customers" ? "active" : ""}`}
              onClick={() => { setSection("customers"); setMobileSidebarOpen(false); }}
            >
              <Users className="w-4 h-4" />
              <span>Customers ({customers.length})</span>
            </div>

            <div
              className={`ap-nav-item ${section === "banners" ? "active" : ""}`}
              onClick={() => { setSection("banners"); setMobileSidebarOpen(false); }}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-100 font-semibold">Hero Banners</span>
              <span className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">{banners.length}</span>
            </div>

            {/* SUPER ADMIN EXCLUSIVE: Platform Commission & Wallet */}
            {isSuperAdmin && (
              <div
                className={`ap-nav-item ${section === "commission" ? "active" : ""}`}
                onClick={() => { setSection("commission"); setMobileSidebarOpen(false); }}
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-200 font-semibold">Platform Earnings</span>
                <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {commissionData ? `${commissionData.commissionRate}%` : "5%"}
                </span>
              </div>
            )}

            {/* SUPER ADMIN EXCLUSIVE: Sales Reports */}
            {isSuperAdmin && (
              <div
                className={`ap-nav-item ${section === "reports" ? "active" : ""}`}
                onClick={() => { setSection("reports"); setMobileSidebarOpen(false); }}
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-semibold">Sales Reports</span>
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SUPER</span>
              </div>
            )}

            {/* SUPER ADMIN EXCLUSIVE: Admin Accounts */}
            {isSuperAdmin && (
              <div
                className={`ap-nav-item ${section === "adminUsers" ? "active" : ""}`}
                onClick={() => { setSection("adminUsers"); setMobileSidebarOpen(false); }}
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-semibold">Admin Accounts</span>
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SUPER</span>
              </div>
            )}

            <div
              className={`ap-nav-item ${section === "activity" ? "active" : ""}`}
              onClick={() => { setSection("activity"); setMobileSidebarOpen(false); }}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Logs</span>
            </div>
          </nav>

          <div className="ap-sidebar-foot space-y-2">
            <button
              onClick={onNavigateHome}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Galleria Store</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="ap-main">
          {/* Topbar */}
          <header className="ap-topbar">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg bg-neutral-100 text-neutral-800"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="ap-page-title capitalize">
                  {section === "banners" ? "Hero Carousel Banners" : section === "adminUsers" ? "Admin Accounts Management" : section === "reports" ? "Sales & Revenue Analytics" : section === "commission" ? "Platform Earnings & Commission Wallet" : section}
                </h1>
                <p className="ap-page-sub">
                  {isSuperAdmin
                    ? "Root Administrator Console · alikendshop database"
                    : "Operations Administrator Console · Product & Order Management"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAll()}
                disabled={loading}
                className="ap-btn ap-btn-ghost ap-btn-sm gap-1.5"
                title="Refresh database records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Sync DB</span>
              </button>
              {section === "products" && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setModalOpen(true);
                  }}
                  className="ap-btn ap-btn-primary ap-btn-sm gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              )}
              {section === "adminUsers" && isSuperAdmin && (
                <button
                  onClick={() => setCreateAdminModalOpen(true)}
                  className="ap-btn ap-btn-primary ap-btn-sm gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Admin</span>
                </button>
              )}
            </div>
          </header>

          {/* Success Banner */}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="ap-content">
            {/* SECTION 1: DASHBOARD */}
            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="ap-tag-row">
                  <div className="ap-vip-card">
                    <div className="ap-tag-label">Active Products</div>
                    <div className="ap-tag-value">{products.length}</div>
                    <div className="ap-tag-delta">{products.filter(p => p.badge === 'SALE' || p.isFlashSale).length} Flash Sale Products</div>
                  </div>

                  <div className="ap-vip-card">
                    <div className="ap-tag-label">Orders Count</div>
                    <div className="ap-tag-value">{orders.length}</div>
                    <div className="ap-tag-delta">{orders.filter(o => o.status === 'pending').length} Pending Fulfillment</div>
                  </div>

                  <div className="ap-vip-card">
                    <div className="ap-tag-label">Verified Customers</div>
                    <div className="ap-tag-value">{customers.length}</div>
                    <div className="ap-tag-delta">{customers.filter(c => c.tier === 'Platinum').length} Platinum VIP Members</div>
                  </div>

                  <div className="ap-vip-card">
                    <div className="ap-tag-label">Active Sellers</div>
                    <div className="ap-tag-value">{sellers.length}</div>
                    <div className="ap-tag-delta">{sellers.filter(s => s.status === 'approved').length} Approved Ateliers</div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="ap-card p-5">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span>Product Management & Flash Hours</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                      Configure product names, brands, prices, list MRPs, discount percentages, stock indicators, and countdown timers. Changes appear live immediately across the storefront.
                    </p>
                    <button
                      onClick={() => setSection("products")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-purple-700 border-purple-200 hover:bg-purple-50 gap-1"
                    >
                      <span>Manage Products Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>Order Processing Queue</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                      Track and transition member orders through Pending, Processing, Shipped, and Delivered stages with real-time updates.
                    </p>
                    <button
                      onClick={() => setSection("orders")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1"
                    >
                      <span>View Orders Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: PRODUCTS & FLASH HOURS */}
            {section === "products" && (
              <div className="space-y-4">
                {/* Search, Category, and Flash filter */}
                <div className="ap-toolbar-row">
                  <div className="flex flex-wrap gap-2 flex-1">
                    <div className="relative min-w-[200px] flex-1">
                      <input
                        type="text"
                        placeholder="Search products by title, brand, or category..."
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        className="ap-input pl-8"
                      />
                      <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="ap-select w-auto min-w-[140px]"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="capitalize">
                          {cat}
                        </option>
                      ))}
                    </select>

                    <div className="flex rounded-lg border border-neutral-300 overflow-hidden bg-white">
                      <button
                        onClick={() => setProdFlashFilter("all")}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          prodFlashFilter === "all" ? "bg-purple-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        All ({products.length})
                      </button>
                      <button
                        onClick={() => setProdFlashFilter("flash")}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors ${
                          prodFlashFilter === "flash" ? "bg-amber-500 text-black font-black" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Flash Sales ({products.filter(p => p.badge === 'SALE' || p.isFlashSale).length})</span>
                      </button>
                      <button
                        onClick={() => setProdFlashFilter("regular")}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          prodFlashFilter === "regular" ? "bg-purple-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        Standard
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setModalOpen(true);
                    }}
                    className="ap-btn ap-btn-primary gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="ap-card">
                  <div className="p-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Showing {filteredProducts.length} items • Scroll horizontally if needed to view all columns
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Actions column is pinned to the right
                    </span>
                  </div>
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th className="min-w-[240px]">Item</th>
                          <th className="min-w-[140px]">Brand</th>
                          <th className="min-w-[120px]">Category</th>
                          <th className="min-w-[130px]">Price & MRP</th>
                          <th className="min-w-[100px]">Discount</th>
                          <th className="min-w-[120px]">Stock & Status</th>
                          <th className="min-w-[120px]">Badge / Flash</th>
                          <th className="min-w-[100px]">Rating</th>
                          <th className="text-right min-w-[140px] ap-sticky-col-header font-bold text-neutral-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => {
                          const mrp = p.mrp || p.price;
                          const discount = Math.max(0, Math.round(((mrp - p.price) / mrp) * 100));
                          const isFlash = p.badge === "SALE" || p.isFlashSale === true;

                          return (
                            <tr key={p._id || p.id}>
                              <td>
                                <div className="flex items-center gap-3 min-w-[220px]">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                                    {p.image ? (
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-neutral-900 truncate">{p.name}</div>
                                    <div className="text-[11px] text-neutral-500 truncate">{p.description?.slice(0, 45)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="font-mono text-xs font-semibold text-neutral-700">{p.brand || "Alike Sovereign"}</td>
                              <td className="capitalize text-xs text-neutral-600">{p.category}</td>
                              <td>
                                <div className="font-bold text-neutral-900">₹{p.price.toLocaleString("en-IN")}</div>
                                {p.mrp && p.mrp > p.price && (
                                  <div className="text-[11px] text-neutral-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</div>
                                )}
                              </td>
                              <td>
                                {discount > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black font-mono">
                                    {discount}% OFF
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400 font-mono">—</span>
                                )}
                              </td>
                              <td>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-neutral-800">{p.stock} units</span>
                                  <span className="text-[10px] text-neutral-500 font-medium">{p.stockStatus || "In Stock"}</span>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.badge && (
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                      p.badge === 'SALE' ? 'bg-amber-500 text-black' : p.badge === 'HOT' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'
                                    }`}>
                                      {p.badge}
                                    </span>
                                  )}
                                  {isFlash && (
                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[9px] font-black flex items-center gap-0.5">
                                      <Flame className="w-3 h-3 text-orange-600" /> Flash
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="font-bold">{p.rating?.toFixed(1) || "4.8"}</span>
                                  <span className="text-[10px] text-neutral-400">({p.reviewsCount || 0})</span>
                                </div>
                              </td>
                              <td className="text-right ap-sticky-col-cell">
                                <div className="flex items-center justify-end gap-1.5 min-w-[130px]">
                                  <button
                                    onClick={() => setViewingProduct(p)}
                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 cursor-pointer shadow-xs transition-all hover:scale-105"
                                    title="View Product Details"
                                    aria-label="View Product"
                                  >
                                    <Eye className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-700 cursor-pointer shadow-xs transition-all hover:scale-105"
                                    title="Edit Product"
                                    aria-label="Edit Product"
                                  >
                                    <Edit3 className="w-4 h-4 text-amber-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p._id || String(p.id), p.name)}
                                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 cursor-pointer shadow-xs transition-all hover:scale-105"
                                    title="Delete Product"
                                    aria-label="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: ORDERS */}
            {section === "orders" && (
              <div className="space-y-4">
                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <input
                      type="text"
                      placeholder="Search orders by number or member name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="ap-input pl-8"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="ap-select w-auto min-w-[140px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Member</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th className="text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr key={o._id}>
                            <td className="font-mono font-bold text-xs">{o.orderNumber}</td>
                            <td>
                              <div className="font-medium text-neutral-900">{o.memberName}</div>
                              {o.memberEmail && <div className="text-[11px] text-neutral-400 font-mono">{o.memberEmail}</div>}
                            </td>
                            <td className="font-bold text-neutral-900">₹{o.total.toLocaleString("en-IN")}</td>
                            <td><Seal status={o.status} /></td>
                            <td className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="text-right">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatus(o._id, e.target.value as OrderStatus)}
                                disabled={actionLoadingId === o._id}
                                className="ap-select py-1 text-xs w-auto font-medium"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: SELLERS */}
            {section === "sellers" && (
              <div className="space-y-4">
                {/* Pending Applications Review Alert Banner */}
                {sellers.filter((s) => s.status === "pending").length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                        {sellers.filter((s) => s.status === "pending").length}
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          {sellers.filter((s) => s.status === "pending").length} Pending Seller Application{sellers.filter((s) => s.status === "pending").length > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-amber-800">
                          Review merchant applications and approve verified businesses to enable their Seller Dashboard and catalog listing tools.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter(sellerStatusFilter === "pending" ? "" : "pending")}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      {sellerStatusFilter === "pending" ? "Show All Sellers" : "Review Pending Applications"}
                    </button>
                  </div>
                )}

                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <input
                      type="text"
                      placeholder="Search by shop name, owner, phone, email, or address..."
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                      className="ap-input pl-8"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <select
                    value={sellerStatusFilter}
                    onChange={(e) => setSellerStatusFilter(e.target.value)}
                    className="ap-select w-auto min-w-[150px] font-medium"
                  >
                    <option value="">All Statuses ({sellers.length})</option>
                    <option value="pending">Pending Approval ({sellers.filter((s) => s.status === "pending").length})</option>
                    <option value="approved">Approved ({sellers.filter((s) => s.status === "approved").length})</option>
                    <option value="review">In Review</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Shop / Storefront</th>
                          <th>Owner & Contact</th>
                          <th>Business Address</th>
                          <th>Catalog Listings</th>
                          <th>Status</th>
                          <th className="text-right">Admin Approval & Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSellers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-neutral-500 text-sm">
                              No sellers found matching the current search or status filter.
                            </td>
                          </tr>
                        ) : (
                          filteredSellers.map((s) => {
                            const isPending = s.status === "pending";
                            const displayName = s.shopName || s.storefront || "Storefront";
                            const contactEmail = s.email || s.ownerEmail || "—";
                            const contactPhone = s.mobileNumber || "—";
                            const address = s.businessAddress || "—";

                            return (
                              <tr key={s._id} className={isPending ? "bg-amber-50/40" : undefined}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                                      <Store className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="font-serif font-bold text-neutral-900">{displayName}</div>
                                      <div className="text-[11px] text-neutral-400 font-mono">
                                        ID: {s._id.slice(-6)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="font-medium text-neutral-900">{s.ownerName}</div>
                                  <div className="text-[11px] text-neutral-600 font-mono flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3 text-neutral-400" />
                                    <span>{contactEmail}</span>
                                  </div>
                                  {contactPhone !== "—" && (
                                    <div className="text-[11px] text-neutral-600 font-mono flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 text-neutral-400" />
                                      <span>{contactPhone}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="max-w-[200px]">
                                  <div className="text-xs text-neutral-600 line-clamp-2" title={address}>
                                    {address}
                                  </div>
                                </td>
                                <td className="font-bold text-xs">
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[11px]">
                                    {s.listingsCount || 0} items
                                  </span>
                                </td>
                                <td>
                                  <Seal status={s.status} />
                                </td>
                                <td className="text-right">
                                  <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                                    {isPending ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleSellerStatus(s._id, "approved")}
                                          disabled={actionLoadingId === s._id}
                                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                                          title="Approve seller application"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSellerStatus(s._id, "rejected")}
                                          disabled={actionLoadingId === s._id}
                                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                                          title="Reject seller application"
                                        >
                                          <X className="w-3.5 h-3.5" /> Reject
                                        </button>
                                      </>
                                    ) : (
                                      <select
                                        value={s.status}
                                        onChange={(e) => handleSellerStatus(s._id, e.target.value as SellerStatus)}
                                        disabled={actionLoadingId === s._id}
                                        className="ap-select py-1 text-xs w-auto font-medium"
                                      >
                                        <option value="approved">Approved</option>
                                        <option value="review">In Review</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: CUSTOMERS */}
            {section === "customers" && (
              <div className="space-y-4">
                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <input
                      type="text"
                      placeholder="Search customers by name, email, or phone..."
                      value={custSearch}
                      onChange={(e) => setCustSearch(e.target.value)}
                      className="ap-input pl-8"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <select
                    value={custTierFilter}
                    onChange={(e) => setCustTierFilter(e.target.value)}
                    className="ap-select w-auto min-w-[140px]"
                  >
                    <option value="">All VIP Tiers</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </div>

                {!isSuperAdmin && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Regular Admin Notice: Customer roster is view-only. Member blocking and loyalty tier adjustments are reserved for Super Administrators.</span>
                  </div>
                )}

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Contact</th>
                          <th>VIP Tier</th>
                          <th>Account Status</th>
                          <th>Total Spend</th>
                          {isSuperAdmin && <th className="text-right">Super Admin Control</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <div className="font-bold text-neutral-900">{c.name}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{c.email}</div>
                            </td>
                            <td className="text-xs font-mono">{c.phone || c.mobileNumber || "—"}</td>
                            <td>
                              {isSuperAdmin ? (
                                <select
                                  value={c.tier}
                                  onChange={(e) => handleUpdateTier(c._id, e.target.value)}
                                  className="ap-select py-1 text-xs w-auto font-bold"
                                >
                                  <option value="Platinum">Platinum</option>
                                  <option value="Gold">Gold</option>
                                  <option value="Silver">Silver</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  c.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' : c.tier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                  {c.tier}
                                </span>
                              )}
                            </td>
                            <td>
                              {c.isBlocked ? (
                                <span className="ap-seal ap-seal-blocked">Blocked</span>
                              ) : (
                                <span className="ap-seal ap-seal-active">Active</span>
                              )}
                            </td>
                            <td className="font-bold text-xs">₹{c.lifetimeSpend?.toLocaleString("en-IN") || 0}</td>
                            {isSuperAdmin && (
                              <td className="text-right">
                                <button
                                  onClick={() => handleToggleUserBlock(c)}
                                  disabled={actionLoadingId === c._id}
                                  className={`ap-btn ap-btn-sm ${
                                    c.isBlocked
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "bg-rose-600 hover:bg-rose-700 text-white"
                                  }`}
                                >
                                  {c.isBlocked ? (
                                    <>
                                      <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5 mr-1" /> Block
                                    </>
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: SALES REPORTS (Super Admin Exclusive) */}
            {section === "reports" && isSuperAdmin && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="ap-card p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-purple-300 mb-1">Total Gross Revenue</div>
                    <div className="text-2xl font-bold font-serif text-white">₹{salesReport?.totalRevenue?.toLocaleString("en-IN") || "2,84,500"}</div>
                    <div className="text-[11px] text-purple-300 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +18.4% this month
                    </div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Total Completed Orders</div>
                    <div className="text-2xl font-bold font-serif text-neutral-900">{salesReport?.totalOrders || orders.length}</div>
                    <div className="text-[11px] text-emerald-600 mt-2">100% verified fulfillment</div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Avg Order Value (AOV)</div>
                    <div className="text-2xl font-bold font-serif text-neutral-900">₹{salesReport?.averageOrderValue?.toLocaleString("en-IN") || "4,750"}</div>
                    <div className="text-[11px] text-neutral-500 mt-2">Luxury tier weighted</div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Flash Sales Share</div>
                    <div className="text-2xl font-bold font-serif text-amber-600">42.8%</div>
                    <div className="text-[11px] text-amber-700 mt-2">Driven by Flash Premium Hours</div>
                  </div>
                </div>

                {/* Sales Breakdown by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="ap-card p-5">
                    <h3 className="font-serif font-bold text-base text-neutral-900 mb-4">Department Revenue Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { cat: "Luxury Watches & Jewelry", share: 45, rev: "₹1,28,000" },
                        { cat: "Audio & Gaming Hardware", share: 30, rev: "₹85,400" },
                        { cat: "Atelier Wholesale & Bulk", share: 15, rev: "₹42,600" },
                        { cat: "Beauty & Lifestyle Extr.", share: 10, rev: "₹28,500" },
                      ].map((d) => (
                        <div key={d.cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{d.cat}</span>
                            <span className="font-mono text-neutral-500">{d.rev} ({d.share}%)</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="bg-purple-700 h-full rounded-full" style={{ width: `${d.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ap-card p-5">
                    <h3 className="font-serif font-bold text-base text-neutral-900 mb-4">VIP Loyalty Revenue Split</h3>
                    <div className="space-y-3">
                      {[
                        { tier: "Platinum Tier (Elite)", share: 62, rev: "₹1,76,390", color: "bg-purple-600" },
                        { tier: "Gold Tier (Preferred)", share: 26, rev: "₹73,970", color: "bg-amber-500" },
                        { tier: "Silver Tier (Member)", share: 12, rev: "₹34,140", color: "bg-neutral-400" },
                      ].map((t) => (
                        <div key={t.tier} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{t.tier}</span>
                            <span className="font-mono text-neutral-500">{t.rev} ({t.share}%)</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`${t.color} h-full rounded-full`} style={{ width: `${t.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: ADMIN USERS (Super Admin Exclusive) */}
            {section === "adminUsers" && isSuperAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Administrator Accounts Directory</h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      Database source: <code className="bg-neutral-100 px-1 py-0.5 rounded text-purple-700">alikendshop.admins</code>
                    </p>
                  </div>
                  <button
                    onClick={() => setCreateAdminModalOpen(true)}
                    className="ap-btn ap-btn-primary gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create New Admin</span>
                  </button>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Admin Name</th>
                          <th>Email Address</th>
                          <th>Role Type</th>
                          <th>Permissions Scope</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((a) => {
                          const isRoot = a.email?.toLowerCase() === "noyondey176@gmail.com";
                          return (
                            <tr key={a._id || a.email}>
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    a.role === 'superadmin' ? 'bg-purple-900 text-amber-300' : 'bg-sky-900 text-sky-200'
                                  }`}>
                                    {a.name ? a.name.charAt(0).toUpperCase() : "A"}
                                  </div>
                                  <div className="font-bold text-neutral-900">{a.name}</div>
                                </div>
                              </td>
                              <td className="font-mono text-xs text-neutral-700">{a.email}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                                  a.role === 'superadmin'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                                }`}>
                                  {a.role === 'superadmin' ? '👑 Super Admin' : '💼 Operations Admin'}
                                </span>
                              </td>
                              <td className="text-xs text-neutral-600">
                                {a.role === 'superadmin' ? (
                                  <span className="text-purple-800 font-semibold">Full Root Control + Admin Management</span>
                                ) : (
                                  <span className="text-neutral-500">Products & Orders Only</span>
                                )}
                              </td>
                              <td>
                                <span className="ap-seal ap-seal-active">Active</span>
                              </td>
                              <td className="text-right">
                                {isRoot ? (
                                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                    Protected Root
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => initiateDeleteAdmin(a)}
                                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors"
                                    title="Revoke Admin Access"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: PLATFORM COMMISSION & WALLET (Super Admin Exclusive) */}
            {section === "commission" && isSuperAdmin && (
              <CommissionWallet
                data={commissionData}
                loading={loading}
                onRefresh={loadCommission}
                onUpdateRate={handleUpdateCommissionRate}
                isUpdatingRate={isUpdatingCommissionRate}
              />
            )}

            {/* SECTION 8: ACTIVITY LOGS */}
            {section === "activity" && (
              <div className="space-y-4">
                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <input
                      type="text"
                      placeholder="Search logs by user, email, IP, or details..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="ap-input pl-8"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value as any)}
                    className="ap-select w-auto min-w-[140px]"
                  >
                    <option value="all">All Events</option>
                    <option value="registration">Registrations</option>
                    <option value="login">Logins</option>
                    <option value="failed_login">Failed Logins</option>
                  </select>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Event Type</th>
                          <th>User / Email</th>
                          <th>Status</th>
                          <th>IP Address & Device</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivityLogs.map((log) => (
                          <tr key={log._id}>
                            <td className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                log.eventType === 'Registration'
                                  ? 'bg-blue-100 text-blue-800'
                                  : log.eventType === 'Login'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {log.eventType}
                              </span>
                            </td>
                            <td>
                              <div className="font-bold text-neutral-900">{log.userName}</div>
                              <div className="text-[11px] font-mono text-neutral-500">{log.email}</div>
                            </td>
                            <td>
                              <span className={`ap-seal ap-seal-${log.status === 'success' ? 'active' : 'blocked'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="text-xs font-mono text-neutral-600">
                              <div>{log.ipAddress}</div>
                              <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">{log.deviceInfo}</div>
                            </td>
                            <td className="text-xs text-neutral-700 max-w-[240px] truncate">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: HERO CAROUSEL BANNERS MANAGEMENT */}
            {section === "banners" && (
              <BannerManagement
                banners={banners}
                onBannersChange={setBanners}
                onFlashSuccess={flashSuccess}
                onError={setError}
                isSuperAdmin={isSuperAdmin}
              />
            )}
          </div>
        </main>
      </div>

      {/* RICH PRODUCT MODAL (Super Admin & Admin) */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* CREATE ADMIN MODAL (Super Admin Exclusive) */}
      {createAdminModalOpen && isSuperAdmin && (
        <div className="ap-modal-backdrop" onClick={() => setCreateAdminModalOpen(false)}>
          <div className="ap-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-neutral-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span>Create Administrator Account</span>
              </h3>
              <button onClick={() => setCreateAdminModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-4">
              Provision a new administrative account in <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">alikendshop.admins</code>.
            </p>

            <form onSubmit={handleCreateAdminAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Manager"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="ap-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ops.staff@alike.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="ap-input font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="ap-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase font-mono mb-1">Role Type</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="ap-select font-semibold"
                >
                  <option value="admin">Regular Admin (Products & Orders Only)</option>
                  <option value="superadmin">Super Admin (Full Root Permissions)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>Role Permissions:</strong>
                {newAdminRole === 'admin' ? (
                  <p className="mt-0.5">Regular Admin can manage products & orders. Sales reports, customer blocking, and admin management are blocked.</p>
                ) : (
                  <p className="mt-0.5">Super Admin receives unrestricted access across all platform modules.</p>
                )}
              </div>

              <div className="ap-modal-actions">
                <button
                  type="button"
                  onClick={() => setCreateAdminModalOpen(false)}
                  className="ap-btn ap-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="ap-btn ap-btn-primary bg-amber-600 hover:bg-amber-700"
                >
                  {creatingAdmin ? "Creating..." : "Save Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ-ONLY PRODUCT VIEW MODAL */}
      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            const prod = viewingProduct;
            setViewingProduct(null);
            setEditingProduct(prod);
            setModalOpen(true);
          }}
        />
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          confirmInput={confirmProductNameInput}
          onChangeInput={setConfirmProductNameInput}
          isDeleting={isDeletingProduct}
          onClose={() => {
            setProductToDelete(null);
            setConfirmProductNameInput("");
          }}
          onConfirm={handleConfirmDeleteProduct}
        />
      )}

      {/* TYPE-TO-CONFIRM ADMIN DELETION MODAL (SUPER ADMIN ONLY) */}
      {adminToDelete && isSuperAdmin && (
        <DeleteAdminModal
          admin={adminToDelete}
          confirmInput={confirmAdminEmailInput}
          onChangeInput={setConfirmAdminEmailInput}
          isDeleting={isDeletingAdmin}
          onClose={() => {
            setAdminToDelete(null);
            setConfirmAdminEmailInput("");
          }}
          onConfirm={handleConfirmDeleteAdmin}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPREHENSIVE PRODUCT MODAL COMPONENT (FULL ATTRIBUTES)
// -------------------------------------------------------------
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, "_id">) => void;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || "Alike Audio");
  const [category, setCategory] = useState(product?.category || "electronics");
  const [price, setPrice] = useState(product?.price !== undefined ? String(product.price) : "3499");
  const [mrp, setMrp] = useState(product?.mrp !== undefined ? String(product.mrp) : "6999");
  const [stock, setStock] = useState(product?.stock !== undefined ? String(product.stock) : "15");
  const [stockStatus, setStockStatus] = useState(product?.stockStatus || "In Stock");
  const [badge, setBadge] = useState(product?.badge || "SALE");
  const [isFlashSale, setIsFlashSale] = useState(product?.isFlashSale ?? (product?.badge === "SALE"));
  const [rating, setRating] = useState(product?.rating !== undefined ? String(product.rating) : "4.8");
  const [reviewsCount, setReviewsCount] = useState(product?.reviewsCount !== undefined ? String(product.reviewsCount) : "148");
  const [image, setImage] = useState(product?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600");
  const [additionalImages, setAdditionalImages] = useState((product?.images || []).slice(1).join("\n"));
  const [description, setDescription] = useState(product?.description || "Immersive active noise-cancelling headphones tuned to golden standard.");
  const [isWholesale, setIsWholesale] = useState(product?.isWholesale || false);
  const [wholesalePrice, setWholesalePrice] = useState(product?.wholesalePrice ? String(product.wholesalePrice) : "2999");
  const [wholesaleMinQty, setWholesaleMinQty] = useState(product?.wholesaleMinQty ? String(product.wholesaleMinQty) : "5");

  // Calculated live discount percentage
  const numPrice = Number(price) || 0;
  const numMrp = Number(mrp) || numPrice;
  const calculatedDiscount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    const imagesList = [image.trim(), ...additionalImages.split("\n").map(s => s.trim()).filter(Boolean)];

    onSave({
      id: product?.id || Date.now(),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      price: numPrice,
      mrp: numMrp,
      stock: Number(stock) || 0,
      stockStatus: stockStatus.trim(),
      badge: badge.trim(),
      isFlashSale: Boolean(isFlashSale),
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 120,
      image: image.trim(),
      images: imagesList,
      description: description.trim(),
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
    });
  };

  return (
    <div className="ap-modal-backdrop" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-neutral-200/80 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100/80 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors backdrop-blur-sm cursor-pointer shadow-sm"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: ALIKE ND Pink/Black Brand & Real-Time Product Preview Panel */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-neutral-950 via-[#1f0518] to-[#600d3a] p-5 sm:p-6 lg:p-7 flex flex-col justify-between text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-pink-950/40 shrink-0">
          {/* Subtle Pink Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#E91269]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FF4586]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Heading & Subtitle */}
          <div className="relative z-10 pr-10 lg:pr-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
              <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
              <span>Storefront Catalog Sync</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] xl:text-3xl font-serif font-black tracking-tight text-white mb-2.5 leading-snug break-words max-w-full">
              {product ? `Edit Product: ${product.name}` : "Create New Luxury Product"}
            </h3>
            <p className="text-xs text-white/80 font-mono leading-relaxed break-words max-w-full">
              Live storefront synchronization across Flash Premium Hours and Category listings
            </p>
          </div>

          {/* Live Product Image & Card Preview */}
          <div className="relative z-10 my-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl group">
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-neutral-900 flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={name || "Product preview"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-white/40">
                    <Package className="w-12 h-12 mb-2 text-pink-400/50 stroke-[1.5]" />
                    <span className="text-xs font-mono">Image preview will appear here</span>
                  </div>
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white font-mono text-[10px] font-black uppercase shadow-md">
                      {badge}
                    </span>
                  )}
                  {isFlashSale && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-mono text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 text-neutral-950" />
                      Flash Deal
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-medium border border-white/20">
                    {category}
                  </span>
                </div>
              </div>

              {/* Overlaid Metadata Card */}
              <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-t border-white/10">
                <div className="text-[10px] uppercase font-mono tracking-wider text-pink-400 font-bold mb-0.5">
                  {brand || "Brand Name"}
                </div>
                <h4 className="text-sm font-serif font-bold text-white truncate mb-2">
                  {name || "Product Title Preview"}
                </h4>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-mono font-black text-pink-300">
                      ₹{Number(price || 0).toLocaleString("en-IN")}
                    </span>
                    {Number(mrp) > Number(price) && (
                      <span className="text-xs font-mono line-through text-white/40">
                        ₹{Number(mrp).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {calculatedDiscount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-black">
                      {calculatedDiscount}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    ★ {rating} <span className="text-white/40 font-normal">({reviewsCount})</span>
                  </span>
                  <span className="text-pink-300 font-semibold">{stockStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-10 text-[11px] font-mono text-white/40 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authenticated Alikend Luxury Storefront Synchronizer</span>
          </div>
        </div>

        {/* RIGHT PANEL: Clean, Compact Form Panel */}
        <div className="lg:w-7/12 flex-1 p-6 lg:p-8 overflow-y-auto max-h-[92vh] bg-white">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Form Section Header */}
            <div className="border-b border-neutral-100 pb-3 mb-2">
              <h4 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">
                Product Specification & Storefront Details
              </h4>
              <p className="text-[11px] text-neutral-500">All fields sync automatically to the customer marketplace.</p>
            </div>

            {/* Row 1: Title & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Product Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alike-Pro Soundmaster Gold Edition"
                  className="ap-input font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Alike Audio, Alike Gaming, Aurelia Genf"
                  className="ap-input font-medium"
                  required
                />
              </div>
            </div>

            {/* Row 2: Category & Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ap-select font-medium"
                >
                  <option value="electronics">Electronics & Audio</option>
                  <option value="luxury">Luxury & Watches</option>
                  <option value="gaming">Gaming Hardware</option>
                  <option value="jewellery">Jewellery & Gold</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="hardware">Hardware & Tools</option>
                  <option value="wholesale">Wholesale Bulk</option>
                  <option value="delivery">20-Min Express Delivery</option>
                  <option value="furniture">Home & Living</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Badge Tag</label>
                <select
                  value={badge}
                  onChange={(e) => {
                    setBadge(e.target.value);
                    if (e.target.value === "SALE") setIsFlashSale(true);
                  }}
                  className="ap-select font-bold"
                >
                  <option value="SALE">SALE (Flash Deal)</option>
                  <option value="HOT">HOT (Bestseller)</option>
                  <option value="NEW">NEW (Fresh Arrival)</option>
                  <option value="TRENDING">TRENDING (Viral)</option>
                  <option value="LIMITED">LIMITED (Exclusive Edition)</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>

            {/* Row 3: Pricing, MRP, and Live Discount Calculation */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3499"
                    className="ap-input font-mono font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">List Price / MRP (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="6999"
                    className="ap-input font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono mb-1">Calculated Discount</span>
                  <div className="px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-black text-sm text-center">
                    {calculatedDiscount}% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Flash Sale Toggle & Stock Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="flashSaleCheck"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="flashSaleCheck" className="cursor-pointer font-medium text-amber-900">
                  <span className="font-bold block flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Include in "Flash Premium Hours"
                  </span>
                  <span className="text-[10px] text-amber-800">Shows prominently in homepage flash countdown section</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Stock Status Badge</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="ap-select font-medium"
                >
                  <option value="In Stock">In Stock (Normal Supply)</option>
                  <option value="Only 2 left!">Only 2 left! (Low Stock Warning)</option>
                  <option value="20-Min Express">20-Min Express (Fast Delivery)</option>
                  <option value="Out of Stock">Out of Stock (Sold Out)</option>
                  <option value="Pre-Order">Pre-Order (Upcoming)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Stock count, Rating & Reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Inventory Stock Units</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="15"
                  className="ap-input font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Star Rating (0 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.8"
                  className="ap-input font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Reviews Count</label>
                <input
                  type="number"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  placeholder="148"
                  className="ap-input font-mono"
                />
              </div>
            </div>

            {/* Row 6: Image URL & Preview */}
            <div className="space-y-2">
              <label className="block font-bold text-neutral-700 uppercase font-mono">Primary Image URL *</label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="ap-input font-mono flex-1 text-xs"
                  required
                />
                <div className="w-10 h-10 rounded-lg overflow-hidden border bg-neutral-100 shrink-0">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>

            {/* Row 7: Description */}
            <div>
              <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Product Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High quality description of the product..."
                className="ap-input text-xs"
              />
            </div>

            {/* Row 8: Wholesale Toggle */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wholesaleCheck"
                  checked={isWholesale}
                  onChange={(e) => setIsWholesale(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="wholesaleCheck" className="cursor-pointer font-bold text-purple-900">
                  Enable Wholesale Bulk Pricing Tier
                </label>
              </div>
              {isWholesale && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase font-mono mb-0.5">Wholesale Unit Price (₹)</label>
                    <input
                      type="number"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      className="ap-input font-mono py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase font-mono mb-0.5">Min Order Qty (MOQ)</label>
                    <input
                      type="number"
                      value={wholesaleMinQty}
                      onChange={(e) => setWholesaleMinQty(e.target.value)}
                      className="ap-input font-mono py-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="ap-modal-actions pt-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="ap-btn ap-btn-ghost flex items-center gap-2 text-neutral-600 hover:text-neutral-900 cursor-pointer font-medium"
              >
                <span>←</span>
                <span>Cancel</span>
              </button>
              <button type="submit" className="ap-btn ap-btn-primary flex items-center gap-2 cursor-pointer shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>{product ? "Save & Publish Changes" : "Create Product"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// READ-ONLY PRODUCT VIEW MODAL
// -------------------------------------------------------------
interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

function ProductViewModal({ product, onClose, onEdit }: ProductViewModalProps) {
  const [selectedImg, setSelectedImg] = useState(product.image || (product.images && product.images[0]) || "");
  const allImages = [product.image, ...(product.images || [])].filter((img, idx, arr) => img && arr.indexOf(img) === idx);
  
  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div className="ap-modal-backdrop" onClick={onClose}>
      <div className="ap-modal max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                  {product.category}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  SKU: {String(product._id || product.id).slice(-8).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900 leading-tight mt-0.5">
                {product.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
          {/* Left: Product Images */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner flex items-center justify-center">
              <img
                src={selectedImg || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"}
                alt={product.name}
                className="w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImg === img ? 'border-amber-500 scale-95 shadow-md' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Specifications & Pricing */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Price & Discount Card */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-neutral-900 font-mono">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-sm text-neutral-400 line-through font-mono">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold font-mono text-xs">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Standard GST rate (18%) and luxury packaging included in listed price.
              </p>
            </div>

            {/* Badges & Inventory Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Inventory Stock</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-neutral-900">{product.stock || 0} Units</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {product.stockStatus || "In Stock"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Customer Rating</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold text-neutral-900 text-sm">{product.rating?.toFixed(1) || "4.8"}</span>
                  </div>
                  <span className="text-neutral-400 font-medium">({product.reviewsCount || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Flash Sale & Brand Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Brand Atelier</span>
                <span className="font-bold text-neutral-900">{product.brand || "Alike Luxury"}</span>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Flash Sale Program</span>
                <div className="flex items-center gap-1.5">
                  {product.isFlashSale || product.badge === "SALE" ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-600" /> Flash Premium Hours Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-medium">Standard Listing</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">Description</span>
              <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
                {product.description || "Authentic high-grade signature luxury piece from the Alike-ND boutique catalog."}
              </p>
            </div>

            {/* Wholesale Details if available */}
            {product.isWholesale && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-purple-900 uppercase font-mono block">Wholesale Bulk Terms</span>
                <div className="flex justify-between items-center text-purple-950 font-medium">
                  <span>Unit Rate: <strong>₹{product.wholesalePrice?.toLocaleString("en-IN") || 0}</strong></span>
                  <span>Minimum Order: <strong>{product.wholesaleMinQty || 1} Units</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="ap-btn ap-btn-ghost text-xs"
          >
            Close Details
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="ap-btn ap-btn-primary gap-1.5 text-xs bg-amber-600 hover:bg-amber-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit This Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DELETE PRODUCT CONFIRMATION MODAL (WITH TYPE-TO-CONFIRM)
// -------------------------------------------------------------
interface DeleteProductModalProps {
  product: { id: string; name: string };
  confirmInput: string;
  onChangeInput: (val: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteProductModal({
  product,
  confirmInput,
  onChangeInput,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  const isMatch = confirmInput.trim().toLowerCase() === product.name.trim().toLowerCase();

  return (
    <div className="ap-modal-backdrop" onClick={onClose}>
      <div className="ap-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-900">Delete Product from Catalog</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <p className="text-neutral-700 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-neutral-900 font-semibold">{product.name}</strong> from the database?
          </p>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Warning: Permanent Action</span>
            </p>
            <p>
              This action permanently removes this item from <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">alikendshop.products</code> and customer catalogs.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-neutral-700">
              Type <span className="font-mono bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 select-all">{product.name}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => onChangeInput(e.target.value)}
              placeholder="Type product name exactly to confirm..."
              className="ap-input font-mono text-xs w-full"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="ap-btn ap-btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || !isMatch}
            className={`ap-btn text-xs gap-1.5 text-white ${
              isMatch && !isDeleting
                ? "bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
                : "bg-neutral-300 cursor-not-allowed opacity-60"
            }`}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Permanently Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TYPE-TO-CONFIRM ADMIN DELETION MODAL
// -------------------------------------------------------------
interface DeleteAdminModalProps {
  admin: AdminAccount;
  confirmInput: string;
  onChangeInput: (val: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAdminModal({
  admin,
  confirmInput,
  onChangeInput,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAdminModalProps) {
  const isMatch = confirmInput.trim().toLowerCase() === admin.email.trim().toLowerCase();
  const isProtected = admin.email.toLowerCase() === "noyondey176@gmail.com";

  return (
    <div className="ap-modal-backdrop" onClick={onClose}>
      <div className="ap-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-900">Revoke Administrator Privileges</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs">
          {isProtected ? (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Protected Super Administrator</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                The root Super Administrator account (<code>noyondey176@gmail.com</code>) is protected by core security protocols and cannot be deleted or revoked.
              </p>
            </div>
          ) : (
            <>
              <p className="text-neutral-700">
                You are about to revoke all administrative permissions for:
              </p>

              <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">{admin.name}</p>
                  <p className="font-mono text-[11px] text-neutral-600">{admin.email}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-neutral-200 text-neutral-700">
                  {admin.role}
                </span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
                <p className="font-bold">Type to Confirm Deletion:</p>
                <p>
                  To prevent accidental removal, please type the administrator's exact email address <strong className="font-mono">{admin.email}</strong> below:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={admin.email}
                  value={confirmInput}
                  onChange={(e) => onChangeInput(e.target.value)}
                  className="ap-input font-mono text-xs w-full border-rose-300 focus:border-rose-600 focus:ring-rose-200"
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="ap-btn ap-btn-ghost text-xs"
          >
            Cancel
          </button>
          {!isProtected && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isMatch || isDeleting}
              className={`ap-btn text-xs gap-1.5 transition-all ${
                isMatch
                  ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Administrator Account
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
