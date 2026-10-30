// VORTEX GAMING — Homepage Storefront
// Composition of Hero, Platforms, Featured Titles, Trending Leaderboard, Flash Deals, Trust Pillars, and FAQ

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PlatformShowcase } from '@/components/home/PlatformShowcase';
import { FeaturedGames } from '@/components/home/FeaturedGames';
import { TrendingGames } from '@/components/home/TrendingGames';
import { DealsSection } from '@/components/home/DealsSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { FAQSection } from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Platform Icons Showcase */}
      <PlatformShowcase />

      {/* Featured Games */}
      <FeaturedGames />

      {/* Trending Games */}
      <TrendingGames />

      {/* Weekend Flash Deals */}
      <DealsSection />

      {/* Customer Trust & Security Pillars */}
      <BenefitsSection />

      {/* FAQ Preview */}
      <FAQSection />
    </div>
  );
}
