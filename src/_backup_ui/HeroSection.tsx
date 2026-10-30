'use client';

// VORTEX GAMING — Premium Futuristic Hero Section
// Cyberpunk glass aesthetic, interactive CTA, live platform indicators & spotlight banner

import React from 'react';
import Link from 'next/link';
import { Sparkles, Zap, ShieldCheck, ArrowRight, Flame, Trophy, ShoppingCart } from 'lucide-react';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { GAMES_CATALOG } from '@/lib/data/games';

export function HeroSection() {
  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);
  
  // Spotlight top title
  const spotlightGame = GAMES_CATALOG[0]; // Cyberpunk 2077: Phantom Liberty

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      
      {/* Background Glow Mesh & Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#00d4ff]/15 via-[#7c3aed]/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00d4ff]/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#7c3aed]/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Subtle Geometric Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12121a] border border-white/10 text-xs font-semibold text-[#00d4ff] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#00d4ff] animate-ping" />
              <span>OFFICIAL DIGITAL MARKETPLACE</span>
              <span className="text-white/30">•</span>
              <span className="text-[#a0a0b8]">INSTANT KEY DISPATCH</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] font-mono">
              YOUR DIGITAL <br />
              <span className="vortex-gradient-text">GAMING UNIVERSE</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#a0a0b8] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore thousands of authorized game keys, digital codes, and gaming subscriptions for Steam, PlayStation, Xbox, and Epic Games with instant automated delivery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/deals"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-sm sm:text-base hover:opacity-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 group"
              >
                <span>Explore Today's Deals</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/platform/steam"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#12121a] hover:bg-[#1a1a2e] border border-white/10 hover:border-[#00d4ff]/40 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#00d4ff]" />
                <span>Browse Platforms</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">100%</div>
                <div className="text-xs text-[#a0a0b8]">Genuine Activation</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#00d4ff] font-mono">&lt; 30s</div>
                <div className="text-xs text-[#a0a0b8]">Instant Delivery</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">0%</div>
                <div className="text-xs text-[#a0a0b8]">Hidden Fees</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">24/7</div>
                <div className="text-xs text-[#a0a0b8]">Gamer Support</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Spotlight Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Card Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] rounded-2xl blur-lg opacity-25" />

            <div className="relative rounded-2xl bg-[#12121a]/90 backdrop-blur-xl border border-white/15 p-6 shadow-2xl overflow-hidden space-y-6">
              
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>HOT SPOTLIGHT</span>
                </div>
                <div className="text-xs text-[#a0a0b8] font-mono">
                  {spotlightGame.platformName} • {spotlightGame.activationRegion}
                </div>
              </div>

              {/* Game Artwork / Gradient Container */}
              <div className={`w-full h-52 rounded-xl bg-gradient-to-tr ${spotlightGame.bannerGradient} p-6 flex flex-col justify-between relative overflow-hidden shadow-inner`}>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                  {spotlightGame.productType}
                </div>

                <div className="relative z-10 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00d4ff] drop-shadow">
                    Official Release
                  </span>
                  <h3 className="text-2xl font-black text-white drop-shadow-md">
                    {spotlightGame.title}
                  </h3>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white">
                    ⭐ {spotlightGame.rating} / 5.0
                  </div>
                  <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-semibold text-emerald-400">
                    ✓ In Stock ({spotlightGame.stockCount} keys left)
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs text-[#a0a0b8] line-through">
                    {format(spotlightGame.originalPriceUSD, spotlightGame.originalPriceIQD)}
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {format(spotlightGame.priceUSD, spotlightGame.priceIQD)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addItem(spotlightGame)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#00d4ff]" />
                  </button>

                  <Link
                    href={`/game/${spotlightGame.slug}`}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Guarantee Bar */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#a0a0b8]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized Merchant Distribution</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Publisher Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
