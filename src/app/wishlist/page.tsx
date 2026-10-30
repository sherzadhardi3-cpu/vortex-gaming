'use client';

// VORTEX GAMING — Customer Wishlist Page

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Gamepad2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const { format } = useCurrencyStore();

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider">
              <span>SAVED TITLES</span>
              <span>•</span>
              <span>PRICE DROP ALERTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              MY WISHLIST ({items.length})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-[#a0a0b8] hover:text-rose-400 font-semibold"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-[#12121a] border border-white/10 p-8 space-y-4 max-w-xl mx-auto">
            <Heart className="w-12 h-12 text-[#6b6b80] mx-auto" />
            <h2 className="text-xl font-bold text-white">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#a0a0b8]">
              Save your favorite games here to track deals, discounts, and releases.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Explore Storefront</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((game) => (
              <div
                key={game.id}
                className="rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="relative">
                  <Link href={`/game/${game.slug}`} className="block">
                    <div
                      className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase w-fit">
                        {game.platformName}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeItem(game.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-rose-400 hover:bg-black/90 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <Link
                    href={`/game/${game.slug}`}
                    className="text-sm font-bold text-white hover:text-[#00d4ff] transition-colors line-clamp-1 block"
                  >
                    {game.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="text-base font-black text-white font-mono">
                      {format(game.priceUSD, game.priceIQD)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
