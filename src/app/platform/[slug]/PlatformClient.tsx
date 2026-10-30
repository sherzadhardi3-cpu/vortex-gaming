'use client';

// VORTEX GAMING — Platform Client Component
// Filters by genre, sorts by price/rating, manages cart and wishlist

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  ShoppingCart,
  Heart,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react';
import type { GameItem } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

interface PlatformClientProps {
  platform: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  games: GameItem[];
}

export function PlatformClient({ platform, games }: PlatformClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const filtered = games.filter((game) => {
    if (selectedGenre !== 'all' && !game.genre.includes(selectedGenre)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_low') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price_high') return b.priceUSD - a.priceUSD;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="pt-24 pb-20 min-h-screen">
      
      {/* Platform Banner Header */}
      <div className="relative py-14 overflow-hidden border-b border-white/10 bg-[#0d0d17]">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full blur-[140px] opacity-25"
          style={{ backgroundColor: platform.color }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                {platform.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider">
                  <span>OFFICIAL DIGITAL STORE</span>
                  <span>•</span>
                  <span>VERIFIED KEYS</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {platform.name} Catalog
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#a0a0b8]">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Code Dispatch</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Global & Regional Activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Filter and Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedGenre === 'all'
                  ? 'bg-[#00d4ff] text-black shadow-md shadow-[#00d4ff]/20'
                  : 'bg-[#12121a] text-[#a0a0b8] hover:text-white border border-white/10'
              }`}
            >
              All Genres ({games.length})
            </button>
            {['Action', 'RPG', 'Open World', 'Sports', 'Racing', 'Horror', 'Sci-Fi'].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedGenre === genre
                    ? 'bg-[#00d4ff] text-black shadow-md shadow-[#00d4ff]/20'
                    : 'bg-[#12121a] text-[#a0a0b8] hover:text-white border border-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#6b6b80]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#12121a] text-xs font-semibold text-white px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#00d4ff]"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price_low">Sort by: Lowest Price</option>
              <option value="price_high">Sort by: Highest Price</option>
              <option value="rating">Sort by: User Rating</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {sorted.map((game) => {
              const inWishlist = isInWishlist(game.id);

              return (
                <div
                  key={game.id}
                  className="group rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative">
                    <Link href={`/game/${game.slug}`} className="block">
                      <div
                        className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                            {game.activationRegion}
                          </span>
                          {game.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded bg-rose-500 text-[10px] font-black text-white uppercase">
                              -{game.discountPercent}%
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-emerald-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded w-fit">
                          ✓ Key In Stock ({game.stockCount})
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => toggleWishlist(game)}
                      className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md border transition-all ${
                        inWishlist
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-black/60 text-white/70 border-white/15 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <div className="text-[10px] text-[#6b6b80] font-mono uppercase">
                        {game.genre.slice(0, 2).join(' • ')}
                      </div>
                      <Link
                        href={`/game/${game.slug}`}
                        className="text-sm font-bold text-white hover:text-[#00d4ff] transition-colors line-clamp-1 block mt-0.5"
                      >
                        {game.title}
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div>
                        {game.discountPercent > 0 && (
                          <div className="text-[11px] text-[#6b6b80] line-through font-mono">
                            {format(game.originalPriceUSD, game.originalPriceIQD)}
                          </div>
                        )}
                        <div className="text-base font-black text-white font-mono">
                          {format(game.priceUSD, game.priceIQD)}
                        </div>
                      </div>

                      <button
                        onClick={() => addItem(game)}
                        className="px-3.5 py-2 rounded-xl bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00d4ff]/20 active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 space-y-3">
            <Gamepad2 className="w-12 h-12 text-[#6b6b80] mx-auto" />
            <h3 className="text-lg font-bold text-white">No titles match this filter</h3>
            <p className="text-xs text-[#a0a0b8]">Try selecting a different genre or clearing filters.</p>
            <button
              onClick={() => setSelectedGenre('all')}
              className="px-4 py-2 rounded-xl bg-[#00d4ff] text-black font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
