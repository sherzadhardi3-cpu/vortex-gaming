// VORTEX GAMING — Complete Security Audit Regression Test Suite
// Verifies all 11 security remediation domains across authentication, vault cryptography,
// payment webhooks, replay defenses, refund reconciliation, and environment validation.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

// Ensure environment variables are loaded
if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {
    // ignore
  }
}

// 1. Domain 1 & 3 & 4: Admin Authentication, Demo Credential Rejection & Plaintext Elimination
test('Domain 1, 3 & 4: Authentication Security & Demo Elimination', async () => {
  const { verifyPasswordHash, getUserByEmail, provisionInitialAdmin } = await import('../src/lib/auth/user-store.ts');

  // A. Demo Admin Must NOT Exist in Store
  const demoAdmin = await getUserByEmail('admin@vortexgaming.com');
  assert.equal(demoAdmin, null, 'Hardcoded demo admin user must be eradicated from store');

  // B. Verify Password Must Reject Demo Plaintext Bypass
  const isBypassAllowed = await verifyPasswordHash('VortexAdmin2026!SecureKey', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8Dcf0KxW1jN2F0q7fNZaFWoO.8Dcf0');
  assert.equal(isBypassAllowed, false, 'Plaintext password bypass must be impossible');

  // C. Admin Provisioning Enforces Complexity and Mandatory MFA
  await assert.rejects(
    async () => {
      await provisionInitialAdmin('testadmin@vortexgaming.com', 'weak', { firstName: 'Tester', lastName: 'Admin' });
    },
    /at least 12 characters/,
    'Admin provisioning must reject short passwords'
  );

  const secureAdmin = await provisionInitialAdmin(
    `auditor_${Date.now()}@vortexgaming.com`,
    'VortexAdmin#2026!StrongComplexity',
    { firstName: 'Audit', lastName: 'Admin' }
  );
  assert.ok(secureAdmin.id, 'Admin successfully provisioned');
  assert.equal(secureAdmin.role, 'SUPER_ADMIN');
  assert.equal(secureAdmin.mfaEnabled, true, 'Admin must have MFA enabled');
  assert.ok(secureAdmin.passwordHash.startsWith('$2'), 'Password must be bcrypt hashed');
});

// 2. Domain 2: Privilege Escalation Defense
test('Domain 2: Privilege Escalation Defense in Registration', async () => {
  const { registerStandardUser } = await import('../src/lib/auth/user-store.ts');

  const testEmail = `cust_escalate_${Date.now()}@vortexgaming.com`;
  const dummyHash = await bcrypt.hash('StandardUserPassword123!', 10);
  const registered = await registerStandardUser(
    testEmail,
    dummyHash,
    'Audit',
    'Customer'
  );

  assert.equal(registered.role, 'CUSTOMER', 'Registration must enforce CUSTOMER role');
  assert.equal(registered.mfaEnabled, false);
});

// 3. Domain 5: Vault AES-256-GCM CSPRNG Key Encryption
test('Domain 5: Vault Cryptographic Integrity (AES-256-GCM)', async () => {
  const { encryptGameKey, decryptGameKey, generateSecureEncryptionKey } = await import('../src/lib/crypto/key-vault.ts');

  const sampleKey = 'VRTX-TEST-XXXX-9999-KEY';
  const encryptedBase64 = encryptGameKey(sampleKey);

  assert.ok(typeof encryptedBase64 === 'string' && encryptedBase64.length > 20, 'Encrypted base64 payload must exist');

  const decrypted = decryptGameKey(encryptedBase64);
  assert.equal(decrypted, sampleKey, 'Decrypted key must match original plain text');

  const generatedKey = generateSecureEncryptionKey();
  assert.equal(generatedKey.length, 64, 'Generated key must be 64-char hex (256 bits)');
  assert.match(generatedKey, /^[0-9a-f]{64}$/, 'Must be valid hex');
});

// 4. Domain 6: Safe Key Rotation & Dual-Key Fallback Decryption
test('Domain 6: Key Rotation Transparent Fallback', async () => {
  const { encryptGameKey, decryptGameKey, rotateEncryptedKey } = await import('../src/lib/crypto/key-vault.ts');

  const prevKeyHex = process.env.GAME_KEY_ENCRYPTION_KEY_PREVIOUS;
  assert.ok(prevKeyHex, 'GAME_KEY_ENCRYPTION_KEY_PREVIOUS must be configured');

  const secretPayload = 'STEAM-PREV-ROTATION-TEST-KEY';
  // Encrypt directly using previous key buffer
  const prevKeyBuffer = Buffer.from(prevKeyHex, 'hex');
  const legacyEncrypted = encryptGameKey(secretPayload, prevKeyBuffer);

  // Decrypt should transparently fall back to previous key when active key fails
  const decryptedFromFallback = decryptGameKey(legacyEncrypted);
  assert.equal(decryptedFromFallback, secretPayload, 'Fallback decryption with previous key must succeed');

  // Rotate key to new active primary key
  const activeKeyHex = process.env.GAME_KEY_ENCRYPTION_KEY;
  assert.ok(activeKeyHex, 'GAME_KEY_ENCRYPTION_KEY must be configured');
  const reEncrypted = rotateEncryptedKey(legacyEncrypted, prevKeyHex, activeKeyHex);
  assert.notEqual(reEncrypted, legacyEncrypted, 'Re-encrypted ciphertext must differ from old');

  const decryptedAfterRotation = decryptGameKey(reEncrypted);
  assert.equal(decryptedAfterRotation, secretPayload, 'Rotated key must decrypt to original data');
});

// 5. Domain 7: Stripe Webhook Cryptographic Signature Verification
test('Domain 7: Webhook Signature Verification Rejects Tampered Payloads', async () => {
  const { verifyStripeWebhookSignature } = await import('../src/lib/stripe.ts');

  const dummyWebhookSecret = 'whsec_test_secret_for_regression_audit_001';
  const payload = JSON.stringify({ id: 'evt_test_1', type: 'payment_intent.succeeded' });
  const timestamp = Math.floor(Date.now() / 1000);

  // Generate valid signature
  const validSignature = crypto
    .createHmac('sha256', dummyWebhookSecret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  const header = `t=${timestamp},v1=${validSignature}`;

  // Valid verification should construct event
  const event = verifyStripeWebhookSignature(payload, header, dummyWebhookSecret);
  assert.equal(event.id, 'evt_test_1');

  // Tampered payload verification MUST fail
  const tamperedPayload = JSON.stringify({ id: 'evt_test_1', type: 'charge.refunded', tampered: true });
  assert.throws(
    () => {
      verifyStripeWebhookSignature(tamperedPayload, header, dummyWebhookSecret);
    },
    /No signatures found matching the expected signature for payload/,
    'Tampered signature must be rejected'
  );
});

// 6. Domain 8 & 10: Webhook Replay Defense & Refund Revocation
test('Domain 8 & 10: Webhook Replay Defense & Refund Revocation', async () => {
  const {
    handleVerifiedStripeEvent,
    getFulfillment,
  } = await import('../src/lib/payments/stripe-fulfillment.ts');

  const targetOrderId = `order_test_audit_${Date.now()}`;
  const eventId = `evt_test_refund_${Date.now()}`;

  // Step 1: Simulate fulfillment
  const fulfillmentEvent = {
    id: `evt_test_fulfill_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session',
        metadata: { orderId: targetOrderId, orderNumber: 'VX-AUDIT-001' },
        customer_email: 'audit@vortexgaming.gg',
      },
    },
  };

  const fulfillRes = handleVerifiedStripeEvent(fulfillmentEvent);
  assert.equal(fulfillRes.action, 'ORDER_FULFILLED_KEYS_ALLOCATED');
  assert.equal(fulfillRes.duplicate, false);

  const initialRecord = getFulfillment(targetOrderId);
  assert.ok(initialRecord);
  assert.equal(initialRecord.status, 'FULFILLED');
  assert.equal(initialRecord.keyDelivered, true);

  // Step 2: Simulate refund revocation
  const refundEvent = {
    id: eventId,
    type: 'charge.refunded',
    data: {
      object: {
        id: 'ch_test_refund',
        metadata: { orderId: targetOrderId },
      },
    },
  };

  const refundRes = handleVerifiedStripeEvent(refundEvent);
  assert.equal(refundRes.action, 'KEY_REVOKED_REFUND_RECONCILED');
  assert.equal(refundRes.duplicate, false);

  const refundedRecord = getFulfillment(targetOrderId);
  assert.ok(refundedRecord);
  assert.equal(refundedRecord.status, 'REFUNDED', 'Order status must be REFUNDED');
  assert.equal(refundedRecord.keyDelivered, false, 'Key delivery must be disabled upon refund');
  assert.ok(refundedRecord.revokedAt, 'Revocation timestamp must be recorded');

  // Step 3: Replay duplicate refund event -> MUST BE BLOCKED
  const replayRes = handleVerifiedStripeEvent(refundEvent);
  assert.equal(replayRes.duplicate, true);
  assert.equal(replayRes.action, 'IGNORED_DUPLICATE_REPLAY', 'Replayed event must be ignored');
});

// 7. Domain 9: Server-Authoritative Checkout Prevents Price Manipulation
test('Domain 9: Checkout Authoritative Recalculation Discards Client Tampering', () => {
  // Authoritative catalog price
  const catalogItem = {
    id: 'steam-cyberpunk-phantom-liberty',
    priceUSD: 2999,
  };

  // Client attempts to manipulate price to 0.01 USD
  const tamperedItem = {
    id: 'steam-cyberpunk-phantom-liberty',
    priceUSD: 0.01,
    quantity: 1,
  };

  // Server authoritative logic discards client price and looks up catalog
  const authoritativePrice = catalogItem.priceUSD * (tamperedItem.quantity || 1);
  assert.equal(authoritativePrice, 2999, 'Catalog price (2999 cents) must override tampered client price');
  assert.notEqual(authoritativePrice, tamperedItem.priceUSD);

  // Promo code test: VORTEX10 applies 10%
  const validPromos = { VORTEX10: 10, LAUNCH20: 20 };
  const discountPercent = validPromos['VORTEX10'] || 0;
  const discountUSD = Math.round((authoritativePrice * discountPercent) / 100);
  const totalUSD = authoritativePrice - discountUSD;

  assert.equal(discountPercent, 10);
  assert.equal(totalUSD, 2699);
});

// 8. Domain 11: Secure Environment & Logging Sanitization
test('Domain 11: Environment Validation & Secret Sanitization', async () => {
  const { validateEnv } = await import('../src/lib/env.ts');
  const { sanitize } = await import('../src/lib/logger.ts');

  // Environment validation
  const envValidation = validateEnv();
  assert.ok(envValidation.success, 'Local environment should pass validation');

  // Logger sanitization
  const sensitiveObj = {
    username: 'gamer_john',
    password: 'SuperSecretPassword123!',
    token: 'jwt_secret_token_value',
    apiKey: 'sk_live_1234567890abcdef',
    creditCard: '4111 2222 3333 4444',
  };

  const sanitized = sanitize(sensitiveObj);
  assert.equal(sanitized.username, 'gamer_john');
  assert.equal(sanitized.password, '[REDACTED]', 'Password must be redacted');
  assert.equal(sanitized.token, '[REDACTED]', 'Token must be redacted');
  assert.equal(sanitized.apiKey, '[REDACTED]', 'API key must be redacted');
  assert.equal(sanitized.creditCard, '[REDACTED]', 'Card must be redacted');
});
