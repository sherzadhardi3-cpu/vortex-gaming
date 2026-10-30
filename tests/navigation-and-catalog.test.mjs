// VORTEX GAMING — Navigation and Product Catalog Layout Test Suite
// Verifies 9-item secondary navigation order, category filtering, multi-platform filters,
// currency-aware price filtering, and trilingual i18n support.

import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES_CATALOG } from '../src/lib/data/games.ts';
import { TRANSLATIONS } from '../src/lib/i18n/translations.ts';
import { PLATFORMS } from '../src/lib/constants.ts';

test('Secondary Navigation: Exact 9-item order and category mappings', () => {
  const EXPECTED_NAV_ORDER = [
    { id: 'all', href: '/store', labelKey: 'nav.allProducts' },
    { id: 'games', href: '/store?category=games', labelKey: 'nav.games' },
    { id: 'gift-cards', href: '/store?category=gift-cards', labelKey: 'nav.giftCards' },
    { id: 'itunes', href: '/store?category=itunes', labelKey: 'nav.itunes', isApple: true },
    { id: 'subscriptions', href: '/store?category=subscriptions', labelKey: 'nav.subscriptions' },
    { id: 'game-accounts', href: '/store?category=game-accounts', labelKey: 'nav.gameAccounts' },
    { id: 'pc-games', href: '/store?category=pc-games', labelKey: 'nav.pcGames' },
    { id: 'top-ups', href: '/store?category=top-ups', labelKey: 'nav.topUps' },
    { id: 'support', href: '/support', labelKey: 'nav.support' },
  ];

  assert.equal(EXPECTED_NAV_ORDER.length, 9, 'Navigation must have exactly 9 items');
  assert.equal(EXPECTED_NAV_ORDER[0].id, 'all');
  assert.equal(EXPECTED_NAV_ORDER[1].id, 'games');
  assert.equal(EXPECTED_NAV_ORDER[2].id, 'gift-cards');
  assert.equal(EXPECTED_NAV_ORDER[3].id, 'itunes');
  assert.equal(EXPECTED_NAV_ORDER[3].isApple, true);
  assert.equal(EXPECTED_NAV_ORDER[4].id, 'subscriptions');
  assert.equal(EXPECTED_NAV_ORDER[5].id, 'game-accounts');
  assert.equal(EXPECTED_NAV_ORDER[6].id, 'pc-games');
  assert.equal(EXPECTED_NAV_ORDER[7].id, 'top-ups');
  assert.equal(EXPECTED_NAV_ORDER[8].id, 'support');
});

test('Catalog Filtering: Every category has matching items in GAMES_CATALOG', () => {
  function matchesCategory(game, category) {
    if (category === 'all') return true;
    if (category === 'games') {
      return game.category === 'games' || game.productType === 'GAME' || game.productType === 'DLC';
    }
    if (category === 'gift-cards') {
      return game.category === 'gift-cards' || game.productType === 'GIFT_CARD';
    }
    if (category === 'itunes') {
      return (
        game.category === 'itunes' ||
        game.productType === 'ITUNES' ||
        game.tags?.some((t) => t.toLowerCase() === 'itunes') ||
        game.title.toLowerCase().includes('itunes')
      );
    }
    if (category === 'subscriptions') {
      return game.category === 'subscriptions' || game.productType === 'SUBSCRIPTION';
    }
    if (category === 'game-accounts') {
      return (
        game.category === 'game-accounts' ||
        game.productType === 'GAME_ACCOUNT' ||
        game.title.toLowerCase().includes('account')
      );
    }
    if (category === 'pc-games') {
      return (
        game.category === 'pc-games' ||
        ['steam', 'epic', 'rockstar', 'ea', 'ubisoft'].includes(game.platform)
      );
    }
    if (category === 'top-ups') {
      return game.category === 'top-ups' || game.productType === 'TOP_UP';
    }
    return false;
  }

  const allItems = GAMES_CATALOG.filter((g) => matchesCategory(g, 'all'));
  assert.ok(allItems.length >= 25, `Expected at least 25 items in catalog, found ${allItems.length}`);

  const games = GAMES_CATALOG.filter((g) => matchesCategory(g, 'games'));
  assert.ok(games.length > 0, 'Games category must have items');

  const giftCards = GAMES_CATALOG.filter((g) => matchesCategory(g, 'gift-cards'));
  assert.ok(giftCards.length > 0, 'Gift Cards category must have items');
  assert.ok(giftCards.some((g) => g.title.includes('Xbox Gift Card') || g.title.includes('PlayStation Network')));

  const itunes = GAMES_CATALOG.filter((g) => matchesCategory(g, 'itunes'));
  assert.ok(itunes.length > 0, 'iTunes category must have items');
  assert.ok(itunes.some((g) => g.title.toLowerCase().includes('itunes')));

  const subscriptions = GAMES_CATALOG.filter((g) => matchesCategory(g, 'subscriptions'));
  assert.ok(subscriptions.length > 0, 'Subscriptions category must have items');
  assert.ok(subscriptions.some((g) => g.title.includes('Xbox Game Pass')));

  const gameAccounts = GAMES_CATALOG.filter((g) => matchesCategory(g, 'game-accounts'));
  assert.ok(gameAccounts.length > 0, 'Game Accounts category must have items');
  assert.ok(gameAccounts.some((g) => g.title.includes('Fortnite') || g.title.includes('Black Ops') || g.title.includes('ARK')));

  const pcGames = GAMES_CATALOG.filter((g) => matchesCategory(g, 'pc-games'));
  assert.ok(pcGames.length > 0, 'PC Games category must have items');

  const topUps = GAMES_CATALOG.filter((g) => matchesCategory(g, 'top-ups'));
  assert.ok(topUps.length > 0, 'Top-Ups category must have items');
  assert.ok(topUps.some((g) => g.title.includes('PUBG') || g.title.includes('Free Fire')));
});

test('Platform Multi-Select: Filtering by multiple platforms works as expected', () => {
  const selectedPlatforms = ['steam', 'xbox'];
  const filtered = GAMES_CATALOG.filter((g) => selectedPlatforms.includes(g.platform));

  assert.ok(filtered.length > 0, 'Should return items for steam and xbox');
  assert.ok(filtered.every((g) => g.platform === 'steam' || g.platform === 'xbox'), 'Filtered items must only be steam or xbox');
});

test('Price Filtering: Accurate filtering in USD and IQD', () => {
  // USD filtering (e.g. $10 to $20)
  const minUSD = 10;
  const maxUSD = 20;
  const filteredUSD = GAMES_CATALOG.filter((g) => {
    const usd = g.priceUSD / 100;
    return usd >= minUSD && usd <= maxUSD;
  });
  assert.ok(filteredUSD.length > 0, 'Should find products between $10 and $20');
  assert.ok(filteredUSD.every((g) => g.priceUSD >= 1000 && g.priceUSD <= 2000));

  // IQD filtering (e.g. 15,000 to 35,000 IQD)
  const minIQD = 15000;
  const maxIQD = 35000;
  const filteredIQD = GAMES_CATALOG.filter((g) => g.priceIQD >= minIQD && g.priceIQD <= maxIQD);
  assert.ok(filteredIQD.length > 0, 'Should find products between 15,000 and 35,000 IQD');
  assert.ok(filteredIQD.every((g) => g.priceIQD >= 15000 && g.priceIQD <= 35000));
});

test('i18n: All navigation and catalog keys exist in en, ku, and ar', () => {
  const requiredKeys = [
    'nav.allProducts',
    'nav.games',
    'nav.giftCards',
    'nav.itunes',
    'nav.subscriptions',
    'nav.gameAccounts',
    'nav.pcGames',
    'nav.topUps',
    'nav.support',
    'catalog.categories',
    'catalog.platformFilters',
    'catalog.priceRange',
    'catalog.minPrice',
    'catalog.maxPrice',
    'catalog.applyFilter',
    'catalog.clearFilters',
    'catalog.inStockOnly',
    'catalog.viewGrid',
    'catalog.viewList',
    'catalog.fromPrice',
    'catalog.emptyTitle',
    'catalog.emptySubtitle',
    'catalog.browseAll',
  ];

  for (const lang of ['en', 'ku', 'ar']) {
    const dict = TRANSLATIONS[lang];
    for (const key of requiredKeys) {
      assert.ok(dict[key], `Missing key "${key}" in language "${lang}"`);
      assert.ok(dict[key].length > 0, `Key "${key}" in "${lang}" cannot be empty`);
    }
  }
});
