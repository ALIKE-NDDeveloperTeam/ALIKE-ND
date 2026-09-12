import React, { useState } from 'react';
import { Eye, Heart, GitCompare, ShoppingCart, Star, PackageOpen, Check, Store } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  isWishlisted: boolean;
  key?: number | string;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  isWishlisted,
}: ProductCardProps) {
  const { id, name, brand, price, mrp, rating, reviewsCount, image, badge } = product;
  const [imageError, setImageError] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  // Calculate discount percentage
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  // Stock Indicator logic (respects database/admin defined stockStatus & stock)
  const getStockStatus = (p: Product) => {
    if (p.stockStatus) {
      const isOut = p.stockStatus.toLowerCase().includes('out of stock') || p.stock === 0;
      const isLow = p.stockStatus.toLowerCase().includes('left') || (p.stock !== undefined && p.stock <= 3 && p.stock > 0);
      const isExpress = p.stockStatus.toLowerCase().includes('express') || p.stockStatus.toLowerCase().includes('delivery');
      
      let badgeClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-bold';
      if (isOut) {
        badgeClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-bold';
      } else if (isLow) {
        badgeClass = 'text-amber-500 bg-amber-500/10 border-amber-500/25 font-bold animate-pulse';
      } else if (isExpress) {
        badgeClass = 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25 font-bold';
      }
      return { label: p.stockStatus, class: badgeClass, isOut };
    }

    const pId = p.id || 1;
    if (p.stock !== undefined && p.stock <= 0) {
      return { label: 'Out of Stock', class: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-bold', isOut: true };
    }
    if (pId % 4 === 0) return { label: 'Only 2 left!', class: 'text-amber-500 bg-amber-500/10 border-amber-500/25 font-bold animate-pulse', isOut: false };
    if (pId % 3 === 0) return { label: '20-Min Express', class: 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25 font-bold', isOut: false };
    return { label: 'In Stock', class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-bold', isOut: false };
  };
  const stock = getStockStatus(product);

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div
      id={`product-card-${id}`}
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col w-full bg-white dark:bg-neutral-900 border border-solid border-neutral-200/90 dark:border-neutral-800 hover:border-[#F5A623] dark:hover:border-[#F5A623] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* 1. Image Container (Balanced 4:3 aspect ratio) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-950 shrink-0">
        {/* Badge positioned inside image container */}
        {badge && (
          <span
            id={`product-badge-${id}`}
            className={`absolute top-2 left-2 z-10 px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-md shadow-md backdrop-blur-xs ${
              badge === 'HOT'
                ? 'bg-red-600 text-white shadow-red-600/30'
                : badge === 'SALE'
                ? 'bg-amber-500 text-black shadow-amber-500/30'
                : badge === 'NEW'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-black text-white dark:bg-white dark:text-black'
            }`}
          >
            {badge}
          </span>
        )}

        {!imageError && image ? (
          <img
            id={`product-image-${id}`}
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            width="320"
            height="240"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 block"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-600 gap-1.5 p-3">
            <PackageOpen className="w-6 h-6 opacity-40 text-neutral-400" />
            <span className="text-[9px] font-mono text-neutral-400 font-bold">{brand}</span>
          </div>
        )}

        {/* Action Buttons overlay positioned inside image container */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10">
          <button
            id={`wishlist-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500 hover:text-red-600' : ''}`} />
          </button>
          <button
            id={`quickview-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) {
                onQuickView(product);
              } else {
                onSelectProduct(product);
              }
            }}
            className="p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            id={`compare-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCompare(product);
            }}
            className="p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
            title="Compare Product"
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Content Container (Spacious, elegant, with readable 2-line title) */}
      <div className="flex flex-col flex-1 p-3 bg-white dark:bg-neutral-900 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <span className="text-[8.5px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-extrabold font-mono truncate block">
            {brand}
          </span>
          {/* Stock Badge */}
          <span className={`px-1.5 py-0.5 text-[7.5px] sm:text-[8px] font-bold rounded-full border border-solid shrink-0 ${stock.class}`}>
            {stock.label}
          </span>
        </div>
        
        {/* Product Title: 2 lines with consistent height so titles are never clipped abruptly */}
        <h3
          id={`product-title-${id}`}
          className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2 h-8 sm:h-9 mb-1.5"
          title={name}
        >
          {name}
        </h3>

        {/* Rating and Discount Row */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1" id={`product-reviews-${id}`}>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-extrabold text-neutral-800 dark:text-neutral-200">{rating.toFixed(1)}</span>
            <span className="text-neutral-400 text-[9px]">({reviewsCount})</span>
          </div>

          {discountPercent > 0 && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20 shrink-0">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Price & MRP Row */}
        <div className="mt-auto flex items-baseline gap-1.5 min-w-0 mb-1.5">
          <span className="text-sm sm:text-base font-black text-neutral-950 dark:text-white truncate" id={`price-${id}`}>
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-neutral-400 line-through truncate font-medium" id={`mrp-${id}`}>
            ₹{mrp.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Sold By Merchant Display */}
        <div className="flex items-center gap-1 text-[9.5px] text-neutral-500 dark:text-neutral-400 truncate mb-2">
          <Store className="w-3 h-3 text-amber-600/80 dark:text-amber-400/80 shrink-0" />
          <span className="truncate">
            Sold by: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.sellerShopName || 'ALIKE-ND Official'}</span>
          </span>
        </div>

        {/* Sleek Action Button */}
        <button
          id={`add-to-cart-card-${id}`}
          type="button"
          onClick={handleCartClick}
          disabled={stock.isOut}
          className={`w-full py-2 px-3 border border-solid rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-[10px] sm:text-[11px] tracking-wider font-extrabold active:scale-[0.96] ${
            stock.isOut
              ? 'bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 cursor-not-allowed'
              : addedAnim
              ? 'bg-emerald-500 border-emerald-400 text-black scale-[0.98] shadow-emerald-500/30 font-black'
              : 'bg-[#0d0d0d] hover:bg-black text-white border-[#0d0d0d] hover:shadow-md cursor-pointer'
          }`}
        >
          {stock.isOut ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 opacity-60" />
              <span>Sold Out</span>
            </>
          ) : addedAnim ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5] text-[#0F1A3C]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

