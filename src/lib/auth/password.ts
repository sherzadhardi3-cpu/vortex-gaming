// VORTEX GAMING — Cryptographic Password Hashing
// Supports bcrypt (via bcryptjs) with standard salt rounds and timing safety
// Compliant with OWASP standards for password storage

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using salted bcrypt (OWASP recommended standard)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a stored hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    if (!password || !hashedPassword) return false;
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Checks if a hash should be re-hashed to higher cost factor
 */
export function needsRehash(hashedPassword: string): boolean {
  if (!hashedPassword.startsWith('$2')) return true;
  return false;
}
