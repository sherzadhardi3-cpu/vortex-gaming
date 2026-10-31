// VORTEX GAMING — Premium Homepage Redesign Verification Test Suite
// Verifies Header layout, 9-category secondary nav, 68/32 two-column hero banners,
// platform shortcut bar, 3D fan illustrations, and horizontal benefits bar.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TRANSLATIONS } from '../src/lib/i18n/translations.ts';

const headerCode = fs.readFileSync(
  path.join(process.cwd(), 'src/components/layout/Header.tsx'),
  'utf8'
);

const heroCode = fs.readFileSync(
  path.join(process.cwd(), 'src/components/home/HeroSection.tsx'),
  'utf8'
);

const pageCode = fs.readFileSync(
  path.join(process.cwd(), 'src/app/page.tsx'),
  'utf8'
);

// ─── 1. HEADER VERIFICATION ─────────────────────────────────────────────────

test('Header: Dark navy container, wide search bar with electric-blue button', () => {
  // Dark navy background
  assert.ok(headerCode.includes('bg-[#060a17]'), 'Header must use dark navy #060a17 background');
  assert.ok(headerCode.includes('border-[#142038]'), 'Header must use subtle blue border #142038');

  // Search input styling
  assert.ok(headerCode.includes('max-w-xl lg:max-w-2xl'), 'Search bar must be wide');
  assert.ok(headerCode.includes('bg-[#0c1326]'), 'Search bar input must use dark navy background');

  // Integrated electric-blue search button
  assert.ok(
    headerCode.includes('bg-[#0070f3]') && headerCode.includes('hover:bg-[#00d4ff]'),
    'Search bar must feature electric-blue button'
  );
  assert.ok(headerCode.includes('aria-label="Search"'), 'Search button must have accessible aria-label');
});

test('Header: Secondary navigation preserves 9 categories with All Products active on homepage', () => {
  // Active check includes home page
  assert.ok(
    headerCode.includes("isHome || (isStore && (!categoryParam || categoryParam === 'all'))"),
    'All Products must be active on homepage and /store by default'
  );

  // Exact 9 items
  const expectedItems = [
    'allProducts',
    'games',
    'giftCards',
    'itunes',
    'subscriptions',
    'gameAccounts',
    'pcGames',
    'topUps',
    'support',
  ];

  for (const item of expectedItems) {
    assert.ok(headerCode.includes(item), `Secondary nav must include ${item}`);
  }
});

// ─── 2. HERO LAYOUT VERIFICATION ────────────────────────────────────────────

test('Hero Layout: Two-column layout with left GAME ACCOUNTS banner and right stacked banners', () => {
  // Grid layout
  assert.ok(heroCode.includes('grid grid-cols-1 lg:grid-cols-12'), 'Hero must use responsive grid');
  assert.ok(heroCode.includes('lg:col-span-8'), 'Left banner must occupy approximately 66-68% width');
  assert.ok(heroCode.includes('lg:col-span-4'), 'Right column must occupy approximately 32-34% width');
  assert.ok(heroCode.includes('rounded-3xl'), 'Hero banner must use rounded-3xl corners');
  assert.ok(heroCode.includes('border-[#1b2a4a]'), 'Hero banner must use dark blue border');
  assert.ok(heroCode.includes('bg-[#080d1f]'), 'Hero banner must use dark navy cyberpunk surface');
});

test('Hero Content: Left GAME ACCOUNTS banner and Right GIFT CARDS & SUBSCRIPTIONS cards', () => {
  // Left Banner
  assert.ok(heroCode.includes('GAME') && heroCode.includes('ACCOUNTS'), 'Hero must include GAME ACCOUNTS');
  assert.ok(heroCode.includes('Play More. Pay Less.'), 'Hero must include subtitle');
  assert.ok(heroCode.includes('POPULAR'), 'Hero must include POPULAR badge');
  assert.ok(heroCode.includes('Shop Now'), 'Hero must feature Shop Now button');
  assert.ok(heroCode.includes('bg-[#0070f3]'), 'Shop Now CTA must use electric-blue background');

  // Right Stacked Cards
  assert.ok(heroCode.includes('GIFT CARDS'), 'Right column must include GIFT CARDS card');
  assert.ok(heroCode.includes('SUBSCRIPTIONS'), 'Right column must include SUBSCRIPTIONS card');
  assert.ok(heroCode.includes('gift-cards-stack.jpg'), 'Must reference gift cards graphic');
  assert.ok(heroCode.includes('subscriptions-stack.jpg'), 'Must reference subscriptions graphic');
});

test('Hero Platforms: Platform shortcuts and selector row inside hero banner', () => {
  // Platform pills container
  assert.ok(heroCode.includes('Select by Platform'), 'Platform selector heading must exist inside hero');

  // Platform icons with strong platform links
  assert.ok(heroCode.includes('/platform/steam'), 'Platform pills must link to Steam');
  assert.ok(heroCode.includes('/platform/playstation'), 'Platform pills must link to PlayStation');
  assert.ok(heroCode.includes('/platform/xbox'), 'Platform pills must link to Xbox');

  assert.ok(heroCode.includes('SteamIcon'), 'Steam pill must render icon');
  assert.ok(heroCode.includes('PlayStationIcon'), 'PlayStation pill must render icon');
  assert.ok(heroCode.includes('XboxIcon'), 'Xbox pill must render icon');
});

test('Section Removal: Select by Platform section is removed from homepage page.tsx', () => {
  assert.ok(!pageCode.includes('<PlatformShowcase />'), 'PlatformShowcase component must NOT be rendered in page.tsx');
  assert.ok(!pageCode.includes("from '@/components/home/PlatformShowcase'"), 'PlatformShowcase import must NOT be present in page.tsx');
});

// ─── 3. BENEFITS BAR VERIFICATION ───────────────────────────────────────────

test('Benefits Bar: 4 horizontal items directly beneath hero banners with truthful staging wording', () => {
  // Check translation dictionary coverage for all 4 items across en, ku, ar
  const languages = ['en', 'ku', 'ar'];
  for (const lang of languages) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict['trust.instantDelivery'], `trust.instantDelivery must exist in ${lang}`);
    assert.ok(dict['trust.instantDeliveryDesc'], `trust.instantDeliveryDesc must exist in ${lang}`);
    assert.ok(dict['trust.genuineProducts'], `trust.genuineProducts must exist in ${lang}`);
    assert.ok(dict['trust.genuineProductsDesc'], `trust.genuineProductsDesc must exist in ${lang}`);
    assert.ok(dict['trust.securePayment'], `trust.securePayment must exist in ${lang}`);
    assert.ok(dict['trust.securePaymentDesc'], `trust.securePaymentDesc must exist in ${lang}`);
    assert.ok(dict['trust.support'], `trust.support must exist in ${lang}`);
    assert.ok(dict['trust.supportDesc'], `trust.supportDesc must exist in ${lang}`);
  }

  // Exact English strings
  assert.equal(TRANSLATIONS.en['trust.instantDelivery'], 'Instant Delivery');
  assert.equal(TRANSLATIONS.en['trust.instantDeliveryDesc'], 'Get your product right after payment.');
  assert.equal(TRANSLATIONS.en['trust.genuineProducts'], '100% Original');
  assert.equal(TRANSLATIONS.en['trust.genuineProductsDesc'], 'Official and genuine products.');
  assert.equal(TRANSLATIONS.en['trust.securePayment'], 'Secure Payment');
  assert.equal(TRANSLATIONS.en['trust.securePaymentDesc'], 'Safe and trusted payment methods.');
  assert.equal(TRANSLATIONS.en['trust.support'], '24/7 Support');
  assert.equal(TRANSLATIONS.en['trust.supportDesc'], 'We are always here to help.');

  // Placement in HeroSection
  assert.ok(heroCode.includes('Horizontal Benefits Bar'), 'Benefits bar must be inside or directly below HeroSection');
  assert.ok(heroCode.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'), 'Benefits bar must be 4 horizontal columns');
  assert.ok(!pageCode.includes('<BenefitsSection />'), 'Redundant separate bottom BenefitsSection must be removed from page.tsx');
});
