import { useState, FormEvent } from 'react';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  BadgePercent,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import Logo from '../components/Logo';
import { sellerApi, RegisterSellerPayload } from '../services/sellerApi';
import { SellerProfile } from '../types';

interface SellerRegisterProps {
  onRegisterSuccess?: (seller: SellerProfile) => void;
  onLoginSuccess?: (seller: SellerProfile) => void;
  onNavigateToDashboard?: () => void;
  onNavigateHome?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function SellerRegister({
  onRegisterSuccess,
  onLoginSuccess,
  onNavigateToDashboard,
  onNavigateHome,
  showToast,
  isLightMode = false,
}: SellerRegisterProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState<SellerProfile | null>(null);

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shopName.trim() || !ownerName.trim() || !mobileNumber.trim() || !email.trim() || !businessAddress.trim()) {
      setErrorMsg('All registration fields are required.');
      showToast('Please fill out all required merchant fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Please choose a secure password of at least 6 characters.');
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterSellerPayload = {
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim().toLowerCase(),
        businessAddress: businessAddress.trim(),
        password,
      };

      const res = await sellerApi.register(payload);
      setLoading(false);

      if (res.success && res.seller) {
        setSuccessSubmitted(res.seller);
        showToast('Application submitted! Your seller application is pending admin approval.', 'success');
        if (onRegisterSuccess) {
          onRegisterSuccess(res.seller);
        }
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Network error occurred while submitting seller application.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both your seller email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await sellerApi.login(loginEmail.trim().toLowerCase(), loginPassword);
      setLoading(false);

      if (res.success && res.seller) {
        showToast(`Welcome back, ${res.seller.shopName || res.seller.ownerName}!`, 'success');
        if (onLoginSuccess) {
          onLoginSuccess(res.seller);
        }
        if (onNavigateToDashboard) {
          onNavigateToDashboard();
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Invalid credentials or pending approval.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div id="seller-portal-root" className="min-h-[85vh] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center animate-fade-in">
      {/* Back to Home Navigation Button (Desktop & Mobile) */}
      <div className="w-full mb-3 flex items-center justify-start">
        <button
          type="button"
          id="seller-back-home-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs cursor-pointer group active:scale-95"
        >
          <span className="text-base font-bold leading-none transition-transform group-hover:-translate-x-1">←</span>
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Split-Screen Container Card */}
      <div className="w-full bg-white dark:bg-[#121214] rounded-3xl sm:rounded-[32px] shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col lg:flex-row transition-all duration-300 min-h-[660px]">
        
        {/* ========================================================
            LEFT PANEL: Colorful Gradient Background (Fixed / Sticky)
            ======================================================== */}
        <div className="w-full lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-[#0e0e11] via-[#2b0819] to-[#E91269] text-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Subtle Ambient Glow Overlays */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FF1E82]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E91269]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top Section: Branding & Tagline */}
          <div className="relative z-10 space-y-6">
            {/* ALIKE ND Official Logo */}
            <div className="flex items-center justify-between">
              <Logo size="md" isLightMode={false} />
              
              {/* Merchant Portal Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white/90">
                <Store className="w-3.5 h-3.5 text-[#FF479C]" />
                <span>Merchant Hub</span>
              </div>
            </div>

            {/* Portal Heading & Description */}
            <div className="pt-2 sm:pt-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#FF479C]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ALIKE Merchant Marketplace</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-white leading-tight tracking-tight">
                {mode === 'register' ? 'Join the Alike Marketplace' : 'Welcome Back, Merchant'}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                List and sell your luxury products, electronics, and fashion directly to verified buyers across India.
              </p>
            </div>

            {/* Merchant Highlights */}
            <div className="pt-2 space-y-2.5 hidden sm:block">
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <BadgePercent className="w-3.5 h-3.5" />
                </div>
                <span>5% Commission on introductory boutique collections</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span>Automated logistics & pan-India courier settlements</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Verified buyer network with guaranteed payouts</span>
              </div>
            </div>
          </div>

          {/* Bottom Action: Mode Switcher Pill Button */}
          <div className="relative z-10 pt-6 sm:pt-8 border-t border-white/10 mt-6">
            <div className="text-xs text-neutral-300 mb-2 font-medium">
              {mode === 'register' ? 'Existing registered partner?' : 'Want to sell on Alike?'}
            </div>
            <button
              type="button"
              id="seller-mode-toggle-btn"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMsg('');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs tracking-wide uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>{mode === 'register' ? 'Already a Seller? Sign In' : 'New Merchant? Apply to Sell'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E91269]" />
            </button>
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: White Background with Form Fields
            ======================================================== */}
        <div className="w-full lg:w-[56%] xl:w-[58%] bg-white dark:bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* VIEW 1: REGISTRATION FORM */}
          {mode === 'register' && (
            <div>
              {successSubmitted ? (
                <div className="space-y-6 text-center py-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400/40 shadow-md">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                      Seller Application Submitted!
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                      Thank you for applying to sell with <strong className="text-neutral-900 dark:text-white">ALIKE-ND</strong>.
                      Your storefront application for <strong className="text-amber-600 dark:text-amber-400 font-serif font-bold">{successSubmitted.shopName}</strong> has been saved with status:
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full font-mono text-xs font-bold border border-amber-300 dark:border-amber-700">
                      <Clock className="w-3.5 h-3.5" /> STATUS: PENDING ADMIN APPROVAL
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                      Application Summary
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Shop Name:</span>
                      <span className="col-span-2 font-medium text-neutral-900 dark:text-white">{successSubmitted.shopName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Owner:</span>
                      <span className="col-span-2 font-medium text-neutral-900 dark:text-white">{successSubmitted.ownerName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Email:</span>
                      <span className="col-span-2 font-mono text-neutral-900 dark:text-white">{successSubmitted.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Mobile:</span>
                      <span className="col-span-2 font-mono text-neutral-900 dark:text-white">{successSubmitted.mobileNumber}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Address:</span>
                      <span className="col-span-2 text-neutral-700 dark:text-neutral-300">{successSubmitted.businessAddress}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-800 dark:text-blue-300 text-xs leading-relaxed max-w-md mx-auto">
                    💡 <strong>Next Step:</strong> The Marketplace Administrator will review your details in the Admin Panel. Once approved, you can log in using your registered email and password to access your dedicated Seller Dashboard.
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginEmail(successSubmitted.email);
                        setSuccessSubmitted(null);
                      }}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Go to Seller Login
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Right Panel Header */}
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      Seller Onboarding Application
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Submit your business details for marketplace onboarding. All applications are verified by admin review.
                    </p>
                  </div>

                  {/* Grid of Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Shop Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Shop / Storefront Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-shop-name"
                          type="text"
                          required
                          placeholder="e.g. Zenith Horology, Royal Bengal Silks"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Owner Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Business Owner Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-owner-name"
                          type="text"
                          required
                          placeholder="e.g. Rajesh Sharma"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-mobile"
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Official Business Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-email"
                          type="email"
                          required
                          placeholder="e.g. contact@zenithboutique.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password for Seller Dashboard */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Seller Portal Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Business Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Registered Business / Warehouse Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                        <textarea
                          id="seller-reg-address"
                          required
                          rows={2}
                          placeholder="Street, Suite / Shop Number, City, State, PIN Code"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white resize-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      id="seller-reg-submit-btn"
                      disabled={loading}
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Seller Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW 2: APPROVED SELLER LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto w-full animate-fade-in">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                  Approved Seller Login
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Log in to your approved merchant dashboard to manage your catalog listings and orders.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Seller Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-email"
                      type="email"
                      required
                      placeholder="e.g. seller@boutique.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your seller account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  id="seller-login-submit-btn"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Access Seller Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

