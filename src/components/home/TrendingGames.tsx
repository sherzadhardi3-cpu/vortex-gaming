'use client';

// VORTEX GAMING — Trending Games Leaderboard
// Shows high-demand titles with rank indicators #1 to #6

import React from 'react';
import Link from 'next/link';
import { Flame, ShoppingCart, Star } from 'lucide-react';
import { getTrendingGames } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';

export function TrendingGames() {
  const games = getTrendingGames().slice(0, 6);
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <section className="py-16 bg-[#0c0c14] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-400 font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span>COMMUNITY VELOCITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              TRENDING LEADERBOARD
            </h2>
          </div>
        </div>

        {/* 2-Column or 3-Column Rank Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, index) => {
            const rank = index + 1;

            return (
              <div
                key={game.id}
                className="group p-4 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all flex items-center justify-between gap-4"
              >
                {/* Rank number & Artwork */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      rank === 1
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                        : rank === 2
                        ? 'bg-slate-300 text-black'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/5 text-[#a0a0b8]'
                    }`}
                  >
                    #{rank}
                  </div>

                  <Link href={`/game/${game.slug}`} className="block shrink-0">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${game.bannerGradient} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-[10px] font-bold text-white px-1 text-center line-clamp-1">
                        {game.platformName}
                      </span>
                    </div>
                  </Link>

                  <div className="space-y-0.5">
                    <Link
                      href={`/game/${game.slug}`}
                      className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1"
                    >
                      {game.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-[#a0a0b8]">
                      <span>{game.platformName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {game.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-white font-mono">
                    {format(game.priceUSD, game.priceIQD)}
                  </div>
                  <button
                    onClick={() => addItem(game)}
                    className="mt-1 p-2 rounded-lg bg-white/5 hover:bg-[#00d4ff] hover:text-black text-[#00d4ff] transition-all"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
