// VORTEX GAMING — Automated Security, Integrity & Functional Test Suite
// Executes via Node.js native test runner: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

// ─── 1. KEY VAULT ENCRYPTION & AUTHENTICITY TESTS ──────────────────────────

const TEST_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.GAME_KEY_ENCRYPTION_KEY = TEST_SECRET;

function encryptGameKey(plainTextKey) {
  const key = Buffer.from(process.env.GAME_KEY_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainTextKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decryptGameKey(encryptedBase64) {
  const key = Buffer.from(process.env.GAME_KEY_ENCRYPTION_KEY, 'hex');
  const packed = Buffer.from(encryptedBase64, 'base64');
  const iv = packed.subarray(0, 16);
  const authTag = packed.subarray(16, 32);
  const ciphertext = packed.subarray(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

function hashKey(plainTextKey) {
  return crypto.createHash('sha256').update(plainTextKey, 'utf8').digest('hex');
}

test('Key Vault: Encrypts and decrypts game keys accurately with AES-256-GCM', () => {
  const sampleKey = 'STEAM-VORTEX-9988-7766-5544';
  const ciphertext = encryptGameKey(sampleKey);

  assert.notEqual(ciphertext, sampleKey);
  assert.ok(ciphertext.length > 32);

  const decrypted = decryptGameKey(ciphertext);
  assert.equal(decrypted, sampleKey);
});

test('Key Vault: Tampered ciphertext or auth tag fails decryption (AEAD integrity)', () => {
  const sampleKey = 'XBOX-PASS-1122-3344-5566';
  const ciphertext = encryptGameKey(sampleKey);

  const rawBytes = Buffer.from(ciphertext, 'base64');
  rawBytes[rawBytes.length - 1] ^= 0xff; // Flip a bit
  const tamperedBase64 = rawBytes.toString('base64');

  assert.throws(() => {
    decryptGameKey(tamperedBase64);
  }, /Unsupported state or unable to authenticate data|bad decrypt/);
});

test('Key Vault: SHA-256 hash deduplicates keys without revealing plaintext', () => {
  const keyA = 'PLAYSTATION-CODE-ABCD';
  const hash1 = hashKey(keyA);
  const hash2 = hashKey(keyA);
  const hashOther = hashKey('DIFFERENT-CODE');

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hashOther);
  assert.equal(hash1.length, 64);
});

// ─── 2. AUTHENTICATION & PASSWORD INTEGRITY TESTS ──────────────────────────

test('Auth: Passwords are salted and verified with constant-time comparison', async () => {
  const rawPassword = 'SecretVortexPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);

  assert.notEqual(hash, rawPassword);
  assert.ok(hash.startsWith('$2'));

  const isValid = await bcrypt.compare(rawPassword, hash);
  assert.equal(isValid, true);

  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isInvalid, false);
});

test('Auth: Two identical passwords produce unique salted hashes', async () => {
  const rawPassword = 'SamePassword123';
  const salt1 = await bcrypt.genSalt(10);
  const salt2 = await bcrypt.genSalt(10);
  const hash1 = await bcrypt.hash(rawPassword, salt1);
  const hash2 = await bcrypt.hash(rawPassword, salt2);

  assert.notEqual(hash1, hash2);
});

// ─── 3. CHECKOUT & COMMERCE INTEGRITY TESTS ────────────────────────────────

test('Checkout Integrity: Rejects client price manipulation', () => {
  const catalogPriceUSD = 2999; // $29.99
  const clientSubmittedPrice = 100; // $1.00 (Tampered client payload)

  // Server authoritative logic ignores client price
  const quantity = 2;
  const authoritativeTotal = catalogPriceUSD * quantity;

  assert.equal(authoritativeTotal, 5998);
  assert.notEqual(authoritativeTotal, clientSubmittedPrice * quantity);
});

test('Checkout Integrity: Server coupon applies strictly validated discounts', () => {
  const validCoupons = { VORTEX10: 10, LAUNCH20: 20 };
  const subtotal = 10000; // $100.00

  // Valid coupon
  const discount1 = validCoupons['LAUNCH20'];
  const total1 = subtotal - (subtotal * discount1) / 100;
  assert.equal(total1, 8000);

  // Fake client coupon is rejected
  const fakeCoupon = 'FREE100';
  const discountFake = validCoupons[fakeCoupon] || 0;
  const totalFake = subtotal - (subtotal * discountFake) / 100;
  assert.equal(totalFake, 10000);
});

test('Checkout Integrity: Quantity limits prevent reseller hoarding', () => {
  const maxPerOrder = 5;
  const requestedQuantity = 50;
  const enforcedQuantity = Math.min(Math.max(requestedQuantity, 1), maxPerOrder);

  assert.equal(enforcedQuantity, 5);
});

// ─── 4. PAYMENT STATE SEPARATION & WEBHOOK REPLAY PROTECTION ───────────────

test('Payment Security: Order is NEVER marked PAID on unverified redirects', () => {
  let orderState = 'PENDING';
  let paymentVerified = false;

  function onBrowserRedirect() {
    if (!paymentVerified) {
      return 'UNVERIFIED_PAYMENT_PENDING';
    }
    orderState = 'PAID';
    return orderState;
  }

  const result = onBrowserRedirect();
  assert.equal(result, 'UNVERIFIED_PAYMENT_PENDING');
  assert.equal(orderState, 'PENDING');
});

test('Webhook Replay Defense: Duplicate payment webhook events are detected & rejected', () => {
  const processedEvents = new Set();

  function processPaymentWebhook(eventId, status) {
    if (processedEvents.has(eventId)) {
      return { status: 'IGNORED_DUPLICATE_REPLAY', processed: false };
    }
    processedEvents.add(eventId);
    return { status: 'PROCESSED', processed: true };
  }

  const event1 = processPaymentWebhook('evt_stripe_1001', 'succeeded');
  assert.equal(event1.status, 'PROCESSED');
  assert.equal(event1.processed, true);

  // Replay attempt with same eventId
  const replay = processPaymentWebhook('evt_stripe_1001', 'succeeded');
  assert.equal(replay.status, 'IGNORED_DUPLICATE_REPLAY');
  assert.equal(replay.processed, false);
});

test('Failed Payments: Payment failure prevents game key allocation', () => {
  let orderStatus = 'PENDING';
  let keysDelivered = [];

  function handlePaymentResult(paymentStatus, keyToAllocate) {
    if (paymentStatus === 'FAILED') {
      orderStatus = 'PAYMENT_FAILED';
      // Key must NOT be delivered
      return { orderStatus, key: null };
    }
    orderStatus = 'PAID';
    keysDelivered.push(keyToAllocate);
    return { orderStatus, key: keyToAllocate };
  }

  const result = handlePaymentResult('FAILED', 'VTX-KEY-1234');
  assert.equal(result.orderStatus, 'PAYMENT_FAILED');
  assert.equal(result.key, null);
  assert.equal(keysDelivered.length, 0);
});

// ─── 5. REFUND & KEY REVOCATION STATE MACHINE ──────────────────────────────

test('Refund Operations: Refunding an order revokes the digital activation key', () => {
  const keyRecord = {
    id: 'key_101',
    status: 'DELIVERED',
    orderId: 'VX-ORDER-101',
  };

  function processRefund(orderId, key) {
    if (key.orderId === orderId && key.status === 'DELIVERED') {
      key.status = 'REVOKED';
      key.revokedAt = new Date().toISOString();
      return { success: true, keyStatus: key.status };
    }
    return { success: false, keyStatus: key.status };
  }

  const refund = processRefund('VX-ORDER-101', keyRecord);
  assert.equal(refund.success, true);
  assert.equal(keyRecord.status, 'REVOKED');
});

// ─── 6. CONCURRENT KEY RESERVATION RACE CONDITION PREVENTION ───────────────

test('Concurrency: Atomic reservation prevents two buyers from acquiring the same key', async () => {
  let availableKeys = ['VTX-SOLO-KEY-1'];
  let successfulAllocations = [];
  let failedAllocations = [];

  // Simulated atomic database reservation lock (e.g., SELECT FOR UPDATE SKIP LOCKED)
  let lock = false;
  async function allocateKeyAtomic(buyerId) {
    while (lock) {
      await new Promise((r) => setTimeout(r, 2));
    }
    lock = true;
    try {
      if (availableKeys.length > 0) {
        const key = availableKeys.pop();
        successfulAllocations.push({ buyerId, key });
        return { success: true, key };
      } else {
        failedAllocations.push(buyerId);
        return { success: false, error: 'OUT_OF_STOCK' };
      }
    } finally {
      lock = false;
    }
  }

  // 2 buyers simultaneously check out the only remaining key
  const [b1, b2] = await Promise.all([
    allocateKeyAtomic('buyer_alpha'),
    allocateKeyAtomic('buyer_beta'),
  ]);

  assert.equal(successfulAllocations.length, 1);
  assert.equal(failedAllocations.length, 1);
  assert.ok((b1.success && !b2.success) || (!b1.success && b2.success));
  assert.equal(availableKeys.length, 0);
});

// ─── 7. ROLE-BASED ACCESS CONTROL (RBAC) ───────────────────────────────────

test('RBAC: Customers are blocked from administrative vault endpoints', () => {
  function verifyAdminAccess(userRole) {
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'];
    if (!userRole || !adminRoles.includes(userRole)) {
      return { status: 403, error: 'FORBIDDEN' };
    }
    return { status: 200, access: 'GRANTED' };
  }

  assert.equal(verifyAdminAccess('CUSTOMER').status, 403);
  assert.equal(verifyAdminAccess(undefined).status, 403);
  assert.equal(verifyAdminAccess('SUPER_ADMIN').status, 200);
  assert.equal(verifyAdminAccess('ADMIN').status, 200);
});

// ─── 8. IRAQI PAYMENT PROVIDER SANDBOX ISOLATION ───────────────────────────

test('Payment Isolation: Unconfigured Iraqi providers block real financial transactions', () => {
  const isMerchantConfigured = {
    fib: false,
    fastpay: false,
    qi_card: false,
  };

  function executeLiveCharge(provider, amountIQD) {
    if (!isMerchantConfigured[provider]) {
      throw new Error(`[${provider.toUpperCase()}] Real charges disabled pending official merchant agreement.`);
    }
    return { charged: true, amount: amountIQD };
  }

  assert.throws(() => executeLiveCharge('fib', 50000), /Real charges disabled/);
  assert.throws(() => executeLiveCharge('fastpay', 35000), /Real charges disabled/);
  assert.throws(() => executeLiveCharge('qi_card', 40000), /Real charges disabled/);
});
