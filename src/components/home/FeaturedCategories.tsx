'use client';

// VORTEX GAMING — Featured Gaming Categories & Promotional Banners
// Displays major gaming categories, top-up shortcuts, and responsive promotional event banners

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Gamepad2, Gift, CreditCard, Shield, Trophy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const CATEGORIES = [
  {
    id: 'rpg-open-world',
    title: 'RPGs & Open World',
    subtitle: 'Epic journeys, fantasy realms & deep character progression',
    count: '350+ Games',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    icon: Trophy,
    href: '/store?genre=RPG',
    badge: 'Trending',
  },
  {
    id: 'action-shooter',
    title: 'Action & Shooters',
    subtitle: 'Fast-paced tactical combat & multiplayer battlegrounds',
    count: '420+ Games',
    gradient: 'from-amber-600 via-rose-600 to-red-600',
    icon: Flame,
    href: '/store?genre=Action',
    badge: 'Popular',
  },
  {
    id: 'gift-cards',
    title: 'Gaming Gift Cards',
    subtitle: 'Instant digital vouchers for Steam, PlayStation, and Xbox stores',
    count: 'Instant Top-Up',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    icon: Gift,
    href: '/store?type=GIFT_CARD',
    badge: 'Zero Markup',
  },
  {
    id: 'game-passes',
    title: 'Subscriptions & Passes',
    subtitle: 'Xbox Game Pass Ultimate, EA Play Pro & seasonal passes',
    count: 'Official Keys',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    icon: CreditCard,
    href: '/store?type=SUBSCRIPTION',
    badge: 'Save 20%',
  },
];

export function FeaturedCategories() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-[#0a0a0f] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Promotional Side Banner Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Hero Promo Banner (Spans 2 columns) */}
          <div className="lg:col-span-2 relative p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#121226] via-[#16162a] to-[#0d0d1a] border border-[#00d4ff]/30 shadow-2xl overflow-hidden flex flex-col justify-between">
            {/* Background cyber accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00d4ff]/20 to-transparent blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#7c3aed]/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-bold text-[#00d4ff]">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>LIMITED TIME CAMPAIGN</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white font-mono leading-tight">
                WEEKEND MEGA SALE <br />
                <span className="vortex-gradient-text">UP TO 75% OFF</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
                Save massively on critically acclaimed blockbusters like Cyberpunk 2077, Elden Ring, Helldivers 2, and Red Dead Redemption 2. Guaranteed immediate digital key release.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/deals"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>{t('home.shopNow')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-[#a0a0b8] font-mono">
                ⚡ Instant Key Delivery Upon Checkout
              </span>
            </div>
          </div>

          {/* Secondary Side Promo: Top-Up Guarantee */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#12121a] to-[#0c0c14] border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">100% Legitimate Distribution</h4>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Every code and key in the VORTEX vault is lawfully sourced and guaranteed to activate without VPNs or region locks.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href="/store"
                className="text-xs text-[#00d4ff] hover:text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
                POPULAR HUB
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                FEATURED GAMING CATEGORIES
              </h2>
            </div>

            <Link
              href="/store"
              className="text-xs text-[#a0a0b8] hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative p-6 rounded-3xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.gradient} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white/5 border border-white/10 text-[#00d4ff] uppercase">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="mt-6 space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-[#00d4ff] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#a0a0b8] line-clamp-2">
                      {cat.subtitle}
                    </p>
                    <div className="text-[11px] font-mono font-bold text-emerald-400 pt-2 flex items-center justify-between">
                      <span>{cat.count}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
