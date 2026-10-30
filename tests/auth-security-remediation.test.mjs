import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUserByEmail,
  verifyExistingUserPassword,
  provisionInitialAdmin,
  registerStandardUser,
} from '../src/lib/auth/user-store.ts';

test('Security Remediation: Demo admin credentials are NOT pre-seeded or hardcoded', async () => {
  // Demo admin must not exist by default
  const legacyAdmin = await getUserByEmail('admin@vortexgaming.com');
  assert.equal(legacyAdmin, null, 'Demo admin@vortexgaming.com must not exist in database/store');

  // Attempting to verify demo password must fail
  const verifyAttempt = await verifyExistingUserPassword('admin@vortexgaming.com', 'VortexAdmin2026!SecureKey');
  assert.equal(verifyAttempt, null, 'Demo credentials must be completely rejected');
});

test('Security Remediation: Plaintext password bypass conditions are eradicated', async () => {
  // Register legitimate test user
  const email = `crypto_test_${Date.now()}@vortexgaming.gg`;
  await registerStandardUser(email, '$2a$12$e8s7d6f5g4h3j2k1l0z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3', 'Crypto', 'Tester');

  // Arbitrary or hardcoded bypass attempts must fail
  assert.equal(await verifyExistingUserPassword(email, 'VortexAdmin2026!SecureKey'), null);
  assert.equal(await verifyExistingUserPassword(email, 'Customer123!SecureKey'), null);
  assert.equal(await verifyExistingUserPassword(email, ''), null);
});

test('Security Remediation: Administrator provisioning enforces strict complexity and MFA', async () => {
  const adminEmail = `prov_admin_${Date.now()}@vortexgaming.gg`;

  // Short password (< 12 chars) rejected
  await assert.rejects(
    async () => provisionInitialAdmin(adminEmail, 'Short1!'),
    /at least 12 characters/
  );

  // Missing complexity (e.g. no special char) rejected
  await assert.rejects(
    async () => provisionInitialAdmin(adminEmail, 'Password12345678'),
    /numbers, and special characters/
  );

  // Strong password provisioned successfully
  const admin = await provisionInitialAdmin(adminEmail, 'V0rtex#SuperAdmin2026!Secure');
  assert.ok(admin);
  assert.equal(admin.role, 'SUPER_ADMIN');
  assert.equal(admin.mfaEnabled, true, 'Administrator accounts must have MFA enabled by default');
  assert.ok(admin.passwordHash.startsWith('$2'), 'Password must be hashed with bcrypt');

  // Verify password with correct credentials
  const verified = await verifyExistingUserPassword(adminEmail, 'V0rtex#SuperAdmin2026!Secure');
  assert.ok(verified);
  assert.equal(verified.id, admin.id);
});
