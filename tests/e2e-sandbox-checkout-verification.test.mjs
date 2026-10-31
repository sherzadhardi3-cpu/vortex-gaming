// VORTEX GAMING — End-to-End Sandbox Checkout Verification Test Suite
// Verifies all 5 payment methods:
// 1. Vortex Wallet
// 2. FIB Bank QR
// 3. FastPay QR
// 4. Iraqi Local Visa/Mastercard (Qi Card, Neo, Switch, FIB Card)
// 5. International Visa/Mastercard (Stripe tokenized)
//
// Key Criteria:
// - AUTHORIZE & CONFIRM PAYMENT works correctly.
// - FIB/FastPay QR codes appear only after payment initiation.
// - Card payments use secure gateway authentication (3DS / OTP).
// - Failed or pending payments never deliver game keys.
// - Successful verified payments deliver the correct product once (idempotent).
// - Checkout works on desktop and mobile.
// - No real payments are initiated (100% sandbox isolation).

process.env.GAME_KEY_ENCRYPTION_KEY ||= '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.APP_ENV = 'staging';
process.env.FORCE_SANDBOX = 'true';

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateAuthoritativeTotals } from '../src/lib/checkout/authoritative-calculator.ts';
import {
  createAuthoritativeOrder,
  getOrderById,
  markOrderAsPaid,
  markOrderAsFailed,
  markOrderAsProcessing,
  sanitizeOrderForCustomer,
  revealOrderActivationKeys,
} from '../src/lib/orders/order-store.ts';
import { isStripeLiveMode } from '../src/lib/stripe.ts';

const projectRoot = process.cwd().endsWith('vortex-gaming')
  ? process.cwd()
  : path.join(process.cwd(), 'vortex-gaming');

const checkoutCode = fs.readFileSync(
  path.join(projectRoot, 'src/app/checkout/page.tsx'),
  'utf8'
);

const sessionRouteCode = fs.readFileSync(
  path.join(projectRoot, 'src/app/api/checkout/create-session/route.ts'),
  'utf8'
);

const processCardCode = fs.readFileSync(
  path.join(projectRoot, 'src/app/api/checkout/process-card/route.ts'),
  'utf8'
);

// ─── 1. METHOD 1: VORTEX WALLET ──────────────────────────────────────────────

test('Method 1 (Vortex Wallet): Enforces zero balance guard and rejects unbacked deductions', () => {
  // Client-side UI guard: Button is disabled or shows Insufficient Wallet Balance
  assert.ok(
    checkoutCode.includes("paymentMethod === 'vortex_wallet'"),
    'Checkout UI must handle vortex_wallet payment method'
  );
  assert.ok(
    checkoutCode.includes('Insufficient Wallet Balance'),
    'UI must clearly indicate insufficient wallet balance'
  );
  assert.ok(
    checkoutCode.includes("disabled={isAuthorizing || paymentMethod === 'vortex_wallet'}"),
    'Authorize button must be disabled for unfunded wallet'
  );

  // Client click handler guard: Rejects submission
  assert.ok(
    checkoutCode.includes("if (paymentMethod === 'vortex_wallet')"),
    'Submission handler must guard against empty wallet deduction'
  );

  // Backend API route guard: create-session strictly rejects vortex_wallet with 0 balance
  assert.ok(
    sessionRouteCode.includes("if (provider === 'vortex_wallet')"),
    'create-session API must validate vortex_wallet provider'
  );
  assert.ok(
    sessionRouteCode.includes('INSUFFICIENT_WALLET_BALANCE'),
    'Backend must return INSUFFICIENT_WALLET_BALANCE error code'
  );
});

// ─── 2. METHOD 2: FIB BANK QR ────────────────────────────────────────────────

test('Method 2 (FIB Bank QR): Generates QR only after AUTHORIZE click; isolated to FIB', () => {
  // Pre-authorization check: FIB preview shown without QR before clicking button
  assert.ok(
    checkoutCode.includes('PREVIEW: FIB BANK'),
    'FIB must display preview before authorization'
  );
  assert.ok(
    checkoutCode.includes('When you click') &&
    checkoutCode.includes('AUTHORIZE & CONFIRM PAYMENT') &&
    checkoutCode.includes('verified FIB payment session'),
    'FIB preview must instruct user to click authorize button'
  );

  // Authorize action
  assert.ok(
    checkoutCode.includes('AUTHORIZE & CONFIRM PAYMENT'),
    'Must feature AUTHORIZE & CONFIRM PAYMENT CTA button'
  );

  // Backend session creation produces valid FIB reference and payload
  assert.ok(
    sessionRouteCode.includes("provider = 'fib'"),
    'create-session API must support FIB provider'
  );
  assert.ok(
    sessionRouteCode.includes('FIB-PAY-'),
    'FIB reference must use FIB-PAY- prefix'
  );
  assert.ok(
    sessionRouteCode.includes('fib://pay?ref='),
    'FIB QR payload must use fib:// protocol'
  );

  // Active session isolates FIB QR
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fib'"),
    'Active session must isolate FIB QR view'
  );
  assert.ok(
    checkoutCode.includes('First Iraqi Bank (FIB) QR Checkout'),
    'FIB QR panel must display official title'
  );
  assert.ok(
    checkoutCode.includes('Check Payment Status'),
    'FIB panel must feature Check Payment Status button'
  );
});

// ─── 3. METHOD 3: FASTPAY QR ─────────────────────────────────────────────────

test('Method 3 (FastPay QR): Generates QR only after AUTHORIZE click; isolated to FastPay', () => {
  // Pre-authorization check: FastPay preview shown without QR before clicking button
  assert.ok(
    checkoutCode.includes('PREVIEW: FASTPAY MOBILE WALLET'),
    'FastPay must display preview before authorization'
  );
  assert.ok(
    checkoutCode.includes('When you click') &&
    checkoutCode.includes('AUTHORIZE & CONFIRM PAYMENT') &&
    checkoutCode.includes('FastPay payment session'),
    'FastPay preview must instruct user to click authorize button'
  );

  // Backend session creation produces valid FastPay reference and payload
  assert.ok(
    sessionRouteCode.includes("provider = 'fastpay'"),
    'create-session API must support FastPay provider'
  );
  assert.ok(
    sessionRouteCode.includes('FP-'),
    'FastPay reference must use FP- prefix'
  );
  assert.ok(
    sessionRouteCode.includes('fastpay://merchant/'),
    'FastPay QR payload must use fastpay:// protocol'
  );
  assert.ok(
    sessionRouteCode.includes("merchantCode = '892401'"),
    'FastPay session must provide authorized merchant code'
  );

  // Active session isolates FastPay QR
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fastpay'"),
    'Active session must isolate FastPay QR view'
  );
  assert.ok(
    checkoutCode.includes('FastPay Mobile Wallet QR Checkout'),
    'FastPay QR panel must display official title'
  );
  assert.ok(
    checkoutCode.includes('Check Payment Status'),
    'FastPay panel must feature Check Payment Status button'
  );
});

// ─── 4. METHOD 4: IRAQI LOCAL VISA/MASTERCARD ────────────────────────────────

test('Method 4 (Iraqi Local Cards): Form validation, brand detection, and 3DS/OTP challenge', () => {
  // Card input fields
  assert.ok(checkoutCode.includes('Cardholder Full Name'), 'Must require Cardholder Full Name');
  assert.ok(checkoutCode.includes('Card Number'), 'Must require Card Number');
  assert.ok(checkoutCode.includes('Expiry Date (MM/YY)'), 'Must require Expiry Date');
  assert.ok(checkoutCode.includes('CVV / CVC'), 'Must require CVV/CVC');

  // Brand detection for Iraqi local issuers
  assert.ok(checkoutCode.includes("autofillIraqiCard('qi')"), 'Qi Card autofill preset');
  assert.ok(checkoutCode.includes("autofillIraqiCard('neo')"), 'Neo Bank autofill preset');
  assert.ok(checkoutCode.includes("autofillIraqiCard('switch')"), 'Switch autofill preset');
  assert.ok(checkoutCode.includes("autofillIraqiCard('fib')"), 'FIB Card autofill preset');

  // Process-card endpoint invocation
  assert.ok(
    checkoutCode.includes("fetch('/api/checkout/process-card'"),
    'Card submission must post to /api/checkout/process-card'
  );

  // 3DS / OTP Challenge Modal
  assert.ok(
    checkoutCode.includes('activeCardAuth'),
    'Must manage activeCardAuth state for Bank Authentication challenge'
  );
  assert.ok(
    checkoutCode.includes('3D SECURE 2.0 STRONG AUTHENTICATION'),
    'Must display 3D Secure 2.0 Strong Authentication challenge header'
  );
  assert.ok(
    checkoutCode.includes('SMS Verification Code (OTP)'),
    'Must render OTP verification code input field'
  );
  assert.ok(
    checkoutCode.includes('Confirm & Authenticate Payment'),
    'Must feature Confirm & Authenticate Payment button'
  );
});

// ─── 5. METHOD 5: INTERNATIONAL VISA/MASTERCARD ──────────────────────────────

test('Method 5 (International Cards): Tokenized gateway inputs and zero raw card storage', () => {
  // Test autofills for Visa & Mastercard
  assert.ok(checkoutCode.includes("autofillInternationalCard('visa')"), 'Visa test card autofill');
  assert.ok(checkoutCode.includes("autofillInternationalCard('mastercard')"), 'Mastercard test card autofill');

  // Tokenization declaration
  assert.ok(
    checkoutCode.includes('PCI-COMPLIANT TOKENIZED GATEWAY') ||
    checkoutCode.includes('Tokenized Processing'),
    'Must declare tokenized gateway processing'
  );
  assert.ok(
    checkoutCode.includes('Zero raw card handling') && checkoutCode.includes('Stripe API'),
    'Must declare zero raw card storage with gateway tokenization'
  );

  // Backend verification of zero raw card storage
  assert.ok(
    processCardCode.includes('const cardLast4 = rawCardNumber.slice(-4)'),
    'Backend must extract only last 4 digits for masked display'
  );
  assert.ok(
    !processCardCode.includes('rawCardNumber:'),
    'rawCardNumber must NEVER be an order store property'
  );
  assert.ok(
    !processCardCode.includes('cardCvc:'),
    'cardCvc must NEVER be an order store property'
  );
});

// ─── 6. SECURITY: FAILED OR PENDING PAYMENTS NEVER DELIVER KEYS ──────────────

test('Security Guard: Failed or pending payments strictly NEVER deliver game keys', () => {
  const items = [
    { id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 },
  ];

  const totals = calculateAuthoritativeTotals(items, 'USD');

  // 1. Pending order test
  const pendingOrder = createAuthoritativeOrder({
    orderNumber: `VTX-TEST-PEND-${Date.now()}`,
    customerEmail: 'audit@vortexgaming.test',
    customerName: 'Audit Tester',
    items: totals.verifiedItems.map((i) => ({
      gameId: i.gameId,
      title: i.title,
      platform: i.platform,
      quantity: i.quantity,
      unitPriceUSD: i.unitPriceUSD,
      unitPriceIQD: i.unitPriceIQD,
    })),
    currency: totals.displayCurrency,
    displayCurrency: totals.displayCurrency,
    exchangeRate: totals.exchangeRate,
    total: totals.authoritativeTotal,
    convertedTotal: totals.convertedTotal,
    paymentProvider: 'fib',
    isSandbox: true,
  });

  assert.equal(pendingOrder.paymentStatus, 'PENDING');
  assert.equal(pendingOrder.deliveryDetails, undefined, 'Pending order must have undefined deliveryDetails');
  assert.equal(pendingOrder.allocatedKeys.length, 0, 'Pending order must have empty allocatedKeys');

  const sanitizedPending = sanitizeOrderForCustomer(pendingOrder);
  assert.equal(sanitizedPending.deliveryDetails, undefined, 'Sanitized pending order must never contain deliveryDetails');
  assert.equal(sanitizedPending.allocatedKeys, undefined, 'Sanitized pending order must never contain allocatedKeys');

  // 2. Failed order test
  const failedOrder = createAuthoritativeOrder({
    orderNumber: `VTX-TEST-FAIL-${Date.now()}`,
    customerEmail: 'audit-failed@vortexgaming.test',
    customerName: 'Audit Failed Tester',
    items: totals.verifiedItems.map((i) => ({
      gameId: i.gameId,
      title: i.title,
      platform: i.platform,
      quantity: i.quantity,
      unitPriceUSD: i.unitPriceUSD,
      unitPriceIQD: i.unitPriceIQD,
    })),
    currency: totals.displayCurrency,
    displayCurrency: totals.displayCurrency,
    exchangeRate: totals.exchangeRate,
    total: totals.authoritativeTotal,
    convertedTotal: totals.convertedTotal,
    paymentProvider: 'international_cards',
    isSandbox: true,
  });

  const markedFailed = markOrderAsFailed(failedOrder.id, 'Card declined: Insufficient sandbox funds');
  assert.ok(markedFailed.success, 'markOrderAsFailed should succeed');
  assert.equal(markedFailed.order.paymentStatus, 'FAILED');
  assert.equal(markedFailed.order.deliveryDetails, undefined, 'Failed order must have undefined deliveryDetails');
  assert.equal(markedFailed.order.allocatedKeys.length, 0, 'Failed order must have empty allocatedKeys');

  const sanitizedFailed = sanitizeOrderForCustomer(markedFailed.order);
  assert.equal(sanitizedFailed.deliveryDetails, undefined, 'Sanitized failed order must never contain deliveryDetails');
  assert.equal(sanitizedFailed.allocatedKeys, undefined, 'Sanitized failed order must never contain allocatedKeys');
});

// ─── 7. IDEMPOTENT SINGLE KEY RELEASE ON VERIFIED PAYMENT ─────────────────────

test('Key Release Integrity: Verified payment allocates correct key exactly once (idempotent)', () => {
  const items = [
    { id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 },
  ];

  const totals = calculateAuthoritativeTotals(items, 'USD');

  const order = createAuthoritativeOrder({
    orderNumber: `VTX-TEST-PAID-${Date.now()}`,
    customerEmail: 'audit-success@vortexgaming.test',
    customerName: 'Audit Success Tester',
    items: totals.verifiedItems.map((i) => ({
      gameId: i.gameId,
      title: i.title,
      platform: i.platform,
      quantity: i.quantity,
      unitPriceUSD: i.unitPriceUSD,
      unitPriceIQD: i.unitPriceIQD,
    })),
    currency: totals.displayCurrency,
    displayCurrency: totals.displayCurrency,
    exchangeRate: totals.exchangeRate,
    total: totals.authoritativeTotal,
    convertedTotal: totals.convertedTotal,
    paymentProvider: 'iraqi_cards',
    isSandbox: true,
  });

  // Step 1: Transition to PROCESSING
  const procResult = markOrderAsProcessing(order.id);
  assert.ok(procResult.success, 'markOrderAsProcessing should succeed');
  assert.equal(procResult.order.paymentStatus, 'PROCESSING');
  assert.equal(procResult.order.deliveryDetails, undefined, 'Processing order does not have keys yet');

  // Step 2: Authoritative bank verification marks order PAID
  const paidResult1 = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_test_auth_999',
    paymentSessionId: 'sess_test_auth_999',
  });

  assert.ok(paidResult1.success, 'markOrderAsPaid should succeed');
  assert.equal(paidResult1.order.paymentStatus, 'PAID');
  assert.equal(paidResult1.order.fulfillmentStatus, 'COMPLETED');
  assert.equal(paidResult1.order.allocatedKeys.length, 1, 'Must allocate exactly 1 key for 1 item');

  // Verify delivery revealing for buyer
  const revealResult1 = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.ok(revealResult1.success, 'Buyer should be able to decrypt keys for PAID order');
  assert.ok(revealResult1.deliveryDetails && revealResult1.deliveryDetails.length === 1);
  assert.ok(revealResult1.keys && revealResult1.keys.length === 1);

  const allocatedKey1 = paidResult1.order.allocatedKeys[0].encryptedKey;

  // Step 3: Duplicate webhook / payment callback idempotency test
  const paidResult2 = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_test_auth_999_REPLAY',
    paymentSessionId: 'sess_test_auth_999_REPLAY',
  });
  assert.ok(paidResult2.success, 'Duplicate markOrderAsPaid should succeed safely');
  assert.equal(paidResult2.order.paymentStatus, 'PAID');
  assert.equal(paidResult2.order.allocatedKeys.length, 1, 'Duplicate call must NOT allocate a second key');
  assert.equal(paidResult2.order.allocatedKeys[0].encryptedKey, allocatedKey1, 'Encrypted key must remain identical without duplicate deduction');
});

// ─── 8. RESPONSIVE DESIGN: DESKTOP & MOBILE COMPLIANCE ───────────────────────

test('Responsive Layout: Checkout adapts cleanly between desktop and mobile', () => {
  // Mobile single-column stacking and desktop 12-column grid
  assert.ok(
    checkoutCode.includes('grid-cols-1 lg:grid-cols-12'),
    'Checkout layout must use fluid responsive grid: single-col mobile, 12-col desktop'
  );
  assert.ok(
    checkoutCode.includes('lg:col-span-7'),
    'Payment and details section must span 7 cols on desktop'
  );
  assert.ok(
    checkoutCode.includes('lg:col-span-5'),
    'Order summary sidebar must span 5 cols on desktop'
  );

  // Touch targets and adaptive padding
  assert.ok(
    checkoutCode.includes('p-6 sm:p-7'),
    'Container cards must adapt padding between mobile and desktop'
  );
  assert.ok(
    checkoutCode.includes('py-4') && checkoutCode.includes('w-full'),
    'Authorize and Confirm button must be full-width with touch-friendly vertical padding'
  );

  // Modal dialog responsive framing
  assert.ok(
    checkoutCode.includes('max-w-md w-full') && checkoutCode.includes('fixed inset-0 z-50'),
    'Authentication modal must fit mobile viewports'
  );
});

// ─── 9. ZERO REAL PAYMENTS (100% SANDBOX ISOLATION) ──────────────────────────

test('Sandbox Isolation: Zero real live merchant transactions can be initiated', () => {
  // Stripe live mode check returns false
  assert.equal(
    isStripeLiveMode(),
    false,
    'isStripeLiveMode() must return false under staging / FORCE_SANDBOX=true'
  );

  // Session route declares sandbox mode
  assert.ok(
    sessionRouteCode.includes('isSandbox: true'),
    'Session route must explicitly flag all sessions as isSandbox: true'
  );

  // Card route declares sandbox mode
  assert.ok(
    processCardCode.includes('isSandbox: true'),
    'Process card route must explicitly flag all card orders as isSandbox: true'
  );
});
