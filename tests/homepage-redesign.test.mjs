// VORTEX GAMING — Premium Homepage Redesign Verification Test Suite
// Verifies Header layout, 9-category secondary nav, 66/34 two-column hero banners,
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

test('Hero Layout: 66/34 two-column grid structure', () => {
  assert.ok(heroCode.includes('lg:grid-cols-12'), 'Hero must use a 12-column grid');
  assert.ok(heroCode.includes('lg:col-span-8'), 'Left banner must occupy approx 66% width (8/12 cols)');
  assert.ok(heroCode.includes('lg:col-span-4'), 'Right banner must occupy approx 34% width (4/12 cols)');
});

test('Hero Layout: Left banner displays GAME ACCOUNTS headline and platform tiles', () => {
  assert.ok(heroCode.includes('POPULAR'), 'Left banner must include POPULAR badge');
  assert.ok(heroCode.includes('GAME'), 'Left banner must include GAME in headline');
  assert.ok(heroCode.includes('ACCOUNTS'), 'Left banner must include ACCOUNTS in headline');
  assert.ok(heroCode.includes('Play More. Pay Less.'), 'Left banner must include subtitle');
  assert.ok(heroCode.includes('/store?category=game-accounts'), 'Left banner CTA must link to game-accounts');

  // 5 Platforms
  assert.ok(heroCode.includes('/platform/steam'), 'Platform tiles must link to Steam');
  assert.ok(heroCode.includes('/platform/playstation'), 'Platform tiles must link to PlayStation');
  assert.ok(heroCode.includes('/platform/xbox'), 'Platform tiles must link to Xbox');
  assert.ok(heroCode.includes('/platform/epic-games'), 'Platform tiles must link to Epic Games');
  assert.ok(heroCode.includes('/store?platform=ea'), 'Platform tiles must link to EA');
});

test('Hero Layout: Right banner displays stacked GIFT CARDS and SUBSCRIPTIONS with 3D fan graphics', () => {
  // Top Card: Gift Cards
  assert.ok(heroCode.includes('GIFT CARDS'), 'Right top card must feature GIFT CARDS');
  assert.ok(heroCode.includes('/store?category=gift-cards'), 'Gift cards CTA must link to /store?category=gift-cards');
  assert.ok(heroCode.includes('Top up your balance.'), 'Gift cards must display balance subtitle');
  assert.ok(heroCode.includes('GiftCardFan'), 'Gift cards card must render 3D GiftCardFan illustration');

  // Bottom Card: Subscriptions
  assert.ok(heroCode.includes('SUBSCRIPTIONS'), 'Right bottom card must feature SUBSCRIPTIONS');
  assert.ok(heroCode.includes('/store?category=subscriptions'), 'Subscriptions CTA must link to /store?category=subscriptions');
  assert.ok(heroCode.includes('More Games.'), 'Subscriptions must display benefits subtitle');
  assert.ok(heroCode.includes('SubscriptionCardFan'), 'Subscriptions card must render 3D SubscriptionCardFan illustration');
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
  assert.equal(TRANSLATIONS.en['trust.instantDeliveryDesc'], 'Automated key dispatch upon payment clearance.');
  assert.equal(TRANSLATIONS.en['trust.genuineProducts'], '100% Original');
  assert.equal(TRANSLATIONS.en['trust.genuineProductsDesc'], 'Official and genuine authorized publisher keys.');
  assert.equal(TRANSLATIONS.en['trust.securePayment'], 'Secure Payment');
  assert.equal(TRANSLATIONS.en['trust.securePaymentDesc'], 'Encrypted 256-bit checkout & sandbox tested.');
  assert.equal(TRANSLATIONS.en['trust.support'], '24/7 Support');
  assert.equal(TRANSLATIONS.en['trust.supportDesc'], 'Dedicated gamer assistance and ticket helpdesk.');

  // Placement in HeroSection
  assert.ok(heroCode.includes('Horizontal Benefits Bar'), 'Benefits bar must be inside or directly below HeroSection');
  assert.ok(heroCode.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'), 'Benefits bar must be 4 horizontal columns');
  assert.ok(!pageCode.includes('<BenefitsSection />'), 'Redundant separate bottom BenefitsSection must be removed from page.tsx');
});
