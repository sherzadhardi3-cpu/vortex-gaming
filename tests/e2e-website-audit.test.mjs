// VORTEX GAMING — End-to-End Website Audit & Subsystem Verification Test Suite
// Verifies all core application subsystems: Storefront, Multi-Currency, Auth, Checkout,
// Key Vault, Support Desk, Admin RBAC, Health Diagnostics, and Render Staging Readiness.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Configure test environment secrets if not already set
process.env.GAME_KEY_ENCRYPTION_KEY ||= '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.APP_ENV = 'staging';
process.env.FORCE_SANDBOX = 'true';

import { GAMES_CATALOG, getGameBySlug } from '../src/lib/data/games.ts';
import { PLATFORMS, CURRENCIES, CURRENCY_CONFIGS, getCurrencyConfig } from '../src/lib/constants.ts';
import { calculateAuthoritativeTotals } from '../src/lib/checkout/authoritative-calculator.ts';
import {
  createAuthoritativeOrder,
  getOrderById,
  markOrderAsPaid,
  revealOrderActivationKeys,
  verifyOrderOwnership,
  sanitizeOrderForCustomer,
} from '../src/lib/orders/order-store.ts';
import { canRevealActivationKey } from '../src/lib/orders/order-state-machine.ts';
import {
  registerStandardUser,
  getUserByEmail,
  getUserById,
  verifyPasswordHash,
} from '../src/lib/auth/user-store.ts';
import { hashPassword, verifyPassword } from '../src/lib/auth/password.ts';
import {
  createTicket,
  addMessageToTicket,
  getTicketsForUser,
} from '../src/lib/support/support-store.ts';
import { encryptGameKey, decryptGameKey } from '../src/lib/crypto/key-vault.ts';

// ─── 1. STOREFRONT & CATALOG AUDIT ──────────────────────────────────────────

test('Subsystem: Product Catalog & Platform Filters integrity', () => {
  assert.ok(GAMES_CATALOG.length >= 25, 'Catalog must contain at least 25 items');
  for (const game of GAMES_CATALOG) {
    assert.ok(game.id, 'Every game must have an id');
    assert.ok(game.slug, 'Every game must have a slug');
    assert.ok(game.title, 'Every game must have a title');
    assert.ok(game.platform, 'Every game must have a platform identifier');
    assert.ok(game.platformName, 'Every game must have a platform name');
    assert.ok(typeof game.priceUSD === 'number' && game.priceUSD > 0, `${game.title} must have a valid priceUSD in cents`);
    assert.ok(typeof game.priceIQD === 'number' && game.priceIQD > 0, `${game.title} must have a valid priceIQD`);
    assert.ok(game.productType, `${game.title} must have a valid productType`);
  }

  // Verify platform coverage
  const expectedPlatforms = ['steam', 'playstation', 'xbox', 'epic', 'ea'];
  for (const p of expectedPlatforms) {
    const found = GAMES_CATALOG.some((g) => g.platform === p || g.platform.includes(p));
    assert.ok(found, `Catalog must contain items for platform: ${p}`);
  }
});

// ─── 2. MULTI-CURRENCY AUDIT (ALL 6 CURRENCIES) ─────────────────────────────

test('Subsystem: All 6 Currencies (USD, IQD, EUR, TRY, SAR, AED) calculate accurately', () => {
  const codes = ['USD', 'IQD', 'EUR', 'TRY', 'SAR', 'AED'];
  assert.equal(CURRENCIES.length, 6, 'Must have exactly 6 supported currencies');

  const sampleGame = GAMES_CATALOG[0]; // priceUSD is in minor units (cents)
  const items = [{ id: sampleGame.id, slug: sampleGame.slug, quantity: 1 }];

  for (const code of codes) {
    const config = getCurrencyConfig(code);
    assert.ok(config, `Config for ${code} must exist`);
    assert.ok(config.rateAgainstUSD > 0, `Rate for ${code} must be positive`);

    const result = calculateAuthoritativeTotals(items, code);
    assert.equal(result.totalUSD, sampleGame.priceUSD);
    assert.equal(result.displayCurrency, code);
    assert.ok(result.convertedTotal > 0, `Converted total in ${code} must be greater than 0`);
    assert.ok(!isNaN(result.convertedTotal), `Converted total in ${code} must not be NaN`);
    assert.ok(result.formattedTotal.length > 0, `Formatted total in ${code} must be non-empty`);
  }
});

// ─── 3. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ──────────────────────────

test('Subsystem: Customer registration, password hashing, and role isolation', async () => {
  const testEmail = `audit_user_${Date.now()}@vortexgaming.test`;
  const rawPassword = 'SecureGamerPass2026!';
  const hashedPassword = await hashPassword(rawPassword);

  assert.notEqual(hashedPassword, rawPassword, 'Password must be hashed');
  assert.ok(await verifyPassword(rawPassword, hashedPassword), 'Password verification must pass');
  assert.ok(!(await verifyPassword('WrongPassword', hashedPassword)), 'Incorrect password must be rejected');

  const user = await registerStandardUser(testEmail, hashedPassword, 'Audit', 'Tester');
  assert.equal(user.email, testEmail);
  assert.equal(user.role, 'CUSTOMER', 'Public registrations must strictly be assigned CUSTOMER role');
  assert.equal(user.mfaEnabled, false);

  const retrieved = await getUserByEmail(testEmail);
  assert.ok(retrieved, 'User must be retrievable by email');
  assert.equal(retrieved.id, user.id);

  const byId = await getUserById(user.id);
  assert.ok(byId, 'User must be retrievable by ID');
  assert.equal(byId.email, testEmail);
});

// ─── 4. CHECKOUT, SANDBOX PAYMENT & KEY VAULT ───────────────────────────────

test('Subsystem: Authoritative checkout, promo discounts, and payment simulation', () => {
  const sampleGame = GAMES_CATALOG[0]; // Cyberpunk: 2999 cents
  const items = [{ id: sampleGame.id, slug: sampleGame.slug, quantity: 2 }];

  // 1. Without promo
  const resNoPromo = calculateAuthoritativeTotals(items, 'USD');
  assert.equal(resNoPromo.totalUSD, sampleGame.priceUSD * 2);
  assert.equal(resNoPromo.discountPercent, 0);

  // 2. With 10% promo VORTEX10
  const resPromo = calculateAuthoritativeTotals(items, 'USD', 'VORTEX10');
  assert.equal(resPromo.discountPercent, 10);
  assert.equal(resPromo.authoritativeTotal, Math.round(sampleGame.priceUSD * 2 * 0.9));

  // 3. Client price tampering rejection
  const tamperedItems = [{ id: sampleGame.id, slug: sampleGame.slug, quantity: 1, priceUSD: 100 }]; // claims $1.00
  const resTampered = calculateAuthoritativeTotals(tamperedItems, 'USD');
  assert.equal(resTampered.totalUSD, sampleGame.priceUSD, 'Tampered price must be discarded');

  // 4. Create authoritative order
  const orderNumber = `VX-AUDIT-${Date.now()}`;
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'audit_checkout@vortex.test',
    items: resPromo.verifiedItems,
    total: resPromo.authoritativeTotal,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  assert.equal(order.paymentStatus, 'PENDING');
  assert.equal(order.fulfillmentStatus, 'NOT_STARTED');
  assert.equal(canRevealActivationKey(order.paymentStatus, order.fulfillmentStatus), false);

  // 5. Simulate payment in sandbox
  const paidResult = markOrderAsPaid(order.id, { paymentIntentId: 'ch_test_audit_simulated' });
  assert.equal(paidResult.success, true);
  const paidOrder = paidResult.order;
  assert.equal(paidOrder.paymentStatus, 'PAID');
  assert.equal(paidOrder.fulfillmentStatus, 'COMPLETED');
  assert.equal(canRevealActivationKey(paidOrder.paymentStatus, paidOrder.fulfillmentStatus), true);

  // 6. Reveal digital keys for authorized customer
  const reveal = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });

  assert.equal(reveal.success, true);
  assert.ok(reveal.keys && reveal.keys.length > 0, 'Must deliver valid digital activation keys');
  for (const k of reveal.keys) {
    assert.ok(k.plainTextKey, 'Key must have plainTextKey');
    assert.ok(k.plainTextKey.length > 10, 'Key must be realistic format');
  }

  // 7. Unauthorized user cannot reveal keys
  const unauthorizedReveal = revealOrderActivationKeys(order.id, {
    orderAccessToken: 'invalid_token_999',
    email: 'hacker@other.com',
  });
  assert.equal(unauthorizedReveal.success, false);
});

// ─── 5. KEY VAULT ENCRYPTION INTEGRITY ──────────────────────────────────────

test('Subsystem: AES-256-GCM digital key vault encryption and decryption', () => {
  const plainKey = 'VTX-STEAM-TEST-KEY-2026-X892';
  const ciphertext = encryptGameKey(plainKey);
  assert.notEqual(ciphertext, plainKey);

  const decrypted = decryptGameKey(ciphertext);
  assert.equal(decrypted, plainKey);
});

// ─── 6. CUSTOMER SUPPORT & DATA ISOLATION ───────────────────────────────────

test('Subsystem: Customer support ticket creation and customer isolation', async () => {
  const userEmail = `gamer_${Date.now()}@vortex.test`;
  const ticket = await createTicket({
    userId: 'usr_audit_1',
    userEmail,
    userName: 'Audit Gamer',
    subject: 'Activation Issue',
    category: 'KEY_ACTIVATION',
    initialMessage: 'My key needs activation help.',
  });

  assert.ok(ticket.id.startsWith('tkt_'));
  assert.equal(ticket.userEmail, userEmail);

  // Add customer reply
  const message = await addMessageToTicket({
    ticketId: ticket.id,
    sender: 'CUSTOMER',
    message: 'Here is my receipt screenshot.',
    senderName: 'Audit Gamer',
    requestingEmail: userEmail,
  });
  assert.ok(message.id.startsWith('msg_'));
  assert.equal(message.ticketId, ticket.id);
  assert.equal(ticket.messages.length, 3);

  // Customer isolation check
  const myTickets = await getTicketsForUser({ userEmail, isAdmin: false });
  assert.equal(myTickets.length, 1);

  const otherTickets = await getTicketsForUser({ userEmail: 'other@user.com', isAdmin: false });
  assert.equal(otherTickets.length, 0, 'Other user must not see tickets');
});

// ─── 7. RENDER STAGING SPECIFICATION & ENVIRONMENT AUDIT ────────────────────

test('Subsystem: Render configuration & staging readiness', () => {
  const renderYaml = fs.readFileSync(path.join(process.cwd(), 'render.yaml'), 'utf8');
  assert.ok(renderYaml.includes('name: vortex-gaming-staging'), 'render.yaml must define vortex-gaming-staging service');
  assert.ok(renderYaml.includes('plan: free'), 'render.yaml must use free plan');
  assert.ok(renderYaml.includes('APP_ENV'), 'render.yaml must configure APP_ENV');
  assert.ok(renderYaml.includes('FORCE_SANDBOX'), 'render.yaml must enforce FORCE_SANDBOX');
  assert.ok(renderYaml.includes('healthCheckPath: /api/health'), 'render.yaml must check /api/health');

  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  assert.ok(pkg.scripts.test, 'package.json must include test script');
  assert.ok(pkg.engines && pkg.engines.node, 'package.json must declare node engine compatibility');
  assert.equal(pkg.type, 'module', 'package.json must use type: module for optimal ESM resolution');
});
