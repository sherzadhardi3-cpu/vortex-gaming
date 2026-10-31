// VORTEX GAMING — Homepage Storefront
// Composition of Hero, Featured Categories, Featured Titles, Trending Leaderboard, Flash Deals, and FAQ

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedGames } from '@/components/home/FeaturedGames';
import { TrendingGames } from '@/components/home/TrendingGames';
import { DealsSection } from '@/components/home/DealsSection';
import { FAQSection } from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Large Cinematic Hero Section & Benefits Bar */}
      <HeroSection />

      {/* Featured Categories & Weekend Promotional Banners */}
      <FeaturedCategories />

      {/* Featured Games */}
      <FeaturedGames />

      {/* Trending Games */}
      <TrendingGames />

      {/* Weekend Flash Deals */}
      <DealsSection />

      {/* FAQ Preview */}
      <FAQSection />
    </div>
  );
}
