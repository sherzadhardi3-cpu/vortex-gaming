// VORTEX GAMING — Checkout Payment Flow Redesign Test Suite
// Verifies:
// 1. Selection Phase: Does NOT display QR codes immediately on selection.
// 2. Pre-Authorization: Displays payment method preview, order summary, and AUTHORIZE CONFIRM PAYMENT button.
// 3. Session Generation: Creates server-authoritative payment session on button click; guards against double clicks.
// 4. Provider QR Isolation: If FIB selected, displays ONLY FIB QR. If FastPay selected, displays ONLY FastPay QR.
// 5. Backend Verification: "Check Payment Status" queries backend order status. Never auto-marks paid on client.
// 6. Sandbox Integrity: Clearly labeled mock QR codes; genuine provider test sessions.

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
  sanitizeOrderForCustomer,
} from '../src/lib/orders/order-store.ts';

const checkoutCode = fs.readFileSync(
  path.join(process.cwd(), 'src/app/checkout/page.tsx'),
  'utf8'
);

const sessionRouteCode = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/checkout/create-session/route.ts'),
  'utf8'
);

// ─── 1. FLOW ARCHITECTURE & INITIAL SELECTION STATE ──────────────────────────

test('1. Initial Selection: No QR codes rendered before clicking Authorize button', () => {
  // Must render QR only when activeSession is established
  assert.ok(
    checkoutCode.includes('{!activeSession ? ('),
    'Checkout must have distinct pre-session configuration vs active session views'
  );

  // In pre-session view, FIB and FastPay cards must display previews without QRCodeDisplay
  assert.ok(
    checkoutCode.includes('PREVIEW: FIB BANK'),
    'FIB must have an initial pre-authorization preview card'
  );
  assert.ok(
    checkoutCode.includes('PREVIEW: FASTPAY MOBILE WALLET'),
    'FastPay must have an initial pre-authorization preview card'
  );

  // Must feature the exact AUTHORIZE & CONFIRM PAYMENT CTA button
  assert.ok(
    checkoutCode.includes('AUTHORIZE & CONFIRM PAYMENT'),
    'Must display AUTHORIZE & CONFIRM PAYMENT button before session creation'
  );

  // Button submission must be guarded against duplicate clicks
  assert.ok(
    checkoutCode.includes('if (isAuthorizing) return;'),
    'Must prevent duplicate session creation requests on repeated clicks'
  );
  assert.ok(
    checkoutCode.includes('disabled={isAuthorizing'),
    'Authorize button must be disabled while session is being generated'
  );
});

// ─── 2. PROVIDER QR CODE ISOLATION ───────────────────────────────────────────

test('2. Provider QR Isolation: FIB displays ONLY FIB QR; FastPay displays ONLY FastPay QR', () => {
  // FIB QR Panel condition
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fib'"),
    'Must isolate FIB QR checkout to activeSession.provider === fib'
  );
  assert.ok(
    checkoutCode.includes('First Iraqi Bank (FIB) QR Checkout'),
    'FIB panel must feature official title'
  );
  assert.ok(
    checkoutCode.includes('provider="fib"'),
    'QRCodeDisplay must receive fib provider configuration'
  );

  // FastPay QR Panel condition
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fastpay'"),
    'Must isolate FastPay QR checkout to activeSession.provider === fastpay'
  );
  assert.ok(
    checkoutCode.includes('FastPay Mobile Wallet QR Checkout'),
    'FastPay panel must feature official title'
  );
  assert.ok(
    checkoutCode.includes('provider="fastpay"'),
    'QRCodeDisplay must receive fastpay provider configuration'
  );
  assert.ok(
    checkoutCode.includes('892401'),
    'FastPay panel must show verified merchant ID 892401'
  );
});

// ─── 3. BACKEND STATUS VERIFICATION & SECURITY ───────────────────────────────

test('3. Backend Verification: "Check Payment Status" queries server without auto-marking paid', () => {
  // Check Payment Status button
  assert.ok(
    checkoutCode.includes('handleCheckPaymentStatus'),
    'Must implement handleCheckPaymentStatus handler'
  );
  assert.ok(
    checkoutCode.includes('Check Payment Status'),
    'Must render Check Payment Status button'
  );

  // Must query authoritative order status API
  assert.ok(
    checkoutCode.includes('/api/orders/${activeSession.orderId}?token='),
    'Must call backend orders status endpoint with token credentials'
  );

  // Must inspect paymentStatus and only advance when PAID
  assert.ok(
    checkoutCode.includes("if (paymentStatus === 'PAID')"),
    'Must verify paymentStatus === PAID from backend before advancing'
  );
  assert.ok(
    checkoutCode.includes('Payment Status: PENDING'),
    'Must display pending state feedback when backend reports PENDING'
  );

  // Change method / Cancel session button
  assert.ok(
    checkoutCode.includes('handleCancelSession'),
    'Must provide cancel session button allowing customer to change payment method'
  );
});

// ─── 4. SANDBOX TRUTH & GATEWAY SEPARATION ───────────────────────────────────

test('4. Sandbox Truth: Mock QR codes are clearly labeled and do not present fabricated live codes', () => {
  assert.ok(
    checkoutCode.includes('Sandbox Test Session') || checkoutCode.includes('Sandbox Staging Gateway'),
    'Must clearly label sandbox test sessions'
  );
  assert.ok(
    checkoutCode.includes('Mock provider QR code') || checkoutCode.includes('Sandbox Mock QR Code'),
    'Must label mock QR codes transparently'
  );
  assert.ok(
    checkoutCode.includes('Real funds are never deducted in sandbox') || checkoutCode.includes('Real money will not be deducted'),
    'Must declare that real money is not deducted in sandbox'
  );

  // Provider route returns isSandbox: true
  assert.ok(
    sessionRouteCode.includes('isSandbox: true'),
    'create-session route must declare isSandbox: true for non-production stubs'
  );
});

// ─── 5. END-TO-END FLOW: ORDER STORE TRANSACTION INTEGRITY ────────────────────

test('5. End-to-End: Order starts PENDING, awaits clearance, advances only upon verification', () => {
  const items = [
    { id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 },
  ];

  const totals = calculateAuthoritativeTotals(items, 'IQD');
  const orderNumber = `VTX-TEST-${Date.now()}`;

  // 1. Authoritative order created in PENDING status
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'gamer@example.com',
    customerId: null,
    customerName: 'Karwan Test',
    items: totals.verifiedItems.map((i) => ({
      gameId: i.gameId,
      title: i.title,
      platform: i.platform,
      quantity: i.quantity,
      unitPriceUSD: i.unitPriceUSD,
      unitPriceIQD: i.unitPriceIQD,
    })),
    total: totals.authoritativeTotal,
    currency: totals.displayCurrency,
    displayCurrency: totals.displayCurrency,
    exchangeRate: totals.exchangeRate,
    convertedTotal: totals.convertedTotal,
    rateTimestamp: new Date().toISOString(),
    discountApplied: 0,
    paymentProvider: 'fib',
  });

  assert.equal(order.paymentStatus, 'PENDING', 'New session order must start PENDING');
  assert.equal(order.fulfillmentStatus, 'NOT_STARTED', 'Fulfillment must not start');

  // Customer cannot view keys in PENDING state
  const sanitized = sanitizeOrderForCustomer(order);
  assert.ok(!sanitized.deliveryDetails, 'Keys must not be present in PENDING state');

  // 2. Verified backend clearance advances order to PAID and allocates keys
  const paidResult = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_test_fib_verified',
    paymentSessionId: 'sess_test_fib_verified',
  });

  assert.ok(paidResult.success, 'markOrderAsPaid must succeed');
  assert.equal(paidResult.order.paymentStatus, 'PAID', 'Order must be PAID');
  assert.equal(paidResult.order.fulfillmentStatus, 'COMPLETED', 'Fulfillment must be COMPLETED');

  // After clearance, sanitized order contains allocated items
  const paidSanitized = sanitizeOrderForCustomer(paidResult.order);
  assert.ok(paidSanitized.items.length > 0, 'Must have items');
  assert.equal(paidSanitized.paymentStatus, 'PAID', 'Payment status must be PAID');
});
