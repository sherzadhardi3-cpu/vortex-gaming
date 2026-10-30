// VORTEX GAMING — Platform Server Component with Static SSG Pre-rendering

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

export default async function PlatformPage({ params }: PageProps) {
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
