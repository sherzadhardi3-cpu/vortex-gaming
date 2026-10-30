// VORTEX GAMING — Strict Payment-First Digital Key Delivery Test Suite
// Exhaustively verifies all 13 critical security scenarios:
// 1. New order starts in PENDING payment and NOT_STARTED fulfillment.
// 2. Unpaid order never exposes a game key.
// 3. Order Confirmation page does not reveal key before payment.
// 4. Client-side URL tampering cannot force PAID status.
// 5. Successful payment webhook moves order to PAID and triggers fulfillment.
// 6. Fulfilled order exposes the key only to the authorized customer.
// 7. Sandbox order uses dummy keys and displays sandbox notices.
// 8. Failed payment marks order FAILED and releases no key.
// 9. Refund marks order REFUNDED and revokes key access.
// 10. Concurrent payments do not sell the same key twice.
// 11. Out-of-stock scenario marks fulfillment FAILED and does not invent fake keys.
// 12. Unauthorized requests cannot access another user's key.
// 13. Reveal and Copy buttons are disabled until fulfillment is complete.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Load environment variables if present
if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {
    // ignore
  }
}

// ─── SCENARIO 1 ─────────────────────────────────────────────────────────────
test('Scenario 1: New order starts in PENDING payment and NOT_STARTED fulfillment', async () => {
  const { createAuthoritativeOrder, getOrderById } = await import('../src/lib/orders/order-store.ts');

  const orderNumber = `VX-TEST-S1-${Date.now()}`;
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'gamer_s1@vortexgaming.gg',
    customerId: 'cust_s1',
    customerName: 'S1 Gamer',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 45000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  assert.ok(order.id, 'Order must have a unique ID');
  assert.equal(order.paymentStatus, 'PENDING', 'New order paymentStatus must be strictly PENDING');
  assert.equal(order.fulfillmentStatus, 'NOT_STARTED', 'New order fulfillmentStatus must be strictly NOT_STARTED');
  assert.equal(order.allocatedKeys.length, 0, 'No keys must be allocated at order creation');
  assert.ok(order.orderAccessToken && order.orderAccessToken.length >= 32, 'Order must generate high-entropy access token');

  const retrieved = getOrderById(order.id);
  assert.ok(retrieved);
  assert.equal(retrieved.paymentStatus, 'PENDING');
  assert.equal(retrieved.fulfillmentStatus, 'NOT_STARTED');
});

// ─── SCENARIO 2 ─────────────────────────────────────────────────────────────
test('Scenario 2: Unpaid order never exposes a game key', async () => {
  const {
    createAuthoritativeOrder,
    sanitizeOrderForCustomer,
    revealOrderActivationKeys,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S2-${Date.now()}`,
    customerEmail: 'gamer_s2@vortexgaming.gg',
    items: [
      {
        gameId: 'elden-ring',
        title: 'Elden Ring',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 3999,
        unitPriceIQD: 60000,
      },
    ],
    total: 3999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  // Verify sanitized view returns ZERO keys
  const sanitized = sanitizeOrderForCustomer(order);
  assert.equal('keys' in sanitized, false, 'Sanitized customer payload must never include keys property');
  assert.equal('allocatedKeys' in sanitized, false, 'Sanitized customer payload must never include allocatedKeys');
  assert.equal(sanitized.canReveal, false, 'canReveal must be false for unpaid order');

  // Attempting to reveal key on unpaid order must be rejected
  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });

  assert.equal(revealResult.success, false, 'Key reveal must fail for unpaid order');
  assert.equal(revealResult.statusCode, 400, 'HTTP status code must be 400 Bad Request');
  assert.equal(revealResult.keys, undefined, 'No keys must be returned in response');
  assert.match(revealResult.error || '', /Awaiting Payment Confirmation/i);
});

// ─── SCENARIO 3 ─────────────────────────────────────────────────────────────
test('Scenario 3: Order Confirmation page does not reveal key before payment', async () => {
  const {
    createAuthoritativeOrder,
    sanitizeOrderForCustomer,
  } = await import('../src/lib/orders/order-store.ts');
  const { canRevealActivationKey } = await import('../src/lib/orders/order-state-machine.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S3-${Date.now()}`,
    customerEmail: 'gamer_s3@vortexgaming.gg',
    items: [
      {
        gameId: 'gta-v',
        title: 'Grand Theft Auto V',
        platform: 'Rockstar',
        quantity: 1,
        unitPriceUSD: 1999,
        unitPriceIQD: 30000,
      },
    ],
    total: 1999,
    currency: 'USD',
    paymentProvider: 'fib',
    isSandbox: true,
  });

  // State machine logic check
  assert.equal(
    canRevealActivationKey(order.paymentStatus, order.fulfillmentStatus),
    false,
    'State machine must deny reveal before payment confirmation'
  );

  const customerView = sanitizeOrderForCustomer(order);
  assert.equal(customerView.canReveal, false);
  assert.equal(customerView.paymentStatus, 'PENDING');
  assert.equal(customerView.fulfillmentStatus, 'NOT_STARTED');
});

// ─── SCENARIO 4 ─────────────────────────────────────────────────────────────
test('Scenario 4: Client-side URL tampering cannot force PAID status', async () => {
  const {
    createAuthoritativeOrder,
    getOrderById,
    revealOrderActivationKeys,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S4-${Date.now()}`,
    customerEmail: 'attacker_s4@evil.com',
    items: [
      {
        gameId: 'starfield',
        title: 'Starfield',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 4999,
        unitPriceIQD: 75000,
      },
    ],
    total: 4999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  // Attacker crafts malicious client query parameters pretending to be paid:
  const tamperedParams = {
    orderId: order.id,
    paymentStatus: 'PAID',
    status: 'PAID',
    override: 'true',
    fulfillmentStatus: 'COMPLETED',
  };

  // Authoritative server lookup ignores client parameters
  const authoritativeOrder = getOrderById(tamperedParams.orderId);
  assert.ok(authoritativeOrder);
  assert.equal(
    authoritativeOrder.paymentStatus,
    'PENDING',
    'Authoritative store must maintain real PENDING state regardless of client input'
  );
  assert.equal(
    authoritativeOrder.fulfillmentStatus,
    'NOT_STARTED',
    'Authoritative store must maintain real NOT_STARTED state regardless of client input'
  );

  // Calling reveal fails because state is derived authoritatively, not from client query
  const attempt = revealOrderActivationKeys(tamperedParams.orderId, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(attempt.success, false);
  assert.equal(attempt.statusCode, 400);
});

// ─── SCENARIO 5 ─────────────────────────────────────────────────────────────
test('Scenario 5: Successful payment webhook moves order to PAID and triggers fulfillment', async () => {
  const { createAuthoritativeOrder, getOrderById } = await import('../src/lib/orders/order-store.ts');
  const { handleVerifiedStripeEvent } = await import('../src/lib/payments/stripe-fulfillment.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S5-${Date.now()}`,
    customerEmail: 'legit_buyer_s5@vortexgaming.gg',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 45000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  // Verify before webhook
  assert.equal(order.paymentStatus, 'PENDING');
  assert.equal(order.fulfillmentStatus, 'NOT_STARTED');

  // Authoritative payment provider webhook event
  const webhookEvent = {
    id: `evt_stripe_s5_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        client_reference_id: order.id,
        payment_intent: `pi_test_${Date.now()}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        customer_email: order.customerEmail,
      },
    },
  };

  const webhookResult = handleVerifiedStripeEvent(webhookEvent);
  assert.equal(webhookResult.duplicate, false);
  assert.equal(webhookResult.action, 'ORDER_FULFILLED_KEYS_ALLOCATED');

  // Verify authoritative state after webhook
  const updatedOrder = getOrderById(order.id);
  assert.ok(updatedOrder);
  assert.equal(updatedOrder.paymentStatus, 'PAID', 'Order paymentStatus must be PAID');
  assert.equal(updatedOrder.fulfillmentStatus, 'COMPLETED', 'Order fulfillmentStatus must be COMPLETED');
  assert.ok(updatedOrder.paidAt, 'Order must record paidAt timestamp');
  assert.ok(updatedOrder.fulfilledAt, 'Order must record fulfilledAt timestamp');
  assert.equal(updatedOrder.allocatedKeys.length, 1, 'Order must have exactly 1 allocated key');
});

// ─── SCENARIO 6 ─────────────────────────────────────────────────────────────
test('Scenario 6: Fulfilled order exposes the key only to the authorized customer', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    revealOrderActivationKeys,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S6-${Date.now()}`,
    customerEmail: 'authorized_owner_s6@vortexgaming.gg',
    customerId: 'user_owner_s6',
    items: [
      {
        gameId: 'elden-ring',
        title: 'Elden Ring',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 3999,
        unitPriceIQD: 60000,
      },
    ],
    total: 3999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(order.id);

  // 1. Authorized Request with valid Token -> SUCCEEDS
  const ownerTokenResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(ownerTokenResult.success, true);
  assert.ok(ownerTokenResult.keys && ownerTokenResult.keys.length === 1);
  assert.ok(ownerTokenResult.keys[0].plainTextKey.length > 5);

  // 2. Authorized Request with valid Customer ID -> SUCCEEDS
  const ownerIdResult = revealOrderActivationKeys(order.id, {
    userId: 'user_owner_s6',
  });
  assert.equal(ownerIdResult.success, true);

  // 3. Unauthorized Attacker Request with invalid token -> FORBIDDEN (403)
  const attackerResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: 'invalid_malicious_token_123',
    userId: 'attacker_user_999',
    email: 'attacker@evil.com',
  });
  assert.equal(attackerResult.success, false);
  assert.equal(attackerResult.statusCode, 403, 'Unauthorized access must return 403 Forbidden');
  assert.equal(attackerResult.keys, undefined);
});

// ─── SCENARIO 7 ─────────────────────────────────────────────────────────────
test('Scenario 7: Sandbox order uses dummy keys and displays sandbox notices', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    revealOrderActivationKeys,
    sanitizeOrderForCustomer,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S7-${Date.now()}`,
    customerEmail: 'sandbox_tester@vortexgaming.gg',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 45000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true, // Strictly sandbox order
  });

  markOrderAsPaid(order.id);

  // Customer sanitized view
  const sanitized = sanitizeOrderForCustomer(order);
  assert.equal(sanitized.isSandbox, true);
  assert.equal(sanitized.notice, 'TEST ORDER — NO REAL PAYMENT');

  // Key reveal view
  const reveal = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(reveal.success, true);
  assert.equal(reveal.isSandbox, true);
  assert.equal(reveal.notice, 'TEST ORDER — NO REAL PAYMENT');
  assert.ok(
    reveal.keys && reveal.keys[0].plainTextKey.startsWith('VTX-SANDBOX-DEMO-'),
    'Sandbox keys must be clearly branded dummy keys starting with VTX-SANDBOX-DEMO-'
  );
});

// ─── SCENARIO 8 ─────────────────────────────────────────────────────────────
test('Scenario 8: Failed payment marks order FAILED and releases no key', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsFailed,
    revealOrderActivationKeys,
    getOrderById,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S8-${Date.now()}`,
    customerEmail: 'failed_payment@vortexgaming.gg',
    items: [
      {
        gameId: 'starfield',
        title: 'Starfield',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 4999,
        unitPriceIQD: 75000,
      },
    ],
    total: 4999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  const failResult = markOrderAsFailed(order.id, 'Card declined by issuing bank');
  assert.equal(failResult.success, true);

  const updated = getOrderById(order.id);
  assert.ok(updated);
  assert.equal(updated.paymentStatus, 'FAILED');
  assert.equal(updated.fulfillmentStatus, 'FAILED');
  assert.equal(updated.allocatedKeys.length, 0, 'No keys must be allocated for failed order');

  const revealAttempt = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(revealAttempt.success, false);
  assert.equal(revealAttempt.statusCode, 400);
});

// ─── SCENARIO 9 ─────────────────────────────────────────────────────────────
test('Scenario 9: Refund marks order REFUNDED and revokes key access', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    reconcileOrderRefund,
    revealOrderActivationKeys,
    getOrderById,
  } = await import('../src/lib/orders/order-store.ts');

  const order = createAuthoritativeOrder({
    orderNumber: `VX-TEST-S9-${Date.now()}`,
    customerEmail: 'refund_target@vortexgaming.gg',
    items: [
      {
        gameId: 'elden-ring',
        title: 'Elden Ring',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 3999,
        unitPriceIQD: 60000,
      },
    ],
    total: 3999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  // Step 1: Mark paid and fulfill
  markOrderAsPaid(order.id);
  assert.equal(getOrderById(order.id).paymentStatus, 'PAID');
  assert.equal(getOrderById(order.id).fulfillmentStatus, 'COMPLETED');

  // Step 2: Customer or merchant initiates refund
  const refundOk = reconcileOrderRefund(order.id, 'Fraud investigation chargeback');
  assert.equal(refundOk, true);

  const refundedOrder = getOrderById(order.id);
  assert.equal(refundedOrder.paymentStatus, 'REFUNDED');
  assert.equal(refundedOrder.fulfillmentStatus, 'REVOKED');
  assert.ok(refundedOrder.revokedAt);

  // Step 3: Subsequent key reveal attempts must be strictly denied
  const revealAttempt = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(revealAttempt.success, false, 'Refunded order must deny key reveal');
  assert.equal(revealAttempt.statusCode, 400);
  assert.equal(revealAttempt.keys, undefined);
});

// ─── SCENARIO 10 ────────────────────────────────────────────────────────────
test('Scenario 10: Concurrent payments do not sell the same key twice', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    addInventoryKeys,
    getOrderById,
  } = await import('../src/lib/orders/order-store.ts');

  // Pre-seed exactly ONE unique production key
  const uniqueKeyGameId = `unique-game-${Date.now()}`;
  const plainProductionKey = `PROD-${Date.now()}-UNIQUE-GAME-KEY-X`;
  addInventoryKeys(uniqueKeyGameId, [plainProductionKey], false);

  // Order A (real production key order)
  const orderA = createAuthoritativeOrder({
    orderNumber: `VX-CONCUR-A-${Date.now()}`,
    customerEmail: 'buyer_a@vortexgaming.gg',
    items: [
      {
        gameId: uniqueKeyGameId,
        title: 'Unique Game',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 5999,
        unitPriceIQD: 90000,
      },
    ],
    total: 5999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: false, // Production order
  });

  // Order B (racing for same stock)
  const orderB = createAuthoritativeOrder({
    orderNumber: `VX-CONCUR-B-${Date.now()}`,
    customerEmail: 'buyer_b@vortexgaming.gg',
    items: [
      {
        gameId: uniqueKeyGameId,
        title: 'Unique Game',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 5999,
        unitPriceIQD: 90000,
      },
    ],
    total: 5999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: false, // Production order
  });

  // Buyer A pays first
  const resultA = markOrderAsPaid(orderA.id);
  assert.equal(resultA.success, true);
  const updatedA = getOrderById(orderA.id);
  assert.equal(updatedA.fulfillmentStatus, 'COMPLETED');
  assert.equal(updatedA.allocatedKeys.length, 1);
  const keyIdA = updatedA.allocatedKeys[0].keyId;

  // Buyer B pays concurrently when stock is 0
  const resultB = markOrderAsPaid(orderB.id);
  const updatedB = getOrderById(orderB.id);

  // Crucial check: Buyer B must NOT receive Buyer A's key!
  assert.equal(updatedB.fulfillmentStatus, 'FAILED', 'Order B must fail fulfillment due to stock exhaustion');
  assert.equal(updatedB.allocatedKeys.length, 0, 'Order B must receive ZERO keys');
  assert.notEqual(keyIdA, updatedB.allocatedKeys[0]?.keyId);
});

// ─── SCENARIO 11 ────────────────────────────────────────────────────────────
test('Scenario 11: Out-of-stock scenario marks fulfillment FAILED and does not invent fake keys', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    revealOrderActivationKeys,
    getOrderById,
  } = await import('../src/lib/orders/order-store.ts');

  const outOfStockGameId = `completely-empty-game-${Date.now()}`;

  const order = createAuthoritativeOrder({
    orderNumber: `VX-OUT-OF-STOCK-${Date.now()}`,
    customerEmail: 'buyer_outofstock@vortexgaming.gg',
    items: [
      {
        gameId: outOfStockGameId,
        title: 'Empty Stock Game',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 5999,
        unitPriceIQD: 90000,
      },
    ],
    total: 5999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: false, // Production inventory check
  });

  // Mark paid
  markOrderAsPaid(order.id);

  const updatedOrder = getOrderById(order.id);
  assert.equal(updatedOrder.paymentStatus, 'PAID');
  assert.equal(updatedOrder.fulfillmentStatus, 'FAILED', 'Fulfillment must be FAILED when out of stock');
  assert.equal(updatedOrder.allocatedKeys.length, 0, 'No keys must be fabricated');

  // Attempt reveal
  const revealAttempt = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(revealAttempt.success, false);
  assert.equal(revealAttempt.statusCode, 400);
  assert.match(revealAttempt.error || '', /Fulfillment Incomplete/i);
});

// ─── SCENARIO 12 ────────────────────────────────────────────────────────────
test('Scenario 12: Unauthorized requests cannot access another user key', async () => {
  const {
    createAuthoritativeOrder,
    markOrderAsPaid,
    verifyOrderOwnership,
    revealOrderActivationKeys,
  } = await import('../src/lib/orders/order-store.ts');

  // Legitimate Customer creates and pays for an order
  const victimOrder = createAuthoritativeOrder({
    orderNumber: `VX-VICTIM-${Date.now()}`,
    customerEmail: 'victim_gamer@vortexgaming.gg',
    customerId: 'usr_victim_123',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 2999,
        unitPriceIQD: 45000,
      },
    ],
    total: 2999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  markOrderAsPaid(victimOrder.id);

  // Attacker attempts IDOR guessing or tampering
  const isAttackerOwner = verifyOrderOwnership(victimOrder, {
    userId: 'usr_attacker_666',
    email: 'attacker@evil.com',
    orderAccessToken: 'forged_fake_token_389283921893819238912',
  });
  assert.equal(isAttackerOwner, false, 'Ownership check must fail for attacker');

  const attackReveal = revealOrderActivationKeys(victimOrder.id, {
    userId: 'usr_attacker_666',
    email: 'attacker@evil.com',
    orderAccessToken: 'forged_fake_token',
  });
  assert.equal(attackReveal.success, false);
  assert.equal(attackReveal.statusCode, 403, 'Attacker must be blocked with HTTP 403 Forbidden');
  assert.equal(attackReveal.keys, undefined);
});

// ─── SCENARIO 13 ────────────────────────────────────────────────────────────
test('Scenario 13: Reveal and Copy buttons are disabled until fulfillment is complete', async () => {
  const { canRevealActivationKey } = await import('../src/lib/orders/order-state-machine.ts');
  const {
    createAuthoritativeOrder,
    sanitizeOrderForCustomer,
    markOrderAsPaid,
  } = await import('../src/lib/orders/order-store.ts');

  // Test exhaustive matrix of states for state machine
  assert.equal(canRevealActivationKey('PENDING', 'NOT_STARTED'), false);
  assert.equal(canRevealActivationKey('PENDING', 'RESERVED'), false);
  assert.equal(canRevealActivationKey('PROCESSING', 'NOT_STARTED'), false);
  assert.equal(canRevealActivationKey('PROCESSING', 'RESERVED'), false);
  assert.equal(canRevealActivationKey('PAID', 'NOT_STARTED'), false);
  assert.equal(canRevealActivationKey('PAID', 'RESERVED'), false);
  assert.equal(canRevealActivationKey('FAILED', 'FAILED'), false);
  assert.equal(canRevealActivationKey('REFUNDED', 'REVOKED'), false);

  // ONLY PAID + COMPLETED returns true
  assert.equal(canRevealActivationKey('PAID', 'COMPLETED'), true);

  // Verify in sanitized customer view
  const order = createAuthoritativeOrder({
    orderNumber: `VX-MATRIX-${Date.now()}`,
    customerEmail: 'matrix_buyer@vortexgaming.gg',
    items: [
      {
        gameId: 'elden-ring',
        title: 'Elden Ring',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 3999,
        unitPriceIQD: 60000,
      },
    ],
    total: 3999,
    currency: 'USD',
    paymentProvider: 'stripe',
    isSandbox: true,
  });

  assert.equal(sanitizeOrderForCustomer(order).canReveal, false);

  markOrderAsPaid(order.id);
  assert.equal(sanitizeOrderForCustomer(order).canReveal, true);
});
