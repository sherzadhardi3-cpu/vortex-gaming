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

  const currentCategory =
    pathname === '/store'
      ? searchParams.get('category') || 'all'
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
                  ? 'bg-[#0070f3]/25 border border-[#0070f3] text-white font-bold shadow-sm shadow-[#0070f3]/20'
                  : 'bg-white/5 text-[#a0a0b8] hover:text-white hover:bg-white/10'
              }`}
            >
              {item.isApple && <Apple className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />}
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1 sm:gap-2 pt-2.5 mt-2.5 border-t border-white/5 overflow-x-auto no-scrollbar">
      {SECONDARY_NAV_ITEMS.map((item) => {
        const isActive = currentCategory === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#0070f3]/20 border border-[#0070f3] text-white font-bold shadow-sm shadow-[#0070f3]/25 ring-1 ring-[#0070f3]/30'
                : 'text-[#a0a0b8] hover:text-white hover:bg-white/5 border border-transparent font-medium'
            }`}
          >
            {item.isApple && <Apple className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />}
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = useCartStore((state) => state.getTotalCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { currency, setCurrency } = useCurrencyStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

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

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          ? 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/50 py-3'
          : 'bg-gradient-to-b from-[#0a0a0f] to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <VortexLogo size="md" />

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full h-11 pl-11 pr-4 bg-[#12121a]/90 text-sm text-white placeholder-[#6b6b80] rounded-xl border border-white/10 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#6b6b80] absolute left-4 top-3.5" />
            </form>

            {/* Live Autocomplete Dropdown */}
            {searchOpen && filteredSearch.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-[#12121a] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#6b6b80] border-b border-white/5">
                  Instant Game Results
                </div>
                {filteredSearch.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${game.bannerGradient} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {game.platformName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{game.title}</div>
                        <div className="text-[10px] text-[#a0a0b8]">{game.platformName} • {game.genre[0]}</div>
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

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <div className="hidden lg:flex items-center bg-[#12121a] border border-white/10 rounded-lg p-0.5">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => setCurrency(cur.code as CurrencyCode)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === cur.code
                      ? 'bg-[#00d4ff] text-black shadow-sm font-bold'
                      : 'text-[#a0a0b8] hover:text-white'
                  }`}
                >
                  {cur.code}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#12121a] border border-white/10 text-xs font-medium text-[#a0a0b8] hover:text-white transition-colors"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-[#6b6b80]" />
              </button>

              {langMenuOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-44 bg-[#12121a] border border-white/15 rounded-xl shadow-2xl py-1.5 z-50`}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        language === lang.code
                          ? 'text-[#00d4ff] bg-white/5 font-bold'
                          : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="uppercase text-[10px] text-[#6b6b80]">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl bg-[#12121a] border border-white/10 text-[#a0a0b8] hover:text-white hover:border-[#00d4ff]/40 transition-colors"
              title={t('nav.wishlist')}
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0a0a0f]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-[#12121a] border border-white/10 text-[#a0a0b8] hover:text-white hover:border-[#00d4ff]/40 transition-colors"
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00d4ff] text-black text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0a0a0f]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth / Account */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-[#12121a] border border-white/10 rounded-xl hover:border-[#00d4ff]/40 transition-all text-xs font-semibold"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.firstName}
                        className="w-6 h-6 rounded-lg object-cover ring-1 ring-[#5865F2]/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00d4ff] to-[#7c3aed] flex items-center justify-center text-black font-bold text-[10px]">
                        {user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline text-white max-w-[90px] truncate">
                      {user?.displayName || user?.firstName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#6b6b80]" />
                  </button>

                  {userMenuOpen && (
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-60 bg-[#12121a] border border-white/15 rounded-2xl shadow-2xl py-2 z-50`}>
                      <div className="px-4 py-3 border-b border-white/10">
                        {user?.avatarUrl && (
                          <img
                            src={user.avatarUrl}
                            alt={user.firstName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#5865F2]/40 mb-2"
                          />
                        )}
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span className="truncate">{user?.displayName || `${user?.firstName} ${user?.lastName}`}</span>
                          {user?.discordUsername && (
                            <span className="text-[10px] text-[#5865F2] font-mono">@{user.discordUsername}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#a0a0b8] truncate mt-0.5">{user?.email}</div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
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
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-[#00d4ff]" />
                          <span>{t('profilePage.overview')}</span>
                        </Link>

                        <Link
                          href="/account?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-emerald-400" />
                          <span>{t('profilePage.vault')}</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>{t('profilePage.wishlist')}</span>
                        </Link>

                        <Link
                          href="/account?tab=wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>{t('profilePage.wallet')}</span>
                        </Link>

                        <Link
                          href="/account?tab=security"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Lock className="w-4 h-4 text-indigo-400" />
                          <span>{t('profilePage.security')}</span>
                        </Link>

                        <Link
                          href="/account?tab=support"
                          onClick={() => {
                            setUserMenuOpen(false);
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('vtx_open_support_widget'));
                            }
                          }}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Headphones className="w-4 h-4 text-[#7c3aed]" />
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

                      <div className="pt-1 border-t border-white/10">
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
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:text-[#00d4ff] transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black hover:opacity-90 transition-opacity shadow-md shadow-[#00d4ff]/20"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#12121a] border border-white/10 text-[#a0a0b8] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar (Exact order: All Products | Games | Gift Cards | iTunes | Subscriptions | Game Accounts | PC Games | Top-Ups | Support) */}
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

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                  className={`px-2 py-1 rounded text-xs ${
                    language === lang.code ? 'bg-[#00d4ff] text-black font-bold' : 'text-[#a0a0b8]'
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => setCurrency(cur.code as CurrencyCode)}
                  className={`px-2 py-1 rounded text-xs ${
                    currency === cur.code ? 'bg-[#00d4ff] text-black font-bold' : 'text-[#a0a0b8]'
                  }`}
                >
                  {cur.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
