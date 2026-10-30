'use client';

// VORTEX GAMING — Search Results Page
// Fast search across game title, platform, publisher, and genre with live filters

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, SlidersHorizontal, Gamepad2 } from 'lucide-react';
import { GAMES_CATALOG } from '@/lib/data/games';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useCartStore } from '@/lib/store/useCartStore';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const { format } = useCurrencyStore();
  const addItem = useCartStore((state) => state.addItem);

  const results = GAMES_CATALOG.filter((g) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.platformName.toLowerCase().includes(q) ||
      g.publisher.toLowerCase().includes(q) ||
      g.genre.some((gn) => gn.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Input Bar */}
        <div className="mb-10 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, platform, genre, or publisher..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#12121a] border border-white/10 text-sm text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff] shadow-xl"
            />
            <Search className="w-5 h-5 text-[#6b6b80] absolute left-4 top-3.5" />
          </div>
          <div className="text-xs text-[#a0a0b8] mt-2">
            Showing {results.length} results {query && <span>for "{query}"</span>}
          </div>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((game) => (
              <div
                key={game.id}
                className="rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                <Link href={`/game/${game.slug}`} className="block">
                  <div
                    className={`w-full h-44 bg-gradient-to-tr ${game.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                  >
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase w-fit">
                      {game.platformName}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded w-fit">
                      ✓ Instant Key
                    </span>
                  </div>
                </Link>

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
        ) : (
          <div className="text-center py-20 rounded-2xl bg-[#12121a] border border-white/10 p-8 space-y-3">
            <Gamepad2 className="w-12 h-12 text-[#6b6b80] mx-auto" />
            <h3 className="text-lg font-bold text-white">No games found</h3>
            <p className="text-xs text-[#a0a0b8]">Try searching for keywords like "Steam", "Cyberpunk", or "Racing".</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-white">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
