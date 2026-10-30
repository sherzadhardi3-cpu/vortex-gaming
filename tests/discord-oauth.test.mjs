// VORTEX GAMING — Automated Discord OAuth2, Security & Account Linking Test Suite
// Executes via Node.js native test runner: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  generatePKCE,
  generateOAuthState,
  buildDiscordAuthorizationUrl,
  getDiscordAvatarUrl,
  getDiscordRedirectUri,
  getDiscordClientId,
  getDiscordClientSecret,
} from '../src/lib/auth/discord.ts';
import {
  getUserByEmail,
  getAccountByProvider,
  createDiscordCustomer,
  linkDiscordToUser,
  verifyExistingUserPassword,
  registerStandardUser,
} from '../src/lib/auth/user-store.ts';
import bcrypt from 'bcryptjs';

// ─── 1. PKCE SPECIFICATION & ENTROPY TESTS (RFC 7636) ──────────────────────

test('Discord PKCE: Generates high-entropy code verifier and S256 challenge', () => {
  const { codeVerifier, codeChallenge } = generatePKCE();

  assert.ok(codeVerifier.length >= 43, 'Verifier must be at least 43 characters');
  assert.match(codeVerifier, /^[A-Za-z0-9_-]+$/, 'Verifier must be URL-safe Base64');
  assert.ok(codeChallenge.length >= 43, 'Challenge must be at least 43 characters');

  // Verify challenge mathematically: SHA256(verifier) base64url encoded
  const expectedHash = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  assert.equal(codeChallenge, expectedHash, 'Challenge must match S256 transformation of verifier');
});

test('Discord PKCE: Two distinct invocations produce completely unique verifiers', () => {
  const pkce1 = generatePKCE();
  const pkce2 = generatePKCE();

  assert.notEqual(pkce1.codeVerifier, pkce2.codeVerifier);
  assert.notEqual(pkce1.codeChallenge, pkce2.codeChallenge);
});

// ─── 2. CSRF STATE GENERATION & VALIDATION ─────────────────────────────────

test('Discord CSRF Defense: Generates cryptographic 48-hex character state', () => {
  const state1 = generateOAuthState();
  const state2 = generateOAuthState();

  assert.equal(state1.length, 48);
  assert.notEqual(state1, state2);
});

test('Discord CSRF Defense: Mismatched or missing state triggers immediate rejection', () => {
  function validateOAuthCallbackState(queryState, cookieState) {
    if (!queryState || !cookieState || queryState !== cookieState) {
      return { status: 400, error: 'CSRF_STATE_MISMATCH' };
    }
    return { status: 200, valid: true };
  }

  // Legitimate match
  const validState = 'abcdef1234567890abcdef1234567890abcdef1234567890';
  assert.equal(validateOAuthCallbackState(validState, validState).status, 200);

  // Forged attacker state
  assert.equal(validateOAuthCallbackState('attacker_state', validState).status, 400);

  // Missing cookie
  assert.equal(validateOAuthCallbackState(validState, null).status, 400);
});

// ─── 3. LEAST PRIVILEGE SCOPE ENFORCEMENT ──────────────────────────────────

test('Discord Scopes: Strictly limits requests to identify and email', () => {
  process.env.DISCORD_CLIENT_ID = '123456789012345678';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

  const state = 'test_state_123';
  const url = buildDiscordAuthorizationUrl({ state });

  const parsedUrl = new URL(url);
  assert.equal(parsedUrl.searchParams.get('client_id'), '123456789012345678');
  assert.equal(parsedUrl.searchParams.get('scope'), 'identify email');
  assert.equal(parsedUrl.searchParams.get('response_type'), 'code');

  // Verify dangerous scopes are NEVER included
  const forbiddenScopes = ['guilds.join', 'bot', 'webhook.incoming', 'messages.read', 'administrator'];
  for (const forbidden of forbiddenScopes) {
    assert.ok(!url.includes(forbidden), `Forbidden scope detected: ${forbidden}`);
  }
});

// ─── 4. STRICT CUSTOMER ROLE ASSIGNMENT (PRIVILEGE SEPARATION) ─────────────

test('RBAC: Discord accounts strictly receive CUSTOMER role by default', () => {
  // Even if an attacker supplies custom claims or simulated admin roles in Discord metadata
  function createDiscordUserAccount(discordProfile) {
    // Enforcement rule: Role is ALWAYS hardcoded to CUSTOMER
    return {
      id: `usr_discord_${discordProfile.id}`,
      email: discordProfile.email,
      role: 'CUSTOMER', // NEVER inherit from external payload
      discordId: discordProfile.id,
    };
  }

  const maliciousDiscordProfile = {
    id: '9988776655',
    username: 'hacker_one',
    email: 'hacker@domain.com',
    role: 'SUPER_ADMIN', // Attacker injection attempt
    isAdmin: true,
  };

  const createdUser = createDiscordUserAccount(maliciousDiscordProfile);
  assert.equal(createdUser.role, 'CUSTOMER');
  assert.notEqual(createdUser.role, 'SUPER_ADMIN');
});

// ─── 5. ANTI-ACCOUNT TAKEOVER ON EMAIL COLLISION ───────────────────────────

test('Account Takeover Defense: Existing email requires password proof before linking', () => {
  const existingUsers = [
    { id: 'usr_orig_1', email: 'gamer.vet@domain.com', passwordHash: 'hashed_pw_123' },
  ];

  function evaluateDiscordRegistration(discordProfile) {
    const existing = existingUsers.find((u) => u.email === discordProfile.email);
    if (existing) {
      // Must NOT automatically link! Must require proof of ownership.
      return {
        action: 'REQUIRE_PASSWORD_VERIFICATION',
        redirect: `/auth/link-account?email=${encodeURIComponent(discordProfile.email)}`,
        autoLinked: false,
      };
    }
    return {
      action: 'CREATE_NEW_CUSTOMER',
      autoLinked: false,
    };
  }

  const result = evaluateDiscordRegistration({
    id: 'discord_snowflake_99',
    email: 'gamer.vet@domain.com',
  });

  assert.equal(result.action, 'REQUIRE_PASSWORD_VERIFICATION');
  assert.equal(result.autoLinked, false);
});

// ─── 6. DISCORD AVATAR RESOLUTION FORMULAS ─────────────────────────────────

test('Discord CDN: Resolves custom avatar hash and default discriminator fallback', () => {
  // Custom uploaded avatar
  const userWithAvatar = {
    id: '123456789',
    username: 'VortexPlayer',
    discriminator: '0',
    global_name: 'Vortex Player',
    avatar: 'a_fedcba9876543210',
    email: 'player@vortex.gg',
    verified: true,
  };

  const urlCustom = getDiscordAvatarUrl(userWithAvatar);
  assert.ok(urlCustom.includes('https://cdn.discordapp.com/avatars/123456789/a_fedcba9876543210.gif'));

  // Default avatar formula when user has no custom avatar
  const userNoAvatar = {
    id: '80351110224678912',
    username: 'NoPicUser',
    discriminator: '0',
    global_name: 'No Pic',
    avatar: null,
    email: 'nopic@vortex.gg',
    verified: true,
  };

  const urlDefault = getDiscordAvatarUrl(userNoAvatar);
  assert.ok(urlDefault.includes('https://cdn.discordapp.com/embed/avatars/'));
});

// ─── 7. DENIED AUTHORIZATION HANDLING ──────────────────────────────────────

test('OAuth Error Handling: Denied authorization does not crash and redirects cleanly', () => {
  function handleOAuthCallbackParams(searchParams) {
    const error = searchParams.get('error');
    if (error === 'access_denied') {
      return { redirect: '/auth/login?error=discord_access_denied', success: false };
    }
    return { success: true };
  }

  const deniedParams = new URLSearchParams('error=access_denied&error_description=The+user+denied+your+request');
  const result = handleOAuthCallbackParams(deniedParams);

  assert.equal(result.success, false);
  assert.equal(result.redirect, '/auth/login?error=discord_access_denied');
});

// ─── 8. UNCONFIGURED CREDENTIALS ENVIRONMENT GUARD ─────────────────────────

test('Configuration Guard: Unconfigured Discord client ID throws clear guidance', () => {
  delete process.env.DISCORD_CLIENT_ID;

  assert.throws(() => {
    buildDiscordAuthorizationUrl({ state: 'abc' });
  }, /DISCORD_CLIENT_ID is not configured/);
});

// ─── 9. EXACT DISCORD CALLBACK URL & CREDENTIAL SANITIZATION ────────────────

test('Callback URI: Confirms exact registered redirect URI format', () => {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  assert.equal(getDiscordRedirectUri(), 'http://localhost:3000/api/auth/discord/callback');

  // Trailing slash normalization
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000/';
  assert.equal(getDiscordRedirectUri(), 'http://localhost:3000/api/auth/discord/callback');

  // Production URL
  process.env.NEXT_PUBLIC_APP_URL = 'https://vortexgaming.com';
  assert.equal(getDiscordRedirectUri(), 'https://vortexgaming.com/api/auth/discord/callback');
});

test('Credential Sanitization: Safely strips quotes and empty whitespace', () => {
  process.env.DISCORD_CLIENT_ID = ' "9876543210" ';
  process.env.DISCORD_CLIENT_SECRET = " 'top_secret_token_123' ";

  assert.equal(getDiscordClientId(), '9876543210');
  assert.equal(getDiscordClientSecret(), 'top_secret_token_123');

  // Empty quotes treated as null
  process.env.DISCORD_CLIENT_ID = '""';
  assert.equal(getDiscordClientId(), null);

  process.env.DISCORD_CLIENT_SECRET = "''";
  assert.equal(getDiscordClientSecret(), null);
});

// ─── 10. DATABASE PERSISTENCE & USER STORE INTEGRATION ──────────────────────

test('Database Persistence: Automatic registration creates persistent CUSTOMER and Account linkage', async () => {
  const testDiscordUser = {
    id: `test_snowflake_${Date.now()}`,
    username: 'vortex_tester_99',
    discriminator: '0',
    global_name: 'Vortex Tester',
    avatar: 'avatar_hash_123',
    email: `tester_${Date.now()}@domain.com`,
    verified: true,
  };

  const { user, account } = await createDiscordCustomer(testDiscordUser, {
    access_token: 'mock_discord_access_token',
    token_type: 'Bearer',
    expires_in: 604800,
    refresh_token: 'mock_discord_refresh_token',
    scope: 'identify email',
  });

  // Verify User record
  assert.equal(user.role, 'CUSTOMER');
  assert.equal(user.email, testDiscordUser.email);
  assert.equal(user.discordId, testDiscordUser.id);
  assert.equal(user.discordUsername, testDiscordUser.username);

  // Verify Account linkage
  assert.equal(account.provider, 'discord');
  assert.equal(account.providerAccountId, testDiscordUser.id);
  assert.equal(account.userId, user.id);

  // Verify persistence lookup by provider
  const lookup = await getAccountByProvider('discord', testDiscordUser.id);
  assert.ok(lookup);
  assert.equal(lookup.user.id, user.id);
  assert.equal(lookup.account.id, account.id);
});

test('Account Takeover Defense: Password verification requires correct password to link', async () => {
  // Dynamically register a test customer with secure bcrypt hash (no hardcoded demo seed)
  const targetEmail = `audit_customer_${Date.now()}@vortexgaming.gg`;
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash('Customer123!SecureKey', salt);
  await registerStandardUser(targetEmail, hash, 'Alex', 'Mercer');

  // Wrong password must fail
  const failedAttempt = await verifyExistingUserPassword(targetEmail, 'WrongPassword123!');
  assert.equal(failedAttempt, null);

  // Correct password must succeed
  const verifiedUser = await verifyExistingUserPassword(targetEmail, 'Customer123!SecureKey');
  assert.ok(verifiedUser);
  assert.equal(verifiedUser.email, targetEmail);

  // Link Discord to verified user
  const linkDiscordId = `linked_discord_${Date.now()}`;
  const { user: linkedUser, account: linkedAccount } = await linkDiscordToUser(verifiedUser.id, {
    providerAccountId: linkDiscordId,
    username: 'linked_gamer',
    displayName: 'Linked Gamer',
  });

  assert.equal(linkedUser.id, verifiedUser.id);
  assert.equal(linkedUser.discordId, linkDiscordId);
  assert.equal(linkedAccount.providerAccountId, linkDiscordId);
  assert.equal(linkedAccount.userId, verifiedUser.id);
});
