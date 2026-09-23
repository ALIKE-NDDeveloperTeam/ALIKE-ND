import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Product, CartItem, Order, Notification, WalletTransaction, Contact } from './types';
import { PRODUCTS, JOBS, TESTIMONIALS, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS, INITIAL_CONTACTS } from './data/mockData';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Shared Layout Components (eagerly loaded for instant shell)
import Toast from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import { BottomNav } from './components/BottomNav';
import LoginModal from './components/LoginModal';

// Primary Landing Page (eagerly loaded for zero-delay First Contentful Paint)
import Home from './pages/Home';

// On-demand code-split sub-pages and modals
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));
const Messenger = lazy(() => import('./pages/Messenger'));
const JobsPortal = lazy(() => import('./pages/JobsPortal'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerRegister = lazy(() => import('./pages/SellerRegister'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const StaffAdminLogin = lazy(() => import('./pages/StaffAdminLogin'));
const SearchModal = lazy(() => import('./components/SearchModal'));
import { adminApi } from './pages/adminApi';

// Dedicated secret administration path (prevents unauthorized discovery of the ops console)
export const ADMIN_ROUTE_PATH = '/ops-console-x7k2m9';

/**
 * URL Scheme & Route Parser
 * 
 * - Home: '/' -> view: 'home'
 * - Admin: '/ops-console-x7k2m9' or '/admin' -> view: 'admin'
 * - Product detail: '/product/:id' (e.g. '/product/12') -> view: 'detail', productId: 12
 * - Search / Category: '/search?category=mobiles&q=iphone' -> view: 'search', category: 'mobiles', searchQuery: 'iphone'
 *   (Also supports direct path '/category/:id' e.g. '/category/mobiles')
 * - Named views: '/cart', '/checkout', '/profile', '/jobs', '/seller_register', '/seller_dashboard', '/notifications', '/ai_recs', '/superadmin_login', '/staffadmin_login'
 */
export interface ParsedRoute {
  view: string;
  category: string;
  searchQuery: string;
  productId: number | null;
}

export function parseRouteFromUrl(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'home', category: 'all', searchQuery: '', productId: null };
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Admin route (secret console path or /admin)
  if (pathname === ADMIN_ROUTE_PATH || pathname === '/admin') {
    return { view: 'admin', category: 'all', searchQuery: '', productId: null };
  }

  // 2. Product Detail: /product/:id (e.g. /product/123)
  const productMatch = pathname.match(/^\/product\/(\d+)$/);
  if (productMatch) {
    const pId = Number(productMatch[1]);
    return {
      view: 'detail',
      category: 'all',
      searchQuery: '',
      productId: Number.isFinite(pId) ? pId : null,
    };
  }

  // 3. Search & Category Browse: /search?category=...&q=...
  if (pathname === '/search') {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    return {
      view: 'search',
      category: cat,
      searchQuery: q,
      productId: null,
    };
  }

  // Also support direct category URL like /category/:id
  const categoryMatch = pathname.match(/^\/category\/([a-zA-Z0-9_-]+)$/);
  if (categoryMatch) {
    const cat = categoryMatch[1];
    const q = searchParams.get('q') || '';
    return {
      view: 'search',
      category: cat,
      searchQuery: q,
      productId: null,
    };
  }

  // 4. Dedicated feature sub-routes
  if (pathname === '/cart') return { view: 'cart', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/checkout') return { view: 'checkout', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/profile') {
    const tabParam = searchParams.get('tab') || 'all';
    return { view: 'profile', category: tabParam, searchQuery: '', productId: null };
  }
  if (pathname === '/wishlist') return { view: 'wishlist', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/jobs') return { view: 'jobs', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller_register' || pathname === '/seller-register') return { view: 'seller_register', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller_dashboard' || pathname === '/seller-dashboard') return { view: 'seller_dashboard', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/notifications') return { view: 'notifications', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/ai_recs' || pathname === '/ai-recs') return { view: 'ai_recs', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/superadmin_login') return { view: 'superadmin_login', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/staffadmin_login') return { view: 'staffadmin_login', category: 'all', searchQuery: '', productId: null };

  // Default to home
  return { view: 'home', category: 'all', searchQuery: '', productId: null };
}

export function buildRouteUrl(
  view: string,
  category: string = 'all',
  searchQuery: string = '',
  productId: number | null = null
): string {
  // Admin route preservation
  if (view === 'admin') {
    return ADMIN_ROUTE_PATH;
  }

  // Product detail view: /product/:id
  if (view === 'detail' || view.startsWith('product_')) {
    const pId = productId ?? (view.startsWith('product_') ? Number(view.replace('product_', '')) : null);
    return pId ? `/product/${pId}` : '/';
  }

  // Search or category browse view: /search?category=...&q=...
  if (view === 'search' || view === 'category_search' || view.startsWith('category_')) {
    const cat = view.startsWith('category_') ? view.replace('category_', '') : category;
    const params = new URLSearchParams();
    if (cat && cat !== 'all') {
      params.set('category', cat);
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  }

  // Home view
  if (view === 'home') {
    return '/';
  }

  // Specific routes
  if (view === 'cart') return '/cart';
  if (view === 'checkout') return '/checkout';
  if (view === 'profile') {
    if (category && category !== 'all' && category !== 'orders') {
      return `/profile?tab=${category}`;
    }
    return '/profile';
  }
  if (view === 'wishlist') return '/wishlist';
  if (view === 'jobs') return '/jobs';
  if (view === 'seller_register') return '/seller_register';
  if (view === 'seller_dashboard') return '/seller_dashboard';
  if (view === 'notifications') return '/notifications';
  if (view === 'ai_recs') return '/ai_recs';
  if (view === 'superadmin_login') return '/superadmin_login';
  if (view === 'staffadmin_login') return '/staffadmin_login';

  return '/';
}

import { X, ShoppingCart, Star } from 'lucide-react';
import GlassCloseButton from './components/GlassCloseButton';

const PageLoadingFallback = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-20 px-4">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-neutral-700/30"></div>
      <div className="absolute inset-0 rounded-full border-2 border-t-[#FF1878] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
    <span className="mt-4 text-[11px] font-mono tracking-widest text-neutral-400 uppercase animate-pulse">Loading Atelier Segment...</span>
  </div>
);

export default function App() {

  // Core Persistent State with database-backed session validation
  const [user, setUser] = useState<{ _id?: string; name: string; email: string; phone: string; avatar?: string; tier?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('alike_user');
      const token = localStorage.getItem('alike_user_token');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        // Only load if it has a real MongoDB _id or token and is not a mock guest user
        if (parsed && parsed._id && parsed.email && parsed.email !== 'guest@alike.com' && parsed.email !== 'facebook.guest@alike.com') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Storage load error for user:", e);
    }
    return null;
  });

  // Auto-bridge admin token in background whenever authenticated user changes
  useEffect(() => {
    if (user && user.email) {
      const userToken = localStorage.getItem('alike_user_token') || undefined;
      adminApi.bridgeLogin(userToken, user.email)
        .then((res) => {
          if (res && res.success && res.token) {
            adminApi.setToken(res.token);
            console.log("👑 [ADMIN AUTO-AUTHENTICATED] Admin privileges bridged for:", user.email);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const [isSeller, setIsSeller] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alike_is_seller') === 'true';
    } catch {
      return false;
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const savedUser = localStorage.getItem('alike_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email) {
          const userWallet = localStorage.getItem(`alike_wallet_${u.email.toLowerCase()}`);
          if (userWallet !== null && !isNaN(Number(userWallet))) {
            return Number(userWallet);
          }
        }
      }
    } catch {}
    return 0;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('alike_products');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for products:", e);
    }
    return PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('alike_cart');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for cart:", e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('alike_wishlist');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for wishlist:", e);
    }
    return [];
  });

  // Orders are customer-specific and start completely empty for newly registered accounts
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedUser = localStorage.getItem('alike_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email) {
          const saved = localStorage.getItem(`alike_orders_${u.email.toLowerCase()}`);
          if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("Storage load error for orders:", e);
    }
    return [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('alike_contacts_v2');
    if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CONTACTS;
  });

  const [lastNonMessengerView, setLastNonMessengerView] = useState('home');
  const [lastNonMessengerScroll, setLastNonMessengerScroll] = useState(0);

  const [toastList, setToastList] = useState<{ id: string; msg: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleProductsChange = (updatedProds: any[]) => {
    if (!Array.isArray(updatedProds)) return;
    const normalized: Product[] = updatedProds.map((p: any) => ({
      id: p.id || (typeof p._id === 'string' ? parseInt(p._id.replace(/\D/g, '').slice(0, 8) || '1', 10) : 1),
      _id: p._id,
      name: p.name,
      brand: p.brand || "Alike Sovereign",
      category: p.category,
      price: p.price,
      mrp: p.mrp || p.price,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 120,
      stock: p.stock !== undefined ? p.stock : 15,
      stockStatus: p.stockStatus || (p.stock > 0 ? "In Stock" : "Out of Stock"),
      badge: p.badge || (p.isFlashSale ? "SALE" : undefined),
      isFlashSale: p.isFlashSale ?? (p.badge === "SALE"),
      flashEndsAt: p.flashEndsAt,
      image: p.image,
      images: p.images || [p.image],
      description: p.description,
      specifications: p.specifications,
      isWholesale: p.isWholesale,
      wholesalePrice: p.wholesalePrice,
      wholesaleMinQty: p.wholesaleMinQty,
      colors: p.colors || ['Black', 'Gold', 'Silver'],
      sizes: p.sizes || ['Standard'],
      emoji: p.emoji || '✨'
    }));
    setProducts(normalized);
    localStorage.setItem('alike_products', JSON.stringify(normalized));
  };

  // Sync catalog live from MongoDB storefront /api/products
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          handleProductsChange(data);
        }
      })
      .catch((err) => console.warn('Storefront products API fallback:', err));
  }, []);

  // Global keyboard shortcut for search experience (⌘K or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const headerInput = document.getElementById('search-input-header') as HTMLInputElement | null;
        if (headerInput) {
          headerInput.focus();
          headerInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 2.1 Quick View & 2.5 Product Compare state layers
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Standard Gold');

  // App Routing Visibility & URL Navigation state
  const [currentAdminUser, setCurrentAdminUser] = useState<{ _id?: string; name: string; email: string; role: string } | null>(null);

  // (a) Route State Initialization: restores view, category, product ID, and search query on reload or direct link
  const [currentView, setCurrentView] = useState<string>(() => parseRouteFromUrl().view);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => parseRouteFromUrl().category);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(() => parseRouteFromUrl().productId);
  const [searchQuery, setSearchQuery] = useState<string>(() => parseRouteFromUrl().searchQuery);
  const [profileInitialTab, setProfileInitialTab] = useState<'orders' | 'addresses' | 'settings' | 'wishlist'>(() => {
    const parsed = parseRouteFromUrl();
    if (parsed.view === 'profile' && (parsed.category === 'settings' || parsed.category === 'addresses' || parsed.category === 'orders' || parsed.category === 'wishlist')) {
      return parsed.category;
    }
    return 'orders';
  });
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);

  // Pure Light Mode Enforced Across Entire Application
  const isLightMode = true;

  // (b) Popstate Listener: synchronizes view state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRouteFromUrl();
      setCurrentView(parsed.view);
      setSelectedCategory(parsed.category);
      setSelectedProductId(parsed.productId);
      setSearchQuery(parsed.searchQuery);
      if (parsed.view === 'profile' && (parsed.category === 'settings' || parsed.category === 'addresses' || parsed.category === 'orders' || parsed.category === 'wishlist')) {
        setProfileInitialTab(parsed.category);
      }
      setNavigationHistory((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.body.classList.add('light-mode');
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark');
    localStorage.setItem('alike_theme', 'light');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.08 });

      const elts = document.querySelectorAll('.product-card, .category-card, .section-header, .reveal-entry');
      elts.forEach(el => {
        el.classList.add('reveal-entry');
        observer.observe(el);
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [currentView]);

  // Close floating chat widget on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!isChatOpen) return;
      const target = e.target as HTMLElement;
      
      // If click is inside the chat widget container, ignore
      const widget = document.getElementById('chat-widget-container');
      if (widget && widget.contains(target)) {
        return;
      }
      
      // If click is on any element that opens or triggers messenger, ignore
      const isTrigger = target.closest('#nav-messenger-btn') || 
                        target.closest('#mobile-nav-messenger-btn') ||
                        target.closest('[title*="Messenger"]') ||
                        target.closest('.messenger-trigger-btn') ||
                        target.closest('button')?.innerText?.toLowerCase().includes('messenger');
      
      if (isTrigger) {
        return;
      }

      // Check if click is on any dialog modals overlay (e.g. Confirm block, Confirm clear)
      if (target.closest('.fixed.inset-0.z-50')) {
        return;
      }

      setIsChatOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isChatOpen]);

  // Synchronize with Firebase Auth session shifts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          avatar: firebaseUser.photoURL || undefined,
          tier: 'Silver',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Strict session verification against live MongoDB alikendshop.users collection on mount
  useEffect(() => {
    const verifyDatabaseSession = async () => {
      const token = localStorage.getItem('alike_user_token');
      if (!token) {
        // Clear any orphaned unverified session without a valid token
        const saved = localStorage.getItem('alike_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (!parsed?._id) {
              setUser(null);
              localStorage.removeItem('alike_user');
            }
          } catch {
            setUser(null);
            localStorage.removeItem('alike_user');
          }
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.valid && data.user) {
          setUser({
            _id: String(data.user._id),
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            tier: data.user.tier,
          });
          setIsSeller(Boolean(data.isSeller));
        } else {
          // Token or user not found in MongoDB
          console.warn("Session verification failed against MongoDB. Resetting session:", data?.error);
          setUser(null);
          localStorage.removeItem('alike_user');
          localStorage.removeItem('alike_user_token');
        }
      } catch (err) {
        console.warn("Could not verify session with MongoDB:", err);
      }
    };

    verifyDatabaseSession();
  }, []);

  // Fetch and synchronize user-specific orders and wallet from database and scoped storage
  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setWalletBalance(0);
      return;
    }
    const cleanEmail = user.email.toLowerCase();

    // 1. Load local wallet balance for this user (defaults to 0)
    try {
      const savedWallet = localStorage.getItem(`alike_wallet_${cleanEmail}`);
      if (savedWallet !== null && !isNaN(Number(savedWallet))) {
        setWalletBalance(Number(savedWallet));
      } else {
        setWalletBalance(0);
      }
    } catch {
      setWalletBalance(0);
    }

    // Check live seller approval status for accurate dropdown rendering
    fetch(`/api/sellers/status-check?email=${encodeURIComponent(cleanEmail)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res && typeof res.isSeller === 'boolean') {
          setIsSeller(res.isSeller);
        }
      })
      .catch(() => {});

    // 2. Load cached orders for this user (defaults to [])
    try {
      const savedOrders = localStorage.getItem(`alike_orders_${cleanEmail}`);
      if (savedOrders && savedOrders.trim() !== '' && savedOrders !== 'null') {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }

    // 3. Fetch real orders from database for this specific user
    fetch(`/api/orders/user?email=${encodeURIComponent(cleanEmail)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
          try {
            localStorage.setItem(`alike_orders_${cleanEmail}`, JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user orders:", err);
      });
  }, [user?.email]);

  // Scoped orders filtered exclusively for the logged-in customer
  const userOrders = useMemo(() => {
    if (!user || !user.email) return [];
    const cleanEmail = user.email.toLowerCase();
    return orders.filter(
      (o) => o.memberEmail && o.memberEmail.toLowerCase() === cleanEmail
    );
  }, [orders, user]);

  const [activeCoupon, setActiveCoupon] = useState<string | undefined>(undefined);

  // Persists states in localStorage upon state updates safely
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('alike_user', JSON.stringify(user));
        if (user.email) {
          localStorage.setItem(`alike_wallet_${user.email.toLowerCase()}`, String(walletBalance));
          localStorage.setItem(`alike_orders_${user.email.toLowerCase()}`, JSON.stringify(orders));
        }
      } else {
        localStorage.removeItem('alike_user');
      }
      localStorage.setItem('alike_is_seller', String(isSeller));
      localStorage.setItem('alike_products', JSON.stringify(products));
      localStorage.setItem('alike_cart', JSON.stringify(cart));
      localStorage.setItem('alike_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('alike_contacts_v2', JSON.stringify(contacts));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [user, isSeller, walletBalance, products, cart, wishlist, orders, contacts]);

  // Global Toast Dispatcher
  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const freshToken = { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, msg, type };
    setToastList((prev) => [...prev, freshToken]);
  };

  const removeToast = (id: string) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  };

  // State mutation wrappers
  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    // Check if combined key exists
    const index = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
    );

    if (index > -1) {
      const fresh = [...cart];
      fresh[index].quantity += quantity;
      setCart(fresh);
    } else {
      setCart([...cart, { product, quantity, selectedColor: color, selectedSize: size }]);
    }
    showToast(`Added ${quantity}x ${product.name} to checkout bag!`, 'success');
  };

  const handleUpdateQuantity = (id: number, qty: number, color?: string, size?: string) => {
    if (qty < 1) {
      handleRemoveFromCart(id, color, size);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (id: number, color?: string, size?: string) => {
    setCart(
      cart.filter(
        (item) =>
          !(item.product.id === id && item.selectedColor === color && item.selectedSize === size)
      )
    );
    showToast('Removed item from shopping bag.', 'info');
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
      showToast('Removed product from wishlist.', 'info');
    } else {
      setWishlist([...wishlist, product]);
      showToast('Starred item into your saved wishlist.', 'success');
    }
  };

  const handleToggleCompare = (product: Product) => {
    const exists = comparedProducts.some((p) => p.id === product.id);
    if (exists) {
      setComparedProducts(comparedProducts.filter((p) => p.id !== product.id));
      showToast(`Removed "${product.name}" from compare matrix.`, 'info');
    } else {
      if (comparedProducts.length >= 3) {
        showToast('Maximum of 3 creations can be compared at once!', 'warning');
        return;
      }
      setComparedProducts([...comparedProducts, product]);
      showToast(`Added "${product.name}" to compare matrix.`, 'success');
    }
  };

  const handleAddMultipleToCart = (items: Product[]) => {
    const freshCart = [...cart];
    items.forEach((p) => {
      const index = freshCart.findIndex((item) => item.product.id === p.id);
      if (index > -1) {
        freshCart[index].quantity += 1;
      } else {
        freshCart.push({ product: p, quantity: 1 });
      }
    });
    setCart(freshCart);
  };

  const handleDeductWallet = (amt: number): boolean => {
    if (walletBalance < amt) return false;
    setWalletBalance((prev) => prev - amt);
    return true;
  };

  const handleAddWalletBalance = (amt: number) => {
    setWalletBalance((prev) => prev + amt);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    const orderWithUser: Order = {
      ...newOrder,
      memberEmail: user?.email ? user.email.toLowerCase() : (newOrder.memberEmail || ''),
      userId: user?._id || newOrder.userId || '',
    };
    setOrders((prev) => [orderWithUser, ...prev]);
    if (user?.email) {
      try {
        const cleanEmail = user.email.toLowerCase();
        const updated = [orderWithUser, ...orders.filter((o) => o.memberEmail?.toLowerCase() === cleanEmail)];
        localStorage.setItem(`alike_orders_${cleanEmail}`, JSON.stringify(updated));
      } catch {}
    }
    setCart([]); // Reset basket
    setActiveCoupon(undefined);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status'], step: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, trackingStep: step } : o))
    );
  };

  // (c) Manual Client-Side Navigation Wrapper with window.history.pushState
  const handleNavigate = (view: string, categoryFilter?: string) => {
    // Ensure any open modals are dismissed upon navigation
    setLoginOpen(false);
    setSearchModalOpen(false);

    // Messenger triggers floating chat widget without altering the page route
    if (view === 'messenger') {
      setIsChatOpen((prev) => {
        const next = !prev;
        if (next) {
          setUnreadMessagesCount(0);
        }
        return next;
      });
      return;
    }

    let nextView = view;
    let nextCategory = selectedCategory;
    let nextProductId: number | null = null;
    let nextQuery = searchQuery;

    // Reset search query when navigating away from search and product detail views
    if (
      view !== 'search' &&
      view !== 'category_search' &&
      !view.startsWith('category_') &&
      view !== 'detail' &&
      !view.startsWith('product_')
    ) {
      nextQuery = '';
      setSearchQuery('');
    }

    if (view === 'admin') {
      nextView = 'admin';
    } else if (view === 'home') {
      nextView = 'home';
      nextCategory = 'all';
      nextProductId = null;
      setSelectedCategory('all');
      setSelectedProductId(null);
    } else if (view === 'category_search' || view === 'search') {
      nextView = 'search';
      nextCategory = categoryFilter !== undefined ? categoryFilter : (selectedCategory || 'all');
      nextProductId = null;
      setSelectedCategory(nextCategory);
      setSelectedProductId(null);
    } else if (view.startsWith('category_')) {
      nextView = 'search';
      nextCategory = view.replace('category_', '');
      nextProductId = null;
      setSelectedCategory(nextCategory);
      setSelectedProductId(null);
    } else if (view.startsWith('product_')) {
      nextView = 'detail';
      const pId = Number(view.replace('product_', ''));
      nextProductId = Number.isFinite(pId) ? pId : null;
      setSelectedProductId(nextProductId);
    } else if (view === 'detail') {
      nextView = 'detail';
      nextProductId = selectedProductId;
    } else if (view === 'profile') {
      nextView = 'profile';
      nextProductId = null;
      setSelectedProductId(null);
      if (categoryFilter === 'settings' || categoryFilter === 'addresses' || categoryFilter === 'orders' || categoryFilter === 'wishlist') {
        setProfileInitialTab(categoryFilter);
      } else {
        setProfileInitialTab('orders');
      }
    } else {
      nextView = view;
      nextProductId = null;
      setSelectedProductId(null);
    }

    // Record previous view in navigation stack for accurate Back navigation
    if (nextView !== currentView) {
      setNavigationHistory((prev) => [...prev, currentView]);
    }

    setCurrentView(nextView);

    // Synchronize browser history and address bar URL with window.history.pushState
    if (typeof window !== 'undefined') {
      const targetUrl = buildRouteUrl(nextView, nextCategory, nextQuery, nextProductId);
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        window.history.pushState({ view: nextView, category: nextCategory, productId: nextProductId }, '', targetUrl);
      }
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back navigation handler: pops prior view from in-app stack or falls back to 'home'
  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const historyCopy = [...navigationHistory];
      const prevView = historyCopy.pop()!;
      setNavigationHistory(historyCopy);
      handleNavigate(prevView);
    } else {
      handleNavigate('home');
    }
  };

  const activeProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || products[0]
    : products[0];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-neutral-200 font-sans selection:bg-[#D1D1D1] selection:text-black antialiased relative">

      {/* 2. Global Toast and Login overlays */}
      <Toast toasts={toastList} onDismiss={removeToast} />
      
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(userData, isNewRegistration) => {
            // Setup active session tied to MongoDB document
            const cleanEmail = userData.email.toLowerCase();
            setUser({
              _id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              tier: userData.tier || 'Silver',
            });
            setIsSeller(Boolean((userData as any)?.isSeller));
            if (isNewRegistration) {
              setWalletBalance(0);
              setOrders([]);
              try {
                localStorage.setItem(`alike_wallet_${cleanEmail}`, '0');
                localStorage.setItem(`alike_orders_${cleanEmail}`, '[]');
                localStorage.removeItem(`alike_addresses_${cleanEmail}`);
                localStorage.removeItem(`alike_cards_${cleanEmail}`);
              } catch {}
            } else {
              try {
                const savedWallet = localStorage.getItem(`alike_wallet_${cleanEmail}`);
                setWalletBalance(savedWallet !== null && !isNaN(Number(savedWallet)) ? Number(savedWallet) : 0);
              } catch {
                setWalletBalance(0);
              }
            }
            setLoginOpen(false);
            if (isNewRegistration) {
              setCurrentView('profile');
              showToast(`Luxury account created successfully! Welcome to your profile, ${userData.name}!`, 'success');
            } else {
              showToast(`Welcome inside Alike luxury corridors, ${userData.name}!`, 'success');
            }
          }}
          onShowForgotPassword={() => {
            setLoginOpen(false);
            showToast('An OTP check corridor link has been triggered to coordinates.', 'info');
          }}
          showToast={showToast}
          isLightMode={isLightMode}
        />
      )}

      {/* Global Search Modal Experience */}
      {searchModalOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onNavigate={handleNavigate}
            onSearch={(q, cat) => {
              const termLower = q.trim().toLowerCase();
              if (termLower === 'admin' || termLower === 'superadmin') {
                setSearchQuery('');
                handleNavigate('admin');
                return;
              }
              setSearchQuery(q);
              if (cat) setSelectedCategory(cat);
              handleNavigate('category_search', cat || 'all');
            }}
            onSelectProduct={(p) => {
              handleNavigate('product_' + p.id);
            }}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            products={products}
            isLightMode={isLightMode}
            initialQuery={searchQuery}
          />
        </Suspense>
      )}

      {/* 3. Sticky top navigational Header block */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onClearUnreadMessages={() => setUnreadMessagesCount(0)}
        onClearUnreadNotifications={() => setUnreadNotificationsCount(0)}
        user={user}
        isSeller={isSeller}
        onLogout={() => {
          localStorage.removeItem('alike_user');
          localStorage.removeItem('alike_user_token');
          localStorage.removeItem('alikend_admin_token');
          adminApi.clearToken();
          signOut(auth)
            .then(() => {
              setUser(null);
              setIsSeller(false);
              setWalletBalance(0);
              setCart([]);
              setWishlist([]);
              setOrders([]);
              showToast('Logged out of luxury segment session.', 'info');
              handleNavigate('home');
            })
            .catch((err) => {
              console.error("Firebase signOut failed:", err);
              setUser(null);
              setIsSeller(false);
              setWalletBalance(0);
              setCart([]);
              setWishlist([]);
              setOrders([]);
              showToast('Logged out of luxury segment session.', 'info');
              handleNavigate('home');
            });
        }}
        onOpenAuthModal={(tab) => {
          setLoginOpen(true);
        }}
        onSearch={(q) => {
          const trimmed = q.trim().toLowerCase();
          if (trimmed === 'admin' || trimmed === 'superadmin') {
            setSearchQuery('');
            handleNavigate('admin');
            return;
          }
          setSearchQuery(q);
          if (typeof window !== 'undefined') {
            const targetUrl = buildRouteUrl('search', selectedCategory, q, null);
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl !== targetUrl) {
              window.history.pushState({ view: 'search', q, category: selectedCategory }, '', targetUrl);
            }
          }
          if (currentView !== 'search') {
            setCurrentView('search');
          }
        }}
        onOpenSearchModal={(initialQ) => {
          if (initialQ !== undefined) setSearchQuery(initialQ);
          setSearchModalOpen(true);
        }}
        isLightMode={isLightMode}
        selectedCategory={selectedCategory}
      />

      {/* 4. Sub-page router dispatcher */}
      <main className="flex-grow pt-0 pb-16 relative z-10" id="main-spa-body">
        <div key={currentView} className="animate-page-in">
          {currentView === 'home' && (
          <Home
            products={products}
            jobs={JOBS}
            testimonials={TESTIMONIALS}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleWishlist={handleToggleWishlist}
            wishlistedIds={wishlist.map((p) => p.id)}
            onNavigate={handleNavigate}
            onCompare={handleToggleCompare}
            onQuickView={setQuickViewProduct}
            isLightMode={isLightMode}
          />
        )}

        {currentView !== 'home' && (
          <Suspense fallback={<PageLoadingFallback />}>
            {currentView === 'detail' && (
              <ProductDetail
            product={activeProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onAddToCartAndCheckout={(p, qty, color, size) => {
              handleAddToCart(p, qty, color, size);
              handleNavigate('checkout');
            }}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            isWishlisted={wishlist.some((p) => p.id === activeProduct.id)}
            showToast={showToast}
            isLightMode={isLightMode}
            onBack={handleBack}
            showBackButton={true}
          />
        )}

        {(currentView === 'search' || currentView === 'category_search') && (
          <SearchPage
            products={products}
            initialCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              if (typeof window !== 'undefined') {
                const targetUrl = buildRouteUrl('search', cat, searchQuery, null);
                const currentUrl = window.location.pathname + window.location.search;
                if (currentUrl !== targetUrl) {
                  window.history.replaceState({ view: 'search', category: cat, q: searchQuery }, '', targetUrl);
                }
              }
            }}
            onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onCompare={handleToggleCompare}
            onQuickView={setQuickViewProduct}
            wishlistedIds={wishlist.map((p) => p.id)}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (typeof window !== 'undefined') {
                const targetUrl = buildRouteUrl('search', selectedCategory, q, null);
                const currentUrl = window.location.pathname + window.location.search;
                if (currentUrl !== targetUrl) {
                  window.history.replaceState({ view: 'search', category: selectedCategory, q }, '', targetUrl);
                }
              }
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
            onBack={() => handleNavigate('home')}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'cart' && (
          <Cart
            cartItems={cart}
            allProducts={products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onProceedToCheckout={(coupon) => {
              if (coupon) setActiveCoupon(coupon);
              handleNavigate('checkout');
            }}
            showToast={showToast}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            cartItems={cart}
            couponCode={activeCoupon}
            walletBalance={walletBalance}
            onDeductWallet={handleDeductWallet}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={handleNavigate}
            showToast={showToast}
            user={user}
          />
        )}

        {currentView === 'profile' && (
          <Profile
            user={user}
            onUpdateUser={(u) => setUser(u)}
            orders={userOrders}
            wishlist={wishlist}
            onRemoveWishlistItem={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onNavigate={handleNavigate}
            onBack={handleBack}
            showBackButton={true}
            initialTab={profileInitialTab}
            walletBalance={walletBalance}
            transactions={INITIAL_TRANSACTIONS}
            onAddWalletBalance={handleAddWalletBalance}
            showToast={showToast}
            isLightMode={isLightMode}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            wishlist={wishlist}
            onRemoveWishlistItem={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onNavigate={handleNavigate}
            onBack={handleBack}
            showBackButton={true}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'messenger' && (
          <Messenger
            contacts={contacts}
            setContacts={setContacts}
            showToast={showToast}
            user={user}
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'jobs' && (
          <JobsPortal
            jobs={JOBS}
            showToast={showToast}
          />
        )}

        {currentView === 'seller_register' && (
          <SellerRegister
            onRegisterSuccess={(seller) => {
              if (seller && seller.status === 'approved') {
                setIsSeller(true);
                handleNavigate('seller_dashboard');
              }
            }}
            onLoginSuccess={(seller) => {
              setIsSeller(true);
              handleNavigate('seller_dashboard');
            }}
            onNavigateToDashboard={() => handleNavigate('seller_dashboard')}
            onNavigateHome={() => handleNavigate('home')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'seller_dashboard' && (
          <SellerDashboard
            products={products}
            onAddProduct={(p) => {
              setProducts([p, ...products]);
              try {
                localStorage.setItem('alike_products', JSON.stringify([p, ...products]));
              } catch {}
            }}
            onRemoveProduct={(id) => {
              const updated = products.filter((p) => p.id !== id);
              setProducts(updated);
              try {
                localStorage.setItem('alike_products', JSON.stringify(updated));
              } catch {}
            }}
            onUpdateProduct={(p) => {
              const updated = products.map((item) => (item.id === p.id ? p : item));
              setProducts(updated);
              try {
                localStorage.setItem('alike_products', JSON.stringify(updated));
              } catch {}
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsPage
            notifications={INITIAL_NOTIFICATIONS}
            showToast={showToast}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'ai_recs' && (
          <AIRecommendations
            products={products}
            onAddMultipleToCart={handleAddMultipleToCart}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            showToast={showToast}
          />
        )}

        {currentView === 'admin' && (
          <div className="w-full">
            <div className="bg-[#241129] border-b border-white/10 px-6 py-2.5 flex items-center justify-between text-xs">
              <span className="font-mono text-pink-300 tracking-wider">ALIKE ND Administrator Console</span>
              <button
                onClick={() => handleNavigate('home')}
                className="font-medium text-amber-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span> Return to Galleria Store
              </button>
            </div>
            <AdminPanel 
              onNavigateHome={() => handleNavigate('home')} 
              user={user} 
              initialAdmin={currentAdminUser}
              onProductsChange={handleProductsChange}
            />
          </div>
        )}

        {currentView === 'superadmin_login' && (
          <div className="w-full">
            <SuperAdminLogin
              onLoginSuccess={(admin) => {
                setCurrentAdminUser(admin);
                showToast(`Welcome Master Administrator, ${admin.name}.`, 'success');
              }}
              onSuccess={() => {
                handleNavigate('admin');
              }}
              onNavigate={handleNavigate}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          </div>
        )}

        {currentView === 'staffadmin_login' && (
          <div className="w-full">
            <StaffAdminLogin
              onLoginSuccess={(admin) => {
                setCurrentAdminUser(admin);
                showToast(`Welcome Operations Staff, ${admin.name}.`, 'success');
              }}
              onSuccess={() => {
                handleNavigate('admin');
              }}
              onNavigate={handleNavigate}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          </div>
        )}
          </Suspense>
        )}
        </div>
      </main>

      {/* 5. Elegant footer of the unified platform */}
      {(() => {
        // Explicit view classification:
        // Sub-pages/detail views where a "Back" button is meaningful:
        // - 'detail': Product Detail page (browsing flow)
        // - 'search' / 'category_search': Category catalogue & search results
        // - 'cart': Shopping Cart (shopping flow)
        // - 'checkout': Checkout funnel (order flow)
        // - 'profile': User Account, order tracking & settings
        // - 'wishlist': Saved products wishlist
        // - 'notifications': Notifications tray
        // - 'ai_recs': AI Recommendations & Style Guide
        // Top-level entry points / standalone portals where "Back" is omitted / hidden:
        // - 'home': Store homepage (root landing page)
        // - 'seller_dashboard': Standalone vendor management workstation
        // - 'admin': Master Administrator console (has built-in "Return to Store" action)
        // - 'superadmin_login': Dedicated admin login screen
        // - 'staffadmin_login': Dedicated staff login screen
        // - 'jobs': Standalone careers portal
        // - 'seller_register': Standalone seller onboarding portal
        // - 'messenger': Standalone chat / message view
        const subPageViews = ['detail', 'search', 'category_search', 'cart', 'checkout', 'profile', 'wishlist', 'notifications', 'ai_recs'];
        const shouldShowBackButton = subPageViews.includes(currentView) && (navigationHistory.length > 0 || currentView !== 'home');

        return (
          <Footer 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            isLightMode={isLightMode} 
            currentView={currentView}
            showBackButton={shouldShowBackButton}
          />
        );
      })()}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
        isLightMode={isLightMode}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setLoginOpen(true)}
      />

      {/* 2.1 Product Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-neutral-950 border-2 border-solid border-[#D1D1D1]/40 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl glass-panel relative p-6 md:p-8 flex flex-col md:flex-row gap-8 scale-in animate-page-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <GlassCloseButton
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10"
              size="md"
              title="Close Quick View"
            />

            {/* Image section */}
            <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info details */}
            <div className="w-full md:w-1/2 flex flex-col justify-between py-1 space-y-4">
              <div>
                <span className="text-[10px] text-[#D1D1D1] uppercase tracking-widest font-black font-mono">
                  {quickViewProduct.brand}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white leading-snug mt-1.5 font-sans">
                  {quickViewProduct.name}
                </h2>

                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex items-center text-[#D1D1D1] bg-neutral-900 px-2 py-0.5 border border-solid border-neutral-800 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold text-white ml-2">{quickViewProduct.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-neutral-500 text-xs">·</span>
                  <span className="text-neutral-400 text-xs font-medium">({quickViewProduct.reviewsCount} premium reviews)</span>
                </div>

                <div className="mt-4 pt-3 border-t border-solid border-neutral-900 space-y-1">
                  <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-widest">Atelier Description</p>
                  <p className="text-neutral-300 text-xs leading-relaxed font-sans mt-0.5">
                    {quickViewProduct.description}
                  </p>
                </div>
              </div>

              {/* Options selection */}
              <div className="space-y-4 pt-4 border-t border-solid border-[#D1D1D1]/10">
                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider font-extrabold">Grade Choice</p>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-1 text-xs font-bold rounded-lg border border-solid transition-colors cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#D1D1D1] border-[#D1D1D1] text-black font-extrabold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider font-extrabold">Surface Polish</p>
                  <div className="flex gap-2">
                    {['Standard Gold', 'Sterling Silver', 'Imperial Amber'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border border-solid transition-colors cursor-pointer ${
                          selectedColor === color
                            ? 'bg-[#D1D1D1] border-[#D1D1D1] text-black font-extrabold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price block */}
              <div className="pt-4 border-t border-solid border-neutral-900">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-[#D1D1D1]">₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-neutral-500 line-through">₹{quickViewProduct.mrp.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct, 1, selectedColor, selectedSize);
                      setQuickViewProduct(null);
                    }}
                    className="flex-grow py-3 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] text-black hover:opacity-90 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-black" />
                    Reserve Signature Copy
                  </button>
                  <button
                    onClick={() => {
                      setQuickViewProduct(null);
                      handleNavigate('product_' + quickViewProduct.id);
                    }}
                    className="px-4 py-3 bg-neutral-900 hover:bg-neutral-850 hover:text-[#D1D1D1] rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-400 border border-solid border-neutral-800 transition-colors cursor-pointer"
                  >
                    Deep View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 Compare Sticky Bottom Drawer Panel */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 border-t-2 border-solid border-[#D1D1D1]/40 backdrop-blur-lg p-4 z-40 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl animate-page-in">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-xs font-black text-white uppercase tracking-wider">Comparison Corridor</p>
              <p className="text-[10px] text-neutral-500">{comparedProducts.length} premium creations selected</p>
            </div>
            <div className="flex gap-2">
              {comparedProducts.map((p, pIdx) => (
                <div key={`cmp-bar-${p.id}-${pIdx}`} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-solid border-neutral-800">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    onClick={() => setComparedProducts(comparedProducts.filter((item) => item.id !== p.id))}
                    className="absolute -top-1 -right-1 bg-neutral-900 border border-solid border-[#D1D1D1]/30 p-0.5 rounded-full text-neutral-400 hover:text-[#D1D1D1] shadow transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setComparedProducts([])}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-[#D1D1D1] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Purge Matrix
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-5 py-2 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] text-black font-black uppercase rounded-xl text-[10px] tracking-wider transition-all shadow-lg cursor-pointer"
            >
              Compare Specs ({comparedProducts.length})
            </button>
          </div>
        </div>
      )}

      {/* 2.5 Detailed Attribute Compare Specification Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setShowCompareModal(false)}>
          <div className="bg-neutral-950 border-2 border-solid border-[#D1D1D1]/40 rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl glass-panel relative p-6 scale-in animate-page-in" onClick={(e) => e.stopPropagation()}>
            <GlassCloseButton
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 z-10"
              size="md"
              title="Close Compare"
            />

            <h2 className="text-xl font-mono uppercase tracking-wider mb-6 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] bg-clip-text text-transparent font-extrabold">Detailed Spec Comparison Matrix</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300 border-collapse">
                <thead>
                  <tr className="border-b border-solid border-neutral-900">
                    <th className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono w-48">Spec Key</th>
                    {comparedProducts.map((p, pIdx) => (
                      <th key={`cmp-head-${p.id}-${pIdx}`} className="py-4 px-4 w-64 min-w-[200px]">
                        <div className="space-y-2">
                          <img src={p.image} alt={p.name} className="w-24 h-24 rounded-lg object-cover bg-neutral-900 border border-solid border-neutral-800" referrerPolicy="no-referrer" />
                          <h4 className="font-bold text-white font-sans text-sm line-clamp-1">{p.name}</h4>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-[#D1D1D1] bg-[#D1D1D1]/20 px-2 py-0.5 rounded-full">{p.brand}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">Price Point</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-price-${p.id}-${pIdx}`} className="py-4 px-4 text-sm font-black text-[#D1D1D1]">₹{p.price.toLocaleString('en-IN')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">MRP Value</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-mrp-${p.id}-${pIdx}`} className="py-4 px-4 text-xs text-neutral-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Atelier Rating</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-rating-${p.id}-${pIdx}`} className="py-4 px-4">
                        <div className="flex items-center text-[#D1D1D1] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {p.rating.toFixed(1)} / 5.0
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Reviews Count</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-reviews-${p.id}-${pIdx}`} className="py-4 px-4">{p.reviewsCount} buyers</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Level Layer</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-cat-${p.id}-${pIdx}`} className="py-4 px-4 capitalize font-mono text-[11px] text-[#D1D1D1]">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Description notes</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-desc-${p.id}-${pIdx}`} className="py-4 px-4 text-neutral-400 text-[11px] leading-relaxed max-w-[200px] line-clamp-3">{p.description}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">Action Corridor</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-action-${p.id}-${pIdx}`} className="py-4 px-4">
                        <button
                          onClick={() => {
                            handleAddToCart(p);
                            setShowCompareModal(false);
                            setComparedProducts([]);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] hover:opacity-90 text-black font-black uppercase text-[10px] tracking-wider rounded-lg transition-all shadow cursor-pointer"
                        >
                          Add to Bag
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Messenger Side Widget/Popup */}
      {isChatOpen && (
        <Suspense fallback={null}>
          <div id="chat-widget-container" className="fixed bottom-6 right-6 z-[90] w-[380px] max-w-[calc(100vw-32px)] h-[min(580px,calc(100vh-100px))] rounded-3xl overflow-hidden shadow-2xl border-2 border-solid border-[#D1D1D1]/40 flex flex-col bg-white animate-slide-up animate-page-in">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <Messenger
                contacts={contacts}
                setContacts={setContacts}
                showToast={showToast}
                user={user}
                onNavigate={handleNavigate}
                isLightMode={isLightMode}
                isWidget={true}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
}
