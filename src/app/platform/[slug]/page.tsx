// VORTEX GAMING — Platform Server Component with Instant Shell & Suspense Streaming

import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PLATFORMS } from '@/lib/constants';
import { GAMES_CATALOG, getGamesByPlatform } from '@/lib/data/games';
import { PlatformClient } from './PlatformClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLATFORMS.map((platform) => ({
    slug: platform.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORMS.find((p) => p.slug === slug || p.id === slug);

  if (!platform) {
    return {
      title: 'Platform Not Found | VORTEX GAMING',
    };
  }

  return {
    title: `${platform.name} Games & Activation Keys | VORTEX GAMING`,
    description: `Browse official, legitimate ${platform.name} digital keys and codes with instant automated delivery.`,
  };
}

async function PlatformContent({ params }: PageProps) {
  const { slug } = await params;
  const platform = PLATFORMS.find((p) => p.slug === slug || p.id === slug);

  if (!platform) {
    notFound();
  }

  const games = getGamesByPlatform(platform.slug).length > 0
    ? getGamesByPlatform(platform.slug)
    : GAMES_CATALOG.filter((g) => g.platform === platform.id);

  return <PlatformClient platform={platform} games={games} />;
}

export function PlatformLoadingFallback() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
        {/* Banner Skeleton */}
        <div className="h-48 sm:h-56 rounded-3xl bg-[#12121a] border border-white/5 relative overflow-hidden flex flex-col justify-end p-8 space-y-3">
          <div className="h-4 w-28 bg-[#00d4ff]/20 rounded-full" />
          <div className="h-10 w-64 max-w-full bg-white/10 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-white/5 rounded-lg" />
        </div>

        {/* Filter bar skeleton */}
        <div className="h-14 rounded-2xl bg-[#12121a] border border-white/5" />

        {/* Game cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-[#12121a] border border-white/5 p-4 space-y-3">
              <div className="h-44 rounded-xl bg-white/5" />
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="h-8 w-full bg-white/5 rounded-lg mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlatformPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlatformLoadingFallback />}>
      <PlatformContent params={params} />
    </Suspense>
  );
}
