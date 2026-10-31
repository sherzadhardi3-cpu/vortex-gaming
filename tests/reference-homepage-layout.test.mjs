// VORTEX GAMING — Homepage Screenshot Reference Verification
// Verifies Header, 9-Category Navigation, Asymmetric 2-Column Hero,
// Fanned 3D Graphics, and 4-Pillar Trust Bar.

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

// ─── 1. HEADER & ORDER VERIFICATION ─────────────────────────────────────────

test('Header: Control layout matches screenshot order (Language -> Currency -> Cart -> Profile)', () => {
  const langIndex = headerCode.indexOf('ref={langMenuRef}');
  const currIndex = headerCode.indexOf('ref={currencyMenuRef}');
  const cartIndex = headerCode.indexOf('href="/cart"');
  const userIndex = headerCode.indexOf('ref={userMenuRef}');

  assert.ok(langIndex !== -1, 'Language selector must exist');
  assert.ok(currIndex !== -1, 'Currency selector must exist');
  assert.ok(cartIndex !== -1, 'Cart button must exist');
  assert.ok(userIndex !== -1, 'User profile menu must exist');

  assert.ok(langIndex < currIndex, 'Language selector must precede Currency selector');
  assert.ok(currIndex < cartIndex, 'Currency selector must precede Cart');
  assert.ok(cartIndex < userIndex, 'Cart must precede User profile avatar');

  // Profile avatar online indicator
  assert.ok(headerCode.includes('bg-emerald-400 rounded-full'), 'Avatar must feature green online indicator dot');
});

// ─── 2. SECONDARY NAVIGATION VERIFICATION ───────────────────────────────────

test('Navigation: 9 categories with All Products outlined pill active state', () => {
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

  // Active pill styling
  assert.ok(
    headerCode.includes('bg-[#0c162d] text-white font-bold shadow-sm shadow-[#0070f3]/30 border border-[#0070f3]'),
    'Active category must be styled as an outlined dark blue pill with border'
  );

  // Apple icon on iTunes
  assert.ok(headerCode.includes('isApple: true'), 'iTunes must have isApple flag');
});

// ─── 3. TWO-COLUMN HERO SECTION VERIFICATION ────────────────────────────────

test('Hero: Two-column layout with Left Game Accounts and Right Stacked Cards', () => {
  // Left Column (col-span-8)
  assert.ok(heroCode.includes('lg:col-span-8'), 'Left column must use col-span-8');
  assert.ok(heroCode.includes('GAME ACCOUNTS') || (heroCode.includes('GAME') && heroCode.includes('ACCOUNTS')), 'Left banner must have GAME ACCOUNTS title');
  assert.ok(heroCode.includes('POPULAR'), 'Left banner must include POPULAR badge');
  assert.ok(heroCode.includes('Play More. Pay Less.'), 'Left banner must include Play More. Pay Less.');
  assert.ok(heroCode.includes('hero-game-accounts-banner.jpg'), 'Left banner must use hero game accounts montage');

  // Platform Shortcuts
  assert.ok(heroCode.includes('Select by Platform'), 'Platform selector heading must exist');
  assert.ok(heroCode.includes('SteamIcon'), 'Steam icon must exist');
  assert.ok(heroCode.includes('PlayStationIcon'), 'PlayStation icon must exist');
  assert.ok(heroCode.includes('XboxIcon'), 'Xbox icon must exist');
  assert.ok(heroCode.includes('EpicGamesIcon'), 'Epic Games icon must exist');
  assert.ok(heroCode.includes('EAIcon'), 'EA icon must exist');

  // Right Column (col-span-4)
  assert.ok(heroCode.includes('lg:col-span-4'), 'Right column must use col-span-4');
  assert.ok(heroCode.includes('GIFT CARDS'), 'Right column must have GIFT CARDS');
  assert.ok(heroCode.includes('Top up your balance.'), 'Gift cards subtitle must be present');
  assert.ok(heroCode.includes('gift-cards-stack.jpg'), 'Must link to 3D gift cards stack graphic');

  assert.ok(heroCode.includes('SUBSCRIPTIONS'), 'Right column must have SUBSCRIPTIONS');
  assert.ok(heroCode.includes('More Games.'), 'Subscriptions subtitle must be present');
  assert.ok(heroCode.includes('subscriptions-stack.jpg'), 'Must link to 3D subscriptions stack graphic');
});

// ─── 4. VALUE PROPOSITION BAR VERIFICATION ──────────────────────────────────

test('Trust Bar: 4 pillars directly underneath hero with exact reference text', () => {
  assert.equal(TRANSLATIONS.en['trust.instantDelivery'], 'Instant Delivery');
  assert.equal(TRANSLATIONS.en['trust.instantDeliveryDesc'], 'Get your product right after payment.');
  assert.equal(TRANSLATIONS.en['trust.genuineProducts'], '100% Original');
  assert.equal(TRANSLATIONS.en['trust.genuineProductsDesc'], 'Official and genuine products.');
  assert.equal(TRANSLATIONS.en['trust.securePayment'], 'Secure Payment');
  assert.equal(TRANSLATIONS.en['trust.securePaymentDesc'], 'Safe and trusted payment methods.');
  assert.equal(TRANSLATIONS.en['trust.support'], '24/7 Support');
  assert.equal(TRANSLATIONS.en['trust.supportDesc'], 'We are always here to help.');

  assert.ok(heroCode.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'), 'Trust bar must render 4 columns');
});
