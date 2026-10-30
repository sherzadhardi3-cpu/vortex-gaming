// VORTEX GAMING — Server Page with Static SSG Pre-rendering for High Performance & SEO

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

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} />;
}
