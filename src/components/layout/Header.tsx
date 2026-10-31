'use client';

// VORTEX GAMING — Sticky Responsive Header & Navigation
// Glass-morphic aesthetic, platform shortcuts, search bar, language/currency selectors, cart & wishlist badges

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
  Globe,
  LogOut,
  PackageCheck,
  Gamepad2,
  Sparkles,
  Wallet,
  Lock,
  Headphones,
  Coins,
  Check,
  Compass,
  Apple,
} from 'lucide-react';
import { PLATFORMS, CURRENCIES, LANGUAGES } from '@/lib/constants';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCurrencyStore, type CurrencyCode } from '@/lib/store/useCurrencyStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation, type TranslationDictionary } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/store/useLanguageStore';
import { GAMES_CATALOG } from '@/lib/data/games';
import { VortexLogo } from '@/components/brand/VortexLogo';

interface NavItem {
  id: string;
  href: string;
  labelKey: keyof TranslationDictionary;
  isApple?: boolean;
}

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'all', href: '/store', labelKey: 'nav.allProducts' },
  { id: 'games', href: '/store?category=games', labelKey: 'nav.games' },
  { id: 'gift-cards', href: '/store?category=gift-cards', labelKey: 'nav.giftCards' },
  { id: 'itunes', href: '/store?category=itunes', labelKey: 'nav.itunes', isApple: true },
  { id: 'subscriptions', href: '/store?category=subscriptions', labelKey: 'nav.subscriptions' },
  { id: 'game-accounts', href: '/store?category=game-accounts', labelKey: 'nav.gameAccounts' },
  { id: 'pc-games', href: '/store?category=pc-games', labelKey: 'nav.pcGames' },
  { id: 'top-ups', href: '/store?category=top-ups', labelKey: 'nav.topUps' },
  { id: 'support', href: '/support', labelKey: 'nav.support' },
];

function SecondaryNavLinks({
  isMobile = false,
  onItemClick,
}: {
  isMobile?: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const isStore = pathname === '/store';
  const isHome = pathname === '/';
  const categoryParam = searchParams.get('category');
  const currentCategory =
    isHome || (isStore && (!categoryParam || categoryParam === 'all'))
      ? 'all'
      : isStore
      ? categoryParam
      : pathname === '/support'
      ? 'support'
      : null;

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {SECONDARY_NAV_ITEMS.map((item) => {
          const isActive = currentCategory === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onItemClick}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#0070f3] text-white font-bold shadow-sm shadow-[#0070f3]/30 border border-[#0070f3]'
                  : 'bg-[#0c1326] text-[#8a99b5] hover:text-white hover:bg-white/5 border border-[#1b2a4a]/40'
              }`}
            >
              {item.isApple && <Apple className="w-3.5 h-3.5 text-white/90 shrink-0 fill-current" />}
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1 sm:gap-2 pt-2.5 mt-2.5 border-t border-[#142038] overflow-x-auto no-scrollbar">
      {SECONDARY_NAV_ITEMS.map((item) => {
        const isActive = currentCategory === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0c162d] text-white font-bold shadow-sm shadow-[#0070f3]/30 border border-[#0070f3]'
                : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent font-medium'
            }`}
          >
            {item.isApple && <Apple className="w-3.5 h-3.5 text-white/90 shrink-0 fill-current" />}
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const router = useRouter();
  const { t, language, setLanguage, isRTL } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { currency, setCurrency } = useCurrencyStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

  const activeCurrencyConfig = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  // Hydration & scroll listener
  useEffect(() => {
    // Rehydrate currency store safely after initial render
    const rehydrate = useCurrencyStore.persist.rehydrate();
    if (rehydrate instanceof Promise) {
      rehydrate.then(() => useCurrencyStore.getState().setHydrated(true));
    } else {
      useCurrencyStore.getState().setHydrated(true);
    }

    // Check for OAuth client hydration cookie (e.g. from Discord callback)
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|;)\s*vtx_client_auth=([^;]+)/);
      if (match) {
        try {
          const decoded = decodeURIComponent(match[2]);
          const authData = JSON.parse(decoded);
          if (authData?.user && authData?.token) {
            useAuthStore.getState().login(authData.user, authData.token);
            document.cookie = 'vtx_client_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside and escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setCurrencyMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCurrencyMenuOpen(false);
        setLangMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filtered games for quick search autocomplete
  const filteredSearch = searchQuery.trim()
    ? GAMES_CATALOG.filter(
        (g) =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.platformName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.genre.some((gn) => gn.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    setLangMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#060a17]/95 backdrop-blur-md border-b border-[#142038] shadow-lg shadow-black/60 py-3'
          : 'bg-[#060a17] border-b border-[#142038] py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <VortexLogo size="md" />

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl lg:max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full h-11 pl-11 pr-14 bg-[#0c1326] text-sm text-white placeholder-[#7888a6] rounded-xl border border-[#1b2a4a] focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] outline-none transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-[#7888a6] absolute left-4 pointer-events-none" />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#00d4ff] hover:bg-[#38bdf8] text-[#060a17] hover:text-white rounded-lg flex items-center justify-center transition-all shadow-sm shadow-[#00d4ff]/30 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {searchOpen && filteredSearch.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[#0c1326] border border-[#1b2a4a] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#7888a6] border-b border-[#142038]">
                  Instant Game Results
                </div>
                {filteredSearch.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-[#142038] last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${game.bannerGradient} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {game.platformName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{game.title}</div>
                        <div className="text-[10px] text-[#8a99b5]">{game.platformName} • {game.genre[0]}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#00d4ff] font-mono shrink-0">
                      ${(game.priceUSD / 100).toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons & Controls (Ordered to Match Reference Screenshot) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. Language Selector (First) */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setCurrencyMenuOpen(false);
                  setUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0c1326] border border-[#1b2a4a] hover:border-[#0070f3]/50 text-xs font-medium text-[#8a99b5] hover:text-white transition-colors"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span className="font-semibold text-white capitalize hidden sm:inline">
                  {LANGUAGES.find((l) => l.code === language)?.name || 'English'}
                </span>
                <span className="font-semibold text-white uppercase sm:hidden">
                  {language}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#7888a6] transition-transform duration-200 ${langMenuOpen ? 'rotate-180 text-[#00d4ff]' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-44 bg-[#0c1326] border border-[#1b2a4a] rounded-xl shadow-2xl py-1.5 z-50`}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        language === lang.code
                          ? 'text-[#00d4ff] bg-white/5 font-bold'
                          : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="uppercase text-[10px] text-[#7888a6]">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Multi-Currency Dropdown (Second - Displays IQ IQD matching reference) */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                onClick={() => {
                  setCurrencyMenuOpen(!currencyMenuOpen);
                  setLangMenuOpen(false);
                  setUserMenuOpen(false);
                }}
                aria-expanded={currencyMenuOpen}
                aria-haspopup="listbox"
                aria-label="Select Currency"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0c1326] border border-[#1b2a4a] hover:border-[#0070f3]/50 text-xs font-medium text-[#8a99b5] hover:text-white transition-all shadow-sm group"
              >
                <span className="flex items-center gap-1 font-mono font-bold text-white text-xs">
                  <span className="text-[10px] text-[#00d4ff] font-extrabold uppercase tracking-tight">
                    {currency === 'IQD'
                      ? 'IQ'
                      : currency === 'USD'
                      ? 'US'
                      : currency === 'EUR'
                      ? 'EU'
                      : currency === 'TRY'
                      ? 'TR'
                      : currency === 'SAR'
                      ? 'SA'
                      : 'AE'}
                  </span>
                  <span>{currency}</span>
                </span>
                <ChevronDown className={`w-3 h-3 text-[#7888a6] transition-transform duration-200 ${currencyMenuOpen ? 'rotate-180 text-[#00d4ff]' : ''}`} />
              </button>

              {currencyMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Available currencies"
                  className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 max-h-72 overflow-y-auto no-scrollbar bg-[#0c1326]/95 backdrop-blur-xl border border-[#1b2a4a] rounded-xl shadow-2xl py-1.5 z-50 ring-1 ring-black/60`}
                >
                  <div className="px-3 py-1.5 border-b border-[#142038] text-[10px] font-bold uppercase tracking-wider text-[#7888a6] flex items-center justify-between">
                    <span>Display Currency</span>
                    <span className="text-[#00d4ff] text-[9px] font-mono">ESTIMATE</span>
                  </div>
                  <div className="py-1">
                    {CURRENCIES.map((cur) => {
                      const isSelected = currency === cur.code;
                      return (
                        <button
                          key={cur.code}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setCurrency(cur.code as CurrencyCode);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-all border-l-2 ${
                            isSelected
                              ? 'bg-[#0070f3]/20 text-white font-bold border-[#0070f3]'
                              : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-[#0070f3] text-white shadow-sm'
                                  : 'bg-white/5 text-[#00d4ff]'
                              }`}
                            >
                              {cur.symbol}
                            </span>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-white">{cur.code}</span>
                                <span className="text-[11px] text-[#8a99b5] truncate">• {cur.name}</span>
                              </div>
                              <div className="text-[10px] text-[#7888a6] truncate">{cur.nativeName}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#00d4ff] shrink-0 rtl:mr-2 ltr:ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Shopping Cart (Third) */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-[#0c1326] border border-[#1b2a4a] hover:border-[#0070f3]/50 text-[#8a99b5] hover:text-white transition-colors"
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00d4ff] text-black text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#060a17]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 4. User Profile Avatar with Online Badge & Dropdown (Fourth) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setCurrencyMenuOpen(false);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#0070f3]/60 transition-all group"
                aria-label="User profile menu"
              >
                <div className="relative">
                  {isAuthenticated && user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0070f3]/40"
                    />
                  ) : isAuthenticated ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00d4ff] to-[#0070f3] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#0070f3]/40">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0c1326] border border-[#1b2a4a] flex items-center justify-center text-[#8a99b5] group-hover:text-white group-hover:border-[#0070f3]">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  {/* Green online status badge */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#060a17]" />
                </div>
                <ChevronDown className={`w-3 h-3 text-[#7888a6] transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-[#00d4ff]' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-60 bg-[#0c1326] border border-[#1b2a4a] rounded-2xl shadow-2xl py-2 z-50 ring-1 ring-black/60`}>
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#142038]">
                        {user?.avatarUrl && (
                          <img
                            src={user.avatarUrl}
                            alt={user.firstName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#0070f3]/40 mb-2"
                          />
                        )}
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span className="truncate">{user?.displayName || `${user?.firstName} ${user?.lastName}`}</span>
                          {user?.discordUsername && (
                            <span className="text-[10px] text-[#5865F2] font-mono">@{user.discordUsername}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8a99b5] truncate mt-0.5">{user?.email}</div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/30">
                            {user?.role}
                          </span>
                          {user?.discordId && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
                              Discord Linked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/account?tab=overview"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-[#00d4ff]" />
                          <span>{t('profilePage.overview')}</span>
                        </Link>

                        <Link
                          href="/account?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-emerald-400" />
                          <span>{t('profilePage.vault')}</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>{t('profilePage.wishlist')}</span>
                        </Link>

                        <Link
                          href="/account?tab=wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>{t('profilePage.wallet')}</span>
                        </Link>

                        <Link
                          href="/account?tab=security"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Lock className="w-4 h-4 text-[#00d4ff]" />
                          <span>{t('profilePage.security')}</span>
                        </Link>

                        <Link
                          href="/support"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Headphones className="w-4 h-4 text-[#00d4ff]" />
                          <span>{t('profilePage.support')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 font-semibold transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>{t('nav.admin')}</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#142038]">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-3">
                      <div className="text-center pb-2 border-b border-[#142038]">
                        <div className="text-xs font-bold text-white">Welcome Gamer</div>
                        <div className="text-[11px] text-[#7888a6]">Sign in to access your keys & orders</div>
                      </div>
                      <div className="space-y-1.5">
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold flex items-center justify-center transition-all shadow-md shadow-[#0070f3]/30"
                        >
                          {t('nav.login')}
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0c1626] border border-[#1b2a4a] hover:border-[#0070f3]/50 text-white text-xs font-semibold flex items-center justify-center transition-all"
                        >
                          {t('nav.register')}
                        </Link>
                      </div>
                      <div className="pt-2 border-t border-[#142038] space-y-1">
                        <Link
                          href="/account?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
                          <span>Order Lookup</span>
                        </Link>
                        <Link
                          href="/support"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Headphones className="w-3.5 h-3.5 text-[#00d4ff]" />
                          <span>Support Center</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#0c1326] border border-[#1b2a4a] text-[#8a99b5] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        {/* Secondary Navigation Bar */}
        <Suspense fallback={<div className="h-9" />}>
          <SecondaryNavLinks />
        </Suspense>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d14] border-b border-white/10 px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 bg-[#12121a] text-xs text-white placeholder-[#6b6b80] rounded-xl border border-white/10 outline-none"
            />
            <Search className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3" />
          </form>

          {/* Mobile Secondary Navigation Links */}
          <Suspense fallback={<div className="h-20" />}>
            <SecondaryNavLinks isMobile onItemClick={() => setMobileMenuOpen(false)} />
          </Suspense>

          {/* Mobile Footer: Language & Currency */}
          <div className="pt-3 border-t border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Language:</span>
              <div className="flex items-center gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      language === lang.code
                        ? 'bg-[#00d4ff] text-black font-bold shadow-sm'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
                <span>Display Currency:</span>
                <span className="text-[#00d4ff] font-mono">{activeCurrencyConfig.name} ({activeCurrencyConfig.symbol})</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                {CURRENCIES.map((cur) => {
                  const isSelected = currency === cur.code;
                  return (
                    <button
                      key={cur.code}
                      onClick={() => {
                        setCurrency(cur.code as CurrencyCode);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-2 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#00d4ff] text-black shadow-md'
                          : 'bg-white/5 text-[#a0a0b8] hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      <span className="text-[11px] opacity-80">{cur.symbol}</span>
                      <span>{cur.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
