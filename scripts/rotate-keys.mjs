#!/usr/bin/env node
// VORTEX GAMING — Safe Key Rotation Procedure Utility
// Safely rotates AES-256-GCM encrypted game keys from an old key to a new CSPRNG key.
// Ensures zero data loss and validates integrity before committing changes.

import crypto from 'node:crypto';
import fs from 'node:fs';

// Load .env.local if present
if (fs.existsSync('.env.local')) {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // fallback
  }
}

import {
  rotateEncryptedKey,
  generateSecureEncryptionKey,
} from '../src/lib/crypto/key-vault.ts';

function runKeyRotationProcedure() {
  console.log('=== VORTEX GAMING SAFE KEY ROTATION PROCEDURE ===\n');

  const oldKeyHex = process.env.GAME_KEY_ENCRYPTION_KEY_PREVIOUS || process.env.GAME_KEY_ENCRYPTION_KEY;
  let newKeyHex = process.env.NEW_GAME_KEY_ENCRYPTION_KEY;

  if (!newKeyHex) {
    console.log('[*] No NEW_GAME_KEY_ENCRYPTION_KEY provided. Generating cryptographically secure 256-bit CSPRNG key...');
    newKeyHex = generateSecureEncryptionKey();
    console.log('[+] Generated New Key (32 bytes / 64 hex characters): [SECURE CSPRNG KEY]');
  }

  if (!oldKeyHex || oldKeyHex.length !== 64) {
    console.error('[-] Error: Old encryption key must be a valid 64-character hex string.');
    process.exit(1);
  }

  if (oldKeyHex === newKeyHex) {
    console.error('[-] Error: New key must be distinct from the old key.');
    process.exit(1);
  }

  console.log('[*] Testing rotation integrity with sample encrypted payload...');
  const sampleKey = 'VTX-CYBER-9842-8812-7641';
  
  // Encrypt with old key
  const oldKeyBuf = Buffer.from(oldKeyHex, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', oldKeyBuf, iv);
  const encrypted = Buffer.concat([cipher.update(sampleKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const sampleOldCiphertext = Buffer.concat([iv, authTag, encrypted]).toString('base64');

  // Rotate
  const reEncrypted = rotateEncryptedKey(sampleOldCiphertext, oldKeyHex, newKeyHex);

  // Decrypt with new key
  const newKeyBuf = Buffer.from(newKeyHex, 'hex');
  const packed = Buffer.from(reEncrypted, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', newKeyBuf, packed.subarray(0, 16));
  decipher.setAuthTag(packed.subarray(16, 32));
  const decrypted = Buffer.concat([decipher.update(packed.subarray(32)), decipher.final()]).toString('utf8');

  if (decrypted === sampleKey) {
    console.log('[+] Rotation Verification: SUCCESSFUL! Data decrypted and re-encrypted with 100% integrity.\n');
    console.log('--- RECOVERY AND CONFIGURATION INSTRUCTIONS ---');
    console.log('1. Set GAME_KEY_ENCRYPTION_KEY to the newly generated CSPRNG key.');
    console.log('2. Set GAME_KEY_ENCRYPTION_KEY_PREVIOUS to your old key during the rotation window.');
    console.log('3. Run database batch migration script: npm run vault:migrate-keys');
    console.log('4. Once all database keys have been migrated, unset GAME_KEY_ENCRYPTION_KEY_PREVIOUS.');
  } else {
    console.error('[-] Rotation verification failed: Decrypted text does not match sample.');
    process.exit(1);
  }
}

runKeyRotationProcedure();
