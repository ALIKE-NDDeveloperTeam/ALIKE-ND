<<<<<<< HEAD
import { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
=======
import { useState, useEffect, useMemo, FormEvent } from 'react';
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
<<<<<<< HEAD
  ShieldCheck,
  Camera,
  Upload,
  X,
  Star,
  ArrowLeft,
  ArrowRight
=======
  ShieldCheck
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
} from 'lucide-react';
import GlassCloseButton from '../components/GlassCloseButton';
import GlassIconButton from '../components/GlassIconButton';
import { Product, SellerProfile } from '../types';
import { CATEGORIES } from '../data/mockData';
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
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formEligibleFor20Min, setFormEligibleFor20Min] = useState(false);
  const [formStock, setFormStock] = useState<number>(15);
  const [formStockStatus, setFormStockStatus] = useState('In Stock');
  const [formImage, setFormImage] = useState(SAMPLE_IMAGES[0].url);
<<<<<<< HEAD
  const [formImages, setFormImages] = useState<string[]>([SAMPLE_IMAGES[0].url]);
  const [sellerUrlInput, setSellerUrlInput] = useState('');
  const sellerFileInputRef = useRef<HTMLInputElement>(null);
  const [sellerIsDragging, setSellerIsDragging] = useState(false);
=======
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
  const [formDescription, setFormDescription] = useState('');
  // Indian Marketplace Compliance Fields
  const [formHsnCode, setFormHsnCode] = useState('');
  const [formGstRate, setFormGstRate] = useState<number>(18);
  const [formCountryOfOrigin, setFormCountryOfOrigin] = useState('India');
  const [formManufacturerDetails, setFormManufacturerDetails] = useState('');
  const [formPackInfo, setFormPackInfo] = useState('');
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
    setFormSubCategory('');
    setFormEligibleFor20Min(false);
    setFormStock(15);
    setFormStockStatus('In Stock');
    setFormImage(SAMPLE_IMAGES[0].url);
<<<<<<< HEAD
    setFormImages([SAMPLE_IMAGES[0].url]);
    setSellerUrlInput('');
=======
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
    setFormDescription('Artisan hand-crafted piece sourced from authentic verified atelier workshops.');
    setFormHsnCode('');
    setFormGstRate(18);
    setFormCountryOfOrigin('India');
    setFormManufacturerDetails('');
    setFormPackInfo('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand || sellerProfile?.shopName || '');
    setFormPrice(p.price);
    setFormMrp(p.mrp);
    setFormCategory(p.category || 'luxury');
    setFormSubCategory(p.subCategory || '');
    setFormEligibleFor20Min(Boolean(p.eligibleFor20MinDelivery || p.category === 'delivery' || p.category === 'grocery' || p.category === 'food_delivery'));
    setFormStock(p.stock !== undefined ? p.stock : 10);
    setFormStockStatus(p.stockStatus || 'In Stock');
<<<<<<< HEAD
    const initialImgs = p.images && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : [SAMPLE_IMAGES[0].url]);
    setFormImage(p.image || initialImgs[0]);
    setFormImages(initialImgs);
    setSellerUrlInput('');
=======
    setFormImage(p.image || SAMPLE_IMAGES[0].url);
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
    setFormDescription(p.description || '');
    setFormHsnCode(p.hsnCode || '');
    setFormGstRate(p.gstRate !== undefined ? Number(p.gstRate) : 18);
    setFormCountryOfOrigin(p.countryOfOrigin || 'India');
    setFormManufacturerDetails(p.manufacturerDetails || '');
    setFormPackInfo(p.packInfo || '');
    setModalOpen(true);
  };

<<<<<<< HEAD
  // Image Upload & Management Handlers for Sellers
  const handleSellerFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFormImages((prev) => {
            const next = [...prev, result];
            if (!formImage) setFormImage(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSellerAddUrl = () => {
    const trimmed = sellerUrlInput.trim();
    if (!trimmed) return;
    setFormImages((prev) => [...prev, trimmed]);
    if (!formImage) setFormImage(trimmed);
    setSellerUrlInput('');
  };

  const handleSellerSetPrimary = (index: number) => {
    const selected = formImages[index];
    if (!selected) return;
    setFormImage(selected);
    setFormImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return [selected, ...filtered];
    });
  };

  const handleSellerRemoveImage = (index: number) => {
    const removed = formImages[index];
    const next = formImages.filter((_, i) => i !== index);
    setFormImages(next);
    if (removed === formImage) {
      setFormImage(next[0] || '');
    }
  };

  const handleSellerMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formImages.length) return;
    setFormImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (toIndex === 0) setFormImage(moved);
      return updated;
    });
  };

  const handleSellerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(true);
  };

  const handleSellerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(false);
  };

  const handleSellerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSellerIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSellerFileUpload(e.dataTransfer.files);
    }
  };

=======
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Product title is required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const is20Min = Boolean(formEligibleFor20Min || formCategory === 'delivery' || formCategory === 'grocery' || formCategory === 'food_delivery');
<<<<<<< HEAD
      const finalPrimary = formImage.trim() || formImages[0] || SAMPLE_IMAGES[0].url;
      const finalImagesList = formImages.length > 0 ? formImages.filter(Boolean) : [finalPrimary];

=======
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
      const payload: SellerProductPayload = {
        name: formName.trim(),
        brand: formBrand.trim() || sellerProfile?.shopName || 'Official Merchant',
        price: Number(formPrice) || 0,
        mrp: Number(formMrp) || Number(formPrice) || 0,
        category: formCategory,
        subCategory: formSubCategory.trim() || undefined,
        eligibleFor20MinDelivery: is20Min,
        stock: Number(formStock) || 0,
        stockStatus: formStockStatus,
<<<<<<< HEAD
        image: finalPrimary,
        images: finalImagesList,
=======
        image: formImage.trim() || SAMPLE_IMAGES[0].url,
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
        description: formDescription.trim(),
        hsnCode: formHsnCode.trim() || undefined,
        gstRate: Number(formGstRate) || 18,
        countryOfOrigin: formCountryOfOrigin.trim() || 'India',
        manufacturerDetails: formManufacturerDetails.trim() || undefined,
        packInfo: formPackInfo.trim() || undefined,
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
                        {(p.stockStatus === '20-Min Express' ? 'Fast Express' : (p.stockStatus || 'In Stock'))} ({p.stock ?? 10} units)
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
                        <GlassIconButton
                          icon={Trash2}
                          disabled={deletingId === p.id}
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          variant="danger"
                          size="sm"
                          title="Delete product"
                          aria-label="Delete product"
                          isLightMode={isLightMode}
                        />
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
              <GlassCloseButton
                onClick={() => setModalOpen(false)}
                isLightMode={false}
                size="sm"
                title="Close"
              />
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
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormCategory(newCat);
                      setFormSubCategory('');
                      if (newCat === 'grocery' || newCat === 'food_delivery' || newCat === 'delivery') {
                        setFormEligibleFor20Min(true);
                        setFormStockStatus('Fast Express');
                      }
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} {cat.eligibleFor20MinDelivery ? '(⚡ Fast Delivery)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Category and Fast Express Toggle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Sub-Category</label>
                  {CATEGORIES.find(c => c.id === formCategory)?.subCategories ? (
                    <select
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                    >
                      <option value="">Select Sub-Category ({CATEGORIES.find(c => c.id === formCategory)?.subCategories?.length} available)</option>
                      {CATEGORIES.find(c => c.id === formCategory)?.subCategories?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Rice & Dal, Biryani, Fresh Fruits..."
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  )}
                </div>
                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEligibleFor20Min}
                      onChange={(e) => setFormEligibleFor20Min(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1">
                        ⚡ Fast Delivery
                      </div>
                      <div className="text-[10px] text-rose-700 dark:text-rose-400">
                        Mark product as fast delivery eligible
                      </div>
                    </div>
                  </label>
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
                    <option value="Fast Express">Fast Express</option>
                    {formStockStatus === '20-Min Express' && <option value="20-Min Express">Fast Express (Legacy)</option>}
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

<<<<<<< HEAD
              {/* Multi-Image Upload & Management */}
              <div className="space-y-3 p-3.5 bg-neutral-50 dark:bg-neutral-950/70 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block text-[11px]">
                      Product Photos ({formImages.length}) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-neutral-500">
                      Upload photos or paste URLs. The photo marked as &quot;Primary&quot; will be used across storefront listings.
                    </p>
                  </div>
                  {formImages.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold">
                      Primary: {formImage ? "Selected" : "Auto (1st)"}
                    </span>
                  )}
                </div>

                {/* Upload Dropzone */}
                <div
                  onClick={() => sellerFileInputRef.current?.click()}
                  onDragOver={handleSellerDragOver}
                  onDragLeave={handleSellerDragLeave}
                  onDrop={handleSellerDrop}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    sellerIsDragging
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[0.99]'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-amber-500'
                  }`}
                >
                  <input
                    type="file"
                    ref={sellerFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleSellerFileUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                      Click to browse or drag &amp; drop photos here
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      Supports JPG, PNG, WEBP, GIF (multi-select enabled)
                    </span>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={sellerUrlInput}
                    onChange={(e) => setSellerUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSellerAddUrl();
                      }
                    }}
                    placeholder="Or paste image URL (https://...) and press Add"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleSellerAddUrl}
                    disabled={!sellerUrlInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 disabled:opacity-40 text-white font-mono font-bold text-xs cursor-pointer transition-colors shrink-0"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-neutral-400 font-mono">Sample Presets:</span>
=======
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
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
<<<<<<< HEAD
                      onClick={() => {
                        if (!formImages.includes(sample.url)) {
                          setFormImages((prev) => [...prev, sample.url]);
                        }
                        if (!formImage) setFormImage(sample.url);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                        formImage === sample.url
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700 font-bold'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
                      }`}
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>

                {/* Thumbnail Strip with Primary & Remove & Reorder Actions */}
                {formImages.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {formImages.map((src, idx) => {
                        const isPrimary = src === formImage || (idx === 0 && !formImages.includes(formImage));
                        return (
                          <div
                            key={`seller-img-${idx}`}
                            className={`relative rounded-xl overflow-hidden border-2 bg-neutral-100 dark:bg-neutral-800 group transition-all ${
                              isPrimary
                                ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <div className="aspect-square w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                              <img
                                src={src}
                                alt={`Product image ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Primary Badge */}
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 bg-amber-500 text-neutral-950 text-[9px] font-black font-mono px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 z-10">
                                <Star className="w-2.5 h-2.5 fill-neutral-950 text-neutral-950" />
                                <span>PRIMARY</span>
                              </div>
                            )}

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-20">
                              <div className="flex justify-between items-center">
                                {/* Reorder Left */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSellerMoveImage(idx, idx - 1);
                                  }}
                                  className="p-1 rounded bg-black/70 hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                                  title="Move left"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSellerRemoveImage(idx);
                                  }}
                                  className="p-1 rounded bg-rose-600/90 hover:bg-rose-700 text-white cursor-pointer"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex justify-between items-center gap-1">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSellerSetPrimary(idx);
                                    }}
                                    className="w-full py-0.5 px-1.5 rounded bg-amber-500 hover:bg-amber-600 text-neutral-950 font-mono text-[9px] font-bold cursor-pointer text-center"
                                  >
                                    Make Primary
                                  </button>
                                )}
                                {/* Reorder Right */}
                                <button
                                  type="button"
                                  disabled={idx === formImages.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSellerMoveImage(idx, idx + 1);
                                  }}
                                  className="p-1 rounded bg-black/70 hover:bg-black text-white disabled:opacity-30 cursor-pointer ml-auto"
                                  title="Move right"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                    ⚠️ At least one product photo is recommended for storefront display.
                  </p>
                )}
=======
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
>>>>>>> b663deda5a777c8380addd145360f145b1b647f1
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

              {/* Indian Statutory Listing Compliance (Consumer Protection E-Commerce Rules 2020) */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-mono">
                    <span>🏛️</span> Indian Statutory Listing Compliance
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Rule 6, E-Commerce 2020</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* GST Slab */}
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      GST Tax Slab <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formGstRate}
                      onChange={(e) => setFormGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-medium"
                    >
                      <option value={0}>0% (Nil / Exempted)</option>
                      <option value={5}>5% (Essential Goods)</option>
                      <option value={12}>12% (Standard S-1)</option>
                      <option value={18}>18% (Standard Default)</option>
                      <option value={28}>28% (Luxury / Sin Goods)</option>
                    </select>
                  </div>

                  {/* HSN Code */}
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      HSN / SAC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6203, 8518, 2106"
                      value={formHsnCode}
                      onChange={(e) => setFormHsnCode(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Country of Origin */}
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Country of Origin <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={formCountryOfOrigin}
                      onChange={(e) => setFormCountryOfOrigin(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Pack / Net Quantity Info */}
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Pack / Net Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pack of 1, 500g, 100ml"
                      value={formPackInfo}
                      onChange={(e) => setFormPackInfo(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Manufacturer Details */}
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Manufacturer / Importer Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alike Ateliers Ltd, Plot 42, Kumarghat Industrial Area, Tripura - 799264"
                    value={formManufacturerDetails}
                    onChange={(e) => setFormManufacturerDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-white text-[11px]"
                  />
                </div>
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
