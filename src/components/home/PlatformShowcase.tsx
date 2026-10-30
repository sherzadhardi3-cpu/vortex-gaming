'use client';

// VORTEX GAMING — Supported Gaming Platforms & Category Shortcuts
// Covers all 10 core shortcuts: Steam, PlayStation, Xbox, Epic, EA, Ubisoft, Rockstar, PC Games, Gift Cards, Top-Ups

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Gift, CreditCard, Laptop } from 'lucide-react';
import { PLATFORMS } from '@/lib/constants';
import { GAMES_CATALOG } from '@/lib/data/games';
import { useTranslation } from '@/lib/i18n';

const EXTRA_SHORTCUTS = [
  {
    id: 'pc-games',
    name: 'PC Games Hub',
    slug: 'store',
    href: '/store',
    icon: '💻',
    color: '#00d4ff',
    badge: 'All PC Launchers',
    description: 'Steam, Epic, EA, Ubisoft & Rockstar keys',
  },
  {
    id: 'gift-cards',
    name: 'Gaming Gift Cards',
    slug: 'gift-cards',
    href: '/store?type=GIFT_CARD',
    icon: '🎁',
    color: '#10b981',
    badge: 'Zero Markup',
    description: 'Steam Wallet, PSN & Xbox balance codes',
  },
  {
    id: 'top-ups',
    name: 'Top-Ups & Passes',
    slug: 'subscriptions',
    href: '/store?type=SUBSCRIPTION',
    icon: '⚡',
    color: '#8b5cf6',
    badge: 'Instant Activation',
    description: 'Xbox Game Pass Ultimate & EA Play Pro',
  },
];

export function PlatformShowcase() {
  const { t } = useTranslation();

  return (
    <section className="py-16 border-t border-white/5 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
              OFFICIAL ECOSYSTEM & SHORTCUTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t('home.platformShortcuts')}
            </h2>
          </div>
          <p className="text-xs text-[#a0a0b8] max-w-md">
            Direct digital key activation for major launchers and gaming consoles. Always lawful, publisher-compliant, and region-verified.
          </p>
        </div>

        {/* 10-Item Shortcut Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLATFORMS.map((platform) => {
            const count = GAMES_CATALOG.filter((g) => g.platform === platform.slug || g.platform === platform.id).length;

            return (
              <Link
                key={platform.id}
                href={`/platform/${platform.slug}`}
                className="group relative p-4 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between overflow-hidden"
              >
                <div
                  className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: platform.color }}
                />

                <div className="flex items-start justify-between">
                  <div className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </div>
                  <div className="p-1 rounded-lg bg-white/5 text-[#a0a0b8] group-hover:text-[#00d4ff] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1">
                    {platform.name}
                  </div>
                  <div className="text-[11px] text-[#a0a0b8]">
                    {count > 0 ? `${count} Active Keys` : 'Official Store'}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold pt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Instant Keys</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Extra 3 Shortcuts: PC Games, Gift Cards, Top-Ups */}
          {EXTRA_SHORTCUTS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative p-4 rounded-2xl bg-[#12121a] border border-[#00d4ff]/20 hover:border-[#00d4ff]/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00d4ff]/10 flex flex-col justify-between overflow-hidden"
            >
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: item.color }}
              />

              <div className="flex items-start justify-between">
                <div className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="p-1 rounded-lg bg-white/5 text-[#a0a0b8] group-hover:text-[#00d4ff] transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1">
                  {item.name}
                </div>
                <div className="text-[11px] text-[#a0a0b8] line-clamp-1">
                  {item.description}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-[#00d4ff] font-semibold pt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.badge}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
