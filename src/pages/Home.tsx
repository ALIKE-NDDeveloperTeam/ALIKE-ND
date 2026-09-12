import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  ShoppingBag,
  Gamepad2,
  Wrench,
  Sparkles,
  Armchair,
  Diamond,
  PackageOpen,
  LayoutGrid,
  Crown,
  Boxes,
  ShoppingBasket,
  Sofa,
  Briefcase,
  ChevronRight,
  Star,
  Quote,
  Check,
  Download,
  Tag
} from 'lucide-react';
import { Product, Job, Testimonial, Banner } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  jobs: Job[];
  testimonials: Testimonial[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onNavigate: (view: string, filter?: string) => void;
  wishlistedIds: number[];
  onCompare: (p: Product) => void;
  onQuickView: (p: Product) => void;
  isLightMode?: boolean;
}

// Fallback modern WebP banner assets in case network is pending
const DEFAULT_HERO_BANNERS: Banner[] = [
  {
    _id: "default-1",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Luxury Atelier Collection",
    subtitle: "NEW ARRIVALS",
    description: "Curated premium fashion, accessories, and bespoke luxury goods.",
    buttonText: "Shop Collection",
    link: "category_search",
    order: 1,
    active: true,
  },
  {
    _id: "default-2",
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Global Express Logistics",
    subtitle: "20-MINUTE COURIER",
    description: "Worldwide white-glove logistics directly to your doorstep.",
    buttonText: "Explore Now",
    link: "category_search",
    order: 2,
    active: true,
  },
  {
    _id: "default-3",
    imageUrl: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "B2B Wholesale Procurement",
    subtitle: "DIRECT FROM SOURCE",
    description: "Bulk pricing advantages with escrow payment protection.",
    buttonText: "Join Wholesale",
    link: "category_search",
    order: 3,
    active: true,
  },
  {
    _id: "default-4",
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Haute Couture Lookbook",
    subtitle: "EXCLUSIVE ACCESS",
    description: "Discover signature collections designed by celebrated master couturiers.",
    buttonText: "View Lookbook",
    link: "category_search",
    order: 4,
    active: true,
  },
];

export default function Home({
  products,
  jobs,
  testimonials,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onNavigate,
  wishlistedIds,
  onCompare,
  onQuickView,
  isLightMode,
}: HomeProps) {
  // Dynamic Hero Banners State
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_HERO_BANNERS);

  // Fetch active banners dynamically from backend
  useEffect(() => {
    let isMounted = true;
    fetch("/api/banners")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic banners:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBanners = useMemo(() => {
    const activeList = banners.filter((b) => b.active);
    return activeList.length > 0 ? activeList : DEFAULT_HERO_BANNERS;
  }, [banners]);

  // Left Banner Image Index State
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keep index within bounds if activeBanners length changes
  useEffect(() => {
    if (leftImageIndex >= activeBanners.length) {
      setLeftImageIndex(0);
    }
  }, [activeBanners.length, leftImageIndex]);

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setLeftImageIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (diff < -40) {
      setLeftImageIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  // Flash Sale Timer State (24 hours standard initial)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  // Rotating Bottom Offer Banner State (20 Min Delivery vs Flat 50% Off)
  const [offerIndex, setOfferIndex] = useState(0);

  // VIP Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const leftInterval = setInterval(() => {
      setLeftImageIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(leftInterval);
  }, [activeBanners.length]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 24 * 60 * 60));
    }, 1000);

    const offerInterval = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % 2);
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(offerInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const timer = formatTime(timeLeft);

  // Filters for Homepage displays (5 products in a line on PC)
  const isFlash = (p: Product) => p.badge === 'SALE' || p.isFlashSale === true;
  const flashSaleList = products.filter(isFlash);
  const flashSaleProducts = (flashSaleList.length >= 5 
    ? flashSaleList 
    : [...flashSaleList, ...products.filter(p => !isFlash(p))]).slice(0, 5);

  const featuredProducts = (products.filter(p => p.category === 'luxury' || p.badge === 'HOT').length >= 5
    ? products.filter(p => p.category === 'luxury' || p.badge === 'HOT')
    : products).slice(0, 5);

  const wholesaleProducts = (products.filter(p => p.isWholesale).length >= 5
    ? products.filter(p => p.isWholesale)
    : [...products.filter(p => p.isWholesale), ...products.filter(p => !p.isWholesale)]).slice(0, 5);

  const getCategoryTheme = (catId: string) => {
    return {
      bg: 'bg-[#FDF3E1]',
      text: catId === 'delivery' ? 'text-[#F5A623]' : 'text-[#0F1A3C]',
      hoverBg: 'group-hover:bg-[#F5A623]',
      hoverText: 'group-hover:text-[#0F1A3C]'
    };
  };

  const getCategoryIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Crown': return <Crown className={className} />;
      case 'Boxes': return <Boxes className={className} />;
      case 'Tv': return <Tv className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'Shirt': return <Shirt className={className} />;
      case 'Gem': return <Gem className={className} />;
      case 'ShoppingBasket': return <ShoppingBasket className={className} />;
      case 'Gamepad2': return <Gamepad2 className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Sofa': return <Sofa className={className} />;
      case 'Zap': return <Zap className={className} />;
      default: return <LayoutGrid className={className} />;
    }
  };

  // Bespoke category styling, soft gradient accents and badges
  const CATEGORY_ACCENTS: Record<string, {
    bgGradient: string;
    iconColor: string;
    hoverBorder: string;
    badge?: { text: string; bg: string };
  }> = {
    luxury: {
      bgGradient: 'from-amber-500/20 via-yellow-500/15 to-amber-600/10 dark:from-amber-500/25 dark:via-yellow-500/20 dark:to-amber-600/15',
      iconColor: 'text-amber-600 dark:text-amber-400',
      hoverBorder: 'hover:border-amber-400/80 hover:shadow-amber-500/20',
      badge: { text: 'VIP', bg: 'bg-gradient-to-r from-[#D4AF37] to-amber-600 text-neutral-950 font-black' },
    },
    wholesale: {
      bgGradient: 'from-blue-500/20 via-indigo-500/15 to-cyan-500/10 dark:from-blue-500/25 dark:via-indigo-500/20 dark:to-cyan-600/15',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverBorder: 'hover:border-blue-400/80 hover:shadow-blue-500/20',
    },
    electronics: {
      bgGradient: 'from-cyan-500/20 via-sky-500/15 to-teal-500/10 dark:from-cyan-500/25 dark:via-sky-500/20 dark:to-teal-600/15',
      iconColor: 'text-cyan-600 dark:text-[#1FB6C0]',
      hoverBorder: 'hover:border-cyan-400/80 hover:shadow-cyan-500/20',
    },
    mobiles: {
      bgGradient: 'from-pink-500/20 via-rose-500/15 to-red-500/10 dark:from-pink-500/25 dark:via-rose-500/20 dark:to-red-600/15',
      iconColor: 'text-rose-600 dark:text-[#FF1878]',
      hoverBorder: 'hover:border-rose-400/80 hover:shadow-rose-500/20',
      badge: { text: 'HOT', bg: 'bg-gradient-to-r from-[#FF1878] to-red-600 text-white font-black' },
    },
    laptops: {
      bgGradient: 'from-purple-500/20 via-violet-500/15 to-indigo-500/10 dark:from-purple-500/25 dark:via-violet-500/20 dark:to-indigo-600/15',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hoverBorder: 'hover:border-purple-400/80 hover:shadow-purple-500/20',
    },
    fashion: {
      bgGradient: 'from-fuchsia-500/20 via-pink-500/15 to-rose-500/10 dark:from-fuchsia-500/25 dark:via-pink-500/20 dark:to-rose-600/15',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      hoverBorder: 'hover:border-fuchsia-400/80 hover:shadow-fuchsia-500/20',
    },
    jewellery: {
      bgGradient: 'from-yellow-500/25 via-amber-400/20 to-amber-600/15 dark:from-yellow-500/30 dark:via-amber-400/25 dark:to-amber-500/20',
      iconColor: 'text-amber-500 dark:text-amber-300',
      hoverBorder: 'hover:border-amber-400/80 hover:shadow-amber-400/20',
    },
    grocery: {
      bgGradient: 'from-emerald-500/20 via-green-500/15 to-teal-500/10 dark:from-emerald-500/25 dark:via-green-500/20 dark:to-teal-600/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-400/80 hover:shadow-emerald-500/20',
    },
    gaming: {
      bgGradient: 'from-orange-500/20 via-amber-500/15 to-red-500/10 dark:from-orange-500/25 dark:via-amber-500/20 dark:to-red-600/15',
      iconColor: 'text-orange-500 dark:text-orange-400',
      hoverBorder: 'hover:border-orange-400/80 hover:shadow-orange-500/20',
      badge: { text: 'NEW', bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black' },
    },
  };

  // Rotating Bottom Promo Offers Strip
  const PROMO_OFFERS = [
    {
      id: 'delivery',
      target: 'delivery',
      tag: 'SPEED DISPATCH',
      title: '20 Min Speed Delivery',
      subtitle: 'Express luxury couriers direct to door',
      icon: Zap,
      gradient: 'from-[#FF1878] via-[#E60060] to-[#C7004C]',
      textColor: 'text-white',
      tagBg: 'bg-white/20 text-white',
    },
    {
      id: 'discount',
      target: 'luxury',
      tag: 'TODAY ONLY',
      title: 'Flat 50% Off Flash Deal',
      subtitle: 'Code: LUXURY50 • VIP Curated Selection',
      icon: Sparkles,
      gradient: 'from-[#D4AF37] via-[#E2C044] to-[#B89020]',
      textColor: 'text-neutral-950',
      tagBg: 'bg-black/15 text-neutral-950 font-black',
    }
  ];

  return (
    <div id="homepage-root" className="space-y-12 pb-16">
      {/* 1. Responsive Dual Banner Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 select-none pt-2">
        
        {/* LEFT HERO BANNER: large main banner */}
        <div 
          id="main-left-hero-banner" 
          className={`w-full lg:col-span-3 rounded-2xl overflow-hidden relative shadow-lg sm:shadow-xl border border-solid transition-all duration-300 aspect-[16/9] sm:aspect-[2/1] md:aspect-[21/9] lg:aspect-auto lg:h-[350px] lg:min-h-[350px] lg:max-h-[350px] cursor-pointer group ${
            isLightMode 
              ? 'border-[#B9E9EC] bg-neutral-100 shadow-[0_10px_35px_rgba(31,182,192,0.12)]' 
              : 'border-[#224466]/40 bg-neutral-900 shadow-[0_10px_35px_rgba(0,0,0,0.4)]'
          }`}
          onClick={() => onNavigate(activeBanners[leftImageIndex]?.link || 'category_search')}
          onTouchStart={handleBannerTouchStart}
          onTouchEnd={handleBannerTouchEnd}
        >
          {/* Slides Container */}
          <div className="absolute inset-0 w-full h-full">
            {activeBanners.map((banner, idx) => (
              <div
                key={banner._id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  idx === leftImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title || `Hero Banner ${idx + 1}`} 
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width="1200"
                  height="350"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                />
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLeftImageIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
            }}
            className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 border border-white/20 active:scale-95 shadow-lg cursor-pointer"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLeftImageIndex((prev) => (prev + 1) % activeBanners.length);
            }}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 border border-white/20 active:scale-95 shadow-lg cursor-pointer"
            aria-label="Next slide"
          >
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Bullet Indicators (Dots) */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLeftImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === leftImageIndex 
                    ? 'bg-[#1FB6C0] scale-110 w-3.5 sm:w-4' 
                    : 'bg-white/55 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Small Floating Active Slide Count */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 backdrop-blur-md bg-black/50 text-[#1FB6C0] border border-[#1FB6C0]/35 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[8.5px] font-mono rounded tracking-widest font-bold">
            {leftImageIndex + 1} / {activeBanners.length}
          </div>
        </div>

        {/* RIGHT SIDE: Categories Quick Navigation Hub */}
        <motion.div 
          id="right-categories-hub" 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full lg:col-span-1 border border-solid shadow-lg sm:shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden rounded-2xl p-3 sm:p-3.5 lg:h-[350px] lg:min-h-[350px] lg:max-h-[350px] ${
            isLightMode 
              ? 'border-neutral-200/90 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.06)]' 
              : 'border-neutral-800/90 bg-neutral-900/95 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Header with Title & Live Offers indicator & View All Link */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-[#FF1878]/20 to-[#FF1878]/5 text-[#FF1878] flex items-center justify-center ring-1 ring-[#FF1878]/30">
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-black tracking-tight ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                  Categories
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF1878]/10 text-[#FF1878]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1878] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF1878]"></span>
                  </span>
                  Picks
                </span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('category_search', 'all')}
              className="text-[11px] font-bold text-[#FF1878] hover:text-[#E60060] flex items-center gap-0.5 transition-colors cursor-pointer group"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Grid of Top Categories with Soft Gradient Icons, Hover Spring, and Badges */}
          <div className="grid grid-cols-3 gap-2 my-auto py-1.5 sm:py-1">
            {CATEGORIES.filter(c => c.id !== 'all').slice(0, 9).map((cat) => {
              const label = cat.id === 'wholesale' ? 'Wholesale' : cat.label.replace(' 🔥', '');
              const accent = CATEGORY_ACCENTS[cat.id] || {
                bgGradient: 'from-neutral-500/15 to-neutral-600/10',
                iconColor: 'text-[#FF1878]',
                hoverBorder: 'hover:border-[#FF1878]/60 hover:shadow-pink-500/15',
              };

              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  onClick={() => onNavigate('category_search', cat.id)}
                  className={`group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all duration-200 text-center cursor-pointer shadow-xs ${
                    isLightMode 
                      ? `bg-neutral-50/70 hover:bg-white border-neutral-200/70 ${accent.hoverBorder} text-neutral-800` 
                      : `bg-neutral-800/40 hover:bg-neutral-800/80 border-neutral-700/50 ${accent.hoverBorder} text-neutral-200`
                  }`}
                >
                  {/* Floating Trending / VIP Badge */}
                  {accent.badge && (
                    <span className={`absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1 px-1.5 py-0.2 rounded-full text-[7.5px] sm:text-[8px] font-black tracking-wider uppercase z-20 shadow-xs ring-1 ring-white/20 dark:ring-black/30 pointer-events-none ${accent.badge.bg}`}>
                      {accent.badge.text}
                    </span>
                  )}

                  {/* Soft Color Accent Icon Circle */}
                  <div className={`p-1.5 sm:p-2 rounded-xl bg-gradient-to-br ${accent.bgGradient} ${accent.iconColor} group-hover:scale-110 group-hover:-rotate-3 shadow-xs ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-200 mb-1`}>
                    {getCategoryIcon(cat.icon, "w-3.5 h-3.5 sm:w-4 sm:h-4")}
                  </div>

                  <span className={`text-[10px] sm:text-[10.5px] font-bold truncate max-w-full leading-tight transition-colors ${
                    isLightMode ? 'text-neutral-800 group-hover:text-neutral-950' : 'text-neutral-200 group-hover:text-white'
                  }`}>
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Eye-Catching Rotating Offer Banner Strip */}
          <div className="relative w-full shrink-0 mt-1">
            <AnimatePresence mode="wait">
              <motion.button
                key={offerIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                onClick={() => onNavigate('category_search', PROMO_OFFERS[offerIndex].target)}
                className={`w-full py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r ${PROMO_OFFERS[offerIndex].gradient} ${PROMO_OFFERS[offerIndex].textColor} flex items-center justify-between shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden`}
              >
                {/* Subtle animated shimmer streak */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-black/15 backdrop-blur-xs shrink-0 flex items-center justify-center">
                    {offerIndex === 0 ? (
                      <Zap className="w-3.5 h-3.5 fill-current shrink-0 animate-pulse" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-[11px] sm:text-xs font-black tracking-tight truncate">
                        {PROMO_OFFERS[offerIndex].title}
                      </span>
                      <span className={`text-[7.5px] sm:text-[8px] font-black uppercase px-1 py-0.2 rounded tracking-wider shrink-0 ${PROMO_OFFERS[offerIndex].tagBg}`}>
                        {PROMO_OFFERS[offerIndex].tag}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[9.5px] opacity-90 truncate leading-tight font-medium mt-0.5">
                      {PROMO_OFFERS[offerIndex].subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                  {/* Interactive Mini Indicator Dots */}
                  <div className="flex items-center gap-1">
                    {PROMO_OFFERS.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOfferIndex(dotIdx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          dotIdx === offerIndex ? 'w-3 bg-current' : 'w-1.5 bg-current/40 hover:bg-current/70'
                        }`}
                      />
                    ))}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>

      </section>

      {/* 2. Top Banner Features (2 Service Cards) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div
          onClick={() => onNavigate('category_search', 'delivery')}
          className={`cursor-pointer group flex items-start gap-4 p-5 sm:p-6 backdrop-blur-md border border-solid rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] text-neutral-900'
              : 'bg-neutral-900/40 border-neutral-800 hover:border-[#D4AF37]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] text-white'
          }`}
        >
          <div className="p-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className={`font-bold text-sm sm:text-base group-hover:text-[#D4AF37] transition-all ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              20 Min Delivery
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Express Sector Logistics couriers premium essentials instantly.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('category_search', 'luxury')}
          className={`cursor-pointer group flex items-start gap-4 p-5 sm:p-6 backdrop-blur-md border border-solid rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] text-neutral-900'
              : 'bg-neutral-900/40 border-neutral-800 hover:border-[#D4AF37]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] text-white'
          }`}
        >
          <div className="p-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`font-bold text-sm sm:text-base group-hover:text-[#D4AF37] transition-all ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              Curated VIP Selection
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Exclusive luxury edition items handpicked for distinguished clients.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-end justify-between border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
              Browse <span className="text-[#F5A623]">Categories</span>
            </h3>
            <p className={`text-xs mt-1 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>Discover curated premium collections</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const theme = getCategoryTheme(cat.id);
            return (
              <div
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => onNavigate('category_search', cat.id)}
                className={`group cursor-pointer p-4 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 ${
                  isLightMode
                    ? 'bg-white border border-solid border-neutral-200 hover:border-[#F5A623] hover:shadow-[0_4px_15px_rgba(245,166,35,0.15)]'
                    : 'bg-neutral-900 border border-solid border-[#D4AF37]/10 hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                }`}
              >
                <div className={`inline-flex p-3 rounded-full mb-3 transform transition-all duration-300 group-hover:scale-110 ${theme.bg} ${theme.text} ${theme.hoverBg} ${theme.hoverText}`}>
                  {getCategoryIcon(cat.icon, "w-6 h-6")}
                </div>
                <h4 className={`text-xs font-bold truncate transition-colors duration-200 ${
                  isLightMode 
                    ? 'text-[#0F1A3C] group-hover:text-[#F5A623]' 
                    : 'text-neutral-300 group-hover:text-white'
                }`}>
                  {cat.label}
                </h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Flash Sale Section (With 24h Countdown) */}
      <section className="max-w-7xl mx-auto px-6 p-6 bg-gradient-to-br from-[#0B1330] via-[#0F1A3C] to-[#152550] border border-solid border-[#F5A623]/30 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-solid border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#F5A623]/20 text-[#F5A623]">
              <Zap className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
                Flash <span className="text-[#F5A623]">Premium Hours</span>
              </h3>
              <p className="text-xs text-neutral-300">Uncompromised pricing on luxury gear</p>
            </div>
          </div>

          {/* Golden Countdown timer */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider mr-1">Time Left:</span>
            <div className="flex gap-1.5 font-mono font-bold text-sm">
              <div className="bg-white text-[#0F1A3C] px-2.5 py-1.5 rounded font-black shadow-sm">
                {timer.hours}
              </div>
              <span className="self-center text-[#F5A623] font-black">:</span>
              <div className="bg-white text-[#0F1A3C] px-2.5 py-1.5 rounded font-black shadow-sm">
                {timer.minutes}
              </div>
              <span className="self-center text-[#F5A623] font-black">:</span>
              <div className="bg-white text-[#0F1A3C] px-2.5 py-1.5 rounded font-black shadow-sm">
                {timer.seconds}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic products in grid (5 in a row on PC) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
          {flashSaleProducts.map((p) => {
            const isWishlisted = wishlistedIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onCompare={onCompare}
                onQuickView={onQuickView}
                isWishlisted={isWishlisted}
              />
            );
          })}
        </div>
      </section>

      {/* 5. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
              ✨ Selected <span className="text-[#F5A623]">Luxury Goods</span>
            </h3>
            <p className={`text-xs mt-1 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>Our crown elite catalog with masterclass platinum grades</p>
          </div>
          <button
            id="view-all-featured"
            onClick={() => onNavigate('category_search', 'luxury')}
            className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-300 hover:translate-x-1.5 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Luxury <ChevronRight className="w-4 h-4 text-[#F5A623]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
          {featuredProducts.map((p) => {
            const isWishlisted = wishlistedIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onCompare={onCompare}
                onQuickView={onQuickView}
                isWishlisted={isWishlisted}
              />
            );
          })}
        </div>
      </section>

      {/* 6. Wholesale Deals Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
              📦 Wholesale <span className="text-[#F5A623]">Bulk Catalog</span>
            </h3>
            <p className={`text-xs mt-1 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>High volume bulk purchasing straight from atelier factories</p>
          </div>
          <button
            id="view-all-wholesale"
            onClick={() => onNavigate('category_search', 'wholesale')}
            className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-300 hover:translate-x-1.5 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Wholesale <ChevronRight className="w-4 h-4 text-[#F5A623]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
          {wholesaleProducts.map((p) => {
            const isWishlisted = wishlistedIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onCompare={onCompare}
                onQuickView={onQuickView}
                isWishlisted={isWishlisted}
              />
            );
          })}
        </div>
      </section>

      {/* 7. Alike Premium Jobs Preview */}
      <section className={`max-w-7xl mx-auto px-6 p-6 md:p-8 rounded-2xl border border-solid ${
        isLightMode ? 'bg-white border-neutral-200 shadow-md' : 'bg-neutral-950 border-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
          <div>
            <h3 className={`text-xl md:text-2xl font-black flex items-center gap-2 ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
              <Briefcase className="w-5.5 h-5.5 text-[#F5A623]" /> Careers @ <span className="text-[#F5A623]">Alike-ND Group</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>
              Join one of India's fastest scaling hyper-local luxury delivery channels
            </p>
          </div>
          <button
            id="view-all-jobs"
            onClick={() => onNavigate('jobs')}
            className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline font-bold uppercase tracking-wider flex items-center gap-1 transition-all duration-300 hover:translate-x-1 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Go to Careers Center <ChevronRight className="w-4 h-4 text-[#F5A623]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.slice(0, 2).map((job) => (
            <div
              key={job.id}
              onClick={() => onNavigate('jobs')}
              className={`group cursor-pointer p-5 rounded-xl flex items-start gap-4 transition-all duration-300 border border-solid ${
                isLightMode
                  ? 'bg-white border-neutral-200 hover:border-[#F5A623] hover:shadow-md'
                  : 'bg-neutral-900 border-neutral-800 hover:border-[#F5A623]'
              }`}
            >
              <img
                src={job.logo}
                alt={job.company}
                loading="lazy"
                decoding="async"
                width="48"
                height="48"
                className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-950 border border-solid border-neutral-200 dark:border-neutral-800 shrink-0"
              />
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[9px] uppercase tracking-wider text-[#0F1A3C] dark:text-neutral-300 rounded-full font-bold">
                  {job.type}
                </span>
                <h4 className={`text-sm font-bold transition-colors ${
                  isLightMode ? 'text-[#0F1A3C] group-hover:text-[#F5A623]' : 'text-white group-hover:text-[#F5A623]'
                }`}>
                  {job.title}
                </h4>
                <p className={`text-xs font-semibold ${isLightMode ? 'text-[#4B5563]' : 'text-neutral-400'}`}>{job.company}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-[#6B7280] font-mono pt-1">
                  <span>📍 {job.location}</span>
                  <span>|</span>
                  <span className="text-[#F5A623] font-bold">💰 {job.salary}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Client Testimonials */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="text-center border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4">
          <span className="text-[10px] uppercase tracking-widest font-mono font-extrabold text-[#F5A623]">Atelier Endorsements</span>
          <h3 className={`text-2xl md:text-3xl font-extrabold mt-1 tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
            What Our <span className="text-[#F5A623]">Luxury Clients</span> Experience
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className={`relative p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 border border-solid ${
                isLightMode
                  ? 'bg-white border-neutral-200 shadow-sm hover:border-[#F5A623]'
                  : 'bg-neutral-900/40 backdrop-blur-md border-neutral-800 hover:border-[#F5A623]/70'
              }`}
            >
              <span className="absolute top-5 right-5 text-neutral-300 dark:text-neutral-850">
                <Quote className="w-8 h-8 rotate-180" />
              </span>
              <div className="space-y-3">
                <div className="flex gap-0.5 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className={`text-xs italic leading-relaxed ${isLightMode ? 'text-[#374151]' : 'text-neutral-300'}`}>
                  "{test.content}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-solid border-neutral-200 dark:border-neutral-800">
                <img
                  src={test.avatar}
                  alt={test.name}
                  loading="lazy"
                  decoding="async"
                  width="36"
                  height="36"
                  className="w-9 h-9 rounded-full object-cover border border-solid border-[#F5A623]"
                />
                <div>
                  <h5 className={`text-xs font-bold ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>{test.name}</h5>
                  <p className={`text-[10px] ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-500'}`}>{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. VIP Membership Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 bg-[#0B1330] border border-solid border-[#F5A623]/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl text-white">
          <div className="space-y-1.5 z-10 text-center md:text-left">
            <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-widest block font-mono">VIP CLIENT MEMBERSHIP</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">Unlock Exclusive Voucher Codes</h3>
            <p className="text-xs text-[#D1D5DB] max-w-md">
              Sign up today and receive a flat 10% coupon valid on your next order, including limited timepiece catalogs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2.5 z-10 shrink-0">
            {newsletterSubscribed ? (
              <div className="px-6 py-3.5 bg-[#F5A623]/20 border border-solid border-[#F5A623]/50 text-[#F5A623] rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>Greetings! Welcome to the premium Alike Group VIP Club.</span>
              </div>
            ) : (
              <>
                <input
                  id="newsletter-sub-main-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 bg-white text-[#1F2937] placeholder-[#6B7280] border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#F5A623] w-full md:w-64 transition-all duration-300 font-medium"
                />
                <button
                  id="newsletter-sub-main-btn"
                  onClick={() => {
                    if (newsletterEmail.trim().includes('@')) {
                      setNewsletterSubscribed(true);
                    } else {
                      alert('Please enter a valid luxury partner email address.');
                    }
                  }}
                  className="px-6 py-3 bg-[#0d0d0d] hover:bg-black text-white border border-[#0d0d0d] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 select-none cursor-pointer shadow-md"
                  title="Join Membership Club"
                >
                  Join VIP Club
                </button>
              </>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 blur-3xl rounded-full"></div>
        </div>
      </section>
    </div>
  );
}
