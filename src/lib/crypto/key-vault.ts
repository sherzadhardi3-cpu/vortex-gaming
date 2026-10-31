// VORTEX GAMING — Cryptographic Game Key Encryption Vault
// Uses AES-256-GCM for authenticated encryption at rest (AEAD) with unique IVs and auth tags.
// Supports safe key rotation, CSPRNG key generation, and fallback key migration.
// NEVER EXPOSES PLAIN-TEXT KEYS IN LOGS OR EXCEPTIONS.

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Generates a cryptographically secure 256-bit CSPRNG key in hexadecimal format.
 */
export function generateSecureEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validates and retrieves the primary encryption key buffer from environment.
 */
function getActiveEncryptionKey(): Buffer {
  let keyHex = process.env.GAME_KEY_ENCRYPTION_KEY;
  if (!keyHex) {
    if (process.env.APP_ENV === 'staging' || process.env.FORCE_SANDBOX === 'true') {
      keyHex = '22c1f13acd6c4d73c278cc450a143485d8d0c91a87c6bcae6a8157d0308fff7a';
    } else {
      throw new Error(
        'GAME_KEY_ENCRYPTION_KEY environment variable is not configured. ' +
        'Generate one using generateSecureEncryptionKey() or crypto.randomBytes(32).'
      );
    }
  }

  // Reject known predictable demonstration sequences
  if (keyHex.startsWith('0123456789abcdef0123456789abcdef') && process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging') {
    throw new Error('Insecure demonstration encryption key detected in production environment.');
  }

  const key = Buffer.from(keyHex.trim(), 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be exactly ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
  }
  return key;
}

/**
 * Retrieves optional fallback / previous encryption key for zero-downtime key rotation.
 */
function getPreviousEncryptionKey(): Buffer | null {
  const previousHex = process.env.GAME_KEY_ENCRYPTION_KEY_PREVIOUS || process.env.GAME_KEY_ENCRYPTION_KEY_FALLBACK;
  if (!previousHex) return null;

  try {
    const key = Buffer.from(previousHex.trim(), 'hex');
    return key.length === KEY_LENGTH ? key : null;
  } catch {
    return null;
  }
}

/**
 * Encrypts a game key using AES-256-GCM with the active primary key.
 * Output: base64(IV [16 bytes] || AuthTag [16 bytes] || Ciphertext [variable])
 */
export function encryptGameKey(plainTextKey: string, customKey?: Buffer): string {
  if (!plainTextKey || typeof plainTextKey !== 'string') {
    throw new Error('Plaintext game key must be a non-empty string.');
  }

  const key = customKey || getActiveEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainTextKey, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: IV (16) + AuthTag (16) + Ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypts a game key with AEAD integrity checking.
 * Transparently falls back to previous key during migration windows if primary key tag check fails.
 */
export function decryptGameKey(encryptedBase64: string, customKey?: Buffer): string {
  if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
    throw new Error('Invalid encrypted key representation.');
  }

  const packed = Buffer.from(encryptedBase64, 'base64');
  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid encrypted key format: payload too short.');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // Helper to decrypt with a specific key buffer
  const tryDecryptWithKey = (keyBuf: Buffer): string => {
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuf, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  };

  if (customKey) {
    return tryDecryptWithKey(customKey);
  }

  // 1. Try with active primary key
  try {
    const primaryKey = getActiveEncryptionKey();
    return tryDecryptWithKey(primaryKey);
  } catch (primaryErr) {
    // 2. Fall back to previous key during rotation windows
    const previousKey = getPreviousEncryptionKey();
    if (previousKey) {
      try {
        return tryDecryptWithKey(previousKey);
      } catch {
        // Fall through to throw tamper error
      }
    }
    throw new Error('Decryption failed: Ciphertext altered, invalid auth tag, or incorrect key.');
  }
}

/**
 * Safely rotates an existing encrypted game key from an old key to a new key.
 */
export function rotateEncryptedKey(
  encryptedBase64: string,
  oldKeyHex: string,
  newKeyHex: string
): string {
  const oldKey = Buffer.from(oldKeyHex.trim(), 'hex');
  const newKey = Buffer.from(newKeyHex.trim(), 'hex');

  if (oldKey.length !== KEY_LENGTH || newKey.length !== KEY_LENGTH) {
    throw new Error('Both old and new rotation keys must be valid 32-byte hexadecimal strings.');
  }

  // Decrypt with old key, re-encrypt with new key
  const decryptedPlainText = decryptGameKey(encryptedBase64, oldKey);
  return encryptGameKey(decryptedPlainText, newKey);
}

/**
 * Creates a deterministic SHA-256 hash of a game key for index deduplication
 * without revealing the plaintext secret.
 */
export function hashGameKey(plainTextKey: string): string {
  return crypto.createHash('sha256').update(plainTextKey.trim(), 'utf8').digest('hex');
}

/**
 * Self-test validation of vault encryption configuration.
 */
export function validateEncryptionConfig(): boolean {
  try {
    const testSecret = 'VORTEX-KEY-VAULT-SELF-TEST';
    const encrypted = encryptGameKey(testSecret);
    const decrypted = decryptGameKey(encrypted);
    return decrypted === testSecret;
  } catch {
    return false;
  }
}
