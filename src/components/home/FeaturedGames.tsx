'use client';

// VORTEX GAMING — Featured Games Storefront Grid
// Interactive cards with dynamic currency formatting, instant add-to-cart, wishlist toggle

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Sparkles, Check } from 'lucide-react';
import { getFeaturedGames, type GameItem } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

export function FeaturedGames() {
  const games = getFeaturedGames();
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  return (
    <section className="py-16 bg-[#0a0a0f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURATED SELECTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              FEATURED DIGITAL TITLES
            </h2>
          </div>
          <Link
            href="/deals"
            className="text-xs font-bold text-[#00d4ff] hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            View All Games &rarr;
          </Link>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => {
            const inWishlist = isInWishlist(game.id);

            return (
              <div
                key={game.id}
                className="group rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black flex flex-col justify-between overflow-hidden"
              >
                {/* Image / Artwork Banner */}
                <div className="relative">
                  <Link href={`/game/${game.slug}`} className="block">
                    <div
                      className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}
                    >
                      {/* Top Bar inside image */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                          {game.platformName}
                        </span>

                        {game.discountPercent > 0 && (
                          <span className="px-2 py-0.5 rounded bg-rose-500 text-[10px] font-black text-white uppercase tracking-widest shadow-md">
                            -{game.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Region & Tag */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-white font-medium">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md">
                          {game.activationRegion}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-emerald-400 font-semibold">
                          ✓ Key Ready
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Wishlist Button floating over artwork */}
                  <button
                    onClick={() => toggleWishlist(game)}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md border transition-all ${
                      inWishlist
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-black/60 text-white/70 border-white/15 hover:text-white hover:bg-black/80'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Content Box */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-[#6b6b80] font-mono uppercase tracking-wider">
                      {game.genre.slice(0, 2).join(' • ')}
                    </div>
                    <Link
                      href={`/game/${game.slug}`}
                      className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-1 block"
                      title={game.title}
                    >
                      {game.title}
                    </Link>
                  </div>

                  {/* Price & Cart Action */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
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
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
