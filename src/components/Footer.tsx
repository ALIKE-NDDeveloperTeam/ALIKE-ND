import React, { useState } from 'react';
import Logo from './Logo';
import { 
  ShieldCheck, 
  Mail, 
  Send, 
  ChevronRight, 
  Sparkles, 
  Headphones, 
  Truck, 
  RotateCcw, 
  CheckCircle2,
  LayoutGrid,
  Star,
  Tag,
  Flame,
  Gift,
  Percent,
  Package,
  HelpCircle,
  Ruler,
  FileCheck,
  Shield,
  ArrowUp,
  Crown,
  Store
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
  isLightMode?: boolean;
}

export default function Footer({ onNavigate, isLightMode = false }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.598 0 9 1.582 9 4.615V8z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      hoverClass: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com',
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      hoverClass: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  const shopLinks = [
    { label: 'Become a Seller', icon: Store, action: () => onNavigate('seller_register') },
    { label: 'All Categories', icon: LayoutGrid, action: () => onNavigate('category_search', 'all') },
    { label: 'New Arrivals', icon: Sparkles, action: () => onNavigate('category_search', 'new') },
    { label: 'Best Sellers', icon: Star, action: () => onNavigate('category_search', 'bestseller') },
    { label: "Today's Deals", icon: Tag, action: () => onNavigate('category_search', 'deals') },
    { label: 'Popular Products', icon: Flame, action: () => onNavigate('category_search', 'popular') },
    { label: 'Curated Brands', icon: Crown, action: () => onNavigate('category_search', 'luxury') },
    { label: 'Gift Cards', icon: Gift, action: () => onNavigate('category_search', 'gift') },
    { label: 'Special Offers', icon: Percent, action: () => onNavigate('category_search', 'wholesale') }
  ];

  const customerServiceLinks = [
    { label: 'Sell on ALIKE-ND', icon: Store, action: () => onNavigate('seller_register') },
    { label: 'Track Your Order', icon: Truck, action: () => onNavigate('orders') },
    { label: 'Returns & Refunds', icon: RotateCcw, action: () => onNavigate('orders') },
    { label: 'Shipping Information', icon: Package, action: () => onNavigate('category_search', 'delivery') },
    { label: 'FAQs & Help Center', icon: HelpCircle, action: () => onNavigate('messenger') },
    { label: 'Size & Style Guide', icon: Ruler, action: () => onNavigate('ai_recommendations') },
    { label: 'Contact Us', icon: Headphones, action: () => onNavigate('messenger') },
    { label: 'Terms & Conditions', icon: FileCheck, action: () => onNavigate('category_search', 'delivery') },
    { label: 'Privacy Policy', icon: Shield, action: () => onNavigate('category_search', 'delivery') }
  ];

  return (
    <footer className={`border-t transition-colors duration-300 ${
      isLightMode 
        ? 'bg-neutral-50/70 border-neutral-200 text-neutral-800' 
        : 'bg-[#09090b] border-neutral-800 text-neutral-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* Column 1: Brand Logo & Information (Span 4) */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-4">
            {/* Website Brand Logo */}
            <div
              id="footer-logo-brand"
              onClick={() => onNavigate('home')}
              className="cursor-pointer group select-none inline-flex"
            >
              <Logo size="lg" isLightMode={isLightMode} />
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isLightMode ? 'text-neutral-600' : 'text-neutral-400'
            }`}>
              Shop the latest trends, curated luxury collections, top atelier brands and exclusive deals all in one place. We make online shopping easy, secure and enjoyable for everyone.
            </p>

            {/* Follow Us Section */}
            <div className="pt-3">
              <span className={`text-xs uppercase font-extrabold tracking-wider block mb-3 ${
                isLightMode ? 'text-neutral-900' : 'text-neutral-200'
              }`}>
                FOLLOW US
              </span>
              <div className="flex flex-wrap gap-2.5 items-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer border ${
                      isLightMode
                        ? 'bg-white border-neutral-200 text-neutral-700 hover:shadow-sm active:scale-95'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white active:scale-95'
                    } ${social.hoverClass}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: SHOP Links (Span 3) */}
          <div className="lg:col-span-2 sm:col-span-1 space-y-4">
            <h4 className={`text-sm font-extrabold uppercase tracking-wider ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              SHOP
            </h4>

            <ul className="space-y-2.5 text-xs font-medium">
              {shopLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.action}
                      className={`w-full flex items-center justify-between py-1 transition-all group text-left cursor-pointer ${
                        isLightMode 
                          ? 'text-neutral-600 hover:text-neutral-950' 
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: CUSTOMER SERVICE Links (Span 3) */}
          <div className="lg:col-span-3 sm:col-span-1 space-y-4">
            <h4 className={`text-sm font-extrabold uppercase tracking-wider ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              CUSTOMER SERVICE
            </h4>

            <ul className="space-y-2.5 text-xs font-medium">
              {customerServiceLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.action}
                      className={`w-full flex items-center justify-between py-1 transition-all group text-left cursor-pointer ${
                        isLightMode 
                          ? 'text-neutral-600 hover:text-neutral-950' 
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: STAY UPDATED (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-sm font-extrabold uppercase tracking-wider ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              STAY UPDATED
            </h4>

            <p className={`text-xs leading-relaxed ${
              isLightMode ? 'text-neutral-600' : 'text-neutral-400'
            }`}>
              Subscribe to get special offers, free giveaways and once-in-a-lifetime deals.
            </p>

            {/* Newsletter Input & Submit */}
            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs outline-none transition-all font-medium border shadow-2xs ${
                    isLightMode
                      ? 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                      : 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400'
                  }`}
                />
              </div>

              <button
                id="newsletter-subscribe-btn"
                type="submit"
                className={`w-full py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                  subscribed
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isLightMode
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 shadow-neutral-900/15'
                    : 'bg-white hover:bg-neutral-100 text-neutral-950 border-white shadow-white/10'
                }`}
                title="Subscribe to Newsletter"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subscribed Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>SUBSCRIBE NOW</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Promo Card: Get 10% Off Your First Order! */}
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
              isLightMode 
                ? 'bg-amber-500/10 border-amber-500/25 text-neutral-900' 
                : 'bg-amber-500/10 border-amber-500/20 text-neutral-100'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-xs">
                <Tag className="w-4 h-4 font-bold" />
              </div>
              <div className="space-y-0.5">
                <h5 className={`text-xs font-extrabold ${isLightMode ? 'text-amber-950' : 'text-amber-300'}`}>
                  Get 10% Off Your First Order!
                </h5>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug">
                  Join our newsletter and enjoy exclusive discounts and early access.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Feature / Trust Badges Card */}
        <div className={`p-6 rounded-2xl border transition-colors ${
          isLightMode 
            ? 'bg-white border-neutral-200/90 shadow-xs' 
            : 'bg-neutral-900/70 border-neutral-800 shadow-md'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Feature 1: Free Shipping */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isLightMode ? 'bg-amber-500/15 text-amber-700' : 'bg-amber-500/15 text-amber-400'
              }`}>
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h5 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                  isLightMode ? 'text-neutral-900' : 'text-white'
                }`}>
                  FREE SHIPPING
                </h5>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  Free shipping on all orders over ₹499
                </p>
              </div>
            </div>

            {/* Feature 2: Secure Payment */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isLightMode ? 'bg-emerald-500/15 text-emerald-700' : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h5 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                  isLightMode ? 'text-neutral-900' : 'text-white'
                }`}>
                  SECURE PAYMENT
                </h5>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  100% secure payment with SSL encryption
                </p>
              </div>
            </div>

            {/* Feature 3: Easy Returns */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isLightMode ? 'bg-sky-500/15 text-sky-700' : 'bg-sky-500/15 text-sky-400'
              }`}>
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h5 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                  isLightMode ? 'text-neutral-900' : 'text-white'
                }`}>
                  EASY RETURNS
                </h5>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  30-day easy return policy
                </p>
              </div>
            </div>

            {/* Feature 4: 24/7 Support */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isLightMode ? 'bg-purple-500/15 text-purple-700' : 'bg-purple-500/15 text-purple-400'
              }`}>
                <Headphones className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h5 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                  isLightMode ? 'text-neutral-900' : 'text-white'
                }`}>
                  24/7 SUPPORT
                </h5>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  Dedicated support whenever you need us
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright & Payment Badges Bar */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Left: Copyright & Discreet Admin Portals */}
          <div className="text-center md:text-left flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-neutral-500 dark:text-neutral-400 text-xs">
            <p>
              © 2026 <strong className={isLightMode ? 'text-neutral-900' : 'text-white'}>ALIKE-ND</strong>. All rights reserved. Made with <span className="text-rose-500">❤️</span> for our customers.
            </p>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-600">·</span>
            <button
              type="button"
              id="footer-become-seller-btn"
              onClick={() => onNavigate('seller_register')}
              className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
              title="Become a Marketplace Seller"
            >
              <Store className="w-3 h-3 text-amber-500" />
              <span>Become a Seller</span>
            </button>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-600">·</span>
            <button
              type="button"
              onClick={() => onNavigate('staffadmin_login')}
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
              title="Operations Staff Admin Login"
            >
              <Shield className="w-3 h-3" />
              <span>Staff Portal</span>
            </button>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-600">·</span>
            <button
              type="button"
              onClick={() => onNavigate('superadmin_login')}
              className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
              title="Super Administrator Master Portal"
            >
              <Crown className="w-3 h-3" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Center/Right: We Accept Payment Cards */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
              WE ACCEPT
            </span>

            {/* Payment Chips */}
            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-blue-700' 
                : 'bg-neutral-900 border-neutral-800 text-blue-400'
            }`}>
              VISA
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-amber-700' 
                : 'bg-neutral-900 border-neutral-800 text-amber-400'
            }`}>
              Mastercard
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-sky-700' 
                : 'bg-neutral-900 border-neutral-800 text-sky-400'
            }`}>
              American Express
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-blue-800' 
                : 'bg-neutral-900 border-neutral-800 text-blue-400'
            }`}>
              PayPal
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-emerald-700' 
                : 'bg-neutral-900 border-neutral-800 text-emerald-400'
            }`}>
              UPI
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-wider shadow-2xs ${
              isLightMode 
                ? 'bg-white border-neutral-200 text-orange-700' 
                : 'bg-neutral-900 border-neutral-800 text-orange-400'
            }`}>
              RuPay
            </span>
          </div>

          {/* Far Right: Back to top button */}
          <div className="flex justify-center md:justify-end">
            <button
              type="button"
              id="scroll-to-top-btn"
              onClick={scrollToTop}
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                isLightMode 
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-950' 
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
