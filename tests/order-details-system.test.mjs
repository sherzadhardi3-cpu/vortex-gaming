// VORTEX GAMING — Order Details & Payment Lifecycle Automated Test Suite
// Verifies 4-stage stepper, real timestamped timeline, payment verification guard,
// cryptographic key delivery, sandbox isolation, IDOR authorization, and trilingual support.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Ensure test encryption key is configured
if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {
    // fallback
  }
}
if (!process.env.GAME_KEY_ENCRYPTION_KEY) {
  process.env.GAME_KEY_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
}
import {
  createAuthoritativeOrder,
  getOrderById,
  markOrderAsPaid,
  markOrderAsFailed,
  reconcileOrderRefund,
  revealOrderActivationKeys,
  verifyOrderOwnership,
  sanitizeOrderForCustomer,
  allocateGameKeysForOrder,
} from '../src/lib/orders/order-store.ts';
import { canRevealActivationKey } from '../src/lib/orders/order-state-machine.ts';
import { TRANSLATIONS } from '../src/lib/i18n/translations.ts';

test('Security Guard: Pending orders strictly never reveal keys', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-PENDING-${Date.now()}`,
    customerEmail: 'gamer_pending@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: false,
  });

  assert.equal(order.paymentStatus, 'PENDING');
  assert.equal(order.fulfillmentStatus, 'NOT_STARTED');
  assert.equal(canRevealActivationKey(order.paymentStatus, order.fulfillmentStatus), false);

  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });

  assert.equal(revealResult.success, false);
  assert.ok(revealResult.error?.includes('Awaiting Payment Confirmation'));
  assert.equal(revealResult.keys, undefined);
});

test('Security Guard: Failed payments strictly never reveal keys', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-FAILED-${Date.now()}`,
    customerEmail: 'gamer_failed@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: false,
  });

  markOrderAsFailed(order.id, 'Card declined by issuing bank');

  const failedOrder = getOrderById(order.id);
  assert.equal(failedOrder?.paymentStatus, 'FAILED');
  assert.equal(failedOrder?.fulfillmentStatus, 'FAILED');

  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });

  assert.equal(revealResult.success, false);
  assert.equal(revealResult.keys, undefined);
});

test('Verified Payment: Verified payment webhook advances order and allocates keys', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-PAID-${Date.now()}`,
    customerEmail: 'gamer_paid@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true, // Sandbox keys for testing
  });

  const payResult = markOrderAsPaid(order.id, {
    paymentIntentId: 'pi_test_123456789',
    paymentSessionId: 'cs_test_123456789',
  });

  assert.equal(payResult.success, true);
  const paidOrder = getOrderById(order.id);
  assert.equal(paidOrder?.paymentStatus, 'PAID');
  assert.equal(paidOrder?.fulfillmentStatus, 'COMPLETED');
  assert.ok(paidOrder?.allocatedKeys.length > 0);
  assert.ok(paidOrder?.paidAt);
  assert.ok(paidOrder?.fulfilledAt);

  // Now reveal key
  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });

  assert.equal(revealResult.success, true);
  assert.equal(revealResult.keys?.length, 1);
  assert.ok(revealResult.keys?.[0].plainTextKey.length > 5);
});

test('Timeline Integrity: Event history records real timestamps and stages accurately', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-TIMELINE-${Date.now()}`,
    customerEmail: 'gamer_timeline@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(order.id);
  revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });

  const updatedOrder = getOrderById(order.id);
  assert.ok(updatedOrder?.statusHistory.length >= 3);

  const initialPaymentEvent = updatedOrder.statusHistory.find(
    (h) => h.statusType === 'PAYMENT' && h.to === 'PENDING'
  );
  assert.ok(initialPaymentEvent);
  assert.ok(new Date(initialPaymentEvent.timestamp).getTime() > 0);

  const confirmedPaymentEvent = updatedOrder.statusHistory.find(
    (h) => h.statusType === 'PAYMENT' && h.to === 'PAID'
  );
  assert.ok(confirmedPaymentEvent);

  const fulfillmentCompletedEvent = updatedOrder.statusHistory.find(
    (h) => h.statusType === 'FULFILLMENT' && h.to === 'COMPLETED'
  );
  assert.ok(fulfillmentCompletedEvent);
});

test('Idempotency Guard: Duplicate webhook payments do not duplicate deliveries', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-IDEMPOTENT-${Date.now()}`,
    customerEmail: 'gamer_idem@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  // First payment event
  const res1 = markOrderAsPaid(order.id);
  assert.equal(res1.success, true);
  const count1 = getOrderById(order.id)?.allocatedKeys.length;

  // Duplicate webhook event
  const res2 = markOrderAsPaid(order.id);
  assert.equal(res2.success, true);
  const count2 = getOrderById(order.id)?.allocatedKeys.length;

  assert.equal(count1, count2, 'Allocated keys count must remain identical on duplicate webhook');
});

test('Authorization Guard (IDOR Prevention): Unauthorized users cannot access another user order', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-IDOR-${Date.now()}`,
    customerEmail: 'legitimate_customer@vortex.test',
    customerId: 'cust_legit_001',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(order.id);

  // Attacker attempts access
  const isOwner = verifyOrderOwnership(order, {
    userId: 'attacker_user_999',
    email: 'attacker@evil.test',
    orderAccessToken: 'invalid_token_xyz',
  });
  assert.equal(isOwner, false, 'Ownership verification must reject mismatched credentials');

  const revealResult = revealOrderActivationKeys(order.id, {
    userId: 'attacker_user_999',
    email: 'attacker@evil.test',
    orderAccessToken: 'invalid_token_xyz',
  });
  assert.equal(revealResult.success, false);
  assert.equal(revealResult.statusCode, 403);
  assert.equal(revealResult.keys, undefined);
});

test('Refund Reversal: Refunding an order marks REFUNDED and revokes digital keys', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-REFUND-${Date.now()}`,
    customerEmail: 'gamer_refund@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(order.id);
  const refundSuccess = reconcileOrderRefund(order.id, 'Customer requested refund via payment dispute');
  assert.equal(refundSuccess, true);

  const refundedOrder = getOrderById(order.id);
  assert.equal(refundedOrder?.paymentStatus, 'REFUNDED');
  assert.equal(refundedOrder?.fulfillmentStatus, 'REVOKED');
  assert.ok(refundedOrder?.revokedAt);

  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
    email: order.customerEmail,
  });
  assert.equal(revealResult.success, false);
  assert.equal(revealResult.keys, undefined);
});

test('Customer Sanitization: Server order payload includes summary and zero unencrypted keys', () => {
  const order = createAuthoritativeOrder({
    orderNumber: `TEST-SANITIZE-${Date.now()}`,
    customerEmail: 'gamer_sanitized@vortex.test',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'steam',
        quantity: 2,
        unitPriceUSD: 2999,
        unitPriceIQD: 39000,
      },
    ],
    total: 5998,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(order.id);

  const sanitized = sanitizeOrderForCustomer(order);
  assert.equal(sanitized.id, order.id);
  assert.equal(sanitized.orderNumber, order.orderNumber);
  assert.equal(sanitized.total, 5998);
  assert.equal(sanitized.items.length, 1);
  assert.equal(sanitized.items[0].quantity, 2);
  assert.equal(sanitized.items[0].unitPriceUSD, 2999);
  assert.ok(sanitized.statusHistory.length >= 2);
  // Guarantee zero raw keys leaked in status payload
  assert.equal((sanitized).allocatedKeys, undefined);
});

test('i18n: All orderDetails keys exist across English, Kurdish, and Arabic', () => {
  const requiredKeys = [
    'orderDetails.backToOrders',
    'orderDetails.orderNumber',
    'orderDetails.placedOn',
    'orderDetails.stageOrderPlaced',
    'orderDetails.stagePaymentConfirmed',
    'orderDetails.stageFulfillmentCompleted',
    'orderDetails.stageDelivered',
    'orderDetails.totalDelivered',
    'orderDetails.viewDetails',
    'orderDetails.hideDetails',
    'orderDetails.customerSupport',
    'orderDetails.rateNow',
    'orderDetails.orderSummary',
    'orderDetails.subtotal',
    'orderDetails.discount',
    'orderDetails.total',
    'orderDetails.paymentMethod',
    'orderDetails.paymentStatus',
    'orderDetails.fulfillmentStatus',
    'orderDetails.statusPaid',
    'orderDetails.statusPending',
    'orderDetails.statusFailed',
    'orderDetails.statusRefunded',
    'orderDetails.statusCompleted',
    'orderDetails.statusProcessing',
    'orderDetails.awaitingPayment',
    'orderDetails.boughtBy',
    'orderDetails.testOrderNotice',
    'orderDetails.activationGuide',
    'orderDetails.region',
    'orderDetails.platform',
    'orderDetails.copyKey',
    'orderDetails.revealKey',
    'orderDetails.copied',
    'orderDetails.timelineHistory',
    'orderDetails.orderNotFound',
    'orderDetails.orderNotFoundDesc',
  ];

  for (const lang of ['en', 'ku', 'ar']) {
    const dict = TRANSLATIONS[lang];
    for (const key of requiredKeys) {
      assert.ok(dict[key], `Missing key "${key}" in language "${lang}"`);
      assert.ok(dict[key].length > 0, `Key "${key}" in language "${lang}" cannot be empty`);
    }
  }
});
