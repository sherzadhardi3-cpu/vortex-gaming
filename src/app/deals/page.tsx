'use client';

// VORTEX GAMING — Special Promotions & Deals Catalog

import React from 'react';
import Link from 'next/link';
import { Percent, ShoppingCart, Timer, Flame } from 'lucide-react';
import { getDealsGames } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';

export default function DealsPage() {
  const deals = getDealsGames();
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              <Percent className="w-3.5 h-3.5" />
              <span>OFFICIAL PUBLISHER DISCOUNTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              HOT SPECIAL DEALS
            </h1>
            <p className="text-xs text-[#a0a0b8] mt-1 max-w-lg">
              Authentic game keys with savings up to 70% off retail pricing. Instant key allocation on payment confirmation.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-[#12121a] border border-white/10 text-xs text-amber-400 font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 fill-current" />
            <span>Limited Keys in Vault</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl bg-[#12121a] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between overflow-hidden"
            >
              <Link href={`/game/${game.slug}`} className="block relative">
                <div
                  className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                      {game.platformName}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                      -{game.discountPercent}%
                    </span>
                  </div>

                  <div className="text-xs text-emerald-400 font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded w-fit">
                    ✓ Immediate Vault Delivery
                  </div>
                </div>
              </Link>

              <div className="p-4 space-y-4">
                <Link
                  href={`/game/${game.slug}`}
                  className="text-sm font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block"
                >
                  {game.title}
                </Link>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#6b6b80] line-through font-mono">
                      {format(game.originalPriceUSD, game.originalPriceIQD)}
                    </div>
                    <div className="text-base font-black text-amber-400 font-mono">
                      {format(game.priceUSD, game.priceIQD)}
                    </div>
                  </div>

                  <button
                    onClick={() => addItem(game)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20 active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Claim</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
