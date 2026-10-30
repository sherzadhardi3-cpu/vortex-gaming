// VORTEX GAMING — Server Page with Instant Shell & Suspense Streaming

import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GAMES_CATALOG, getGameBySlug } from '@/lib/data/games';
import { GameDetailClient } from './GameDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GAMES_CATALOG.map((game) => ({
    slug: game.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    return {
      title: 'Game Not Found | VORTEX GAMING',
    };
  }

  return {
    title: `${game.title} (${game.platformName}) — Instant Key Delivery | VORTEX GAMING`,
    description: game.shortDescription,
    keywords: [game.title, game.platformName, 'digital key', 'activation code', ...game.genre],
  };
}

async function GameDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} />;
}

export function GameDetailLoadingFallback() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-white/5 rounded" />

        {/* Hero banner skeleton */}
        <div className="h-80 sm:h-96 rounded-3xl bg-[#12121a] border border-white/5 p-8 sm:p-12 space-y-4 relative overflow-hidden">
          <div className="h-6 w-32 bg-[#00d4ff]/20 rounded-full" />
          <div className="h-12 w-2/3 max-w-xl bg-white/10 rounded-2xl" />
          <div className="h-5 w-1/2 bg-white/5 rounded-lg" />
        </div>

        {/* 2-Column Details & Purchase skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-[#12121a] border border-white/5 p-6 space-y-4">
              <div className="h-6 w-40 bg-white/10 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-4 w-4/6 bg-white/5 rounded" />
            </div>
            <div className="h-48 rounded-2xl bg-[#12121a] border border-white/5 p-6 space-y-3">
              <div className="h-6 w-36 bg-white/10 rounded" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-[#12121a] border border-white/5 p-6 space-y-4">
              <div className="h-10 w-1/2 bg-white/10 rounded-xl" />
              <div className="h-12 w-full bg-[#00d4ff]/20 rounded-xl" />
              <div className="h-12 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<GameDetailLoadingFallback />}>
      <GameDetailContent params={params} />
    </Suspense>
  );
}
