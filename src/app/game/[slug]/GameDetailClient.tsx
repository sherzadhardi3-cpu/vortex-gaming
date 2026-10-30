'use client';

// VORTEX GAMING — Product Detail Client Component
// Handles interactive tabs, currency formatting, add-to-cart & buy now

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  ShoppingCart,
  Heart,
  CheckCircle,
  HelpCircle,
  Cpu,
  Monitor,
  HardDrive,
  Sparkles,
  Star,
  Lock,
} from 'lucide-react';
import type { GameItem } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

interface GameDetailClientProps {
  game: GameItem;
}

export function GameDetailClient({ game }: GameDetailClientProps) {
  const router = useRouter();
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(game.id);

  const [activeTab, setActiveTab] = useState<'details' | 'guide' | 'specs' | 'reviews'>('details');

  const handleBuyNow = () => {
    addItem(game);
    router.push('/checkout');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0a0a0f]">
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#a0a0b8] flex items-center gap-2">
        <Link href="/" className="hover:text-white">Storefront</Link>
        <span>/</span>
        <Link href={`/platform/${game.platform}`} className="hover:text-white capitalize">
          {game.platformName}
        </Link>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-xs">{game.title}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Media & Information Tabs */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Artwork Hero Showcase */}
            <div className={`w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-tr ${game.bannerGradient} p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl`}>
              <div className="flex items-center justify-between relative z-10">
                <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                  {game.platformName}
                </span>

                {game.discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-xl bg-rose-500 text-xs font-black text-white uppercase tracking-wider shadow-lg">
                    SAVE {game.discountPercent}%
                  </span>
                )}
              </div>

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Legit Key • Immediate Vault Dispatch</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                  {game.title}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 max-w-2xl drop-shadow line-clamp-2">
                  {game.shortDescription}
                </p>
              </div>
            </div>

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#12121a] border border-white/10 text-xs">
              <div>
                <span className="text-[#6b6b80] block text-[10px] uppercase">Publisher</span>
                <span className="font-bold text-white truncate block">{game.publisher}</span>
              </div>
              <div>
                <span className="text-[#6b6b80] block text-[10px] uppercase">Developer</span>
                <span className="font-bold text-white truncate block">{game.developer}</span>
              </div>
              <div>
                <span className="text-[#6b6b80] block text-[10px] uppercase">Release Date</span>
                <span className="font-bold text-white block">{game.releaseDate}</span>
              </div>
              <div>
                <span className="text-[#6b6b80] block text-[10px] uppercase">Region Lock</span>
                <span className="font-bold text-[#00d4ff] block">{game.activationRegion}</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-white/10 flex gap-6 text-sm">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 font-bold transition-all relative ${
                  activeTab === 'details'
                    ? 'text-[#00d4ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00d4ff]'
                    : 'text-[#a0a0b8] hover:text-white'
                }`}
              >
                Game Overview
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`pb-3 font-bold transition-all relative ${
                  activeTab === 'guide'
                    ? 'text-[#00d4ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00d4ff]'
                    : 'text-[#a0a0b8] hover:text-white'
                }`}
              >
                Activation Instructions
              </button>
              {game.systemRequirements && (
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 font-bold transition-all relative ${
                    activeTab === 'specs'
                      ? 'text-[#00d4ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00d4ff]'
                      : 'text-[#a0a0b8] hover:text-white'
                  }`}
                >
                  System Requirements
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-bold transition-all relative ${
                  activeTab === 'reviews'
                    ? 'text-[#00d4ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00d4ff]'
                    : 'text-[#a0a0b8] hover:text-white'
                }`}
              >
                Customer Reviews ({game.reviewCount})
              </button>
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'details' && (
              <div className="space-y-6 text-sm text-[#a0a0b8] leading-relaxed">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">About This Product</h3>
                  <p>{game.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                    Genres & Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {game.genre.map((g) => (
                      <span key={g} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white">
                        {g}
                      </span>
                    ))}
                    {game.tags.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-lg bg-[#00d4ff]/10 text-xs text-[#00d4ff] border border-[#00d4ff]/20">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Genuine Key Guarantee</h5>
                    <p className="text-xs text-[#a0a0b8] mt-0.5">
                      This key was verified directly through authorized channels and is guaranteed to redeem on {game.platformName}. No accounts, no password-sharing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">How to Redeem on {game.platformName}</h3>
                <div className="p-5 rounded-2xl bg-[#12121a] border border-white/10 text-xs leading-relaxed whitespace-pre-line text-[#a0a0b8] font-mono">
                  {game.activationGuide}
                </div>
                <p className="text-xs text-[#6b6b80]">
                  Need help? Contact our 24/7 technical team via the Help Desk for live troubleshooting.
                </p>
              </div>
            )}

            {activeTab === 'specs' && game.systemRequirements && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">PC System Requirements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/5">
                      <Monitor className="w-4 h-4 text-[#00d4ff]" />
                      <span>Operating System</span>
                    </div>
                    <div className="text-[#a0a0b8]">{game.systemRequirements.os}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/5">
                      <Cpu className="w-4 h-4 text-[#7c3aed]" />
                      <span>Processor (CPU)</span>
                    </div>
                    <div className="text-[#a0a0b8]">{game.systemRequirements.processor}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Memory & Graphics</span>
                    </div>
                    <div className="text-[#a0a0b8]">
                      <div>{game.systemRequirements.memory}</div>
                      <div className="mt-1">{game.systemRequirements.graphics}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/5">
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      <span>Storage Space</span>
                    </div>
                    <div className="text-[#a0a0b8]">{game.systemRequirements.storage}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#12121a] border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-white font-mono">{game.rating}</div>
                    <div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <div className="text-xs text-[#a0a0b8] mt-0.5">
                        Based on {game.reviewCount} verified customer activations
                      </div>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Aram K.</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                          ✓ Verified Purchase
                        </span>
                      </div>
                      <span className="text-[#6b6b80]">2 days ago</span>
                    </div>
                    <p className="text-[#a0a0b8]">
                      Received key immediately after payment with FIB. Activated on Steam without issues. Highly recommended marketplace!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-6 sticky top-28">
              <div>
                <div className="text-xs text-[#6b6b80] uppercase font-mono tracking-wider">
                  Authoritative Price
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {format(game.priceUSD, game.priceIQD)}
                  </span>
                  {game.discountPercent > 0 && (
                    <span className="text-sm text-[#6b6b80] line-through font-mono">
                      {format(game.originalPriceUSD, game.originalPriceIQD)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#a0a0b8]">Stock State:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    In Stock ({game.stockCount} keys)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a0a0b8]">Activation Region:</span>
                  <span className="text-white font-bold">{game.activationRegion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a0a0b8]">Format:</span>
                  <span className="text-[#00d4ff] font-bold">Digital Code / Key</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-sm hover:opacity-95 transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BUY NOW (INSTANT KEY)</span>
                </button>

                <button
                  onClick={() => addItem(game)}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a2e] hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 text-[#00d4ff]" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={() => toggleWishlist(game)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    inWishlist
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-transparent border-white/10 text-[#a0a0b8] hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                  <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-[#a0a0b8]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00d4ff]" />
                  <span>PCI DSS Encrypted Transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>14-Day Unredeemed Key Refund Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
