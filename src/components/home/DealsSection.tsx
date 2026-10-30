'use client';

// VORTEX GAMING — Special Flash Deals with Live Countdown
// Displays high-discount items with simulated ticker and instant checkout trigger

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ShoppingCart, Percent, Zap } from 'lucide-react';
import { getDealsGames } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';

export function DealsSection() {
  const deals = getDealsGames().slice(0, 4);
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);

  // Live Countdown state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 38, seconds: 45 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-[#0a0a0f] border-t border-white/5 relative overflow-hidden">
      
      {/* Glow highlight */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-rose-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
              <Percent className="w-3.5 h-3.5" />
              <span>LIMITED PROMOTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              WEEKEND FLASH DEALS
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#12121a] border border-white/10 shadow-lg">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs text-[#a0a0b8] font-medium mr-2">Deals Expire In:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm text-white">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl bg-[#12121a] border border-white/10 hover:border-amber-400/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black flex flex-col justify-between overflow-hidden"
            >
              {/* Artwork with Giant Discount Pill */}
              <Link href={`/game/${game.slug}`} className="block relative">
                <div
                  className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                      {game.platformName}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                      SAVE {game.discountPercent}%
                    </span>
                  </div>

                  <div className="text-xs text-white font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg w-fit">
                    ⚡ Instant Key Delivery
                  </div>
                </div>
              </Link>

              {/* Information */}
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] text-[#6b6b80] font-mono uppercase">
                    {game.activationRegion} • Genuine Code
                  </div>
                  <Link
                    href={`/game/${game.slug}`}
                    className="text-sm font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block mt-0.5"
                  >
                    {game.title}
                  </Link>
                </div>

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
    </section>
  );
}
