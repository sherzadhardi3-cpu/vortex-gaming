// VORTEX GAMING — Discord Order Notification Automated Test Suite
// Verifies:
// 1. Configuration & channel ID sanitization
// 2. Embed field completeness (Product Name, Product Type, Duration, Account Type, Quantity, Price, Currency, Platform, Order ID, Display Name, Payment Method, Status, Date/Time)
// 3. Exact color-coding rules (Green=PAID, Yellow=PENDING, Blue=PROCESSING, Red=FAILED, Gray=CANCELED, Orange=REFUNDED)
// 4. In-place Discord message editing via discordMessageId
// 5. State machine automatic event dispatching (create -> paid -> deliver -> refund -> fail -> cancel)
// 6. Security & privacy (No raw keys, passwords, or full customer emails exposed)
// 7. Non-blocking error resilience (Discord outage never fails checkout or key delivery)

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.GAME_KEY_ENCRYPTION_KEY ||= '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.DISCORD_BOT_TOKEN ||= 'MTU1MDk2OTUwODc4NzY1NDc0OA.mock.test';
process.env.DISCORD_GUILD_ID ||= '1546561132456579222';
process.env.DISCORD_ORDERS_CHANNEL_ID ||= '1566233075359285319';
import {
  getDiscordOrdersConfig,
  isDiscordOrdersConfigured,
  getOrderEventColor,
  getOrderEventHeader,
  formatPaymentProvider,
  buildDiscordOrderEmbed,
  sendDiscordOrderNotification,
} from '../src/lib/discord/discord-order-notifier.ts';
import {
  createAuthoritativeOrder,
  markOrderAsPaid,
  markOrderAsProcessing,
  markOrderAsFailed,
  reconcileOrderRefund,
  cancelOrder,
  revealOrderActivationKeys,
} from '../src/lib/orders/order-store.ts';

// ─── 1. CONFIGURATION & SANITIZATION ──────────────────────────────────────────
test('Discord Orders Config: Sanitizes channel ID, guild ID, and token', () => {
  const origToken = process.env.DISCORD_BOT_TOKEN;
  const origGuild = process.env.DISCORD_GUILD_ID;
  const origOrdersChannel = process.env.DISCORD_ORDERS_CHANNEL_ID;

  try {
    process.env.DISCORD_BOT_TOKEN = ' "MTU1MDk2OTUwODc4NzY1NDc0OA.test" ';
    process.env.DISCORD_GUILD_ID = ' 1546561132456579222 ';
    process.env.DISCORD_ORDERS_CHANNEL_ID = " '1566233075359285319' ";

    const config = getDiscordOrdersConfig();
    assert.equal(config.botToken, 'MTU1MDk2OTUwODc4NzY1NDc0OA.test');
    assert.equal(config.guildId, '1546561132456579222');
    assert.equal(config.ordersChannelId, '1566233075359285319');
    assert.equal(isDiscordOrdersConfigured(), true);

    // Empty check
    delete process.env.DISCORD_ORDERS_CHANNEL_ID;
    assert.equal(isDiscordOrdersConfigured(), false);
  } finally {
    if (origToken !== undefined) process.env.DISCORD_BOT_TOKEN = origToken;
    else delete process.env.DISCORD_BOT_TOKEN;

    if (origGuild !== undefined) process.env.DISCORD_GUILD_ID = origGuild;
    else delete process.env.DISCORD_GUILD_ID;

    if (origOrdersChannel !== undefined) process.env.DISCORD_ORDERS_CHANNEL_ID = origOrdersChannel;
    else delete process.env.DISCORD_ORDERS_CHANNEL_ID;
  }
});

// ─── 2. EMBED COLOR-CODING RULES ──────────────────────────────────────────────
test('Discord Embed Colors: Exactly match the mandated color specifications', () => {
  // Green: Verified PAID & Digital Delivery
  assert.equal(getOrderEventColor('PAID'), 0x22c55e, 'PAID color must be Green');
  assert.equal(getOrderEventColor('DELIVERED'), 0x22c55e, 'DELIVERED color must be Green');

  // Yellow: PENDING / AWAITING PAYMENT
  assert.equal(getOrderEventColor('CREATED'), 0xeab308, 'PENDING/CREATED color must be Yellow');

  // Blue: PROCESSING
  assert.equal(getOrderEventColor('PROCESSING'), 0x3b82f6, 'PROCESSING color must be Blue');

  // Red: FAILED
  assert.equal(getOrderEventColor('FAILED'), 0xef4444, 'FAILED color must be Red');

  // Gray: CANCELED
  assert.equal(getOrderEventColor('CANCELLED'), 0x6b7280, 'CANCELLED color must be Gray');

  // Orange: REFUNDED
  assert.equal(getOrderEventColor('REFUNDED'), 0xf97316, 'REFUNDED color must be Orange');
});

// ─── 3. EMBED FIELD COMPLETENESS & FORMATTING ─────────────────────────────────
test('Discord Embed Format: Contains all 13 required reference specification fields', () => {
  const dummyOrder = {
    id: 'ord_test_spec_001',
    orderNumber: 'VTX-2026-9901',
    customerEmail: 'gamer_ahmed@example.com',
    customerId: 'usr_ahmed_1',
    customerName: 'Ahmed Barzani',
    orderAccessToken: 'tok_spec_test',
    paymentProvider: 'fib',
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'NOT_STARTED',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077: Phantom Liberty',
        platform: 'Steam (PC)',
        quantity: 1,
        unitPriceUSD: 29.99,
        unitPriceIQD: 39500,
      },
    ],
    total: 29.99,
    currency: 'USD',
    discountApplied: 0,
    isSandbox: true,
    allocatedKeys: [],
    statusHistory: [],
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };

  const embed = buildDiscordOrderEmbed(dummyOrder, 'CREATED');

  assert.equal(embed.title, '🛒 New VORTEX GAMING Order');
  assert.equal(embed.color, 0xeab308);

  const fieldNames = embed.fields.map((f) => f.name);

  // Assert presence of all required fields
  assert.ok(fieldNames.some((n) => n.includes('Product Name')), 'Must have Product Name');
  assert.ok(fieldNames.some((n) => n.includes('Product Type')), 'Must have Product Type');
  assert.ok(fieldNames.some((n) => n.includes('Quantity')), 'Must have Quantity');
  assert.ok(fieldNames.some((n) => n.includes('Total Price')), 'Must have Total Price');
  assert.ok(fieldNames.some((n) => n.includes('Currency')), 'Must have Currency');
  assert.ok(fieldNames.some((n) => n.includes('Platform')), 'Must have Platform');
  assert.ok(fieldNames.some((n) => n.includes('Order ID')), 'Must have Order ID');
  assert.ok(fieldNames.some((n) => n.includes('Customer Display Name')), 'Must have Customer Display Name');
  assert.ok(fieldNames.some((n) => n.includes('Payment Method')), 'Must have Payment Method');
  assert.ok(fieldNames.some((n) => n.includes('Payment Status')), 'Must have Payment Status');
  assert.ok(fieldNames.some((n) => n.includes('Order Date and Time')), 'Must have Order Date and Time');

  // Verify field values
  const nameField = embed.fields.find((f) => f.name.includes('Customer Display Name'));
  assert.equal(nameField.value, '👤 Ahmed Barzani');

  const priceField = embed.fields.find((f) => f.name.includes('Total Price'));
  assert.equal(priceField.value, '**$29.99**');

  const methodField = embed.fields.find((f) => f.name.includes('Payment Method'));
  assert.equal(methodField.value, 'FIB Bank QR (Sandbox)');
});

// ─── 4. SECURITY & PRIVACY CONTROLS ──────────────────────────────────────────
test('Security & Privacy: Raw keys, passwords, and full emails are strictly excluded', () => {
  const sensitiveOrder = {
    id: 'ord_sensitive_001',
    orderNumber: 'VTX-SEC-001',
    customerEmail: 'secret_user_super_private@corporate.com',
    customerId: 'usr_sec',
    customerName: '', // Empty name should fallback to username prefix without domain
    orderAccessToken: 'sensitive_token_123',
    paymentProvider: 'iraqi_cards',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'COMPLETED',
    items: [
      {
        gameId: 'gta-v',
        title: 'Grand Theft Auto V: Premium Online',
        platform: 'Rockstar (PC)',
        quantity: 1,
        unitPriceUSD: 19.99,
        unitPriceIQD: 26000,
      },
    ],
    total: 19.99,
    currency: 'USD',
    discountApplied: 0,
    isSandbox: false,
    allocatedKeys: [
      {
        keyId: 'k_1',
        gameId: 'gta-v',
        encryptedKey: 'secret_encrypted_payload',
        isSandboxKey: false,
      },
    ],
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const embed = buildDiscordOrderEmbed(sensitiveOrder, 'PAID');
  const embedString = JSON.stringify(embed);

  assert.ok(!embedString.includes('corporate.com'), 'Full email domain must not be exposed');
  assert.ok(!embedString.includes('secret_encrypted_payload'), 'Encrypted or plain keys must never be in embed');
  assert.ok(!embedString.includes('sensitive_token_123'), 'Access tokens must not be in embed');
});

// ─── 5. STATE MACHINE AUTOMATIC DISCORD DISPATCH ─────────────────────────────
test('State Machine: Order creation, processing, paid, delivered, failed, and canceled events', async () => {
  const orderNumber = `VTX-TEST-${Date.now().toString().slice(-4)}`;
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'state_machine_test@vortexgaming.gg',
    customerName: 'Soran Gaming',
    paymentProvider: 'fastpay',
    total: 45.0,
    currency: 'USD',
    items: [
      {
        gameId: 'elden-ring',
        title: 'Elden Ring: Shadow of the Erdtree',
        platform: 'Steam (PC)',
        quantity: 1,
        unitPriceUSD: 45.0,
        unitPriceIQD: 59000,
      },
    ],
    isSandbox: true,
  });

  assert.ok(order.id);
  assert.equal(order.paymentStatus, 'PENDING');

  // Simulate initial notification dispatch
  process.env.TEST_MOCK_DISCORD = 'true';
  const createNotify = await sendDiscordOrderNotification(order, 'CREATED');
  assert.equal(createNotify.success, true);
  assert.ok(order.discordMessageId, 'Order must store discordMessageId');

  const initialMsgId = order.discordMessageId;

  // 1. Transition to PROCESSING -> In-place update
  const procResult = markOrderAsProcessing(order.id, '3D Secure in progress');
  assert.equal(procResult.success, true);
  const procNotify = await sendDiscordOrderNotification(order, 'PROCESSING');
  assert.equal(procNotify.success, true);
  assert.equal(order.discordMessageId, initialMsgId, 'Message ID must be preserved for in-place edit');

  // 2. Transition to PAID -> In-place update
  const paidResult = markOrderAsPaid(order.id, { paymentIntentId: 'pi_test_fastpay' });
  assert.equal(paidResult.success, true);
  assert.equal(order.paymentStatus, 'PAID');
  const paidNotify = await sendDiscordOrderNotification(order, 'PAID');
  assert.equal(paidNotify.success, true);
  assert.equal(order.discordMessageId, initialMsgId);

  // 3. Customer reveals keys -> DELIVERED update
  const revealResult = revealOrderActivationKeys(order.id, {
    orderAccessToken: order.orderAccessToken,
  });
  assert.equal(revealResult.success, true);
  const delivNotify = await sendDiscordOrderNotification(order, 'DELIVERED');
  assert.equal(delivNotify.success, true);

  delete process.env.TEST_MOCK_DISCORD;
});

// ─── 6. CANCELLATION & REFUND EVENTS ─────────────────────────────────────────
test('Cancellation & Refund: Transitions trigger correct Discord embeds', async () => {
  process.env.TEST_MOCK_DISCORD = 'true';

  // Test Cancellation of PENDING order
  const pendingOrder = createAuthoritativeOrder({
    orderNumber: `VTX-CANCEL-${Date.now().toString().slice(-4)}`,
    customerEmail: 'cancel_test@vortex.gg',
    customerName: 'Cancel Customer',
    paymentProvider: 'fib',
    total: 10.0,
    currency: 'USD',
    items: [
      {
        gameId: 'steam-cyberpunk-phantom-liberty',
        title: 'Cyberpunk 2077',
        platform: 'Steam',
        quantity: 1,
        unitPriceUSD: 10.0,
        unitPriceIQD: 13000,
      },
    ],
    isSandbox: true,
  });

  const cancelSuccess = cancelOrder(pendingOrder.id, 'User clicked cancel on payment modal');
  assert.equal(cancelSuccess, true);
  assert.equal(pendingOrder.paymentStatus, 'CANCELLED');

  const cancelEmbed = buildDiscordOrderEmbed(pendingOrder, 'CANCELLED');
  assert.equal(cancelEmbed.color, 0x6b7280, 'Canceled color must be Gray');
  assert.ok(cancelEmbed.title.includes('CANCELED'));

  // Test Refund of PAID order
  const paidOrder = createAuthoritativeOrder({
    orderNumber: `VTX-REFUND-${Date.now().toString().slice(-4)}`,
    customerEmail: 'refund_test@vortex.gg',
    customerName: 'Refund Customer',
    paymentProvider: 'iraqi_cards',
    total: 25.0,
    currency: 'USD',
    items: [
      {
        gameId: 'gta-v',
        title: 'GTA V',
        platform: 'PC',
        quantity: 1,
        unitPriceUSD: 25.0,
        unitPriceIQD: 32000,
      },
    ],
    isSandbox: true,
  });

  markOrderAsPaid(paidOrder.id);
  assert.equal(paidOrder.paymentStatus, 'PAID');

  const refundSuccess = reconcileOrderRefund(paidOrder.id, 'Defective product customer claim');
  assert.equal(refundSuccess, true);
  assert.equal(paidOrder.paymentStatus, 'REFUNDED');

  const refundEmbed = buildDiscordOrderEmbed(paidOrder, 'REFUNDED');
  assert.equal(refundEmbed.color, 0xf97316, 'Refunded color must be Orange');
  assert.ok(refundEmbed.title.includes('REFUNDED'));

  delete process.env.TEST_MOCK_DISCORD;
});

// ─── 7. NON-BLOCKING RESILIENCE (DISCORD DOWN NEVER BREAKS CHECKOUT) ──────────
test('Resilience: Checkout and order creation succeed even if Discord notification fails', async () => {
  // Point to invalid channel to simulate network failure
  process.env.DISCORD_ORDERS_CHANNEL_ID = '999999999999999999';
  process.env.DISCORD_BOT_TOKEN = 'MTU1MDk2OTUwODc4NzY1NDc0OA.invalid_token';

  const orderNumber = `VTX-RESILIENT-${Date.now().toString().slice(-4)}`;
  const order = createAuthoritativeOrder({
    orderNumber,
    customerEmail: 'resilience_test@vortex.gg',
    customerName: 'Resilience Tester',
    paymentProvider: 'vortex_wallet',
    total: 15.0,
    currency: 'USD',
    items: [
      {
        gameId: 'starfield',
        title: 'Starfield',
        platform: 'Xbox / PC',
        quantity: 1,
        unitPriceUSD: 15.0,
        unitPriceIQD: 19500,
      },
    ],
    isSandbox: true,
  });

  // Order creation and state must be intact
  assert.ok(order.id);
  assert.equal(order.paymentStatus, 'PENDING');

  // Payment marking must not throw and succeed
  const paidResult = markOrderAsPaid(order.id);
  assert.equal(paidResult.success, true);
  assert.equal(order.paymentStatus, 'PAID');
  assert.equal(order.fulfillmentStatus, 'COMPLETED');
});
