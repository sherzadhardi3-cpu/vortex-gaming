'use client';

// VORTEX GAMING — Production Digital Game Store & Catalog
// Category sidebar, multi-platform filter, currency-aware price range, sort, grid/list view, uniform artwork cards & pagination

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  X,
  Gamepad2,
  RotateCcw,
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  Headphones,
  LayoutGrid,
  List,
  Gift,
  Apple,
  RefreshCw,
  UserCheck,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { GAMES_CATALOG, type GameItem } from '@/lib/data/games';
import { PLATFORMS } from '@/lib/constants';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useTranslation, type TranslationDictionary } from '@/lib/i18n';

interface CategoryOption {
  id: string;
  labelKey: keyof TranslationDictionary;
  icon: React.ComponentType<{ className?: string }>;
  isApple?: boolean;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', labelKey: 'nav.allProducts', icon: LayoutGrid },
  { id: 'games', labelKey: 'nav.games', icon: Gamepad2 },
  { id: 'gift-cards', labelKey: 'nav.giftCards', icon: Gift },
  { id: 'itunes', labelKey: 'nav.itunes', icon: Apple, isApple: true },
  { id: 'subscriptions', labelKey: 'nav.subscriptions', icon: RefreshCw },
  { id: 'game-accounts', labelKey: 'nav.gameAccounts', icon: UserCheck },
  { id: 'pc-games', labelKey: 'nav.pcGames', icon: Monitor },
  { id: 'top-ups', labelKey: 'nav.topUps', icon: Zap },
];

const ITEMS_PER_PAGE = 12;

function matchesCategory(game: GameItem, category: string): boolean {
  if (category === 'all') return true;
  if (category === 'games') {
    return game.category === 'games' || game.productType === 'GAME' || game.productType === 'DLC';
  }
  if (category === 'gift-cards') {
    return game.category === 'gift-cards' || game.productType === 'GIFT_CARD';
  }
  if (category === 'itunes') {
    return (
      game.category === 'itunes' ||
      game.productType === 'ITUNES' ||
      game.tags.some((t) => t.toLowerCase() === 'itunes') ||
      game.title.toLowerCase().includes('itunes')
    );
  }
  if (category === 'subscriptions') {
    return game.category === 'subscriptions' || game.productType === 'SUBSCRIPTION';
  }
  if (category === 'game-accounts') {
    return (
      game.category === 'game-accounts' ||
      game.productType === 'GAME_ACCOUNT' ||
      game.title.toLowerCase().includes('account')
    );
  }
  if (category === 'pc-games') {
    return (
      game.category === 'pc-games' ||
      ['steam', 'epic', 'rockstar', 'ea', 'ubisoft'].includes(game.platform)
    );
  }
  if (category === 'top-ups') {
    return game.category === 'top-ups' || game.productType === 'TOP_UP';
  }
  return true;
}

function getProductBadge(game: GameItem) {
  if (game.productType === 'GIFT_CARD') {
    return { label: 'GIFT CARD', bg: 'bg-rose-600 text-white shadow-rose-600/30' };
  }
  if (game.productType === 'GAME_ACCOUNT') {
    return { label: 'GAME ACCOUNT', bg: 'bg-[#00d4ff] text-black font-black shadow-[#00d4ff]/30' };
  }
  if (game.productType === 'SUBSCRIPTION') {
    return { label: 'SUBSCRIPTION', bg: 'bg-[#0070f3] text-white shadow-[#0070f3]/30' };
  }
  if (game.productType === 'ITUNES') {
    return { label: 'ITUNES', bg: 'bg-zinc-200 text-black font-black shadow-white/20' };
  }
  if (game.productType === 'TOP_UP') {
    return { label: 'TOP-UP', bg: 'bg-amber-500 text-black font-black shadow-amber-500/30' };
  }
  if (
    ['steam', 'epic', 'rockstar', 'ea', 'ubisoft'].includes(game.platform) &&
    game.productType === 'GAME'
  ) {
    return { label: 'PC GAME', bg: 'bg-purple-600 text-white shadow-purple-600/30' };
  }
  if (game.productType === 'DLC') {
    return { label: 'DLC', bg: 'bg-indigo-600 text-white shadow-indigo-600/30' };
  }
  return {
    label: game.platformName.toUpperCase(),
    bg: 'bg-white/20 text-white backdrop-blur-md',
  };
}

function StoreCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { currency, format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Initial params
  const initialCategory = searchParams.get('category') || 'all';
  const initialPlatform = searchParams.get('platform');
  const initialPlatforms = initialPlatform ? initialPlatform.split(',').filter(Boolean) : [];
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSort = (searchParams.get('sort') as any) || 'featured';
  const initialView = (searchParams.get('view') as 'grid' | 'list') || 'grid';
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialPlatforms);
  const [minPriceInput, setMinPriceInput] = useState<string>(initialMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialMaxPrice);
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(
    initialMinPrice ? parseFloat(initialMinPrice) : null
  );
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(
    initialMaxPrice ? parseFloat(initialMaxPrice) : null
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest' | 'title'>(
    initialSort
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [currentPage, setCurrentPage] = useState<number>(initialPage > 0 ? initialPage : 1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Sync category when URL search parameter changes externally (e.g. from secondary nav clicks)
  useEffect(() => {
    const urlCat = searchParams.get('category') || 'all';
    if (urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Update browser URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedPlatforms.length > 0) params.set('platform', selectedPlatforms.join(','));
    if (appliedMinPrice !== null) params.set('minPrice', appliedMinPrice.toString());
    if (appliedMaxPrice !== null) params.set('maxPrice', appliedMaxPrice.toString());
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (currentPage > 1) params.set('page', currentPage.toString());

    const qs = params.toString();
    const newUrl = qs ? `/store?${qs}` : '/store';
    window.history.replaceState(null, '', newUrl);
  }, [
    selectedCategory,
    selectedPlatforms,
    appliedMinPrice,
    appliedMaxPrice,
    sortBy,
    viewMode,
    searchQuery,
    currentPage,
  ]);

  // Toggle platform selection
  const togglePlatform = (slug: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
    setCurrentPage(1);
  };

  // Apply price range filter
  const applyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const min = minPriceInput ? parseFloat(minPriceInput) : null;
    const max = maxPriceInput ? parseFloat(maxPriceInput) : null;
    setAppliedMinPrice(min !== null && !isNaN(min) ? min : null);
    setAppliedMaxPrice(max !== null && !isNaN(max) ? max : null);
    setCurrentPage(1);
  };

  const clearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPlatforms([]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    selectedPlatforms.length > 0 ||
    appliedMinPrice !== null ||
    appliedMaxPrice !== null ||
    inStockOnly ||
    searchQuery.trim() !== '' ||
    sortBy !== 'featured';

  // Filter & sort products
  const filteredGames = useMemo(() => {
    let result = [...GAMES_CATALOG];

    // Category filter
    result = result.filter((g) => matchesCategory(g, selectedCategory));

    // Platform multi-select filter
    if (selectedPlatforms.length > 0) {
      result = result.filter((g) => {
        return (
          selectedPlatforms.includes(g.platform) ||
          selectedPlatforms.some((sp) => {
            const foundPlat = PLATFORMS.find((p) => p.slug === sp || p.id === sp);
            return foundPlat && (g.platform === foundPlat.id || g.platform === foundPlat.slug);
          })
        );
      });
    }

    // Price range filter (currency-aware)
    if (appliedMinPrice !== null || appliedMaxPrice !== null) {
      result = result.filter((g) => {
        const itemPrice = currency === 'USD' ? g.priceUSD / 100 : g.priceIQD;
        if (appliedMinPrice !== null && itemPrice < appliedMinPrice) return false;
        if (appliedMaxPrice !== null && itemPrice > appliedMaxPrice) return false;
        return true;
      });
    }

    // In-Stock filter
    if (inStockOnly) {
      result = result.filter((g) => g.stockCount > 0);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.platformName.toLowerCase().includes(q) ||
          g.publisher.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.genre.some((gn) => gn.toLowerCase().includes(q))
      );
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
        result.sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
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
  }, [
    selectedCategory,
    selectedPlatforms,
    appliedMinPrice,
    appliedMaxPrice,
    inStockOnly,
    searchQuery,
    sortBy,
    currency,
  ]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pagedGames = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, activePage]);

  const handleAddToCart = (game: GameItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem(game);
    setAddedItemIds((prev) => ({ ...prev, [game.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [game.id]: false }));
    }, 1800);
  };

  const handleToggleWishlist = (game: GameItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(game);
  };

  // Get active category title for header
  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);
  const categoryTitle = activeCategoryObj ? t(activeCategoryObj.labelKey) : t('store.title');

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#07070a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── 1. TOP TRUST BADGES STRIP (As in Reference Screenshot) ── */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/5 rtl:divide-x-reverse">
            {/* Feature 1: Instant Delivery */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {t('trust.instantDelivery')}
                </div>
                <div className="text-[11px] text-[#a0a0b8] leading-tight">
                  {t('trust.instantDeliveryDesc')}
                </div>
              </div>
            </div>

            {/* Feature 2: 100% Original */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 rtl:sm:pl-0 rtl:sm:pr-6">
              <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {t('trust.genuineProducts')}
                </div>
                <div className="text-[11px] text-[#a0a0b8] leading-tight">
                  {t('trust.genuineProductsDesc')}
                </div>
              </div>
            </div>

            {/* Feature 3: Secure Payment */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 rtl:sm:pl-0 rtl:sm:pr-6">
              <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {t('trust.securePayment')}
                </div>
                <div className="text-[11px] text-[#a0a0b8] leading-tight">
                  {t('trust.securePaymentDesc')}
                </div>
              </div>
            </div>

            {/* Feature 4: 24/7 Support */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 rtl:sm:pl-0 rtl:sm:pr-6">
              <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {t('trust.support')}
                </div>
                <div className="text-[11px] text-[#a0a0b8] leading-tight">
                  {t('trust.supportDesc')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN CATALOG LAYOUT: LEFT SIDEBAR + PRODUCTS AREA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── DESKTOP LEFT SIDEBAR ── */}
          <aside className="hidden lg:block space-y-6 bg-[#101018] p-5 rounded-2xl border border-white/10 sticky top-28 shadow-xl">
            {/* Categories Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t('catalog.categories')}
                </h3>
              </div>

              <div className="space-y-1 pt-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  const count = GAMES_CATALOG.filter((g) => matchesCategory(g, cat.id)).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#0070f3] text-white shadow-md shadow-[#0070f3]/30 font-bold'
                          : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-[#00d4ff]'
                          }`}
                        />
                        <span className="truncate">{t(cat.labelKey)}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-white/5 text-[#6b6b80]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters Section */}
            <div className="pt-4 border-t border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>{t('store.filters')}</span>
                </h3>
                {isFiltered && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('catalog.clearFilters')}</span>
                  </button>
                )}
              </div>

              {/* Platform Checkboxes */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider">
                  {t('catalog.platformFilters')}
                </label>
                <div className="space-y-1.5">
                  {PLATFORMS.map((p) => {
                    const isChecked = selectedPlatforms.includes(p.slug);
                    const count = GAMES_CATALOG.filter(
                      (g) => g.platform === p.id || g.platform === p.slug
                    ).length;

                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-white/10 text-white font-bold' : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePlatform(p.slug)}
                            className="w-4 h-4 rounded border-white/20 bg-[#07070a] text-[#0070f3] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm">{p.icon}</span>
                            <span>{p.name}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6b6b80]">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range (IQD / USD) */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider">
                    {t('catalog.priceRange')} ({currency})
                  </label>
                  {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                    <button
                      onClick={clearPriceFilter}
                      className="text-[10px] text-[#00d4ff] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <form onSubmit={applyPriceFilter} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder={t('catalog.minPrice')}
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full h-8 px-2.5 bg-[#07070a] text-xs text-white placeholder-[#6b6b80] rounded-lg border border-white/10 focus:border-[#0070f3] outline-none"
                    />
                    <input
                      type="number"
                      placeholder={t('catalog.maxPrice')}
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full h-8 px-2.5 bg-[#07070a] text-xs text-white placeholder-[#6b6b80] rounded-lg border border-white/10 focus:border-[#0070f3] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-[#0070f3] hover:bg-[#0060df] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    {t('catalog.applyFilter')}
                  </button>
                </form>
              </div>

              {/* In-Stock Only Toggle */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white font-semibold">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-[#07070a] text-[#0070f3] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t('catalog.inStockOnly')}</span>
                </label>
              </div>
            </div>
          </aside>

          {/* ── PRODUCTS MAIN AREA ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Strip: Title, Subtitle, Search, Sort & View Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white capitalize">
                  {categoryTitle}
                </h1>
                <p className="text-xs text-[#a0a0b8] mt-0.5">
                  {t('store.subtitle')}
                </p>
              </div>

              {/* Controls Bar */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>{t('store.filters')}</span>
                  {isFiltered && <span className="w-2 h-2 rounded-full bg-[#0070f3]" />}
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs bg-[#101018] border border-white/10 rounded-xl px-2.5 py-1">
                  <span className="text-[#a0a0b8] hidden sm:inline">{t('store.sortBy')}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs text-white outline-none cursor-pointer py-1 font-semibold"
                  >
                    <option value="featured" className="bg-[#101018] text-white">
                      {t('store.sortFeatured')}
                    </option>
                    <option value="newest" className="bg-[#101018] text-white">
                      {t('store.sortNewest')}
                    </option>
                    <option value="price-asc" className="bg-[#101018] text-white">
                      {t('store.sortPriceAsc')}
                    </option>
                    <option value="price-desc" className="bg-[#101018] text-white">
                      {t('store.sortPriceDesc')}
                    </option>
                    <option value="title" className="bg-[#101018] text-white">
                      {t('store.sortTitle')}
                    </option>
                  </select>
                </div>

                {/* View Mode Switcher: Grid / List */}
                <div className="flex items-center bg-[#101018] border border-white/10 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#0070f3] text-white shadow-sm'
                        : 'text-[#a0a0b8] hover:text-white'
                    }`}
                    title={t('catalog.viewGrid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#0070f3] text-white shadow-sm'
                        : 'text-[#a0a0b8] hover:text-white'
                    }`}
                    title={t('catalog.viewList')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search games, gift cards, accounts, subscriptions..."
                className="w-full h-11 pl-11 pr-10 bg-[#101018] text-xs text-white placeholder-[#6b6b80] rounded-xl border border-white/10 focus:border-[#0070f3] outline-none shadow-sm"
              />
              <Search className="w-4 h-4 text-[#6b6b80] absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-[#6b6b80] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active Filters Pill Bar (if any) */}
            {isFiltered && (
              <div className="flex items-center flex-wrap gap-2 pt-1 text-xs">
                <span className="text-[#a0a0b8] text-[11px] font-bold uppercase">Active:</span>
                {selectedCategory !== 'all' && (
                  <span className="px-2.5 py-1 rounded-full bg-[#0070f3]/20 border border-[#0070f3]/40 text-white flex items-center gap-1 text-[11px]">
                    <span>Category: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')}>
                      <X className="w-3 h-3 text-[#00d4ff]" />
                    </button>
                  </span>
                )}
                {selectedPlatforms.map((sp) => (
                  <span
                    key={sp}
                    className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white flex items-center gap-1 text-[11px]"
                  >
                    <span>{sp}</span>
                    <button onClick={() => togglePlatform(sp)}>
                      <X className="w-3 h-3 text-[#00d4ff]" />
                    </button>
                  </span>
                ))}
                {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white flex items-center gap-1 text-[11px]">
                    <span>
                      {currency}: {appliedMinPrice ?? 0} - {appliedMaxPrice ?? '∞'}
                    </span>
                    <button onClick={clearPriceFilter}>
                      <X className="w-3 h-3 text-[#00d4ff]" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#00d4ff] hover:underline font-semibold ml-auto"
                >
                  {t('catalog.clearFilters')}
                </button>
              </div>
            )}

            {/* Product List or Grid */}
            {pagedGames.length > 0 ? (
              viewMode === 'grid' ? (
                /* ── GRID VIEW (Matching Reference Screenshot 3) ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pagedGames.map((game) => {
                    const badge = getProductBadge(game);
                    const inWishlist = isInWishlist(game.id);
                    const isAdded = !!addedItemIds[game.id];

                    return (
                      <div
                        key={game.id}
                        className="group rounded-2xl bg-[#101018] border border-white/10 hover:border-[#0070f3]/60 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/70"
                      >
                        {/* Artwork Banner Container with Uniform Aspect Ratio */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-tr from-slate-900 via-neutral-900 to-black">
                          {/* Background Gradient / Visual Representation */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-tr ${game.bannerGradient} opacity-90 group-hover:scale-105 transition-transform duration-300`}
                          />

                          {/* Subtle Pattern Overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                          {/* Top-Left Category Badge (As in Reference Screenshot) */}
                          <div className="absolute top-3 left-3 z-10">
                            <span
                              className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          {/* Top-Right Wishlist Heart Button */}
                          <button
                            onClick={(e) => handleToggleWishlist(game, e)}
                            className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all ${
                              inWishlist
                                ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50'
                                : 'bg-black/50 text-[#a0a0b8] hover:text-white border border-white/10'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-400' : ''}`} />
                          </button>

                          {/* Bottom Region & Delivery Indicators */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] z-10">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono font-bold border border-white/10">
                              {game.activationRegion}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-emerald-400 font-bold flex items-center gap-1 border border-white/10">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Instant</span>
                            </span>
                          </div>

                          {/* Clickable Overlay Link to Detail Page */}
                          <Link href={`/game/${game.slug}`} className="absolute inset-0 z-0" />
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-[#6b6b80] font-mono">
                              <span>{game.platformName}</span>
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{game.rating.toFixed(1)}</span>
                              </span>
                            </div>

                            <Link
                              href={`/game/${game.slug}`}
                              className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1 block leading-tight"
                            >
                              {game.title}
                            </Link>

                            <p className="text-[11px] text-[#a0a0b8] line-clamp-1">
                              {game.shortDescription}
                            </p>
                          </div>

                          {/* Price & Blue Cart Button (Matching Reference Screenshot) */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <div>
                              <div className="text-base font-extrabold text-white font-mono leading-none flex items-center gap-1">
                                {game.productType === 'GIFT_CARD' ||
                                game.productType === 'GAME_ACCOUNT' ||
                                game.productType === 'TOP_UP' ? (
                                  <span className="text-xs text-[#a0a0b8] font-normal">
                                    {t('catalog.fromPrice')}
                                  </span>
                                ) : null}
                                <span>{format(game.priceUSD, game.priceIQD)}</span>
                              </div>
                              {game.discountPercent > 0 && (
                                <div className="text-[10px] text-[#6b6b80] line-through font-mono mt-0.5">
                                  {format(game.originalPriceUSD, game.originalPriceIQD)}
                                </div>
                              )}
                            </div>

                            {/* Blue Square Cart Button */}
                            <button
                              onClick={(e) => handleAddToCart(game, e)}
                              disabled={game.stockCount === 0}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shadow-md ${
                                isAdded
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                  : 'bg-[#0070f3] hover:bg-[#0060df] text-white shadow-[#0070f3]/25'
                              }`}
                              title={t('store.addToCart')}
                            >
                              {isAdded ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <ShoppingCart className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── LIST VIEW ── */
                <div className="space-y-3">
                  {pagedGames.map((game) => {
                    const badge = getProductBadge(game);
                    const inWishlist = isInWishlist(game.id);
                    const isAdded = !!addedItemIds[game.id];

                    return (
                      <div
                        key={game.id}
                        className="group rounded-2xl bg-[#101018] border border-white/10 hover:border-[#0070f3]/60 transition-all p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Artwork Thumbnail */}
                          <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-gradient-to-tr from-slate-900 to-black">
                            <div
                              className={`absolute inset-0 bg-gradient-to-tr ${game.bannerGradient}`}
                            />
                            <div className="absolute top-1.5 left-1.5 z-10">
                              <span
                                className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <Link href={`/game/${game.slug}`} className="absolute inset-0" />
                          </div>

                          {/* Info */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] text-[#6b6b80] font-mono">
                              <span className="font-bold text-[#00d4ff]">{game.platformName}</span>
                              <span>•</span>
                              <span>{game.activationRegion}</span>
                              <span>•</span>
                              <span className="text-emerald-400">In Stock</span>
                            </div>
                            <Link
                              href={`/game/${game.slug}`}
                              className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors truncate block"
                            >
                              {game.title}
                            </Link>
                            <p className="text-xs text-[#a0a0b8] line-clamp-1">
                              {game.shortDescription}
                            </p>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="text-left sm:text-right">
                            <div className="text-base font-extrabold text-white font-mono">
                              {format(game.priceUSD, game.priceIQD)}
                            </div>
                            {game.discountPercent > 0 && (
                              <div className="text-[10px] text-[#6b6b80] line-through font-mono">
                                {format(game.originalPriceUSD, game.originalPriceIQD)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleWishlist(game, e)}
                              className={`p-2 rounded-xl border transition-all ${
                                inWishlist
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  : 'bg-white/5 text-[#a0a0b8] hover:text-white border-white/10'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-400' : ''}`} />
                            </button>

                            <button
                              onClick={(e) => handleAddToCart(game, e)}
                              disabled={game.stockCount === 0}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shadow-md ${
                                isAdded
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                  : 'bg-[#0070f3] hover:bg-[#0060df] text-white shadow-[#0070f3]/25'
                              }`}
                            >
                              {isAdded ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <ShoppingCart className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* ── EMPTY STATE ── */
              <div className="p-12 rounded-2xl bg-[#101018] border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#0070f3] mx-auto">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">{t('catalog.emptyTitle')}</h3>
                <p className="text-xs text-[#a0a0b8] max-w-md mx-auto">
                  {t('catalog.emptySubtitle')}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#0060df] text-white font-extrabold text-xs transition-all shadow-md shadow-[#0070f3]/25"
                >
                  {t('catalog.browseAll')}
                </button>
              </div>
            )}

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#a0a0b8]">
                  Showing{' '}
                  <strong className="text-white">
                    {(activePage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(activePage * ITEMS_PER_PAGE, filteredGames.length)}
                  </strong>{' '}
                  of <strong className="text-white">{filteredGames.length}</strong> items
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={activePage === 1}
                    className="p-2 rounded-xl bg-[#101018] border border-white/10 text-[#a0a0b8] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => {
                        setCurrentPage(pg);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-xl font-bold transition-all ${
                        activePage === pg
                          ? 'bg-[#0070f3] text-white shadow-md shadow-[#0070f3]/30'
                          : 'bg-[#101018] border border-white/10 text-[#a0a0b8] hover:text-white'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={activePage === totalPages}
                    className="p-2 rounded-xl bg-[#101018] border border-white/10 text-[#a0a0b8] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OUT FILTER DRAWER ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs h-full bg-[#101018] p-6 space-y-6 overflow-y-auto border-l border-white/10">
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

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">
                {t('catalog.categories')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium text-left truncate transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#0070f3] text-white font-bold'
                        : 'bg-white/5 text-[#a0a0b8]'
                    }`}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">
                {t('catalog.platformFilters')}
              </label>
              <div className="space-y-1">
                {PLATFORMS.map((p) => {
                  const isChecked = selectedPlatforms.includes(p.slug);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-xs text-white p-1.5 rounded bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePlatform(p.slug)}
                        className="w-4 h-4 rounded text-[#0070f3]"
                      />
                      <span>{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0a0b8] uppercase">
                {t('catalog.priceRange')} ({currency})
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full h-8 px-2 bg-[#07070a] text-xs text-white rounded border border-white/10"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full h-8 px-2 bg-[#07070a] text-xs text-white rounded border border-white/10"
                />
              </div>
              <button
                onClick={() => applyPriceFilter()}
                className="w-full py-1.5 rounded bg-[#0070f3] text-white text-xs font-bold"
              >
                {t('catalog.applyFilter')}
              </button>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-[#0070f3] hover:bg-[#0060df] text-white font-extrabold text-xs uppercase shadow-md shadow-[#0070f3]/25"
              >
                View Results ({filteredGames.length})
              </button>
              {isFiltered && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-[#a0a0b8]"
                >
                  {t('catalog.clearFilters')}
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
    <Suspense
      fallback={
        <div className="pt-32 text-center text-white min-h-screen bg-[#07070a]">
          Loading Catalog...
        </div>
      }
    >
      <StoreCatalogContent />
    </Suspense>
  );
}
