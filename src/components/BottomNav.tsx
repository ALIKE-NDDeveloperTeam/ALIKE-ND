import React from 'react';
import { Home, Grid, ShoppingCart, Heart, User } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface BottomNavProps {
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  user: UserProfile | null;
  isLightMode: boolean;
  onNavigate: (view: string, category?: string) => void;
  onOpenAuthModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  cartCount,
  wishlistCount,
  user,
  isLightMode,
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-solid transition-colors duration-300 backdrop-blur-xl ${
        isLightMode
          ? 'bg-white/95 border-neutral-200 text-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
          : 'bg-black/95 border-neutral-800 text-white shadow-[0_-4px_25px_rgba(0,0,0,0.8)]'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {/* Home Tab */}
        <button
          id="bottom-nav-home"
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'home'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Categories Tab */}
        <button
          id="bottom-nav-categories"
          type="button"
          onClick={() => onNavigate('search')}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'category_search' || currentView === 'search'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Grid className={`w-5 h-5 ${currentView === 'category_search' || currentView === 'search' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* Cart Tab */}
        <button
          id="bottom-nav-cart"
          type="button"
          onClick={() => onNavigate('cart')}
          className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'cart'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${currentView === 'cart' ? 'scale-110' : ''} transition-transform`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1.5 -right-2 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow ${
                isLightMode ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>

        {/* Wishlist Tab */}
        <button
          id="bottom-nav-wishlist"
          type="button"
          onClick={() => onNavigate('wishlist')}
          className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'wishlist'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentView === 'wishlist' ? (isLightMode ? 'scale-110 fill-black text-black' : 'scale-110 fill-white text-white') : ''} transition-transform`} />
            {wishlistCount > 0 && (
              <span className={`absolute -top-1.5 -right-2 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow ${
                isLightMode ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* User Account Tab */}
        <button
          id="bottom-nav-account"
          type="button"
          onClick={() => (user ? onNavigate('profile') : onOpenAuthModal())}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'profile'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 ${currentView === 'profile' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight truncate max-w-[56px]">
            {user ? user.name.split(' ')[0] : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
};
