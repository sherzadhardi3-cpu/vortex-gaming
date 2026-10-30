'use client';

// VORTEX GAMING — Supported Gaming Platforms Showcase
// Covers all 7 platforms: Steam, Epic Games, Rockstar, Xbox, PlayStation, EA, Ubisoft

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PLATFORMS } from '@/lib/constants';
import { GAMES_CATALOG } from '@/lib/data/games';

export function PlatformShowcase() {
  return (
    <section className="py-16 border-t border-white/5 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
              OFFICIAL ECOSYSTEM
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              SUPPORTED GAMING PLATFORMS
            </h2>
          </div>
          <p className="text-xs text-[#a0a0b8] max-w-md">
            Direct digital key activation for major launchers and gaming consoles. Always lawful, publisher-compliant, and region-verified.
          </p>
        </div>

        {/* 7-Platform Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PLATFORMS.map((platform) => {
            const count = GAMES_CATALOG.filter((g) => g.platform === platform.slug || g.platform === platform.id).length;

            return (
              <Link
                key={platform.id}
                href={`/platform/${platform.slug}`}
                className="group relative p-5 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between overflow-hidden"
              >
                {/* Ambient Platform Glow on hover */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: platform.color }}
                />

                <div className="flex items-start justify-between">
                  <div className="text-3xl p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </div>
                  <div className="p-1 rounded-lg bg-white/5 text-[#a0a0b8] group-hover:text-[#00d4ff] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <div className="text-base font-bold text-white group-hover:text-[#00d4ff] transition-colors">
                    {platform.name}
                  </div>
                  <div className="text-xs text-[#a0a0b8]">
                    {count > 0 ? `${count} Active Titles` : 'Full Catalog Ready'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold pt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Global & Regional Keys</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
