import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Product, SellerProfile } from '../types';
import { sellerApi, SellerProductPayload } from '../services/sellerApi';

interface SellerDashboardProps {
  products?: Product[];
  onAddProduct?: (p: Product) => void;
  onRemoveProduct?: (id: number) => void;
  onUpdateProduct?: (p: Product) => void;
  onNavigate?: (view: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

const SAMPLE_IMAGES = [
  { label: 'Watch 1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Watch 2', url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80' },
  { label: 'Jewelry', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Leather', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80' },
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
];

export default function SellerDashboard({
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
  onNavigate,
  showToast,
  isLightMode = false,
}: SellerDashboardProps) {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(() => sellerApi.getStoredProfile());
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState<number>(4999);
  const [formMrp, setFormMrp] = useState<number>(6999);
  const [formCategory, setFormCategory] = useState('luxury');
  const [formStock, setFormStock] = useState<number>(15);
  const [formStockStatus, setFormStockStatus] = useState('In Stock');
  const [formImage, setFormImage] = useState(SAMPLE_IMAGES[0].url);
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load seller's own products from API
  const loadMyProducts = async () => {
    try {
      setRefreshing(true);
      const res = await sellerApi.getMyProducts();
      if (res && res.success && Array.isArray(res.products)) {
        setMyProducts(res.products);
      }
    } catch (err: any) {
      console.warn("Failed to load seller products:", err);
      // Fallback: If not logged in, prompt user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Check auth and load on mount
  useEffect(() => {
    const token = sellerApi.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Refresh profile in background
    sellerApi.getMe().then((res) => {
      if (res && res.success && res.seller) {
        setSellerProfile(res.seller);
        sellerApi.setStoredProfile(res.seller);
      }
    }).catch(() => {});

    loadMyProducts();
  }, []);

  const handleLogout = () => {
    sellerApi.clearToken();
    setSellerProfile(null);
    setMyProducts([]);
    showToast('Logged out of seller portal.', 'info');
    if (onNavigate) {
      onNavigate('seller_register');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand(sellerProfile?.shopName || 'Boutique Collection');
    setFormPrice(4999);
    setFormMrp(6999);
    setFormCategory('luxury');
    setFormStock(15);
    setFormStockStatus('In Stock');
    setFormImage(SAMPLE_IMAGES[0].url);
    setFormDescription('Artisan hand-crafted piece sourced from authentic verified atelier workshops.');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand || sellerProfile?.shopName || '');
    setFormPrice(p.price);
    setFormMrp(p.mrp);
    setFormCategory(p.category || 'luxury');
    setFormStock(p.stock !== undefined ? p.stock : 10);
    setFormStockStatus(p.stockStatus || 'In Stock');
    setFormImage(p.image || SAMPLE_IMAGES[0].url);
    setFormDescription(p.description || '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Product title is required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload: SellerProductPayload = {
        name: formName.trim(),
        brand: formBrand.trim() || sellerProfile?.shopName || 'Official Merchant',
        price: Number(formPrice) || 0,
        mrp: Number(formMrp) || Number(formPrice) || 0,
        category: formCategory,
        stock: Number(formStock) || 0,
        stockStatus: formStockStatus,
        image: formImage.trim() || SAMPLE_IMAGES[0].url,
        description: formDescription.trim(),
      };

      if (editingProduct) {
        const res = await sellerApi.updateProduct(editingProduct.id, payload);
        if (res && res.success && res.product) {
          setMyProducts((prev) => prev.map((item) => (item.id === editingProduct.id ? res.product : item)));
          if (onUpdateProduct) onUpdateProduct(res.product);
          showToast(`Updated "${formName}" successfully!`, 'success');
        }
      } else {
        const res = await sellerApi.createProduct(payload);
        if (res && res.success && res.product) {
          setMyProducts((prev) => [res.product, ...prev]);
          if (onAddProduct) onAddProduct(res.product);
          showToast(`Successfully listed "${formName}" under ${sellerProfile?.shopName || 'your shop'}!`, 'success');
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your shop?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await sellerApi.deleteProduct(id);
      if (res && res.success) {
        setMyProducts((prev) => prev.filter((p) => p.id !== id));
        if (onRemoveProduct) onRemoveProduct(id);
        showToast(`Removed "${name}" from your catalog.`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return myProducts;
    const q = searchQuery.toLowerCase();
    return myProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [myProducts, searchQuery]);

  // If user is not logged in as a seller
  if (!sellerProfile && !sellerApi.getToken()) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
          Seller Portal Access Required
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Please log in with your approved seller credentials or register a new seller account to access your merchant catalog dashboard.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('seller_register')}
            className="px-5 py-2.5 bg-[#0d0d0d] hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Go to Seller Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="seller-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* 1. SELLER STOREFRONT BANNER */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-md transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
              {sellerProfile?.shopName ? sellerProfile.shopName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-white">
                  {sellerProfile?.shopName || 'My Storefront'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Verified Merchant
                </span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-3 flex-wrap">
                <span>Owner: <strong className="text-neutral-900 dark:text-white font-medium">{sellerProfile?.ownerName || 'Merchant'}</strong></span>
                {sellerProfile?.mobileNumber && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-neutral-400" /> {sellerProfile.mobileNumber}
                  </span>
                )}
                {sellerProfile?.email && (
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3 h-3 text-neutral-400" /> {sellerProfile.email}
                  </span>
                )}
              </div>
              {sellerProfile?.businessAddress && (
                <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate max-w-md">{sellerProfile.businessAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              id="seller-refresh-btn"
              onClick={loadMyProducts}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              id="seller-add-product-btn"
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-[#0d0d0d] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
            <button
              type="button"
              id="seller-logout-btn"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Logout from seller portal"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">My Active Listings</span>
          <div className="text-xl font-bold font-serif text-neutral-900 dark:text-white mt-1">
            {myProducts.length} items
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Live on marketplace catalog
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Storefront Identity</span>
          <div className="text-base font-bold text-neutral-900 dark:text-white mt-1 truncate">
            {sellerProfile?.shopName || 'Official'}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 font-mono">
            Sold By tag displayed to buyers
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Approval Status</span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Approved
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Full catalog upload permissions
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Marketplace Visibility</span>
          <div className="text-base font-bold text-neutral-900 dark:text-white mt-1">
            Pan-India Direct
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Protected buyer checkout
          </div>
        </div>
      </div>

      {/* 3. INVENTORY MANAGEMENT TABLE & CONTROLS */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your products by title, category, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
            />
          </div>
          <div className="text-xs text-neutral-500 self-center sm:self-auto font-medium">
            Showing <strong>{filteredProducts.length}</strong> of <strong>{myProducts.length}</strong> products
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-neutral-500 text-xs">
              Loading your store catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-neutral-400 mx-auto opacity-50" />
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {myProducts.length === 0 ? "You haven't listed any products yet" : "No products found matching your search"}
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {myProducts.length === 0
                  ? "Click the 'Add New Product' button above to list your first item with custom pricing, photos, and inventory count."
                  : "Try clearing your search query to see all your listed products."}
              </p>
              {myProducts.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-[#0d0d0d] hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
                >
                  + Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-950/60 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / MRP</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Sold By Tag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-neutral-900 dark:text-white truncate" title={p.name}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-medium">
                            {p.brand} · ID #{p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-neutral-700 dark:text-neutral-300 font-medium">
                      {p.category || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-neutral-400 line-through">
                        ₹{p.mrp.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        {p.stockStatus || 'In Stock'} ({p.stock ?? 10} units)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Store className="w-3 h-3" />
                        <span>{p.sellerShopName || sellerProfile?.shopName || 'Official'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif text-neutral-900 dark:text-white">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Store'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Store: <strong className="text-amber-600 dark:text-amber-400">{sellerProfile?.shopName || 'Your Boutique'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Roseline Chronograph Dial"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              {/* Brand & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Brand name"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                  >
                    <option value="luxury">Luxury & Watches</option>
                    <option value="jewellery">Jewellery & Gold</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="accessories">Accessories & Leather</option>
                    <option value="gourmet">Gourmet & Delicacies</option>
                    <option value="home">Home & Living</option>
                  </select>
                </div>
              </div>

              {/* Price & MRP Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Selling Price (₹) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">MRP / Tag Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Stock & Stock Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Available Stock (Units)</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Stock Display Badge</label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Only 2 left!">Only 2 left!</option>
                    <option value="20-Min Express">20-Min Express</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Quick Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono text-[11px]"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-400">Presets:</span>
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setFormImage(sample.url)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                        formImage === sample.url
                          ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed product highlights, material provenance, craftsmanship..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>←</span>
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0d0d0d] hover:bg-black text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
