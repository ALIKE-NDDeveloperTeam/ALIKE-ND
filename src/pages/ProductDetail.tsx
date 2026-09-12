import { useState, useEffect, useRef, FormEvent, ChangeEvent, TouchEvent } from 'react';
import { Star, ShieldCheck, Truck, RotateCcw, RotateCw, Heart, ShoppingBag, ShoppingCart, Plus, Minus, Check, Users, Loader2, Building2, Percent, Camera, X, ArrowLeft, Zap, Clock, Sparkles, MessageSquare, PenLine, Info, Lock, Share2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Play, QrCode, MapPin, FileText, Sliders, HelpCircle, ThumbsUp, Search, Navigation, Compass, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const POPULAR_LOCATIONS = [
  { city: 'New Delhi', pincode: '110001', state: 'Delhi' },
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra' },
  { city: 'Bengaluru', pincode: '560001', state: 'Karnataka' },
  { city: 'Kolkata', pincode: '700001', state: 'West Bengal' },
  { city: 'Chennai', pincode: '600001', state: 'Tamil Nadu' },
  { city: 'Hyderabad', pincode: '500001', state: 'Telangana' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra' },
  { city: 'Ahmedabad', pincode: '380001', state: 'Gujarat' },
  { city: 'Jaipur', pincode: '302001', state: 'Rajasthan' },
  { city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', pincode: '160017', state: 'Punjab' },
  { city: 'Surat', pincode: '395001', state: 'Gujarat' },
  { city: 'Patna', pincode: '800001', state: 'Bihar' },
  { city: 'Kochi', pincode: '682001', state: 'Kerala' },
  { city: 'Indore', pincode: '452001', state: 'Madhya Pradesh' },
  { city: 'Guwahati', pincode: '781001', state: 'Assam' }
];

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (p: Product, qty: number, color?: string, size?: string) => void;
  onAddToCartAndCheckout: (p: Product, qty: number, color?: string, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  isWishlisted: boolean;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
  onBack?: () => void;
}

export default function ProductDetail({
  product,
  allProducts,
  onAddToCart,
  onAddToCartAndCheckout,
  onToggleWishlist,
  onSelectProduct,
  isWishlisted,
  showToast,
  isLightMode = false,
  onBack,
}: ProductDetailProps) {
  const { id, name, brand, price, mrp, rating, reviewsCount, image, images = [image], description, specifications, colors = ['Standard'], sizes = ['Fits All'] } = product;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [is360Active, setIs360Active] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    let interval: any;
    if (is360Active && images.length > 1) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 600);
    }
    return () => clearInterval(interval);
  }, [is360Active, images.length]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  
  // Dynamic Dispatch & Delivery calculations
  const [timeLeft, setTimeLeft] = useState(4 * 3600 + 12 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 4 * 3600 + 12 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h} hrs ${m} mins ${s} secs`;
  };

  const getTomorrowFormattedDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc');
  const [openQuestions, setOpenQuestions] = useState<number[]>([0, 1, 2, 3]);

  const toggleQuestion = (idx: number) => {
    setOpenQuestions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAllQuestions = () => {
    if (openQuestions.length === 4) {
      setOpenQuestions([]);
    } else {
      setOpenQuestions([0, 1, 2, 3]);
    }
  };

  // Mobile touch swipe gestures for main image carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeWidth = 50;

    if (Math.abs(diffX) > minSwipeWidth) {
      if (diffX > 0) {
        // Swiped left -> next
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Delivery Destination Location State & Modal
  const [deliveryLocation, setDeliveryLocation] = useState<{
    city: string;
    pincode: string;
    state?: string;
  }>(() => {
    const saved = localStorage.getItem('alike_delivery_location');
    return saved ? JSON.parse(saved) : { city: 'New Delhi', pincode: '110001', state: 'Delhi' };
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [customPincodeInput, setCustomPincodeInput] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const getDeliveryEstimateText = (pincodeStr: string) => {
    const today = new Date();
    let minDays = 2;
    let maxDays = 4;
    if (pincodeStr.startsWith('11') || pincodeStr.startsWith('12') || pincodeStr.startsWith('20')) {
      minDays = 1;
      maxDays = 2;
    } else if (pincodeStr.startsWith('40') || pincodeStr.startsWith('56') || pincodeStr.startsWith('70') || pincodeStr.startsWith('60')) {
      minDays = 2;
      maxDays = 3;
    } else {
      minDays = 3;
      maxDays = 5;
    }
    const d1 = new Date(today);
    d1.setDate(today.getDate() + minDays);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + maxDays);

    const m1 = d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const m2 = d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Guaranteed by ${m1} - ${m2}`;
  };

  const handleSelectLocation = (loc: { city: string; pincode: string; state?: string }) => {
    setDeliveryLocation(loc);
    localStorage.setItem('alike_delivery_location', JSON.stringify(loc));
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to ${loc.city}, ${loc.pincode}`, 'success');
  };

  const handleApplyCustomPincode = (e: FormEvent) => {
    e.preventDefault();
    const pin = customPincodeInput.trim();
    if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
      showToast('Please enter a valid 6-digit Pincode (e.g. 400001)', 'warning');
      return;
    }
    const matched = POPULAR_LOCATIONS.find((l) => l.pincode === pin);
    const city = matched ? matched.city : `Region ${pin.slice(0, 2)}`;
    const state = matched ? matched.state : 'India';
    handleSelectLocation({ city, pincode: pin, state });
    setCustomPincodeInput('');
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          const autoLoc = { city: 'Bengaluru', pincode: '560001', state: 'Karnataka' };
          handleSelectLocation(autoLoc);
        },
        () => {
          setIsDetectingLocation(false);
          const autoLoc = { city: 'New Delhi', pincode: '110001', state: 'Delhi' };
          handleSelectLocation(autoLoc);
        },
        { timeout: 3500 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingLocation(false);
        handleSelectLocation({ city: 'New Delhi', pincode: '110001', state: 'Delhi' });
      }, 500);
    }
  };

  const handleCheckPincode = (e: FormEvent) => {
    e.preventDefault();
    const cleanPincode = pincode.trim();
    if (!cleanPincode || cleanPincode.length !== 6 || isNaN(Number(cleanPincode))) {
      showToast('Please enter a valid 6-digit PIN code (e.g., 110001 or 400001)', 'warning');
      return;
    }
    setCheckingPincode(true);
    setPincodeStatus(null);
    setTimeout(() => {
      setCheckingPincode(false);
      // Pincodes starting with 99 are simulated as non-deliverable
      if (!cleanPincode.startsWith('99')) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        setPincodeStatus({
          success: true,
          message: `✓ Delivery available — Expected by ${formattedDate}`
        });
        showToast(`Delivery available for PIN code ${cleanPincode}!`, 'success');
      } else {
        setPincodeStatus({
          success: false,
          message: '✗ Currently not deliverable to this pincode'
        });
        showToast(`Currently not deliverable to PIN code ${cleanPincode}.`, 'error');
      }
    }, 1000);
  };

  const showEmiPlansToast = () => {
    const monthlyEmi = Math.round(price / 12);
    const sixEmi = Math.round(price / 6);
    showToast(`EMI Options: 3 Months No-Cost EMI @ ₹${(price/3).toLocaleString('en-IN')}/mo | 6 Months @ ₹${sixEmi.toLocaleString('en-IN')}/mo | 12 Months @ ₹${monthlyEmi.toLocaleString('en-IN')}/mo`, 'info');
  };

  // Related products under same category
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    showToast(`Added ${quantity}x ${name} to your cart successfully!`, 'success');
  };

  const handleBuyNow = () => {
    onAddToCartAndCheckout(product, quantity, selectedColor, selectedSize);
  };

  // Load initial reviews from localStorage or default
  const getInitialReviews = () => {
    try {
      const saved = localStorage.getItem(`alike_reviews_prod_${product.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return [
      { 
        id: 1, 
        name: 'Kunal Sen', 
        rating: 5, 
        date: '2026-06-15', 
        comment: 'Undeniably the premier luxury purchase I have made here! Precision is incredible.',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'
        ]
      },
      { 
        id: 2, 
        name: 'Ankita Roy', 
        rating: 4, 
        date: '2026-06-10', 
        comment: 'Extremely stunning packaging and finish. Highly satisfied, came in pristine order.',
        images: []
      },
      { 
        id: 3, 
        name: 'Nikhil Mehta', 
        rating: 5, 
        date: '2026-06-02', 
        comment: 'Absolutely authentic! Hand-checked seal was intact. Customer support was incredibly swift.',
        images: []
      }
    ];
  };

  const [reviewsList, setReviewsList] = useState(getInitialReviews);

  useEffect(() => {
    setReviewsList(getInitialReviews());
  }, [product.id]);

  // Form states for custom reviews
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5); // Default to 5 stars for high user satisfaction starting point
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [helpfulMap, setHelpfulMap] = useState<Record<number, { count: number; userLiked: boolean }>>({
    1: { count: 18, userLiked: false },
    2: { count: 11, userLiked: false },
    3: { count: 7, userLiked: false },
  });

  const toggleHelpful = (reviewId: number) => {
    setHelpfulMap((prev) => {
      const curr = prev[reviewId] || { count: 4, userLiked: false };
      const nextLiked = !curr.userLiked;
      const nextCount = nextLiked ? curr.count + 1 : Math.max(0, curr.count - 1);
      if (nextLiked) {
        showToast('Marked as helpful review', 'success');
      }
      return {
        ...prev,
        [reviewId]: { count: nextCount, userLiked: nextLiked }
      };
    });
  };

  const scrollToSection = (id: 'desc' | 'reviews' | 'qa') => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections: Array<'desc' | 'reviews' | 'qa'> = ['desc', 'reviews', 'qa'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(`section-${secId}`);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(secId);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [fbtMainChecked, setFbtMainChecked] = useState(true);
  const [fbt1Checked, setFbt1Checked] = useState(true);
  const [fbt2Checked, setFbt2Checked] = useState(true);

  useEffect(() => {
    setFbtMainChecked(true);
    setFbt1Checked(true);
    setFbt2Checked(true);
    setActiveImageIndex(0);
    setSelectedColor(colors[0] || 'Standard');
    setSelectedSize(sizes[0] || 'Fits All');
    setQuantity(1);
  }, [product.id, colors, sizes]);

  const getLoggedInUserName = () => {
    try {
      const saved = localStorage.getItem('alike_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch (e) {
      // Ignore
    }
    return 'Guest User';
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map(file => URL.createObjectURL(file as Blob));
      setNewReviewImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setNewReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || newRating === 0) {
      showToast('Please write a comment and select a rating star', 'error');
      return;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const finalName = reviewerName.trim() || getLoggedInUserName() || 'Verified Customer';

    const newRev = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: finalName,
      rating: newRating,
      date: formattedDate,
      comment: newReviewText,
      images: newReviewImages
    };

    const updatedReviews = [newRev, ...reviewsList];
    setReviewsList(updatedReviews);
    try {
      localStorage.setItem(`alike_reviews_prod_${product.id}`, JSON.stringify(updatedReviews));
    } catch (err) {
      // Ignore
    }

    // Reset Form
    setNewReviewText('');
    setReviewerName('');
    setNewRating(5); // Reset to default 5 stars
    setNewHoverRating(0);
    setNewReviewImages([]);
    setShowWriteForm(false);
    showToast('Your comment and review have been posted successfully!', 'success');
  };

  const handleClose = () => {
    if (window.history && window.history.length > 1) {
      window.history.back();
      if (onBack) {
        setTimeout(() => {
          onBack();
        }, 100);
      }
    } else {
      if (onBack) {
        onBack();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div id="product-detail-root" className={`relative w-full font-['Inter',sans-serif] text-xs pb-16 transition-colors duration-200 overflow-visible ${
      isLightMode ? 'bg-[#FAFAF7] text-[#0F172A]' : 'bg-[#011014] text-[#E2E8F0]'
    }`}>
      {/* 1. TOP BAR: Sovereign luxury gold hairline accent at the very top */}
      <div className="h-[2px] bg-gradient-to-r from-[#F5A623] via-[#FBD088] to-[#D4AF37] w-full" />

      {/* Top Header & Navigation Bar */}
      <div className={`px-4 sm:px-6 lg:px-8 py-3 space-y-2 border-b relative z-20 transition-colors ${
        isLightMode ? 'bg-white/80 border-[#EADFC9] backdrop-blur-md' : 'bg-[#0A0F24]/80 border-[#162744] backdrop-blur-md'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              id="premium-back-button"
              onClick={handleClose}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold cursor-pointer text-xs transition-all shadow-xs active:scale-95 border ${
                isLightMode 
                  ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 hover:border-amber-500 hover:text-amber-700' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-amber-400 hover:text-amber-300'
              }`}
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </button>

            {/* Categories dropdown with chevron icon */}
            <div className="relative">
              <button
                id="product-detail-categories-dropdown-btn"
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className={`flex items-center gap-1.5 font-bold text-xs cursor-pointer select-none transition-colors px-3 py-2 rounded-xl border ${
                  isLightMode 
                    ? 'bg-white border-neutral-300 text-[#0F172A] hover:text-[#B48C28]' 
                    : 'bg-[#0B1B32] border-[#162744] text-[#F5A623] hover:text-[#FBD088]'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1.5 w-56 rounded-xl shadow-2xl z-50 py-2 border animate-fade-in ${
                  isLightMode ? 'bg-white border-[#EADFC9] text-gray-800' : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0]'
                }`}>
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isLightMode ? 'text-gray-400' : 'text-[#F5A623]/80'
                  }`}>Explore Catalog</div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoriesDropdownOpen(false);
                        if (onBack) onBack();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isLightMode ? 'hover:bg-[#F5A623]/10 hover:text-[#B48C28]' : 'hover:bg-[#162744] hover:text-[#F5A623]'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb: Category > Subcategory > Product name */}
        <div className={`flex items-center gap-1.5 text-[11px] flex-wrap ${
          isLightMode ? 'text-gray-500' : 'text-slate-400'
        }`}>
          <span className={`hover:underline cursor-pointer ${isLightMode ? 'text-[#0F172A] hover:text-[#B48C28]' : 'text-[#D3E8ED] hover:text-[#F5A623]'}`} onClick={handleClose}>
            {product.category ? product.category.toUpperCase() : 'BOUTIQUE'}
          </span>
          <span>&gt;</span>
          <span className={`hover:underline cursor-pointer ${isLightMode ? 'text-[#0F172A] hover:text-[#B48C28]' : 'text-[#D3E8ED] hover:text-[#F5A623]'}`} onClick={handleClose}>
            {brand || 'Atelier Signature'}
          </span>
          <span>&gt;</span>
          <span className={`font-medium truncate max-w-[240px] sm:max-w-md ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{name}</span>
        </div>
      </div>

      {/* 2. LAYOUT: 3-column grid (image gallery | product details | delivery/purchase sidebar) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 border-b transition-colors ${
        isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
      }`}>
        
        {/* =======================================================
            COLUMN 1: IMAGE GALLERY (left, lg:col-span-4)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-4 p-4 lg:p-5 border-r space-y-4 transition-colors ${
          isLightMode ? 'border-[#EADFC9] bg-white' : 'border-[#162744] bg-[#0A0F24]/50'
        }`}>
          {/* Main Display Image Frame */}
          <div
            onClick={() => setLightboxImage(images[activeImageIndex] || image)}
            className={`relative aspect-square w-full rounded-2xl overflow-hidden group select-none border transition-all duration-300 cursor-pointer ${
            isLightMode 
              ? 'bg-[#FAFAF7] border-[#EADFC9] hover:border-[#F5A623]/60 shadow-sm' 
              : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#F5A623]/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}>
            
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={images[activeImageIndex] || image}
                alt={name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 origin-center"
                referrerPolicy="no-referrer"
                id="main-product-display-image"
              />
            </AnimatePresence>

            {/* Small icon badges overlaid on top-left */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md border ${
                isLightMode 
                  ? 'bg-white/90 border-[#EADFC9] text-[#B48C28]' 
                  : 'bg-[#0A0F24]/90 border-[#F5A623]/30 text-[#F5A623]'
              }`} title="Authentic Atelier Piece">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md border ${
                isLightMode 
                  ? 'bg-white/90 border-[#EADFC9] text-[#0F172A]' 
                  : 'bg-[#0A0F24]/90 border-[#D3E8ED]/30 text-[#D3E8ED]'
              }`} title="Verified Sovereign Guild">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Sovereign Warranty badge top-right */}
            <div className={`absolute top-3 right-3 z-10 px-2.5 py-1 text-[9px] font-extrabold tracking-wider rounded-lg border uppercase backdrop-blur-md shadow-md ${
              isLightMode 
                ? 'bg-[#0F172A] text-white border-black/10' 
                : 'bg-[#0B1B32]/95 text-[#F5A623] border-[#F5A623]/40'
            }`}>
              1-Yr Sovereign Warranty
            </div>

            {/* Bottom specs strip on image */}
            <div className={`absolute bottom-0 left-0 right-0 z-10 py-1.5 px-3 text-[10px] font-bold flex items-center justify-around text-center divide-x backdrop-blur-md ${
              isLightMode 
                ? 'bg-[#0F172A]/90 text-[#FBD088] divide-white/20' 
                : 'bg-[#0B1B32]/95 text-[#F5A623] divide-[#162744] border-t border-[#162744]'
            }`}>
              <span className="flex-1 text-center truncate">✨ 100% Authentic</span>
              <span className="flex-1 text-center truncate">🛡️ Insured Transit</span>
              <span className="flex-1 text-center truncate">⚡ Express Dispatch</span>
            </div>
          </div>

          {/* Thumbnail row below */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className={`w-8 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all border shadow-2xs active:scale-95 ${
                isLightMode 
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800' 
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 flex gap-2 overflow-x-auto custom-scrollbar py-1">
              {images.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    id={`thumb-image-btn-${idx}`}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIs360Active(false);
                    }}
                    className={`relative w-12 h-12 rounded-xl shrink-0 cursor-pointer overflow-hidden transition-all duration-200 border ${
                      isActive 
                        ? 'border-2 border-[#F5A623] ring-2 ring-[#F5A623]/30 scale-105' 
                        : isLightMode 
                          ? 'border-[#EADFC9] bg-white hover:border-gray-400' 
                          : 'border-[#162744] bg-[#0B1B32] hover:border-[#F5A623]/40'
                    }`}
                    title={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {idx === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className={`w-8 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all border shadow-2xs active:scale-95 ${
                isLightMode 
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800' 
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons below main image */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIs360Active(!is360Active);
                showToast(is360Active ? "360° View mode paused" : "360° Interactive view active", "info");
              }}
              className={`py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                is360Active 
                  ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]' 
                  : isLightMode 
                    ? 'bg-white border-[#EADFC9] text-[#0F172A] hover:bg-gray-50 hover:border-amber-400' 
                    : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0] hover:border-[#F5A623]/40'
              }`}
            >
              <span>🔄</span> {is360Active ? "Stop 360°" : "360° View"}
            </button>
            <button
              type="button"
              onClick={() => setLightboxImage(images[activeImageIndex] || image)}
              className={`py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                isLightMode 
                  ? 'bg-white border-[#EADFC9] text-[#0F172A] hover:bg-gray-50 hover:border-amber-400' 
                  : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0] hover:border-[#F5A623]/40'
              }`}
            >
              <span>🔍</span> Full Screen
            </button>
          </div>
        </div>

        {/* =======================================================
            COLUMN 2: PRODUCT DETAILS (middle, lg:col-span-5)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-5 p-4 lg:p-6 border-r space-y-4 transition-colors ${
          isLightMode ? 'border-[#EADFC9] bg-white' : 'border-[#162744] bg-[#0A0F24]/30'
        }`}>
          
          {/* Sovereign Atelier Reserve / Flash Deal Banner */}
          <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 shadow-md transition-all ${
            isLightMode
              ? 'bg-gradient-to-r from-[#F5A623]/15 via-[#FFF9EE] to-[#FAFAF7] border-[#F5A623]/30 text-[#0F172A]'
              : 'bg-gradient-to-r from-[#0B1B32] via-[#162744] to-[#0A0F24] border-[#F5A623]/40 text-[#E2E8F0] shadow-[0_0_15px_rgba(245,166,35,0.12)]'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
                <Zap className="w-4 h-4 fill-[#F5A623]" />
              </div>
              <div>
                <span className="font-black uppercase tracking-wider text-xs block text-[#F5A623]">ATELIER RESERVE SALE</span>
                <span className="text-[10px] opacity-70">Exclusive Vault Pricing</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="text-[10px] opacity-80">Ends in:</div>
              <div className="bg-black/60 px-2.5 py-1 rounded-lg text-[#F5A623] font-bold font-mono text-xs border border-[#F5A623]/30 shadow-inner">
                {formatTimeLeft(timeLeft)}
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-[10px] pt-1.5 border-t border-black/10 dark:border-white/10 mt-0.5">
              <span className="opacity-80 font-medium">342 reserved in last 24 hours</span>
              <div className="w-28 bg-black/40 rounded-full h-1.5 overflow-hidden border border-[#F5A623]/20">
                <div className="bg-gradient-to-r from-[#F5A623] to-[#FBD088] h-full w-[78%]" />
              </div>
            </div>
          </div>

          {/* Title & Brand badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#F5A623] text-[#0A0F24] flex items-center justify-center font-black text-[10px] uppercase shrink-0 shadow-xs">
                  {brand ? brand.charAt(0) : 'A'}
                </div>
                <span className={`text-[11px] font-semibold tracking-wide ${
                  isLightMode ? 'text-gray-500' : 'text-[#D3E8ED]/80'
                }`}>{brand || 'Official Atelier Flagship'}</span>
              </div>

              {/* Multi-Seller Shop Tag */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                isLightMode ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              }`}>
                <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                <span>Sold by: <strong className="font-bold">{product.sellerShopName || 'ALIKE-ND Official'}</strong></span>
              </div>
            </div>

            {/* Product title */}
            <h1 id="product-detail-name" className={`text-lg sm:text-xl font-bold font-serif leading-snug line-clamp-2 ${
              isLightMode ? 'text-[#0F172A]' : 'text-white'
            }`}>
              {name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 fill-current ${
                        i < Math.floor(rating) ? 'text-[#F5A623] fill-[#F5A623]' : 'text-gray-400 opacity-40'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`hover:underline cursor-pointer font-bold transition-colors ${
                    isLightMode ? 'text-[#B48C28]' : 'text-[#F5A623]'
                  }`}
                  onClick={() => {
                    setActiveTab('reviews');
                    document.getElementById("tab-btn-reviews")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  {rating} ({reviewsCount} Ratings)
                </span>
                <span className="opacity-30">|</span>
                <span
                  className={`hover:underline cursor-pointer font-medium transition-colors ${
                    isLightMode ? 'text-gray-600' : 'text-[#D3E8ED]'
                  }`}
                  onClick={() => {
                    setActiveTab('qa');
                    document.getElementById("tab-btn-qa")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  128 Answered Questions
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast("Product link copied!", "success");
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isLightMode 
                      ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-700' 
                      : 'bg-[#0B1B32] border-[#162744] text-slate-300 hover:text-[#F5A623] hover:border-[#F5A623]/40'
                  }`}
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                    isWishlisted 
                      ? 'bg-red-500/15 border-red-400 text-red-500' 
                      : isLightMode 
                        ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-700' 
                        : 'bg-[#0B1B32] border-[#162744] text-slate-300 hover:text-[#F5A623] hover:border-[#F5A623]/40'
                  }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-current'}`} />
                </button>
              </div>
            </div>

            {/* Brand row */}
            <div className={`flex items-center gap-1.5 text-[11px] pt-0.5 ${
              isLightMode ? 'text-gray-500' : 'text-slate-400'
            }`}>
              <span>Brand:</span>
              <span className={`font-bold hover:underline cursor-pointer ${
                isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
              }`}>{brand || 'ALIKE ATELIER'}</span>
              <span className="opacity-30 mx-1">|</span>
              <span className={`hover:underline cursor-pointer ${
                isLightMode ? 'text-[#B48C28]' : 'text-[#D3E8ED]'
              }`}>More products from this guild</span>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Price: Luxury Price display */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span id="detail-price-tag" className={`text-3xl sm:text-4xl font-black tracking-tight font-serif ${
                isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
              }`}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm line-through opacity-50">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              {discountPercent > 0 && (
                <span className="bg-gradient-to-r from-[#F5A623] to-[#D4AF37] text-[#0A0F24] text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-60">Curated Sovereign Price inclusive of all duties and GST taxes.</p>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Variant selector: Color */}
          {colors && colors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-75 font-medium">
                Color Family: <span className={`font-bold ml-1 ${isLightMode ? 'text-black' : 'text-white'}`}>{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((col) => (
                  <button
                    key={col}
                    id={`color-pill-${col}`}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      col === selectedColor
                        ? 'border-2 border-[#F5A623] bg-[#F5A623]/15 text-[#B48C28] dark:text-[#F5A623] shadow-xs'
                        : isLightMode
                          ? 'border-[#EADFC9] bg-white text-gray-700 hover:border-gray-400'
                          : 'border-[#162744] bg-[#0B1B32] text-slate-300 hover:border-[#F5A623]/40'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes Selection */}
          {sizes && sizes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-75 font-medium">
                Size Variant: <span className={`font-bold ml-1 ${isLightMode ? 'text-black' : 'text-white'}`}>{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    id={`size-pill-${sz}`}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      sz === selectedSize
                        ? 'border-2 border-[#F5A623] bg-[#F5A623]/15 text-[#B48C28] dark:text-[#F5A623] shadow-xs'
                        : isLightMode
                          ? 'border-[#EADFC9] bg-white text-gray-700 hover:border-gray-400'
                          : 'border-[#162744] bg-[#0B1B32] text-slate-300 hover:border-[#F5A623]/40'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4 text-xs">
            <span className="opacity-75 font-medium w-20">Quantity</span>
            <div className={`inline-flex items-center rounded-xl border overflow-hidden ${
              isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0B1B32] border-[#162744]'
            }`}>
              <button
                type="button"
                onClick={() => handleQtyChange(quantity - 1)}
                className={`w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  isLightMode ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' : 'bg-[#162744] hover:bg-[#1f365c] text-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`w-12 text-center font-extrabold text-xs select-none ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQtyChange(quantity + 1)}
                className={`w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  isLightMode ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' : 'bg-[#162744] hover:bg-[#1f365c] text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS: Match site's signature buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              id="buy-now-action-btn"
              onClick={handleBuyNow}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F5A623] via-[#E5A823] to-[#D4AF37] hover:brightness-110 text-[#0A0F24] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,166,35,0.3)] active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now</span>
            </button>

            <button
              id="add-to-cart-action-btn"
              onClick={handleAddToCart}
              className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-2 active:scale-[0.98] ${
                isLightMode
                  ? 'border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white'
                  : 'bg-[#0B1B32] border-[#F5A623]/60 text-[#F5A623] hover:bg-[#F5A623]/15 shadow-sm'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>

        </div>

        {/* =======================================================
            COLUMN 3: DELIVERY SIDEBAR (right, lg:col-span-3)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-3 p-4 space-y-4 text-xs transition-colors ${
          isLightMode ? 'bg-[#FAFAF7]' : 'bg-[#0A0F24]/80'
        }`}>
          
          {/* Delivery Options Header */}
          <div className={`flex items-center justify-between border-b pb-2.5 ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <span className={`font-bold font-serif text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Delivery Corridor</span>
            <span title="Delivery details" className="inline-flex items-center">
              <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer" />
            </span>
          </div>

          {/* Location row */}
          <div className="flex items-start justify-between gap-2 text-[11px]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <span className={`leading-snug ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>
                Deliver to <strong>{deliveryLocation.city}, {deliveryLocation.pincode}</strong>
              </span>
            </div>
            <button
              type="button"
              id="change-location-btn"
              onClick={() => setIsLocationModalOpen(true)}
              className={`font-black text-[10px] uppercase tracking-wider shrink-0 cursor-pointer hover:underline ${
                isLightMode ? 'text-[#B48C28]' : 'text-[#F5A623]'
              }`}
            >
              CHANGE
            </button>
          </div>

          {/* Standard delivery row */}
          <div className={`flex items-start justify-between gap-2 text-[11px] pt-2 border-t ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <div>
                <div className={`font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>White-Glove Delivery</div>
                <div className="opacity-60 text-[10px]">{getDeliveryEstimateText(deliveryLocation.pincode)}</div>
              </div>
            </div>
            <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>₹49</span>
          </div>

          {/* Cash on Delivery row */}
          <div className={`flex items-center gap-2 text-[11px] pt-2 border-t ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className={isLightMode ? 'text-gray-700' : 'text-slate-200'}>Cash on Delivery Available</span>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Merchant Section */}
          <div className={`p-3 rounded-xl border space-y-2.5 text-[11px] ${
            isLightMode 
              ? 'bg-white border-[#EADFC9]' 
              : 'bg-[#0B1B32] border-[#162744]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="opacity-50 text-[10px] block">Sold By</span>
                <div className={`font-bold truncate max-w-[140px] flex items-center gap-1.5 ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                  <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                  <span className="truncate">{product.sellerShopName || 'ALIKE-ND Official'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast(`Connected to ${product.sellerShopName || 'ALIKE-ND Official'} customer support!`, "info")}
                className="bg-[#F5A623] hover:bg-[#e0951a] text-[#0A0F24] text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-2 text-[10px] pt-2 border-t ${
              isLightMode ? 'border-gray-100' : 'border-[#162744]'
            }`}>
              <div>
                <span className="opacity-50 block">Positive Rating</span>
                <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>98%</span>
              </div>
              <div>
                <span className="opacity-50 block">On-time Delivery</span>
                <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>99%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

        {/* Product Sections with Sticky ScrollSpy Indicator Bar */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Scrollable Section Navigation Indicator Bar */}
          <div className={`border rounded-2xl p-1.5 sm:p-2 shadow-sm flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none whitespace-nowrap flex-nowrap select-none transition-colors ${
            isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/80 border-[#162744]'
          }`}>
            <button
              id="tab-btn-desc"
              type="button"
              onClick={() => scrollToSection('desc')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'desc' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#F5A623] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-current" />
              <span>Product Description</span>
              {activeTab === 'desc' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#F5A623] via-[#E5A823] to-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
              )}
            </button>

            <button
              id="tab-btn-reviews"
              type="button"
              onClick={() => scrollToSection('reviews')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'reviews' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#F5A623] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="w-4 h-4 fill-current text-current" />
              <span>Reviews & Ratings ({reviewsList.length})</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#F5A623] via-[#E5A823] to-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
              )}
            </button>

            <button
              id="tab-btn-qa"
              type="button"
              onClick={() => scrollToSection('qa')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'qa' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#F5A623] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-current" />
              <span>Questions & Answers</span>
              {activeTab === 'qa' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#F5A623] via-[#E5A823] to-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
              )}
            </button>
          </div>

          {/* Section 1: Product Description */}
          <div id="section-desc" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <FileText className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Product Description
                  </h3>
                  <p className="text-xs opacity-60">Overview, materials, and authenticity details</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                Atelier Verified
              </span>
            </div>

            <div className={`p-5 sm:p-7 rounded-xl border space-y-4 ${
              isLightMode 
                ? 'bg-[#FAFAF7] border-[#EADFC9]' 
                : 'bg-[#0B1B32]/60 border-[#162744]'
            }`}>
              <p className={`text-sm sm:text-base leading-relaxed ${isLightMode ? 'text-gray-700' : 'text-slate-200'}`}>
                {description}
              </p>

              <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
                Crafted to high standards, this product offers superior reliability and style. Sourced directly from authorized distributors ensuring authentic product quality and verified craftsmanship.
              </p>

              {/* Highlight Features Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>100% Authentic</p>
                    <p className="text-[11px] opacity-60">Direct from atelier</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Express Delivery</p>
                    <p className="text-[11px] opacity-60">Insured luxury transit</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Easy Returns</p>
                    <p className="text-[11px] opacity-60">Complimentary 7-day guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Trigger Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              isLightMode 
                ? 'bg-neutral-50/90 border-neutral-200/80 shadow-xs' 
                : 'bg-neutral-900/80 border-neutral-800 shadow-md'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${
                  isLightMode ? 'bg-neutral-900 text-white shadow-xs' : 'bg-white text-neutral-950 shadow-xs'
                }`}>
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className={`text-sm sm:text-base font-bold ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                    Have you experienced this piece?
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Share your genuine impressions with discerning buyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="write-review-trigger-btn"
                onClick={() => {
                  scrollToSection('reviews');
                  setShowWriteForm(true);
                }}
                className={`group px-4.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95 border ${
                  isLightMode
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900'
                    : 'bg-white hover:bg-neutral-100 text-neutral-950 border-white'
                }`}
              >
                <PenLine className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isLightMode ? 'text-white' : 'text-neutral-950'
                }`} />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Section 2: Customer Reviews & Ratings */}
          <div id="section-reviews" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <Star className="w-5 h-5 fill-[#F5A623] text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Reviews & Ratings ({reviewsList.length})
                  </h3>
                  <p className="text-xs opacity-60">Genuine client experiences and ratings</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                Verified Feedback
              </span>
            </div>

            {/* Rating Summary Card */}
            <div className={`p-5 sm:p-6 rounded-xl border shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Big Score Display */}
                <div className="text-center sm:text-left shrink-0">
                  <span className={`text-4xl sm:text-5xl font-black font-serif ${
                    isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
                  }`}>
                    {reviewsList.length > 0 
                      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
                      : (rating || 4.8)}
                  </span>
                  <span className="text-xs opacity-60 block font-semibold mt-0.5">out of 5.0</span>
                </div>

                <div className={`h-16 w-[1px] hidden sm:block ${isLightMode ? 'bg-[#EADFC9]' : 'bg-[#162744]'}`} />

                {/* Stars & Breakdown Bars */}
                <div className="space-y-2 flex-grow min-w-[220px]">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avgVal = reviewsList.length > 0 
                        ? reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length 
                        : (rating || 4.8);
                      return (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.round(avgVal) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-400 opacity-40'}`} 
                        />
                      );
                    })}
                    <span className={`text-xs font-bold ml-2 ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                      {reviewsList.length} Verified {reviewsList.length === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>

                  {/* Progress Breakdown */}
                  <div className="space-y-1 pt-1 max-w-xs">
                    {[
                      { stars: 5, pct: 82 },
                      { stars: 4, pct: 12 },
                      { stars: 3, pct: 4 },
                      { stars: 2, pct: 1 },
                      { stars: 1, pct: 1 },
                    ].map((item) => (
                      <div key={item.stars} className="flex items-center gap-2 text-[11px] opacity-75">
                        <span className="w-3 font-bold text-right">{item.stars}★</span>
                        <div className={`flex-grow h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-black/40'}`}>
                          <div 
                            className="h-full bg-gradient-to-r from-[#F5A623] to-[#D4AF37] rounded-full transition-all duration-500" 
                            style={{ width: `${item.pct}%` }} 
                          />
                        </div>
                        <span className="w-7 font-mono text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="write-review-toggle-btn"
                onClick={() => setShowWriteForm(!showWriteForm)}
                className={`group px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start lg:self-auto active:scale-95 border ${
                  showWriteForm
                    ? isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-[#162744] hover:bg-[#1C3256] text-neutral-200 border-[#223E68]'
                    : isLightMode
                    ? 'bg-[#0F172A] hover:bg-black text-[#F5A623] hover:text-[#FFB84D] border-[#0F172A] hover:shadow-md'
                    : 'bg-gradient-to-r from-[#0F1B30] to-[#162744] hover:from-[#13233E] hover:to-[#1C3256] text-[#F5A623] hover:text-[#FFB84D] border-[#203A60] hover:border-[#F5A623]/60 shadow-lg shadow-black/40'
                }`}
              >
                <PenLine className="w-4 h-4 text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span>{showWriteForm ? 'Cancel Review' : 'Write a Product Review'}</span>
              </button>
            </div>

            {/* Review Form */}
            {showWriteForm && (
              <form
                onSubmit={handlePostReview}
                className={`p-5 sm:p-6 rounded-xl border space-y-4 shadow-sm ${
                  isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/80 border-[#162744]'
                }`}
              >
                <h4 className={`text-sm font-bold border-b pb-2 flex items-center gap-2 ${
                  isLightMode ? 'border-[#EADFC9] text-[#0F172A]' : 'border-[#162744] text-white'
                }`}>
                  <Sparkles className="w-4 h-4 text-[#F5A623]" />
                  <span>Leave Your Genuine Feedback</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs opacity-75 font-semibold">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border focus:outline-none transition-all ${
                        isLightMode 
                          ? 'bg-white border-[#EADFC9] text-gray-900 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20' 
                          : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs opacity-75 font-semibold">
                      Your Star Rating
                    </label>
                    <div className="flex items-center gap-2 h-[42px]" onMouseLeave={() => setNewHoverRating(0)}>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const v = idx + 1;
                        const isLit = v <= (newHoverRating || newRating);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewRating(v)}
                            onMouseEnter={() => setNewHoverRating(v)}
                            className="focus:outline-none cursor-pointer hover:scale-125 transition-transform duration-150"
                            title={`Rate ${v} stars`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isLit ? 'fill-[#F5A623] text-[#F5A623] drop-shadow-[0_0_6px_rgba(245,166,35,0.5)]' : 'text-gray-400 opacity-40'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs opacity-75 font-semibold">
                    Your Review Comment
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you like or appreciate about this product?"
                    className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border focus:outline-none transition-all ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] text-gray-900 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20' 
                        : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold opacity-75">
                    📸 Attach Photos (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 ${
                        isLightMode 
                          ? 'border-[#EADFC9] bg-white hover:border-[#F5A623]' 
                          : 'border-[#162744] bg-[#0A0F24] hover:border-[#F5A623]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-semibold">Upload Photos</span>
                    </div>

                    <div className={`border rounded-xl p-3 flex flex-col justify-between gap-2 ${
                      isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
                    }`}>
                      <span className="text-xs font-semibold">Paste Image URL</span>
                      <div className="flex gap-1.5">
                        <input
                          id="direct-image-url-input"
                          type="text"
                          placeholder="https://..."
                          className={`flex-grow text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none ${
                            isLightMode ? 'bg-[#FAFAF7] border-gray-300 text-gray-900' : 'bg-[#0B1B32] border-[#162744] text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('direct-image-url-input') as HTMLInputElement;
                            const val = input?.value?.trim();
                            if (val) {
                              setNewReviewImages(prev => [...prev, val]);
                              input.value = '';
                              showToast('Image URL added!', 'success');
                            }
                          }}
                          className="px-3 py-1 bg-[#F5A623] hover:bg-[#e0951a] rounded-lg text-xs font-bold text-[#0A0F24] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {newReviewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {newReviewImages.map((src, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#F5A623]/40">
                          <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(idx)}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 text-white rounded-full cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    id="submit-comment-button"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F5A623] via-[#E5A823] to-[#D4AF37] hover:brightness-110 text-[#0A0F24] font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Review Cards List */}
            <div className="space-y-4">
              {reviewsList.map((rev, rIdx) => {
                const hInfo = helpfulMap[rev.id] || { count: 6, userLiked: false };
                return (
                  <div 
                    key={`review-${rev.id}-${rIdx}`} 
                    className={`p-5 sm:p-6 rounded-2xl border shadow-2xs space-y-3 relative overflow-hidden transition-all ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#F5A623]/40'
                    }`}
                  >
                    {/* Vertical Gold Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#F5A623] to-[#D4AF37]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar with Gold Ring */}
                        <div className="w-9 h-9 rounded-xl bg-[#F5A623] text-[#0A0F24] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>{rev.name}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Verified Client
                            </span>
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-400 opacity-40'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs opacity-50">{rev.date}</span>
                    </div>

                    <p className={`text-sm leading-relaxed pt-1 ${isLightMode ? 'text-gray-700' : 'text-slate-200'}`}>
                      {rev.comment}
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-[#F5A623]/30 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-2xs"
                          >
                            <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer action row */}
                    <div className={`pt-2 flex items-center justify-between border-t ${
                      isLightMode ? 'border-gray-100' : 'border-[#162744]'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleHelpful(rev.id)}
                        className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hInfo.userLiked 
                            ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]' 
                            : isLightMode
                              ? 'bg-[#FAFAF7] border-gray-200 text-gray-600 hover:border-[#F5A623] hover:text-[#B48C28]'
                              : 'bg-[#0A0F24] border-[#162744] text-slate-300 hover:border-[#F5A623] hover:text-[#F5A623]'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hInfo.userLiked ? 'fill-[#F5A623] text-[#F5A623]' : ''}`} />
                        <span>Helpful ({hInfo.count})</span>
                      </button>

                      <span className="text-[11px] opacity-50">ALIKE Verified Atelier Buyer</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Questions & Answers */}
          <div id="section-qa" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <HelpCircle className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Questions & Answers
                  </h3>
                  <p className="text-xs opacity-60">Verified concierge answers to client inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="qa-toggle-all-btn"
                  onClick={toggleAllQuestions}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-[#122442] hover:bg-[#1A3358] text-amber-400 border-[#1F3A60]'
                  }`}
                >
                  {openQuestions.length === 4 ? 'Collapse All' : 'Expand All'}
                </button>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                  Concierge Q&A
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  q: "Does this product come with domestic manufacturer warranty?",
                  a: "Yes, it includes a 1-Year Sovereign Brand Warranty covering any technical defects. Contact atelier concierge directly for seamless claims."
                },
                {
                  q: "What is the expected delivery duration for tier 1 cities?",
                  a: "For metro cities (such as New Delhi, Mumbai, Bengaluru), white-glove delivery is completed within 24 to 48 hours."
                },
                {
                  q: "Are these materials authentic and verified?",
                  a: "Yes, every item undergoes strict multi-point authentication before storage in our secure temperature-regulated vault."
                },
                {
                  q: "Is Cash on Delivery (COD) available?",
                  a: "Yes, Cash on Delivery is available across most serviceable pin codes during checkout."
                }
              ].map((item, idx) => {
                const isOpen = openQuestions.includes(idx);
                return (
                  <div key={idx} className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isOpen
                      ? isLightMode
                        ? 'bg-white border-amber-500/40 shadow-xs'
                        : 'bg-[#0B1B32] border-amber-500/40 shadow-md'
                      : isLightMode 
                        ? 'bg-[#FAFAF7] border-[#EADFC9] hover:border-amber-500/30' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-amber-500/30'
                  }`}>
                    <button
                      type="button"
                      id={`qa-item-${idx}`}
                      onClick={() => toggleQuestion(idx)}
                      className={`w-full text-left flex items-start justify-between gap-3 font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer ${
                        isLightMode ? 'text-neutral-900' : 'text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                          Q
                        </span>
                        <span className="font-bold text-xs sm:text-sm">{item.q}</span>
                      </span>
                      <span className={`p-1 rounded-lg transition-transform duration-200 shrink-0 ${
                        isLightMode ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-300'
                      } ${isOpen ? 'rotate-180 text-amber-500' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className={`mt-3.5 pt-3.5 border-t pl-2 sm:pl-3 space-y-2 text-xs sm:text-sm transition-all ${
                        isLightMode ? 'border-neutral-200/80' : 'border-neutral-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            A
                          </span>
                          <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Concierge Answer
                          </span>
                        </div>
                        <p className={`pl-8 leading-relaxed font-medium ${isLightMode ? 'text-neutral-700' : 'text-neutral-200'}`}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Section */}
        <div className="p-4 sm:p-6 lg:p-8 pt-0">
          {(() => {
          const fbtProducts = allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 2);

          if (fbtProducts.length === 0) return null;

          let fbtTotalPrice = 0;
          if (fbtMainChecked) fbtTotalPrice += product.price;
          if (fbtProducts[0] && fbt1Checked) fbtTotalPrice += fbtProducts[0].price;
          if (fbtProducts[1] && fbt2Checked) fbtTotalPrice += fbtProducts[1].price;

          let fbtTotalMrp = 0;
          if (fbtMainChecked) fbtTotalMrp += product.mrp;
          if (fbtProducts[0] && fbt1Checked) fbtTotalMrp += fbtProducts[0].mrp;
          if (fbtProducts[1] && fbt2Checked) fbtTotalMrp += fbtProducts[1].mrp;

          const handleAddFbtBundleToCart = () => {
            let addedCount = 0;
            if (fbtMainChecked) {
              onAddToCart(product, 1);
              addedCount++;
            }
            if (fbtProducts[0] && fbt1Checked) {
              onAddToCart(fbtProducts[0], 1);
              addedCount++;
            }
            if (fbtProducts[1] && fbt2Checked) {
              onAddToCart(fbtProducts[1], 1);
              addedCount++;
            }

            if (addedCount > 0) {
              showToast(`Added ${addedCount} bundle item(s) to your cart!`, 'success');
            } else {
              showToast('Please select at least one product.', 'warning');
            }
          };

          return (
            <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${
              isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/50 border-[#162744]'
            }`}>
              <div className={`border-b pb-3 flex items-center justify-between ${
                isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
              }`}>
                <h3 className={`text-base font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                  Frequently Curated Together
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-1 rounded-full border border-[#F5A623]/30">
                  Bundle & Save
                </span>
              </div>

              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                {/* Items row */}
                <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
                  
                  {/* Item 1 */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                    isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={fbtMainChecked}
                      onChange={(e) => setFbtMainChecked(e.target.checked)}
                      className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                      id="fbt-check-main"
                    />
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] opacity-60 font-medium block">Current Piece</span>
                      <h4 className={`text-xs font-bold truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{product.name}</h4>
                      <span className="text-xs font-black text-[#F5A623]">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* + Separator */}
                  {fbtProducts[0] && (
                    <div className="text-[#F5A623] font-bold text-base shrink-0">+</div>
                  )}

                  {/* Item 2 */}
                  {fbtProducts[0] && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={fbt1Checked}
                        onChange={(e) => setFbt1Checked(e.target.checked)}
                        className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        id="fbt-check-1"
                      />
                      <img src={fbtProducts[0].image} alt={fbtProducts[0].name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] opacity-60 font-medium block">{fbtProducts[0].brand}</span>
                        <h4 className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                          isLightMode ? 'text-gray-900 hover:text-[#B48C28]' : 'text-white hover:text-[#F5A623]'
                        }`} onClick={() => onSelectProduct(fbtProducts[0])}>{fbtProducts[0].name}</h4>
                        <span className="text-xs font-black text-[#F5A623]">₹{fbtProducts[0].price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* + Separator */}
                  {fbtProducts[1] && (
                    <div className="text-[#F5A623] font-bold text-base shrink-0">+</div>
                  )}

                  {/* Item 3 */}
                  {fbtProducts[1] && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={fbt2Checked}
                        onChange={(e) => setFbt2Checked(e.target.checked)}
                        className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        id="fbt-check-2"
                      />
                      <img src={fbtProducts[1].image} alt={fbtProducts[1].name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] opacity-60 font-medium block">{fbtProducts[1].brand}</span>
                        <h4 className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                          isLightMode ? 'text-gray-900 hover:text-[#B48C28]' : 'text-white hover:text-[#F5A623]'
                        }`} onClick={() => onSelectProduct(fbtProducts[1])}>{fbtProducts[1].name}</h4>
                        <span className="text-xs font-black text-[#F5A623]">₹{fbtProducts[1].price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className={`p-4 rounded-xl border w-full xl:w-72 space-y-3 shrink-0 ${
                  isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32] border-[#162744]'
                }`}>
                  <div>
                    <span className="text-xs opacity-60 font-medium block">Bundle Total:</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>
                        ₹{fbtTotalPrice.toLocaleString('en-IN')}
                      </span>
                      {fbtTotalMrp - fbtTotalPrice > 0 && (
                        <span className="text-xs line-through opacity-50">₹{fbtTotalMrp.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    id="add-all-fbt-to-cart-btn"
                    onClick={handleAddFbtBundleToCart}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#D4AF37] hover:brightness-110 text-[#0A0F24] font-black text-xs uppercase tracking-wider shadow-sm shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Add Bundle to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
        </div>

        {/* Recommended Products Section */}
        {related.length > 0 && (
          <div className="p-4 sm:p-6 lg:p-8 pt-0 space-y-4">
            <div className={`border-b pb-3 flex items-center justify-between ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <h3 className={`text-base font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                Clients Also Explored
              </h3>
              <span className="text-xs opacity-50">Curated recommendations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => {
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className={`group cursor-pointer rounded-2xl border p-3.5 space-y-2.5 transition-all hover:scale-[1.02] shadow-sm ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#F5A623]/50'
                    }`}
                  >
                    <div className={`aspect-square overflow-hidden relative rounded-xl border ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
                    }`}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-[10px] opacity-60 block">{p.brand}</span>
                      <h4 className={`text-xs font-bold line-clamp-2 transition-colors ${
                        isLightMode ? 'text-gray-900 group-hover:text-[#B48C28]' : 'text-white group-hover:text-[#F5A623]'
                      }`}>{p.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-sm font-black ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] opacity-50 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Delivery Location Selector Modal */}
      {isLocationModalOpen && (
        <div
          id="location-picker-modal-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-55 flex items-center justify-center p-4 animate-premium-fade-in"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            id="location-picker-modal-panel"
            className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-slide-up ${
              isLightMode 
                ? 'bg-white border-[#EADFC9] text-gray-900' 
                : 'bg-[#0B1B32] border-[#162744] text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold font-serif leading-tight ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Choose Delivery Destination
                  </h3>
                  <p className="text-xs opacity-60">Select location for accurate delivery window & estimates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              
              {/* 1. Instant Location Detection Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="w-full p-3.5 rounded-xl border border-dashed border-[#F5A623]/50 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 text-[#F5A623] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A623] text-[#0A0F24] flex items-center justify-center">
                    {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <span className={`text-xs font-bold block ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                      {isDetectingLocation ? 'Detecting coordinates...' : 'Use Current Coordinates'}
                    </span>
                    <span className="text-[11px] opacity-70">Auto-detect GPS location</span>
                  </div>
                </div>
                <span className="text-xs font-bold group-hover:translate-x-0.5 transition-transform text-[#F5A623]">Detect →</span>
              </button>

              {/* 2. Manual Pincode & City Search Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-75 block">
                  Search City / Pincode
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 opacity-40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder="Type city name or 6-digit pincode (e.g. Mumbai, 400001)..."
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border transition-all ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#F5A623]' 
                        : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623]'
                    }`}
                  />
                  {locationSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Direct Custom Pincode Apply Form */}
              <form onSubmit={handleApplyCustomPincode} className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Enter Exact 6-Digit PIN</span>
                  <span className="text-[10px] opacity-60 font-mono">India Post Network</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={customPincodeInput}
                    onChange={(e) => setCustomPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter PIN (e.g. 560001)"
                    className={`flex-1 px-3.5 py-2 text-xs rounded-lg border font-mono tracking-wider ${
                      isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0B1B32] border-[#162744] text-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F5A623] hover:bg-[#e0951a] text-[#0A0F24] text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply PIN
                  </button>
                </div>
              </form>

              {/* 4. Popular Cities / Matched Results List */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[11px] opacity-75">
                    {locationSearchQuery ? 'Matching Locations' : 'Popular Delivery Destinations'}
                  </span>
                  <span className="text-[11px] opacity-50 font-mono">
                    {POPULAR_LOCATIONS.filter(l =>
                      !locationSearchQuery ||
                      l.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                      l.pincode.includes(locationSearchQuery) ||
                      l.state.toLowerCase().includes(locationSearchQuery.toLowerCase())
                    ).length} locations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {POPULAR_LOCATIONS
                    .filter((l) =>
                      !locationSearchQuery ||
                      l.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                      l.pincode.includes(locationSearchQuery) ||
                      l.state.toLowerCase().includes(locationSearchQuery.toLowerCase())
                    )
                    .map((loc) => {
                      const isSelected = deliveryLocation.pincode === loc.pincode;
                      return (
                        <button
                          key={loc.pincode}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623] shadow-xs'
                              : isLightMode
                                ? 'bg-white border-[#EADFC9] hover:border-gray-400 text-gray-800'
                                : 'bg-[#0A0F24] border-[#162744] hover:border-[#F5A623]/40 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#F5A623]' : 'opacity-40'}`} />
                              <span className="font-bold text-xs truncate">{loc.city}</span>
                            </div>
                            <span className="text-[10px] opacity-60 font-mono block pl-5">
                              {loc.pincode} • {loc.state}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#F5A623] text-[#0A0F24] flex items-center justify-center shrink-0 font-black">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs opacity-75 ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
            }`}>
              <span>Current: <strong className={isLightMode ? 'text-black' : 'text-white'}>{deliveryLocation.city} ({deliveryLocation.pincode})</strong></span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className={`px-4 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                  isLightMode 
                    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100' 
                    : 'bg-[#0B1B32] border-[#162744] text-white hover:bg-[#162744]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 360° & Full Screen Interactive Viewer Modal */}
      {(lightboxImage || is360Active) && (
        <div
          id="product-interactive-viewer-modal"
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-premium-fade-in"
          onClick={() => {
            setLightboxImage(null);
            setIs360Active(false);
          }}
        >
          {/* Top Bar with Clear Back Button and Title */}
          <div
            className="w-full max-w-6xl flex items-center justify-between gap-3 py-2 px-3 sm:px-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl z-20 backdrop-blur-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Primary Back Button */}
            <button
              id="viewer-back-btn"
              type="button"
              onClick={() => {
                setLightboxImage(null);
                setIs360Active(false);
              }}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 border border-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Exit View</span>
            </button>

            {/* Title & Mode Indicator */}
            <div className="flex items-center gap-2 truncate text-center">
              <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-xs">{name}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                {is360Active ? '360° Spin View' : 'Full Screen High-Res'}
              </span>
            </div>

            {/* 360 Toggle & Close Icon */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIs360Active(!is360Active)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  is360Active
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${is360Active ? 'animate-spin-slow' : ''}`} />
                <span className="hidden sm:inline">{is360Active ? 'Auto Spinning' : 'Start 360°'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLightboxImage(null);
                  setIs360Active(false);
                }}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer border border-neutral-700"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Visual Display Area */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-3 sm:my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 hover:border-white transition-all shadow-xl cursor-pointer active:scale-95"
              title="Previous Angle"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* The Main High-Res Image with rotation effect */}
            <motion.div
              key={activeImageIndex}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-full max-h-[62vh] sm:max-h-[68vh] flex items-center justify-center p-2"
            >
              <img
                src={images[activeImageIndex] || image}
                alt={`${name} angle ${activeImageIndex + 1}`}
                className="max-w-full max-h-[60vh] sm:max-h-[66vh] object-contain rounded-2xl shadow-2xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 hover:border-white transition-all shadow-xl cursor-pointer active:scale-95"
              title="Next Angle"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails & Angle Selector */}
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-2 py-2 px-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur-md z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar max-w-full py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    idx === activeImageIndex
                      ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                      : 'border-neutral-700 opacity-60 hover:opacity-100 hover:border-neutral-400'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-mono text-white px-1">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Angle {activeImageIndex + 1} of {images.length} • Click "Back / Exit View" or Press anywhere to return
            </span>
          </div>
        </div>
      )}

      {/* Premium Close Button Custom Animations */}
      <style>{`
        @keyframes premiumFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-premium-fade-in {
          animation: premiumFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
