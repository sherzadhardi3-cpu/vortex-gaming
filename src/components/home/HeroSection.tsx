'use client';

// VORTEX GAMING — Asymmetric 2-Column Hero Section & Value Proposition Bar
// Matches reference screenshot:
// - Left Col (~68%): Large "GAME ACCOUNTS" Cinematic Banner with character artwork,
//   "POPULAR" badge, "Play More. Pay Less.", "Shop Now ->", and platform selector (Steam, PlayStation, Xbox, Epic Games, EA, Nintendo, PC Games).
// - Right Col (~32%): Two stacked promotional banners:
//   1. Top Card: "GIFT CARDS" with fanned PlayStation, Xbox, Steam cards.
//   2. Bottom Card: "SUBSCRIPTIONS" with fanned Xbox Game Pass, PS Plus, EA Play cards.
// - Full-width 4-Pillar Trust & Benefits Bar directly below.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, CreditCard, Headphones, Sparkles } from 'lucide-react';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { GAMES_CATALOG } from '@/lib/data/games';
import { useTranslation } from '@/lib/i18n';

// ─── Platform Vector Icons ──────────────────────────────────────────────────

function SteamIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.707L.436 15.07C1.82 20.171 6.463 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.55 18.025c-.23.498-.71.86-1.282.913l-1.99-.822c.205-.33.52-.589.897-.714.286-.096.597-.107.904-.035.733.17 1.282.684 1.471 1.358v-.7zM15.94 6.84a2.072 2.072 0 100 4.144 2.072 2.072 0 000-4.144z" />
    </svg>
  );
}

function PlayStationIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M8.98 2.59c-.43.34-.84.77-1.22 1.27-.47.62-.87 1.34-1.2 2.15-.33.81-.55 1.7-.65 2.66-.08.77-.07 1.54.04 2.29.11.75.33 1.48.65 2.16.32.68.74 1.29 1.26 1.81.42.42.9.77 1.42 1.05v-8.8l.58-.2c.79-.27 1.4-.23 1.83.13.43.36.64.97.64 1.83v7.35l2.25.79v-9.5c0-1.42-.45-2.52-1.35-3.29-.9-.77-2.13-1.07-3.69-.9-.26.03-.57.11-.94.24l.43-.99zM2.85 16.71c.73.5 1.75.91 3.06 1.23.44.11.89.2 1.34.28l.21-1.07c-.42-.08-.83-.17-1.23-.27-1.06-.26-1.87-.58-2.42-.96-.55-.38-.83-.84-.83-1.38 0-.46.22-.88.66-1.26.44-.38 1.05-.72 1.83-1.02l.37 1.06c-.63.24-1.12.51-1.47.81-.35.3-.53.62-.53.96 0 .44.33.82 1.01 1.15v.49zm18.3 0c-.55.38-1.36.7-2.42.96-.4.1-.81.19-1.23.27l.21 1.07c.45-.08.9-.17 1.34-.28 1.31-.32 2.33-.73 3.06-1.23.73-.5 1.09-1.08 1.09-1.74 0-.58-.33-1.08-1-1.5-.67-.42-1.57-.79-2.7-1.11l-.31 1.08c.95.27 1.7.57 2.25.9.55.33.82.72.82 1.17 0 .54-.28 1-.82 1.38zM14.65 19.33c-1.31.28-2.67.43-4.08.45-1.44.02-2.85-.1-4.23-.36l.2 1.08c1.32.25 2.68.37 4.09.35 1.45-.02 2.87-.18 4.26-.48l-.24-1.04z" />
    </svg>
  );
}

function XboxIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.91 1.041 5.58 2.775 7.665.044-.06.702-.852 1.25-1.52 1.995-2.43 4.275-5.23 7.975-9.875 3.7 4.645 5.98 7.445 7.975 9.875.548.668 1.206 1.46 1.25 1.52C22.959 17.58 24 14.91 24 12c0-6.627-5.373-12-12-12zm-3.8 3.515c1.175.76 2.5 1.22 3.8 1.22s2.625-.46 3.8-1.22c-1.125-.83-2.435-1.32-3.8-1.32s-2.675.49-3.8 1.32zM3.45 6.78c.84 1.46 2.06 2.76 3.53 3.75-1.45 1.83-2.91 3.65-4.13 5.33C2.31 14.47 2 13.27 2 12c0-1.89.53-3.66 1.45-5.22zm17.1 0C21.47 8.34 22 10.11 22 12c0 1.27-.31 2.47-.85 3.86-1.22-1.68-2.68-3.5-4.13-5.33 1.47-.99 2.69-2.29 3.53-3.75z" />
    </svg>
  );
}

function EpicGamesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M4 2.5C4 2.5 12 0 12 0s8 2.5 8 2.5v12.2c0 4.8-8 9.3-8 9.3s-8-4.5-8-9.3V2.5zm8 2.1l-5.3 1.6v8.4c0 3.2 5.3 6.4 5.3 6.4s5.3-3.2 5.3-6.4V6.2L12 4.6zm-2.8 4.2h5.6v1.9h-3.6v1.4h3.2v1.8h-3.2v1.5h3.6v1.9H9.2V8.8z" />
    </svg>
  );
}

function EAIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.8 14.5l-1.2-2.5H6.2l-.7 2.5H4l3.5-10h1.8l3.5 10h-1.6zm8.8 0h-4.8V7.5h4.6v1.8h-2.8v1.9h2.4v1.7h-2.4v1.8h3v1.8zm-7.6-4.2l-1.3-2.9-1.3 2.9h2.6z" />
    </svg>
  );
}

function NintendoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M0 4.382C0 1.966 1.966 0 4.382 0H9.5v24H4.382C1.966 24 0 22.034 0 19.618V4.382zm7.15 4.343a1.59 1.59 0 100-3.18 1.59 1.59 0 000 3.18zm5.7 15.275h5.118C20.384 24 22.35 22.034 22.35 19.618V4.382C22.35 1.966 20.384 0 17.968 0H12.85v24zm3.95-10.742a1.59 1.59 0 100-3.18 1.59 1.59 0 000 3.18z" />
    </svg>
  );
}

function PCGamesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6l-2 3v1h8v-1l-2-3h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z" />
    </svg>
  );
}

// ─── Platform Definitions ────────────────────────────────────────────────────

interface PlatformOption {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  hoverBorder: string;
}

const HERO_PLATFORMS: PlatformOption[] = [
  {
    id: 'steam',
    name: 'Steam',
    href: '/platform/steam',
    icon: SteamIcon,
    accentColor: '#00d4ff',
    hoverBorder: 'hover:border-[#00d4ff]',
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    href: '/platform/playstation',
    icon: PlayStationIcon,
    accentColor: '#0070f3',
    hoverBorder: 'hover:border-[#0070f3]',
  },
  {
    id: 'xbox',
    name: 'Xbox',
    href: '/platform/xbox',
    icon: XboxIcon,
    accentColor: '#107c10',
    hoverBorder: 'hover:border-emerald-400',
  },
  {
    id: 'epic',
    name: 'Epic Games',
    href: '/store?platform=epic',
    icon: EpicGamesIcon,
    accentColor: '#ffffff',
    hoverBorder: 'hover:border-white',
  },
  {
    id: 'ea',
    name: 'EA Play',
    href: '/store?platform=ea',
    icon: EAIcon,
    accentColor: '#ff4757',
    hoverBorder: 'hover:border-rose-400',
  },
  {
    id: 'nintendo',
    name: 'Nintendo',
    href: '/store?platform=nintendo',
    icon: NintendoIcon,
    accentColor: '#e60012',
    hoverBorder: 'hover:border-rose-400',
  },
  {
    id: 'pc-games',
    name: 'PC Games',
    href: '/store?category=pc-games',
    icon: PCGamesIcon,
    accentColor: '#0070f3',
    hoverBorder: 'hover:border-[#0070f3]',
  },
];

// ─── Main HeroSection Component ──────────────────────────────────────────────

export function HeroSection() {
  const { format } = useCurrencyStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('steam');

  useEffect(() => {
    setMounted(true);
  }, []);

  const spotlightGame = GAMES_CATALOG[0];

  const benefits = [
    {
      icon: Zap,
      title: t('trust.instantDelivery'),
      description: t('trust.instantDeliveryDesc'),
    },
    {
      icon: ShieldCheck,
      title: t('trust.genuineProducts'),
      description: t('trust.genuineProductsDesc'),
    },
    {
      icon: CreditCard,
      title: t('trust.securePayment'),
      description: t('trust.securePaymentDesc'),
    },
    {
      icon: Headphones,
      title: t('trust.support'),
      description: t('trust.supportDesc'),
    },
  ];

  return (
    <section className="relative pt-32 pb-8 sm:pt-36 sm:pb-12 bg-[#060a17] overflow-hidden">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[950px] h-[400px] bg-[#0070f3]/12 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-24 left-10 w-80 h-80 bg-[#00d4ff]/8 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ─── Two-Column Asymmetric Hero Layout (Matches Reference Screenshot) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          
          {/* ─── LEFT COLUMN: Large GAME ACCOUNTS Cinematic Banner (col-span-8) ─── */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-[#1b2a4a] bg-[#080d1f] flex flex-col justify-between shadow-2xl min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] p-6 sm:p-9 lg:p-10 group">
            
            {/* Cinematic Game Characters Artwork (Ghost, Goku, Kratos, etc.) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src="/images/hero-game-accounts-banner.jpg"
                alt="VORTEX GAMING Universe"
                className="w-full h-full object-cover object-[center_right] sm:object-right opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              {/* Directional contrast gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060a17] via-[#060a17]/90 via-50% to-transparent sm:via-[#060a17]/85" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a17] via-[#060a17]/40 to-transparent opacity-90" />
            </div>

            {/* Subtle Geometric Grid */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
              style={{
                backgroundImage: `linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
                backgroundSize: '36px 36px',
              }}
            />

            {/* Left-Aligned Headline Content */}
            <div className="relative z-10 space-y-3 sm:space-y-4 max-w-xl">
              
              {/* "POPULAR" Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-white/90 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                <span>POPULAR</span>
              </div>

              {/* Big "GAME ACCOUNTS" Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight italic text-white drop-shadow-[0_4px_25px_rgba(0,112,243,0.5)] leading-none">
                GAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#00a3ff] to-[#38bdf8] drop-shadow-[0_0_35px_rgba(0,212,255,0.7)]">ACCOUNTS</span>
              </h1>

              {/* Subtitle & Value Line */}
              <p className="text-base sm:text-xl font-bold text-white/95 drop-shadow">
                Play More. Pay Less.
              </p>

              {/* CTA Button & Spotlight Deal */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/store?category=game-accounts"
                  className="inline-flex items-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#0070f3]/40 transition-all hover:scale-105 active:scale-95 group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Hydration-safe price tag for spotlight deals */}
                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                  <span className="text-[#7888a6] text-[11px]">From</span>
                  <span className="text-white/40 line-through text-[11px]">
                    {mounted ? format(spotlightGame.originalPriceUSD, spotlightGame.originalPriceIQD) : ''}
                  </span>
                  <span className="text-[#00d4ff] font-mono font-bold text-xs">
                    {mounted ? format(spotlightGame.priceUSD, spotlightGame.priceIQD) : `$${(spotlightGame.priceUSD / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Selection Row (Bottom of Left Banner) */}
            <div className="relative z-10 pt-8 sm:pt-10 mt-auto space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#7888a6] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Select by Platform</span>
              </div>

              {/* 5 Major Platform Badges (Matches Reference Screenshot Brand Tiles) */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {HERO_PLATFORMS.slice(0, 5).map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === p.id;
                  const brandBg =
                    p.id === 'steam'
                      ? 'bg-[#0070f3]'
                      : p.id === 'playstation'
                      ? 'bg-[#00439c]'
                      : p.id === 'xbox'
                      ? 'bg-[#107c10]'
                      : p.id === 'epic'
                      ? 'bg-[#1a1a1a] border border-white/20'
                      : 'bg-[#a3000b]';

                  return (
                    <Link
                      key={p.id}
                      href={p.href}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${brandBg} text-white ${
                        isSelected
                          ? 'shadow-xl ring-2 ring-white/90 scale-105'
                          : 'opacity-90 hover:opacity-100 hover:scale-105 shadow-md'
                      } ${p.hoverBorder}`}
                      title={p.name}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                  );
                })}
              </div>

              {/* Miniature Platform Indicator / Switcher Row (Matches Reference Screenshot icon strip) */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {HERO_PLATFORMS.slice(0, 5).map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#0070f3] text-white shadow-md shadow-[#0070f3]/50 scale-105'
                          : 'bg-[#0c1626]/70 text-[#7888a6] hover:text-white hover:bg-white/10'
                      }`}
                      title={p.name}
                      aria-label={p.name}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ─── RIGHT COLUMN: Stacked Gift Cards & Subscriptions Cards (col-span-4) ─── */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4 lg:gap-5">
            
            {/* 1. TOP CARD: GIFT CARDS */}
            <div className="rounded-3xl border border-[#1b2a4a] bg-gradient-to-br from-[#0c1326] via-[#080d1f] to-[#040714] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between flex-1 group hover:border-[#0070f3]/60 transition-all shadow-xl min-h-[220px] sm:min-h-[245px]">
              
              {/* Ambient Card Spotlight */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#0070f3]/15 blur-[60px] pointer-events-none rounded-full" />
              
              {/* Graphic on Right (3D Fanned PlayStation, Xbox, Steam Cards) */}
              <div className="absolute right-0 top-0 bottom-0 w-[56%] h-full overflow-hidden pointer-events-none z-0">
                <img
                  src="/images/gift-cards-stack.jpg"
                  alt="Gift Cards - PlayStation, Xbox, Steam"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Smooth blend to background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#080d1f] via-[#080d1f]/80 via-30% to-transparent" />
              </div>

              {/* Text & Action on Left */}
              <div className="relative z-10 max-w-[55%] flex flex-col justify-between h-full">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white drop-shadow">
                    GIFT CARDS
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#8a99b5] font-medium leading-relaxed">
                    Top up your balance.<br />Play without limits.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href="/store?category=gift-cards"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#0070f3]/30 transition-all hover:scale-105 active:scale-95 group/btn"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. BOTTOM CARD: SUBSCRIPTIONS */}
            <div className="rounded-3xl border border-[#1b2a4a] bg-gradient-to-br from-[#0c1326] via-[#080d1f] to-[#040714] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between flex-1 group hover:border-[#0070f3]/60 transition-all shadow-xl min-h-[220px] sm:min-h-[245px]">
              
              {/* Ambient Card Spotlight */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#00d4ff]/15 blur-[60px] pointer-events-none rounded-full" />
              
              {/* Graphic on Right (3D Fanned Game Pass, PS Plus, EA Play Cards) */}
              <div className="absolute right-0 top-0 bottom-0 w-[56%] h-full overflow-hidden pointer-events-none z-0">
                <img
                  src="/images/subscriptions-stack.jpg"
                  alt="Subscriptions - Xbox Game Pass, PlayStation Plus, EA Play"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Smooth blend to background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#080d1f] via-[#080d1f]/80 via-30% to-transparent" />
              </div>

              {/* Text & Action on Left */}
              <div className="relative z-10 max-w-[55%] flex flex-col justify-between h-full">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white drop-shadow">
                    SUBSCRIPTIONS
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#8a99b5] font-medium leading-relaxed">
                    More Games.<br />More Benefits.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href="/store?category=subscriptions"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#0070f3]/30 transition-all hover:scale-105 active:scale-95 group/btn"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ─── Horizontal Benefits Bar (Directly below hero banner) ────────── */}
        <div className="mt-4 sm:mt-5 rounded-2xl bg-[#070b18] border border-[#142038] p-4 sm:p-5 shadow-lg shadow-black/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#0070f3]/15 border border-[#0070f3]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#7888a6] line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
