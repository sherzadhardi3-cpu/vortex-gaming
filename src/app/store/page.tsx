'use client';

// VORTEX GAMING — Production Digital Game Store & Catalog
// Comprehensive grid, category sidebar, live search, multi-criteria filtering, sorting, and responsive drawer

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  Gamepad2,
  RotateCcw,
  Check,
  Flame,
} from 'lucide-react';
import { GAMES_CATALOG, type GameItem } from '@/lib/data/games';
import { PLATFORMS, GENRES, REGIONS } from '@/lib/constants';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useTranslation } from '@/lib/i18n';

function StoreCatalogContent() {
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get('platform') || 'all';
  const initialGenre = searchParams.get('genre') || 'all';
  const initialType = searchParams.get('type') || 'all';

  const { t } = useTranslation();
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialPlatform);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'title'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Filter & sort logic
  const filteredGames = useMemo(() => {
    let result = [...GAMES_CATALOG];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.platformName.toLowerCase().includes(q) ||
          g.publisher.toLowerCase().includes(q) ||
          g.genre.some((gn) => gn.toLowerCase().includes(q))
      );
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      result = result.filter((g) => g.platform === selectedPlatform);
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((g) => g.genre.includes(selectedGenre));
    }

    // Product Type filter (GAME, DLC, GIFT_CARD, SUBSCRIPTION)
    if (selectedType !== 'all') {
      result = result.filter((g) => g.productType === selectedType);
    }

    // Region filter
    if (selectedRegion !== 'all') {
      result = result.filter((g) => g.activationRegion === selectedRegion);
    }

    // In-Stock only filter
    if (inStockOnly) {
      result = result.filter((g) => g.stockCount > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [searchQuery, selectedPlatform, selectedGenre, selectedType, selectedRegion, inStockOnly, sortBy]);

  const handleAddToCart = (game: GameItem) => {
    addItem(game);
    setAddedItemIds((prev) => ({ ...prev, [game.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [game.id]: false }));
    }, 1800);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedGenre('all');
    setSelectedType('all');
    setSelectedRegion('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const isFiltered =
    searchQuery ||
    selectedPlatform !== 'all' ||
    selectedGenre !== 'all' ||
    selectedType !== 'all' ||
    selectedRegion !== 'all' ||
    inStockOnly;

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Store Title & Quick Tagline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL DIGITAL CATALOG</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              {t('store.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#a0a0b8] mt-1 max-w-xl">
              {t('store.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0b8] font-mono">
              Showing <strong className="text-white">{filteredGames.length}</strong> of {GAMES_CATALOG.length} games
            </span>
          </div>
        </div>

        {/* Top Control Bar: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12121a] p-3 sm:p-4 rounded-2xl border border-white/10">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, publisher, genre..."
              className="w-full h-10 pl-10 pr-4 bg-[#0a0a0f] text-xs text-white placeholder-[#6b6b80] rounded-xl border border-white/10 focus:border-[#00d4ff] outline-none"
            />
            <Search className="w-4 h-4 text-[#6b6b80] absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#6b6b80] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls Right */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00d4ff]" />
              <span>{t('store.filters')}</span>
              {isFiltered && <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />}
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#a0a0b8] hidden sm:inline">{t('store.sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 bg-[#0a0a0f] text-xs text-white border border-white/10 rounded-xl outline-none focus:border-[#00d4ff]"
              >
                <option value="featured">{t('store.sortFeatured')}</option>
                <option value="price-asc">{t('store.sortPriceAsc')}</option>
                <option value="price-desc">{t('store.sortPriceDesc')}</option>
                <option value="newest">{t('store.sortNewest')}</option>
                <option value="title">{t('store.sortTitle')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Store Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-[#12121a] p-6 rounded-3xl border border-white/10 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00d4ff]" />
                <span>{t('store.filters')}</span>
              </h3>
              {isFiltered && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('store.clearFilters')}</span>
                </button>
              )}
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                Platform
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPlatform === 'all'
                      ? 'bg-[#00d4ff] text-black font-bold'
                      : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('store.allPlatforms')}
                </button>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedPlatform === p.slug
                        ? 'bg-[#00d4ff] text-black font-bold'
                        : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </span>
                    <span className="text-[10px] opacity-60">
                      {GAMES_CATALOG.filter((g) => g.platform === p.slug).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type Filter */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                Product Type
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: t('store.allTypes') },
                  { id: 'GAME', label: 'Full Games' },
                  { id: 'DLC', label: 'DLCs & Expansions' },
                  { id: 'GIFT_CARD', label: 'Gift Cards' },
                  { id: 'SUBSCRIPTION', label: 'Passes & Top-Ups' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedType === type.id
                        ? 'bg-[#00d4ff] text-black font-bold'
                        : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full h-9 px-3 bg-[#0a0a0f] text-xs text-white border border-white/10 rounded-xl outline-none focus:border-[#00d4ff]"
              >
                <option value="all">{t('store.allGenres')}</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">
                Activation Region
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedRegion('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs text-center font-medium transition-colors ${
                    selectedRegion === 'all'
                      ? 'bg-[#00d4ff] text-black font-bold'
                      : 'bg-white/5 text-[#a0a0b8] hover:text-white'
                  }`}
                >
                  All
                </button>
                {['GLOBAL', 'NA', 'EU', 'ME'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs text-center font-medium transition-colors ${
                      selectedRegion === reg
                        ? 'bg-[#00d4ff] text-black font-bold'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-semibold">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0a0f] border-white/20 text-[#00d4ff] focus:ring-0"
                />
                <span>{t('store.inStockOnly')}</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area (3 Columns on desktop) */}
          <div className="lg:col-span-3">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGames.map((game) => {
                  const inWishlist = isInWishlist(game.id);
                  const isAdded = !!addedItemIds[game.id];

                  return (
                    <div
                      key={game.id}
                      className="group rounded-3xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between overflow-hidden relative"
                    >
                      {/* Product Header / Cover Image Banner */}
                      <Link href={`/game/${game.slug}`} className="block relative overflow-hidden">
                        <div
                          className={`w-full h-48 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative`}
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                              {game.platformName}
                            </span>
                            {game.discountPercent > 0 && (
                              <span className="px-2 py-0.5 rounded-xl bg-rose-500 text-white text-[11px] font-extrabold shadow-lg">
                                -{game.discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Bottom Banner Indicators */}
                          <div className="flex items-center justify-between z-10">
                            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                              {game.activationRegion}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('store.instantKey')}</span>
                            </span>
                          </div>

                          {/* Hover Gradient Overlay */}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#6b6b80] font-mono">
                            <span>{game.genre.slice(0, 2).join(' • ')}</span>
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{game.rating.toFixed(1)}</span>
                            </span>
                          </div>

                          <Link
                            href={`/game/${game.slug}`}
                            className="text-base font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1 block"
                          >
                            {game.title}
                          </Link>

                          <div className="text-[11px] text-[#a0a0b8]">
                            Publisher: <span className="text-white font-medium">{game.publisher}</span>
                          </div>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-lg font-black text-white font-mono leading-none">
                              {format(game.priceUSD, game.priceIQD)}
                            </div>
                            {game.discountPercent > 0 && (
                              <div className="text-[11px] text-[#6b6b80] line-through font-mono mt-0.5">
                                {format(game.originalPriceUSD, game.originalPriceIQD)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Wishlist Button */}
                            <button
                              onClick={() => toggleWishlist(game)}
                              className={`p-2.5 rounded-xl border transition-all ${
                                inWishlist
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  : 'bg-white/5 text-[#a0a0b8] hover:text-white border-white/10'
                              }`}
                              title="Toggle Wishlist"
                            >
                              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-400' : ''}`} />
                            </button>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => handleAddToCart(game)}
                              disabled={game.stockCount === 0}
                              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                                isAdded
                                  ? 'bg-emerald-400 text-black shadow-emerald-400/20'
                                  : 'bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black shadow-[#00d4ff]/20'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t('store.added')}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>{t('store.addToCart')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Search State */
              <div className="p-12 rounded-3xl bg-[#12121a] border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00d4ff] mx-auto">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">{t('store.noResults')}</h3>
                <p className="text-xs text-[#a0a0b8] max-w-md mx-auto">
                  {t('store.noResultsDesc')}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase"
                >
                  {t('store.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs h-full bg-[#12121a] p-6 space-y-6 overflow-y-auto border-l border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00d4ff]" />
                <span>{t('store.filters')}</span>
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Platform */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full h-10 px-3 bg-[#0a0a0f] text-xs text-white border border-white/10 rounded-xl outline-none"
              >
                <option value="all">{t('store.allPlatforms')}</option>
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Genre */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full h-10 px-3 bg-[#0a0a0f] text-xs text-white border border-white/10 rounded-xl outline-none"
              >
                <option value="all">{t('store.allGenres')}</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Region */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-10 px-3 bg-[#0a0a0f] text-xs text-white border border-white/10 rounded-xl outline-none"
              >
                <option value="all">{t('store.allRegions')}</option>
                {['GLOBAL', 'NA', 'EU', 'ME'].map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase"
              >
                Apply Filters ({filteredGames.length})
              </button>
              {isFiltered && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-[#a0a0b8]"
                >
                  {t('store.clearFilters')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreCatalogPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-white">Loading Catalog...</div>}>
      <StoreCatalogContent />
    </Suspense>
  );
}
