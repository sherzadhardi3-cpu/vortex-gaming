'use client';

// VORTEX GAMING — Premium Homepage Hero Section & Benefits Bar
// Inspired by high-end gaming store aesthetic: 66/34 two-column hero layout,
// platform shortcut bar, 3D gift cards & subscription fan illustrations,
// and horizontal 4-pillar trust & benefits bar.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
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

function EpicIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M12 0L2 4v11.5c0 5 4.5 7.5 10 8.5 5.5-1 10-3.5 10-8.5V4L12 0zm0 3.2l7 2.8v8.9c0 3.3-3 5.3-7 6.1-4-.8-7-2.8-7-6.1V6l7-2.8zm-3 4.5v8.6h6v-2.2h-3.6v-1.1h3.1v-2.1h-3.1V9.7h3.6V7.7H9z" />
    </svg>
  );
}

function EAIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.8 4.5h3.6l3.6 11h-2.5l-.8-2.6h-4.2l-.8 2.6H6.6l3.6-11zm1.8 2.8l-1.5 4.2h3l-1.5-4.2z" />
    </svg>
  );
}

// ─── 3D-Angled Fanned Cards Visual Components ────────────────────────────────

function GiftCardFan() {
  return (
    <div className="relative w-36 h-28 sm:w-44 sm:h-32 shrink-0 select-none pointer-events-none">
      {/* PlayStation $50 (Left - Angled) */}
      <div className="absolute left-0 top-3 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#00439c] via-[#002f70] to-[#001c44] border border-[#0070f3]/40 shadow-xl shadow-black/80 -rotate-12 transition-transform hover:-rotate-16 flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <PlayStationIcon className="w-3.5 h-3.5 text-white/90" />
          <span className="text-[10px] font-mono font-black text-white/90">$50</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-blue-200 uppercase truncate">
          PlayStation
        </div>
      </div>

      {/* Xbox $50 (Center - Upright) */}
      <div className="absolute left-6 top-1 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#107c10] via-[#0b5c0b] to-[#053805] border border-emerald-400/40 shadow-xl shadow-black/80 rotate-2 z-10 flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <XboxIcon className="w-3.5 h-3.5 text-white/90" />
          <span className="text-[10px] font-mono font-black text-white/90">$50</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-emerald-200 uppercase truncate">
          Xbox Card
        </div>
      </div>

      {/* Steam $50 (Right - Angled Front) */}
      <div className="absolute left-14 top-2 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#1b2838] via-[#101b2b] to-[#070d17] border border-[#00d4ff]/50 shadow-2xl shadow-black/90 rotate-14 z-20 flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <SteamIcon className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span className="text-[10px] font-mono font-black text-[#00d4ff]">$50</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-cyan-200 uppercase truncate">
          Steam Wallet
        </div>
      </div>
    </div>
  );
}

function SubscriptionCardFan() {
  return (
    <div className="relative w-36 h-28 sm:w-44 sm:h-32 shrink-0 select-none pointer-events-none">
      {/* Xbox Game Pass (Left - Angled) */}
      <div className="absolute left-0 top-3 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#0e7a0d] via-[#095708] to-[#042e04] border border-emerald-400/40 shadow-xl shadow-black/80 -rotate-12 transition-transform flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <XboxIcon className="w-3.5 h-3.5 text-white/90" />
          <span className="text-[8px] font-extrabold px-1 rounded bg-black/40 text-emerald-300">PASS</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-emerald-100 uppercase truncate">
          Game Pass
        </div>
      </div>

      {/* PlayStation Plus (Center - Upright) */}
      <div className="absolute left-6 top-1 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#003791] via-[#00225d] to-[#001133] border border-[#0070f3]/40 shadow-xl shadow-black/80 rotate-2 z-10 flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <PlayStationIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] font-black text-amber-400">+</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-blue-200 uppercase truncate">
          PS Plus
        </div>
      </div>

      {/* EA Play (Right - Angled Front) */}
      <div className="absolute left-14 top-2 w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-br from-[#d92525] via-[#941111] to-[#4d0000] border border-rose-500/50 shadow-2xl shadow-black/90 rotate-14 z-20 flex flex-col justify-between p-2 overflow-hidden">
        <div className="flex items-center justify-between text-white">
          <EAIcon className="w-3.5 h-3.5 text-white" />
          <span className="text-[8px] font-extrabold px-1 rounded bg-black/40 text-rose-200">PLAY</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
        <div className="text-[8px] font-mono font-bold tracking-wider text-rose-100 uppercase truncate">
          EA Play
        </div>
      </div>
    </div>
  );
}

// ─── Main HeroSection Component ──────────────────────────────────────────────

export function HeroSection() {
  const { format } = useCurrencyStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Spotlight top title (for hydration-safe pricing checks and deal highlight)
  const spotlightGame = GAMES_CATALOG[0];

  const platformTiles = [
    { id: 'steam', name: 'Steam', href: '/platform/steam', icon: SteamIcon, active: true },
    { id: 'playstation', name: 'PlayStation', href: '/platform/playstation', icon: PlayStationIcon, active: false },
    { id: 'xbox', name: 'Xbox', href: '/platform/xbox', icon: XboxIcon, active: false },
    { id: 'epic-games', name: 'Epic Games', href: '/platform/epic-games', icon: EpicIcon, active: false },
    { id: 'ea', name: 'EA', href: '/store?platform=ea', icon: EAIcon, active: false },
  ];

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
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-[#0070f3]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-24 left-10 w-72 h-72 bg-[#00d4ff]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ─── Hero Two-Column Grid (66% / 34%) ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column: GAME ACCOUNTS Cinematic Banner (approx 66% width) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-[#1b2a4a] bg-[#080d1f] flex flex-col justify-between shadow-2xl min-h-[380px] sm:min-h-[420px] p-6 sm:p-9 group">
            
            {/* Cinematic Cyberpunk Atmosphere Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#060a17] via-[#091329] to-[#040814]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,_var(--tw-gradient-stops))] from-[#0070f3]/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_var(--tw-gradient-stops))] from-[#00d4ff]/15 via-transparent to-transparent pointer-events-none" />
            
            {/* Subtle Geometric Overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
                backgroundSize: '36px 36px',
              }}
            />

            {/* Top / Headline Part */}
            <div className="relative z-10 space-y-3 sm:space-y-4 max-w-xl">
              
              {/* Popular Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                <span>POPULAR</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight italic text-white drop-shadow-md leading-none">
                GAME <span className="text-[#00d4ff] drop-shadow-[0_0_25px_rgba(0,212,255,0.6)]">ACCOUNTS</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-white/85 font-semibold drop-shadow">
                Play More. Pay Less.
              </p>

              {/* CTA Action & Spotlight Deal Pill */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/store?category=game-accounts"
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0070f3]/40 transition-all hover:scale-105 group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Hydration-safe price tag for featured accounts */}
                <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                  <span className="text-[#7888a6] text-[11px]">From</span>
                  <span className="text-white/40 line-through text-[11px]">
                    {mounted ? format(spotlightGame.originalPriceUSD, spotlightGame.originalPriceIQD) : ''}
                  </span>
                  <span className="text-[#00d4ff] font-mono font-bold">
                    {mounted ? format(spotlightGame.priceUSD, spotlightGame.priceIQD) : `$${(spotlightGame.priceUSD / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Platform Bar Inside Left Banner */}
            <div className="relative z-10 pt-6 sm:pt-8 mt-auto">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {platformTiles.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.id}
                      href={p.href}
                      className={`relative flex items-center justify-center p-3 sm:px-4 sm:py-3 rounded-2xl border transition-all ${
                        p.active
                          ? 'bg-[#0070f3]/25 border-[#0070f3] text-white shadow-lg shadow-[#0070f3]/30 ring-1 ring-[#0070f3]'
                          : 'bg-[#0c162d]/80 border-[#1b2b4f] text-[#8a99b5] hover:text-white hover:border-[#0070f3]/60 hover:bg-[#0070f3]/15'
                      }`}
                      title={p.name}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      {p.active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_8px_#00d4ff]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Cards (approx 34% width) */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            
            {/* Top Card: GIFT CARDS */}
            <div className="relative rounded-3xl border border-[#1b2a4a] bg-gradient-to-br from-[#0c1836] via-[#081026] to-[#050a18] p-5 sm:p-6 overflow-hidden flex items-center justify-between shadow-xl min-h-[190px] group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,_var(--tw-gradient-stops))] from-[#0070f3]/20 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5 max-w-[55%]">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  GIFT CARDS
                </h2>
                <p className="text-xs text-[#8a99b5] leading-snug">
                  Top up your balance. <br className="hidden sm:inline" />
                  Play without limits.
                </p>
                <div className="pt-2">
                  <Link
                    href="/store?category=gift-cards"
                    className="px-4 py-2 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#0070f3]/30 transition-all hover:scale-105 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 3D Angled Fan Graphic */}
              <div className="relative z-10">
                <GiftCardFan />
              </div>
            </div>

            {/* Bottom Card: SUBSCRIPTIONS */}
            <div className="relative rounded-3xl border border-[#1b2a4a] bg-gradient-to-br from-[#0c1836] via-[#081026] to-[#050a18] p-5 sm:p-6 overflow-hidden flex items-center justify-between shadow-xl min-h-[190px] group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,_var(--tw-gradient-stops))] from-[#00d4ff]/15 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5 max-w-[55%]">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  SUBSCRIPTIONS
                </h2>
                <p className="text-xs text-[#8a99b5] leading-snug">
                  More Games. <br className="hidden sm:inline" />
                  More Benefits.
                </p>
                <div className="pt-2">
                  <Link
                    href="/store?category=subscriptions"
                    className="px-4 py-2 rounded-full bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#0070f3]/30 transition-all hover:scale-105 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 3D Angled Fan Graphic */}
              <div className="relative z-10">
                <SubscriptionCardFan />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Horizontal Benefits Bar (Directly below hero banners) ────────── */}
        <div className="mt-5 rounded-2xl bg-[#070b18] border border-[#142038] p-4 sm:p-5 shadow-lg shadow-black/40">
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
