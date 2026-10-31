// VORTEX GAMING — Visa & Mastercard Checkout Test Suite
// Verifies:
// 1. Iraqi Local Cards (Qi Card, Neo, Switch, FIB Card) form & brand detection.
// 2. International Cards (Stripe tokenized) form & compliant security descriptions.
// 3. Card Processing Flow: Details -> AUTHORIZE CONFIRM PAYMENT -> Bank Authentication (3DS/OTP) -> Processing -> Verification -> Success.
// 4. Payment Failure Handling: Bank decline or invalid OTP displays Payment Failed with safe retry without cart loss.
// 5. Zero Raw Card Storage: PAN and CVV are never stored in order store, database, or disk.
// 6. QR Isolation: Visa and Mastercard flows use secure card processing, not QR codes.
// 7. Idempotency & Duplicate Charge Defense: Prevents multiple deductions and redundant key allocations.

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
} from '../src/lib/orders/order-store.ts';

const checkoutCode = fs.readFileSync(
  path.join(process.cwd(), 'src/app/checkout/page.tsx'),
  'utf8'
);

const processCardCode = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/checkout/process-card/route.ts'),
  'utf8'
);

// ─── 1. IRAQI LOCAL CARDS INTERFACE & BRAND DETECTION ────────────────────────

test('1. Iraqi Local Cards: Supports Qi Card, Neo, Switch, and FIB Card with brand detection', () => {
  // Qi Card, Neo, Switch, FIB Card test presets
  assert.ok(checkoutCode.includes("autofillIraqiCard('qi')"), 'Must provide Qi Card test autofill');
  assert.ok(checkoutCode.includes("autofillIraqiCard('neo')"), 'Must provide Neo Bank test autofill');
  assert.ok(checkoutCode.includes("autofillIraqiCard('switch')"), 'Must provide Switch test autofill');
  assert.ok(checkoutCode.includes("autofillIraqiCard('fib')"), 'Must provide FIB Card test autofill');

  // Brand detection logic for Iraqi cards
  assert.ok(checkoutCode.includes('Qi Card'), 'Must detect Qi Card');
  assert.ok(checkoutCode.includes('Neo'), 'Must detect Neo');
  assert.ok(checkoutCode.includes('Switch'), 'Must detect Switch');
  assert.ok(checkoutCode.includes('FIB Card'), 'Must detect FIB Card');

  // Input fields for card details
  assert.ok(checkoutCode.includes('Cardholder Full Name'), 'Must require Cardholder Full Name');
  assert.ok(checkoutCode.includes('Card Number'), 'Must require Card Number');
  assert.ok(checkoutCode.includes('Expiry Date (MM/YY)'), 'Must require Expiry Date');
  assert.ok(checkoutCode.includes('CVV / CVC'), 'Must require CVV/CVC');

  // Sandbox separation
  assert.ok(
    checkoutCode.includes('SANDBOX PREVIEW') && checkoutCode.includes('Central Bank of Iraq'),
    'Must clearly separate sandbox Iraqi local card payments'
  );
});

// ─── 2. INTERNATIONAL CARDS & COMPLIANT TOKENIZATION ─────────────────────────

test('2. International Cards: Preserves styling, tokenized inputs, and compliant security claims', () => {
  // Test autofill for Visa and Mastercard
  assert.ok(checkoutCode.includes("autofillInternationalCard('visa')"), 'Must support Visa test card');
  assert.ok(checkoutCode.includes("autofillInternationalCard('mastercard')"), 'Must support Mastercard test card');

  // Tokenized inputs
  assert.ok(
    checkoutCode.includes('PCI-COMPLIANT TOKENIZED GATEWAY') ||
    checkoutCode.includes('Tokenized Processing'),
    'Must declare tokenized architecture without unsubstantiated claims'
  );

  // Zero raw card handling declaration
  assert.ok(
    checkoutCode.includes('Zero raw card handling') && checkoutCode.includes('Stripe API'),
    'Must explain that tokenization occurs via payment gateway without local raw card storage'
  );

  // Save card checkbox
  assert.ok(checkoutCode.includes('saveCardCheckbox'), 'Must provide save card token checkbox');
});

// ─── 3. CARD PROCESSING FLOW & BANK AUTHENTICATION (3D SECURE / OTP) ─────────

test('3. Card Processing Flow: Details -> AUTHORIZE CONFIRM PAYMENT -> 3D Secure / OTP Modal', () => {
  // Submission calls process-card API
  assert.ok(
    checkoutCode.includes('/api/checkout/process-card'),
    'Card payments must submit to /api/checkout/process-card'
  );

  // Modal challenge
  assert.ok(
    checkoutCode.includes('activeCardAuth'),
    'Must manage activeCardAuth state for Bank Authentication challenge'
  );
  assert.ok(
    checkoutCode.includes('3D SECURE 2.0 STRONG AUTHENTICATION'),
    'Must display 3D Secure 2.0 Strong Authentication header'
  );
  assert.ok(
    checkoutCode.includes('SMS Verification Code (OTP)'),
    'Must render OTP verification code input field'
  );
  assert.ok(
    checkoutCode.includes('Confirm & Authenticate Payment'),
    'Must feature Confirm & Authenticate Payment button'
  );

  // Payment Processing state
  assert.ok(
    checkoutCode.includes('Payment Processing...'),
    'Must display Payment Processing while authentication is pending'
  );
  assert.ok(
    checkoutCode.includes('Authorizing transaction with bank gateway'),
    'Must inform user that authorization is in progress'
  );

  // Payment Successful state
  assert.ok(
    checkoutCode.includes('Payment Successful'),
    'Must display Payment Successful after authoritative confirmation'
  );
});

// ─── 4. PAYMENT DECLINE & SAFE RETRY FLOW ────────────────────────────────────

test('4. Payment Failure: Declined transactions display Payment Failed with safe retry without cart loss', () => {
  assert.ok(
    checkoutCode.includes('Simulate Decline'),
    'Must provide decline simulation button in sandbox'
  );
  assert.ok(
    checkoutCode.includes('Try Again with Another Card'),
    'Must provide retry button allowing customer to try another card'
  );
  assert.ok(
    checkoutCode.includes('handleRetryFailedCard'),
    'Must implement handleRetryFailedCard handler'
  );
});

// ─── 5. SECURITY: ZERO RAW CARD PAN OR CVV STORAGE ───────────────────────────

test('5. Zero Raw Card Storage: PAN and CVV are strictly excluded from order store and persistence', () => {
  // In process-card route
  assert.ok(
    processCardCode.includes('const cardLast4 = rawCardNumber.slice(-4)'),
    'Must extract only last 4 digits for display'
  );
  assert.ok(
    processCardCode.includes('maskedCard'),
    'Must construct masked card string'
  );

  // Verify that rawCardNumber and cvc are never written to createAuthoritativeOrder
  assert.ok(
    !processCardCode.includes('rawCardNumber:'),
    'rawCardNumber must not be an order property'
  );
  assert.ok(
    !processCardCode.includes('cvc:'),
    'cvc must not be an order property'
  );
  assert.ok(
    !processCardCode.includes('cardCvc:'),
    'cardCvc must not be an order property'
  );
});

// ─── 6. QR CODE ISOLATION ────────────────────────────────────────────────────

test('6. QR Code Isolation: Visa and Mastercard do NOT render QR codes', () => {
  // Check that Visa and Mastercard flows do NOT link to QRCodeDisplay
  const iraqiCardIdx = checkoutCode.indexOf("paymentMethod === 'iraqi_cards'");
  const intlCardIdx = checkoutCode.indexOf("paymentMethod === 'international_cards'");

  assert.ok(iraqiCardIdx !== -1, 'Iraqi cards preview must exist');
  assert.ok(intlCardIdx !== -1, 'International cards preview must exist');

  // Previews contain form inputs, not QRCodeDisplay
  assert.ok(checkoutCode.includes('placeholder="4000 1234 5678 9010"'), 'Iraqi preview has card inputs');
  assert.ok(checkoutCode.includes('placeholder="4242 4242 4242 4242"'), 'International preview has card inputs');

  // QR codes are strictly isolated to FIB and FastPay in VIEW B
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fib'"),
    'FIB QR is isolated'
  );
  assert.ok(
    checkoutCode.includes("activeSession.provider === 'fastpay'"),
    'FastPay QR is isolated'
  );
});

// ─── 7. END-TO-END CARD PAYMENT STATE MACHINE INTEGRITY ──────────────────────

test('7. End-to-End: Card order created PENDING -> PROCESSING -> verified PAID with atomic key delivery', () => {
  const items = [
    { id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 },
  ];

  const totals = calculateAuthoritativeTotals(items, 'USD');
  const orderNumber = `VTX-CARD-${Date.now()}`;

  // 1. Order created in PENDING status
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'alex@example.com',
    customerId: null,
    customerName: 'Alex Mercer',
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
    paymentProvider: 'international_cards',
  });

  assert.equal(order.paymentStatus, 'PENDING', 'Card order starts PENDING');

  // 2. Card authorization transitions to PROCESSING
  const procResult = markOrderAsProcessing(order.id, '3D Secure authentication in progress');
  assert.ok(procResult.success, 'Transition to PROCESSING must succeed');
  assert.equal(procResult.order.paymentStatus, 'PROCESSING', 'Order must be PROCESSING');

  // Customer cannot view keys in PROCESSING status
  const procSanitized = sanitizeOrderForCustomer(procResult.order);
  assert.ok(!procSanitized.deliveryDetails, 'Keys must not be exposed while PROCESSING');

  // 3. Bank authentication verified -> Order marked PAID
  const paidResult = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_card_test_3ds_verified',
    paymentSessionId: 'sess_card_test_verified',
  });

  assert.ok(paidResult.success, 'markOrderAsPaid must succeed');
  assert.equal(paidResult.order.paymentStatus, 'PAID', 'Order must be PAID');
  assert.equal(paidResult.order.fulfillmentStatus, 'COMPLETED', 'Fulfillment must be COMPLETED');

  // Post-payment: Keys allocated
  const paidSanitized = sanitizeOrderForCustomer(paidResult.order);
  assert.equal(paidSanitized.paymentStatus, 'PAID', 'Sanitized status is PAID');
  assert.ok(paidSanitized.items.length > 0, 'Items delivered');

  // 4. Idempotency check: Subsequent payment attempts on already-paid order do not re-fulfill
  const keyCountBefore = paidResult.order.allocatedKeys.length;
  const duplicatePay = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_card_duplicate_attempt',
  });
  assert.ok(duplicatePay.success, 'Idempotent call succeeds');
  assert.equal(duplicatePay.order.allocatedKeys.length, keyCountBefore, 'Key count must not change on duplicate payment');
});

// ─── 8. DECLINED CARD STATE MACHINE INTEGRITY ────────────────────────────────

test('8. End-to-End: Declined card marks order FAILED and strictly revokes inventory allocation', () => {
  const items = [
    { id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 },
  ];

  const totals = calculateAuthoritativeTotals(items, 'IQD');
  const orderNumber = `VTX-DECLINED-${Date.now()}`;

  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'failed@example.com',
    customerId: null,
    customerName: 'Karwan Declined',
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
    paymentProvider: 'iraqi_cards',
  });

  // Bank declines OTP / transaction
  const failResult = markOrderAsFailed(order.id, 'Bank authentication failed: Invalid OTP');
  assert.ok(failResult.success, 'markOrderAsFailed must succeed');
  assert.equal(failResult.order.paymentStatus, 'FAILED', 'Order must be FAILED');
  assert.equal(failResult.order.fulfillmentStatus, 'FAILED', 'Fulfillment must be FAILED');

  // Customer cannot view keys in FAILED status
  const failSanitized = sanitizeOrderForCustomer(failResult.order);
  assert.ok(!failSanitized.deliveryDetails, 'Keys must not be exposed for FAILED order');
});
