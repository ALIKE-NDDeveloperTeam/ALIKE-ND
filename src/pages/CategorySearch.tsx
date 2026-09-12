import { useState, useMemo } from 'react';
import { SlidersHorizontal, Grid, List, ChevronRight, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

interface CategorySearchProps {
  products: Product[];
  initialCategory?: string;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  wishlistedIds: number[];
  searchQuery?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onBack?: () => void;
  isLightMode?: boolean;
}

export default function CategorySearch({
  products,
  initialCategory = 'all',
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  wishlistedIds,
  searchQuery = '',
  showToast,
  onBack,
  isLightMode = false,
}: CategorySearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isGridView, setIsGridView] = useState<boolean>(true);

  // Category selection handler
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSortBy('relevance');
    showToast('Category reset to all.', 'info');
  };

  // Filter products in memory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category Filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'wholesale') {
            if (!p.isWholesale) return false;
          } else if (selectedCategory === 'luxury') {
            if (p.category !== 'luxury') return false;
          } else if (selectedCategory === 'delivery') {
            if (p.category !== 'delivery') return false;
          } else {
            if (p.category !== selectedCategory) return false;
          }
        }

        // Search Query Filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
          const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
          if (!matchName && !matchBrand && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.id - a.id; // simulation
        return 0; // relevance
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div id="category-search-root" className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumbs with Back button */}
      <div className="flex items-center gap-4 pb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 border border-solid border-neutral-800 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-850 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
            title="Go Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <span className="hover:text-white cursor-pointer" onClick={() => handleCategorySelect('all')}>Alike Marketplace</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-white uppercase tracking-wider font-semibold">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All Items'}
          </span>
          {searchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-neutral-400 italic">Searched: "{searchQuery}"</span>
            </>
          )}
        </div>
      </div>

      <div className="w-full">
        {/* Main: Search Results / Sorting & Grid list */}
        <section className="w-full space-y-6">
          <div className={`p-4 border rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] shadow-sm' 
              : 'bg-neutral-900 border-neutral-850'
          }`}>
            <div className="space-y-1">
              <h2 className={`text-md sm:text-lg font-bold uppercase tracking-wide ${
                isLightMode ? 'text-neutral-900' : 'text-white'
              }`}>
                Showing {filteredProducts.length} Luxury Item{filteredProducts.length !== 1 ? 's' : ''}
              </h2>
              <p className={`text-xs ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Curated specifically according to strict client preferences</p>
            </div>

            {/* Sorting and view option toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  id="sort-select-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold appearance-none pr-9 cursor-pointer transition-all border shadow-2xs focus:outline-none ${
                    isLightMode
                      ? 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400 focus:border-[#F5A623]'
                      : 'bg-[#0B1B32] text-neutral-100 border-[#162744] hover:border-[#F5A623]/40 focus:border-[#F5A623]'
                  }`}
                  title="Sort Order"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: Highest Elite</option>
                  <option value="newest">Catalog: New Arrival</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#F5A623]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Grid / List controls */}
              <div className={`flex p-1 rounded-xl border shadow-2xs items-center ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-300'
                  : 'bg-[#0B1B32] border-[#162744]'
              }`}>
                <button
                  id="toggle-grid-view"
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    isGridView 
                      ? isLightMode
                        ? 'bg-white text-[#B48C28] shadow-xs font-bold'
                        : 'bg-[#F5A623]/20 text-[#F5A623] shadow-xs font-bold border border-[#F5A623]/40'
                      : isLightMode
                        ? 'text-neutral-500 hover:text-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Grid visual layout"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="toggle-list-view"
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    !isGridView 
                      ? isLightMode
                        ? 'bg-white text-[#B48C28] shadow-xs font-bold'
                        : 'bg-[#F5A623]/20 text-[#F5A623] shadow-xs font-bold border border-[#F5A623]/40'
                      : isLightMode
                        ? 'text-neutral-500 hover:text-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="List details layout"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty Search Fallback */}
          {filteredProducts.length === 0 ? (
            <div id="empty-search-state" className={`p-16 border border-dashed rounded-3xl text-center space-y-4 ${
              isLightMode ? 'border-neutral-300 bg-neutral-50/50' : 'border-neutral-800 bg-neutral-900/30'
            }`}>
              <span className={`inline-flex p-5 rounded-full border ${
                isLightMode ? 'bg-white border-neutral-200 text-[#F5A623]' : 'bg-neutral-950 border-neutral-800 text-[#F5A623]'
              }`}>
                <SlidersHorizontal className="w-8.5 h-8.5 animate-spin" />
              </span>
              <div className="space-y-1">
                <h3 className={`text-lg font-bold ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>No Matching Luxury Items Found</h3>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  We could not locate items meeting these parameters. Try clearing the search query or selecting another collection.
                </p>
              </div>
              <button
                id="reset-filters-empty"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-[#F5A623] to-[#D4AF37] hover:brightness-110 text-[#0A0F24] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reset Catalog
              </button>
            </div>
          ) : (
            /* Products display based on layout view */
            <div
              id="marketplace-products-list"
              className={
                isGridView
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 items-stretch'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((p) => {
                const isWishlisted = wishlistedIds.includes(p.id);
                if (isGridView) {
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
                } else {
                  // Interactive List view
                  const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                  return (
                    <div
                      key={p.id}
                      id={`list-item-${p.id}`}
                      className={`group p-4 border rounded-2xl flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isLightMode 
                          ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]' 
                          : 'bg-neutral-900 border-neutral-850 hover:border-[#F5A623]/50'
                      }`}
                      onClick={() => onSelectProduct(p)}
                    >
                      <div className={`w-full sm:w-40 aspect-square rounded-xl overflow-hidden cursor-pointer shrink-0 ${
                        isLightMode ? 'bg-neutral-100' : 'bg-neutral-950'
                      }`}>
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] text-[#B48C28] dark:text-[#F5A623] font-mono tracking-widest font-extrabold block uppercase">{p.brand}</span>
                              <h3 className={`text-md font-bold mt-0.5 leading-tight transition-colors ${
                                isLightMode ? 'text-neutral-900 group-hover:text-amber-800' : 'text-white group-hover:text-[#F5A623]'
                              }`}>{p.name}</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                              {discountPercent}% OFF
                            </span>
                          </div>
                          <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                            isLightMode ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            {p.description}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-black ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-neutral-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                          </div>
                          <button
                            id={`list-btn-add-${p.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(p);
                            }}
                            className="px-4.5 py-2 bg-gradient-to-r from-[#F5A623] to-[#D4AF37] hover:brightness-110 text-[#0A0F24] font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
