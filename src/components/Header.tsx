import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Search,
  Bell,
  Heart,
  ShoppingCart,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
  Menu,
  X,
  Clock,
  CreditCard,
  Briefcase,
  Store,
  Wallet,
  Sun,
  Moon,
  Home,
  Sparkles,
  Zap,
  Package,
  Layers,
  Watch,
  Smartphone,
  Shield,
  Shirt,
  Utensils
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import Logo from './Logo';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, categoryFilter?: string) => void;
  cartCount: number;
  wishlistCount: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  onClearUnreadMessages?: () => void;
  onClearUnreadNotifications?: () => void;
  user: { name: string; email: string; phone: string; isSeller?: boolean; sellerStatus?: string | null } | null;
  isSeller?: boolean;
  onLogout: () => void;
  onOpenAuthModal: (tab?: 'password' | 'otp' | 'register') => void;
  onSearch: (query: string) => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
  selectedCategory?: string;
}

export default function Header({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  unreadMessagesCount,
  unreadNotificationsCount,
  onClearUnreadMessages,
  onClearUnreadNotifications,
  user,
  isSeller = false,
  onLogout,
  onOpenAuthModal,
  onSearch,
  onOpenSearchModal,
  isLightMode = false,
  onToggleTheme = () => {},
  selectedCategory = 'all',
}: HeaderProps) {
  const isApprovedSeller = Boolean(isSeller || user?.isSeller === true || user?.sellerStatus === 'approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('alike_recent_searches');
    return saved ? JSON.parse(saved) : ['Watch', 'iPhone', 'Gold Chronograph', 'Leather', 'Atelier Ghee'];
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Smooth smart-header scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setIsScrolled(currentY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecentDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed === 'noyondey176@gmail.com' || trimmed === 'superadmin') {
      setShowRecentDropdown(false);
      setSearchQuery('');
      onNavigate('superadmin_login');
      return;
    }
    if (trimmed === 'admin' || trimmed === 'staff' || trimmed === 'admin234@gmail.com' || trimmed === 'ops') {
      setShowRecentDropdown(false);
      setSearchQuery('');
      onNavigate('staffadmin_login');
      return;
    }
    if (!trimmed) {
      onSearch('');
      onNavigate('search');
      setShowRecentDropdown(false);
      return;
    }
    if (!recentSearches.includes(trimmed)) {
      const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase()).slice(0, 8)];
      setRecentSearches(updated);
      localStorage.setItem('alike_recent_searches', JSON.stringify(updated));
    }
    setShowRecentDropdown(false);
    onSearch(trimmed);
    onNavigate('search');
  };

  const handleSuggestionClick = (query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === 'noyondey176@gmail.com' || trimmed === 'superadmin') {
      setShowRecentDropdown(false);
      setSearchQuery('');
      onNavigate('superadmin_login');
      return;
    }
    if (trimmed === 'admin' || trimmed === 'staff' || trimmed === 'admin234@gmail.com' || trimmed === 'ops') {
      setShowRecentDropdown(false);
      setSearchQuery('');
      onNavigate('staffadmin_login');
      return;
    }
    setSearchQuery(query);
    setShowRecentDropdown(false);
    onSearch(query);
    onNavigate('search');
  };

  const handleRemoveRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== term);
    setRecentSearches(updated);
    localStorage.setItem('alike_recent_searches', JSON.stringify(updated));
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('alike_recent_searches');
    setShowRecentDropdown(false);
  };

  // Autocomplete Suggestions logic
  const filteredSuggestions = searchQuery.trim() === ''
    ? []
    : PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const [headerNotifications, setHeaderNotifications] = useState([
    { id: 'n1', title: 'Luxury Dispatch Confirmed', desc: 'Your Aurelia Gold Watch is dispatched via high-efficiency segment 200.', time: '10 mins ago', unread: true, targetView: 'orders' },
    { id: 'n2', title: 'Atelier Coupon Unlocked', desc: 'Use premium code ALIKE10 to avail 10% loyalty discount on your cart.', time: '2 hours ago', unread: true, targetView: 'profile' },
    { id: 'n3', title: 'Secure Wallet Credit Active', desc: '₹15,000 complimentary segmented reserve is ready to checkout items.', time: '1 day ago', unread: false, targetView: 'profile' }
  ]);

  const activeUnreadCount = headerNotifications.filter(n => n.unread).length;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b border-solid transition-all duration-300 ease-in-out ${
      isScrolled
        ? isLightMode
          ? 'shadow-md shadow-neutral-900/5 border-neutral-200'
          : 'shadow-lg shadow-black/80 border-neutral-800'
        : 'shadow-none border-transparent'
    } ${
      isLightMode
        ? 'bg-white/95 text-black border-neutral-200'
        : 'bg-black/95 text-white border-neutral-800'
    }`}>
      {/* Top Header (~80px height standard, shrinks on scroll) */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ease-in-out ${
        isScrolled ? 'py-1.5 md:py-2' : 'py-2.5 sm:py-3'
      }`}>
        {/* Official ALIKE ND Brand Logo */}
        <div
          id="alike-logo-container"
          onClick={() => onNavigate('home')}
          className="cursor-pointer group select-none shrink-0 flex items-center"
        >
          <Logo size={isScrolled ? "sm" : "md"} isLightMode={isLightMode} />
        </div>

        {/* Search Bar: Clean, Unified, Minimal Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl min-w-[200px] mx-2 lg:mx-4 relative" ref={searchRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative group"
            id="header-search-form"
          >
            {/* Left Search Icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-colors">
              <Search className={`transition-all duration-300 text-neutral-400 group-hover:text-[#F5A623] ${
                isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
              }`} />
            </div>

            {/* Main Input Field */}
            <input
              id="search-input-header"
              type="text"
              placeholder="Search luxury products, brands, deals..."
              value={searchQuery}
              onFocus={() => {
                setShowRecentDropdown(true);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowRecentDropdown(true);
              }}
              className={`w-full font-sans tracking-wide transition-all duration-300 ease-in-out border border-solid outline-none ${
                isScrolled
                  ? 'py-1.5 pl-9 pr-24 rounded-full text-xs'
                  : 'py-2.5 pl-10 pr-28 rounded-full text-xs'
              } ${
                isLightMode
                  ? 'bg-neutral-100/90 text-black border-neutral-300 focus:border-[#F5A623] focus:bg-white focus:ring-2 focus:ring-[#F5A623]/20 shadow-xs placeholder-neutral-500'
                  : 'bg-neutral-900/90 text-white border-neutral-750 focus:border-[#F5A623] focus:bg-neutral-850 focus:ring-2 focus:ring-[#F5A623]/20 shadow-inner placeholder-neutral-400'
              }`}
            />
            
            {/* Right Controls: Clear button + Keyboard shortcut + Search Action Button */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Keyboard shortcut hint */}
              <div className="pointer-events-none hidden xl:flex items-center">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isLightMode
                    ? 'bg-neutral-200 border-neutral-300 text-neutral-600'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  ⌘K
                </span>
              </div>

              {/* Styled #0d0d0d Search Action Pill */}
              <button
                id="search-submit-btn-header"
                type="submit"
                className={`flex items-center justify-center gap-1 px-3.5 py-1 bg-[#0d0d0d] hover:bg-black text-white font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-[#0d0d0d] ${
                  isScrolled ? 'h-6.5 text-[10px] px-2.5' : 'h-7.5'
                }`}
                title="Execute Search"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Clean Recent Searches Dropdown Panel */}
          {showRecentDropdown && recentSearches.length > 0 && (
            <div
              className={`absolute left-0 right-0 top-full mt-2 rounded-xl border border-solid shadow-xl z-50 overflow-hidden text-xs animate-fade-in ${
                isLightMode
                  ? 'bg-white border-neutral-200 shadow-lg text-neutral-800'
                  : 'bg-[#0b1226] border-neutral-750 shadow-2xl text-white'
              }`}
            >
              <div className="p-3">
                {/* Header with Title and Clear All */}
                <div className="flex items-center justify-between px-1.5 pb-2 mb-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-[10px] text-neutral-400 hover:text-red-500 font-semibold underline cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* List of Recent Search Items */}
                <div className="space-y-1 mt-1">
                  {recentSearches.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                        isLightMode
                          ? 'hover:bg-neutral-100 text-neutral-700 hover:text-black'
                          : 'hover:bg-neutral-800/80 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#F5A623] shrink-0 transition-colors" />
                        <span className="font-medium text-xs truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecentSearch(item, e)}
                        className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        title={`Delete "${item}" from search history`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Icons & Auth Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          {/* Desktop Only Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Notifications with interactive Dropdown panel */}
            <div className="relative" ref={notificationRef}>
              <button
                id="nav-notifications-btn"
                onClick={() => {
                  const nextState = !notificationsDropdownOpen;
                  setNotificationsDropdownOpen(nextState);
                  if (nextState) {
                    onClearUnreadNotifications?.();
                  }
                }}
                className={`rounded-full relative border border-solid border-transparent transition-all duration-300 ease-in-out active:scale-95 ${
                  isScrolled ? 'p-2' : 'p-2.5'
                } ${
                  isLightMode 
                    ? 'text-neutral-700 hover:text-black hover:bg-neutral-100' 
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                } ${
                  notificationsDropdownOpen 
                    ? isLightMode 
                      ? 'text-black bg-neutral-100 border-neutral-300' 
                      : 'text-white bg-neutral-900 border-neutral-700' 
                    : ''
                }`}
                title="Notifications Panel"
              >
                <Bell className={`transition-all duration-300 ${isScrolled ? 'w-4.5 h-4.5' : 'w-[22px] h-[22px]'}`} />
                <span className="absolute -top-0.5 -right-0.5 text-white font-extrabold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black border border-white/40 shadow-sm">
                  {activeUnreadCount}
                </span>
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-80 border border-solid rounded-2xl shadow-2xl z-50 overflow-hidden text-xs py-1 animate-fade-in divide-y ${
                  isLightMode
                    ? 'bg-white border-neutral-200 divide-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-neutral-800'
                    : 'bg-neutral-950 border-neutral-800 divide-neutral-900 text-white shadow-2xl'
                }`}>
                  <div className={`px-4 py-2.5 flex justify-between items-center ${isLightMode ? 'bg-neutral-50' : 'bg-neutral-900'}`}>
                    <span className="font-extrabold uppercase text-[10px] tracking-wider text-neutral-400 font-mono">My Notifications</span>
                    <div className="flex items-center gap-2">
                      {headerNotifications.some(n => n.unread) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeaderNotifications(headerNotifications.map(n => ({ ...n, unread: false })));
                            onClearUnreadNotifications?.();
                          }}
                          className="text-[9px] font-bold text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${isLightMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        {activeUnreadCount} New
                      </span>
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto divide-y divide-neutral-800/20">
                    {headerNotifications.map((notif, idx) => (
                      <div
                        key={`header-notif-${notif.id || 'notif'}-${idx}`}
                        onClick={() => {
                          setHeaderNotifications(headerNotifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                          onNavigate(notif.targetView);
                          setNotificationsDropdownOpen(false);
                        }}
                        className={`p-3.5 transition-colors cursor-pointer space-y-1 ${
                          isLightMode
                            ? notif.unread ? 'bg-neutral-100/80 hover:bg-neutral-200/70' : 'hover:bg-neutral-50'
                            : notif.unread ? 'bg-neutral-900 hover:bg-neutral-800' : 'hover:bg-neutral-900/60'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`font-bold transition-all ${
                            isLightMode 
                              ? notif.unread ? 'text-black font-extrabold' : 'text-neutral-600'
                              : notif.unread ? 'text-white font-extrabold' : 'text-neutral-400'
                          }`}>
                            {notif.title}
                            {notif.unread && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-neutral-400"></span>}
                          </p>
                          <span className="text-[8px] text-neutral-400 shrink-0 font-mono mt-0.5">{notif.time}</span>
                        </div>
                        <p className="text-neutral-400 text-[10px] leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`p-2.5 text-center ${isLightMode ? 'bg-neutral-50' : 'bg-neutral-900'}`}>
                    <button
                      onClick={() => {
                        onNavigate('notifications');
                        setNotificationsDropdownOpen(false);
                      }}
                      className="w-full py-1 text-xs font-black hover:underline tracking-wide cursor-pointer"
                    >
                      Enter Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={() => onNavigate('wishlist')}
              className={`rounded-full relative border border-solid border-transparent transition-all duration-300 ease-in-out active:scale-95 ${
                isScrolled ? 'p-2' : 'p-2.5'
              } ${
                isLightMode 
                  ? 'text-neutral-700 hover:text-black hover:bg-neutral-100' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              } ${
                currentView === 'wishlist' ? (isLightMode ? 'text-black bg-neutral-100 border-neutral-300' : 'text-white bg-neutral-900 border-neutral-700') : ''
              }`}
              title="Wishlist"
            >
              <Heart className={`transition-all duration-300 ${isScrolled ? 'w-4.5 h-4.5' : 'w-[22px] h-[22px]'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-white font-extrabold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black border border-white/40 shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="nav-cart-btn"
              onClick={() => onNavigate('cart')}
              className={`rounded-full relative border border-solid border-transparent transition-all duration-300 ease-in-out active:scale-95 ${
                isScrolled ? 'p-2' : 'p-2.5'
              } ${
                isLightMode 
                  ? 'text-neutral-700 hover:text-black hover:bg-neutral-100' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              } ${
                currentView === 'cart' ? (isLightMode ? 'text-black bg-neutral-100 border-neutral-300' : 'text-white bg-neutral-900 border-neutral-700') : ''
              }`}
              title="Cart"
            >
              <ShoppingCart className={`transition-all duration-300 ${isScrolled ? 'w-4.5 h-4.5' : 'w-[22px] h-[22px]'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-white font-extrabold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black border border-white/40 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-menu-dropdown-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 rounded-full border border-solid transition-all duration-300 ease-in-out uppercase tracking-wider font-extrabold ${
                    isScrolled ? 'px-3 py-1 text-[11px]' : 'px-4 py-2 text-xs'
                  } ${
                    isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-black shadow-xs'
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                  title="Account Settings"
                >
                  <UserIcon className={`transition-all duration-300 ${isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name || 'VIKRAM M...'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Box */}
                {userDropdownOpen && (
                  <div
                    id="user-menu-dropdown"
                    className={`absolute right-0 mt-2 w-52 border border-solid rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-fade-in ${
                      isLightMode
                        ? 'bg-white border-neutral-200 text-neutral-800 shadow-xl'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-200 shadow-2xl'
                    }`}
                  >
                    <div className={`px-4 py-2.5 border-b border-solid ${
                      isLightMode
                        ? 'border-neutral-100 bg-neutral-50'
                        : 'border-neutral-800 bg-neutral-950'
                    }`}>
                      <p className="text-xs text-neutral-500">Logged in client</p>
                      <p className={`text-sm font-bold truncate ${isLightMode ? 'text-black' : 'text-white'}`}>{user.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <button
                      id="menu-btn-profile"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      My Profile
                    </button>
                    <button
                      id="menu-btn-orders"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Order History
                    </button>
                    <button
                      id="menu-btn-wallet"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Alike Wallet
                    </button>
                    {/* Seller Option - CONDITIONAL: ONLY one option rendered based on approved seller status */}
                    {isApprovedSeller ? (
                      <button
                        id="menu-btn-seller-dash"
                        type="button"
                        onClick={() => {
                          onNavigate('seller_dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                          isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 text-amber-500" />
                        <span>Seller Dashboard</span>
                      </button>
                    ) : (
                      <button
                        id="menu-btn-seller-reg"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          onNavigate('seller_register');
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                          isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 text-amber-500" />
                        <span>Become a Seller</span>
                      </button>
                    )}
                    <div className={`border-t border-solid my-1 ${isLightMode ? 'border-neutral-100' : 'border-neutral-800'}`}></div>
                    <button
                      id="menu-btn-logout"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50/50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                type="button"
                onClick={() => onOpenAuthModal('password')}
                className={`px-4 py-1.5 uppercase font-extrabold text-[11px] tracking-wider rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                  isLightMode
                    ? 'bg-black text-white hover:bg-neutral-800'
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Only Header Actions */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Cart (Mobile) */}
            <button
              id="mobile-nav-cart-btn"
              onClick={() => {
                onNavigate('cart');
                setMobileMenuOpen(false);
              }}
              className={`w-8.5 h-8.5 rounded-full relative transition-all duration-200 border border-solid active:scale-90 flex items-center justify-center cursor-pointer shadow-xs ${
                isLightMode 
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
              } ${
                currentView === 'cart' 
                  ? isLightMode 
                    ? 'ring-2 ring-black font-bold'
                    : 'ring-2 ring-white font-bold' 
                  : ''
              }`}
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white dark:text-black font-mono font-bold text-[8.5px] w-4 h-4 rounded-full flex items-center justify-center bg-black dark:bg-white border border-white/60 dark:border-black/60 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Toggle */}
            <button
              id="mobile-nav-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-8.5 h-8.5 rounded-full transition-all duration-200 border border-solid active:scale-90 flex items-center justify-center cursor-pointer shadow-xs ${
                isLightMode 
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
              }`}
              title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar (Always visible on mobile below top header bar) */}
      <div className={`md:hidden px-4 transition-all duration-300 ease-in-out ${
        isScrolled ? 'pb-1.5 pt-0' : 'pb-2.5 pt-0.5'
      }`}>
        <form
          onSubmit={(e) => {
            handleSearchSubmit(e);
          }}
          className="relative w-full group"
          id="mobile-header-search-form"
        >
          {/* Left Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#F5A623] transition-colors" />
          </div>

          <input
            id="mobile-header-search-input"
            type="text"
            placeholder="Search products, brands, deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full font-sans transition-all duration-300 ease-in-out border border-solid outline-none ${
              isScrolled
                ? 'py-1.5 pl-8 pr-16 rounded-full text-[11px]'
                : 'py-2 pl-8.5 pr-18 rounded-full text-xs'
            } ${
              isLightMode
                ? 'bg-neutral-100/95 text-black border-neutral-300 focus:border-[#F5A623] placeholder-neutral-500 shadow-xs'
                : 'bg-neutral-900/95 text-white border-neutral-750 focus:border-[#F5A623] placeholder-neutral-400 shadow-inner'
            }`}
          />
          <button
            id="mobile-header-search-submit"
            type="submit"
            className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center px-2.5 bg-[#0d0d0d] hover:bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer shadow-xs active:scale-95 border border-[#0d0d0d] ${
              isScrolled ? 'h-6' : 'h-6.5'
            }`}
            title="Search"
          >
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Mobile Drawer Slide-out/Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t border-solid py-5 px-5 animate-slide-down shadow-2xl relative z-55 max-h-[85vh] overflow-y-auto space-y-6 ${
          isLightMode
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl'
            : 'bg-black border-neutral-800 text-white shadow-2xl'
        }`}>
          
          {/* Mobile Search Input */}
          <div className="relative">
            <form
              onSubmit={(e) => {
                setMobileMenuOpen(false);
                handleSearchSubmit(e);
              }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search luxury products, boutiques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2.5 pr-10 border border-solid rounded-xl text-xs outline-none ${
                  isLightMode
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-[#F5A623]'
                    : 'bg-neutral-900 text-white border-neutral-800 focus:border-[#F5A623]'
                }`}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-[#F5A623] cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Direct Navigation Links */}
          <div className="flex flex-col gap-2">
            <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold border-b pb-1.5 ${isLightMode ? 'text-neutral-500 border-neutral-200' : 'text-neutral-400 border-neutral-800'}`}>Directives</h4>
            
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                currentView === 'home' 
                  ? isLightMode ? 'bg-black text-white font-extrabold' : 'bg-white text-black font-extrabold' 
                  : isLightMode 
                    ? 'hover:bg-neutral-100 text-neutral-800' 
                    : 'hover:bg-neutral-900 text-neutral-300'
              }`}
            >
              <span>Home Screen</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('category_search', 'luxury'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-solid transition-all ${
                currentView === 'category_search' && selectedCategory === 'luxury' 
                  ? isLightMode ? 'bg-black text-white border-black' : 'bg-white text-black border-white' 
                  : isLightMode
                    ? 'text-neutral-900 hover:bg-neutral-100 border-neutral-200'
                    : 'text-white hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <span>✨ Luxury Edition</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('category_search', 'delivery'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isLightMode
                  ? 'text-neutral-800 hover:bg-neutral-100'
                  : 'text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span>⚡ Fast Delivery</span>
            </button>
          </div>

          {/* Account and Dashboard Links */}
          <div className="flex flex-col gap-2 pt-2">
            <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold border-b pb-1.5 ${isLightMode ? 'text-neutral-500 border-neutral-200' : 'text-neutral-400 border-neutral-800'}`}>Account & Controls</h4>
            {user ? (
              <div className="space-y-1">
                <div className={`px-3 py-2 rounded-xl mb-2 ${isLightMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}>
                  <p className="text-[10px] font-medium text-neutral-500">Logged in client</p>
                  <p className={`text-xs font-black truncate ${isLightMode ? 'text-black' : 'text-white'}`}>{user.name}</p>
                </div>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Alike Wallet</span>
                </button>

                {/* Mobile Seller Option - CONDITIONAL */}
                {isApprovedSeller ? (
                  <button
                    id="mobile-menu-seller-dash"
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('seller_dashboard'); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Seller Dashboard</span>
                  </button>
                ) : (
                  <button
                    id="mobile-menu-seller-reg"
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('seller_register'); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Become a Seller</span>
                  </button>
                )}

                <div className={`border-t border-solid my-2 pt-2 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}></div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 text-red-500 hover:bg-red-50/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  id="mobile-become-seller-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    onNavigate('seller_register');
                  }}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    isLightMode
                      ? 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                      : 'border-amber-500/30 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>Become a Seller</span>
                </button>
                <button
                  id="mobile-login-btn"
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal('password'); }}
                  className={`w-full py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl text-center shadow-md cursor-pointer ${
                    isLightMode
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
