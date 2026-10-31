// VORTEX GAMING — Production User & Account Persistence Store
// Manages customer and administrator identities, prevents account takeover,
// enforces role constraints (strictly CUSTOMER for OAuth), and requires MFA for administrators.
// ZERO HARDCODED DEMO CREDENTIALS — Initial administrator must be provisioned via secure setup or environment.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from '../prisma.ts';

export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'SUPPORT_AGENT' | 'PRODUCT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  mfaEnabled: boolean;
  mfaSecret?: string;
  locale: string;
  currency: string;
  passwordHash?: string;
  securityPinHash?: string;
  securityPinCreatedAt?: string;
  pinFailedAttempts?: number;
  pinLockedUntil?: string | null;
  discordId?: string;
  discordUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAccount {
  id: string;
  userId: string;
  provider: string; // 'discord'
  providerAccountId: string; // Discord Snowflake ID
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  scope?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabasePayload {
  users: Record<string, StoredUser>;
  accounts: Record<string, StoredAccount>; // key: provider:providerAccountId
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'auth-store.json');

// In-memory cache synced with disk persistence
let memoryStore: DatabasePayload | null = null;

export async function verifyPasswordHash(password: string, hashedPassword?: string): Promise<boolean> {
  if (!password || !hashedPassword) return false;
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch {
    return false;
  }
}

function ensureInitialized(): DatabasePayload {
  if (memoryStore) return memoryStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8').trim();
      if (content) {
        memoryStore = JSON.parse(content);
      } else {
        memoryStore = { users: {}, accounts: {} };
      }
      
      // Cleanse any legacy demo accounts from disk on initialization
      if (memoryStore?.users?.['admin_master_001']?.email === 'admin@vortexgaming.com') {
        delete memoryStore.users['admin_master_001'];
        persistStore();
      }
      if (memoryStore?.users?.['customer_demo_001']?.email === 'customer@vortexgaming.com') {
        delete memoryStore.users['customer_demo_001'];
        persistStore();
      }
    } else {
      memoryStore = { users: {}, accounts: {} };
      persistStore();
    }
  } catch (err) {
    memoryStore = { users: {}, accounts: {} };
  }

  // Provision initial administrator if environment variables are supplied and no admin exists
  const envAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const envAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (envAdminEmail && envAdminPassword && memoryStore) {
    const hasAdmin = Object.values(memoryStore.users).some(
      (u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
    );
    if (!hasAdmin) {
      const now = new Date().toISOString();
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync(envAdminPassword, salt);
      const adminId = `admin_${Date.now()}`;
      memoryStore.users[adminId] = {
        id: adminId,
        email: envAdminEmail,
        firstName: 'Vortex',
        lastName: 'Admin',
        displayName: 'Security Administrator',
        role: 'SUPER_ADMIN',
        mfaEnabled: true,
        locale: 'en',
        currency: 'USD',
        passwordHash: hash,
        createdAt: now,
        updatedAt: now,
      };
      persistStore();
    }
  }

  return memoryStore!;
}

function persistStore() {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryStore, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    // Disk persistence error fallback
  }
}

/**
 * Synchronize user entity directly to persistent PostgreSQL database when DATABASE_URL is configured.
 */
async function syncUserToPostgres(user: StoredUser): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    await client.user.upsert({
      where: { email: user.email.toLowerCase().trim() },
      create: {
        id: user.id,
        email: user.email.toLowerCase().trim(),
        firstName: user.firstName || 'Customer',
        lastName: user.lastName || 'User',
        displayName: user.displayName,
        role: user.role as any,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        locale: user.locale || 'en',
        currency: user.currency || 'USD',
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
      },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role as any,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret,
        locale: user.locale,
        currency: user.currency,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    // Graceful fallback to memory/file store if PostgreSQL instance is offline/unreachable
  }
}

/**
 * Synchronize OAuth Account linkage directly to persistent PostgreSQL database.
 */
async function syncAccountToPostgres(account: StoredAccount): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    await client.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      create: {
        id: account.id,
        userId: account.userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        username: account.username,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl,
        email: account.email,
        scope: account.scope,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.expiresAt ? new Date(account.expiresAt) : null,
      },
      update: {
        username: account.username,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl,
        email: account.email,
        scope: account.scope,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        expiresAt: account.expiresAt ? new Date(account.expiresAt) : null,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.warn('[UserStore] Account PostgreSQL sync error:', err);
  }
}

/**
 * Create or record persistent user session in PostgreSQL.
 */
export async function recordPersistentSession(userId: string, token: string, expiresAt: Date): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;
    await client.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  } catch (err) {
    console.warn('[UserStore] Session PostgreSQL sync error:', err);
  }
}

/**
 * Retrieve user by email (case-insensitive) with PostgreSQL read-through persistence
 */
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const store = ensureInitialized();
  const normalized = email.toLowerCase().trim();

  // If DATABASE_URL is set, query PostgreSQL for durable persistence
  if (process.env.DATABASE_URL) {
    try {
      const client = getPrismaClient();
      if (client) {
        const dbUser = await client.user.findUnique({
          where: { email: normalized },
          include: { accounts: true },
        });
        if (dbUser) {
          const discordAccount = dbUser.accounts.find((a) => a.provider === 'discord');
          const storedUser: StoredUser = {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            displayName: dbUser.displayName || `${dbUser.firstName} ${dbUser.lastName}`,
            avatarUrl: dbUser.avatarUrl || undefined,
            role: dbUser.role as StoredUser['role'],
            mfaEnabled: dbUser.mfaEnabled,
            mfaSecret: dbUser.mfaSecret || undefined,
            locale: dbUser.locale,
            currency: dbUser.currency,
            passwordHash: dbUser.passwordHash || undefined,
            discordId: discordAccount?.providerAccountId,
            discordUsername: discordAccount?.username || undefined,
            createdAt: dbUser.createdAt.toISOString(),
            updatedAt: dbUser.updatedAt.toISOString(),
          };
          store.users[storedUser.id] = storedUser;
          return storedUser;
        }
      }
    } catch {
      // Gracefully fall back to local store
    }
  }

  for (const user of Object.values(store.users)) {
    if (user.email.toLowerCase().trim() === normalized) {
      return user;
    }
  }
  return null;
}

/**
 * Retrieve user by unique ID with PostgreSQL read-through persistence
 */
export async function getUserById(id: string): Promise<StoredUser | null> {
  const store = ensureInitialized();

  if (process.env.DATABASE_URL) {
    try {
      const client = getPrismaClient();
      if (client) {
        const dbUser = await client.user.findUnique({
          where: { id },
          include: { accounts: true },
        });
        if (dbUser) {
          const discordAccount = dbUser.accounts.find((a) => a.provider === 'discord');
          const storedUser: StoredUser = {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            displayName: dbUser.displayName || `${dbUser.firstName} ${dbUser.lastName}`,
            avatarUrl: dbUser.avatarUrl || undefined,
            role: dbUser.role as StoredUser['role'],
            mfaEnabled: dbUser.mfaEnabled,
            mfaSecret: dbUser.mfaSecret || undefined,
            locale: dbUser.locale,
            currency: dbUser.currency,
            passwordHash: dbUser.passwordHash || undefined,
            discordId: discordAccount?.providerAccountId,
            discordUsername: discordAccount?.username || undefined,
            createdAt: dbUser.createdAt.toISOString(),
            updatedAt: dbUser.updatedAt.toISOString(),
          };
          store.users[storedUser.id] = storedUser;
          return storedUser;
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  return store.users[id] || null;
}

/**
 * Find linked OAuth account by provider and providerAccountId
 */
export async function getAccountByProvider(
  provider: string,
  providerAccountId: string
): Promise<{ account: StoredAccount; user: StoredUser } | null> {
  const store = ensureInitialized();

  if (process.env.DATABASE_URL) {
    try {
      const client = getPrismaClient();
      if (client) {
        const dbAccount = await client.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        });
        if (dbAccount && dbAccount.user) {
          const account: StoredAccount = {
            id: dbAccount.id,
            userId: dbAccount.userId,
            provider: dbAccount.provider,
            providerAccountId: dbAccount.providerAccountId,
            username: dbAccount.username || undefined,
            displayName: dbAccount.displayName || undefined,
            avatarUrl: dbAccount.avatarUrl || undefined,
            email: dbAccount.email || undefined,
            scope: dbAccount.scope || undefined,
            accessToken: dbAccount.accessToken || undefined,
            refreshToken: dbAccount.refreshToken || undefined,
            expiresAt: dbAccount.expiresAt ? dbAccount.expiresAt.toISOString() : undefined,
            createdAt: dbAccount.createdAt.toISOString(),
            updatedAt: dbAccount.updatedAt.toISOString(),
          };
          const user: StoredUser = {
            id: dbAccount.user.id,
            email: dbAccount.user.email,
            firstName: dbAccount.user.firstName,
            lastName: dbAccount.user.lastName,
            displayName: dbAccount.user.displayName || `${dbAccount.user.firstName} ${dbAccount.user.lastName}`,
            avatarUrl: dbAccount.user.avatarUrl || undefined,
            role: dbAccount.user.role as StoredUser['role'],
            mfaEnabled: dbAccount.user.mfaEnabled,
            mfaSecret: dbAccount.user.mfaSecret || undefined,
            locale: dbAccount.user.locale,
            currency: dbAccount.user.currency,
            passwordHash: dbAccount.user.passwordHash || undefined,
            discordId: provider === 'discord' ? providerAccountId : undefined,
            discordUsername: provider === 'discord' ? dbAccount.username || undefined : undefined,
            createdAt: dbAccount.user.createdAt.toISOString(),
            updatedAt: dbAccount.user.updatedAt.toISOString(),
          };
          store.users[user.id] = user;
          store.accounts[`${provider}:${providerAccountId}`] = account;
          return { account, user };
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  const accountKey = `${provider}:${providerAccountId}`;
  const account = store.accounts[accountKey];
  if (!account) return null;

  const user = store.users[account.userId];
  if (!user) return null;

  return { account, user };
}

/**
 * Register a standard customer user with bcrypt password hash
 */
export async function registerStandardUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
): Promise<StoredUser> {
  const store = ensureInitialized();
  const normalizedEmail = email.toLowerCase().trim();

  if (await getUserByEmail(normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newUser: StoredUser = {
    id: userId,
    email: normalizedEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    role: 'CUSTOMER',
    mfaEnabled: false,
    locale: 'en',
    currency: 'USD',
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  store.users[userId] = newUser;
  persistStore();
  await syncUserToPostgres(newUser);

  return newUser;
}

/**
 * Provision an administrator account with password complexity enforcement and mandatory MFA
 */
export async function provisionInitialAdmin(
  email: string,
  plainPassword: string,
  options?: { firstName?: string; lastName?: string }
): Promise<StoredUser> {
  const store = ensureInitialized();
  const normalizedEmail = email.toLowerCase().trim();

  if (plainPassword.length < 12) {
    throw new Error('Administrator password must be at least 12 characters long.');
  }

  const hasUpper = /[A-Z]/.test(plainPassword);
  const hasLower = /[a-z]/.test(plainPassword);
  const hasDigit = /[0-9]/.test(plainPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(plainPassword);

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    throw new Error(
      'Administrator password must contain uppercase, lowercase, numbers, and special characters.'
    );
  }

  const existing = await getUserByEmail(normalizedEmail);
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(plainPassword, salt);
  const now = new Date().toISOString();

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = 'SUPER_ADMIN';
    existing.mfaEnabled = true;
    existing.updatedAt = now;
    persistStore();
    await syncUserToPostgres(existing);
    return existing;
  }

  const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newAdmin: StoredUser = {
    id: adminId,
    email: normalizedEmail,
    firstName: options?.firstName || 'System',
    lastName: options?.lastName || 'Administrator',
    displayName: `${options?.firstName || 'System'} ${options?.lastName || 'Administrator'}`,
    role: 'SUPER_ADMIN',
    mfaEnabled: true,
    locale: 'en',
    currency: 'USD',
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  store.users[adminId] = newAdmin;
  persistStore();
  await syncUserToPostgres(newAdmin);
  return newAdmin;
}

/**
 * Verify user password (used during anti-account-takeover linking and sign-in)
 * ZERO PLAINTEXT BYPASSES — strictly authenticates against bcrypt hash
 */
export async function verifyExistingUserPassword(
  email: string,
  passwordAttempt: string
): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isMatch = await verifyPasswordHash(passwordAttempt, user.passwordHash);
  if (isMatch) {
    return user;
  }
  return null;
}

/**
 * Register a new Discord user as a CUSTOMER with an Account linkage
 * CRITICAL SECURITY RULE: Role is strictly locked to CUSTOMER.
 */
export async function createDiscordCustomer(
  discordProfile: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    email?: string | null;
  },
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  }
): Promise<{ user: StoredUser; account: StoredAccount }> {
  const store = ensureInitialized();
  const rawEmail = discordProfile.email || `${discordProfile.username}_${discordProfile.id.slice(-4)}@discord.vortexgaming.local`;
  const email = rawEmail.toLowerCase().trim();

  // Check if an account is already linked to this Discord ID
  const accountKey = `discord:${discordProfile.id}`;
  const existingAccount = store.accounts[accountKey];
  if (existingAccount) {
    const existingUser = store.users[existingAccount.userId];
    if (existingUser) {
      return { user: existingUser, account: existingAccount };
    }
  }

  // Create new user with strictly CUSTOMER permissions
  const now = new Date().toISOString();
  const userId = `usr_discord_${discordProfile.id}`;
  const displayName = discordProfile.global_name || discordProfile.username;

  const newUser: StoredUser = {
    id: userId,
    email,
    firstName: displayName.split(' ')[0] || discordProfile.username,
    lastName: displayName.split(' ').slice(1).join(' ') || 'Gamer',
    displayName,
    avatarUrl: discordProfile.avatar
      ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
      : undefined,
    role: 'CUSTOMER', // Strict RBAC lock
    mfaEnabled: false,
    locale: 'en',
    currency: 'USD',
    discordId: discordProfile.id,
    discordUsername: discordProfile.username,
    createdAt: now,
    updatedAt: now,
  };

  const newAccount: StoredAccount = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    provider: 'discord',
    providerAccountId: discordProfile.id,
    username: discordProfile.username,
    displayName,
    avatarUrl: newUser.avatarUrl,
    email,
    scope: tokens?.scope || 'identify email',
    accessToken: tokens?.access_token,
    refreshToken: tokens?.refresh_token,
    expiresAt: tokens?.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : undefined,
    createdAt: now,
    updatedAt: now,
  };

  store.users[userId] = newUser;
  store.accounts[accountKey] = newAccount;
  persistStore();
  await syncUserToPostgres(newUser);
  await syncAccountToPostgres(newAccount);

  return { user: newUser, account: newAccount };
}

/**
 * Link an existing user account to Discord after anti-takeover authentication
 */
export async function linkDiscordToUser(
  userId: string,
  discordData: {
    providerAccountId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  }
): Promise<{ user: StoredUser; account: StoredAccount }> {
  const store = ensureInitialized();
  const user = store.users[userId];
  if (!user) {
    throw new Error('User not found to link Discord account.');
  }

  const now = new Date().toISOString();
  const accountKey = `discord:${discordData.providerAccountId}`;

  const account: StoredAccount = {
    id: store.accounts[accountKey]?.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    provider: 'discord',
    providerAccountId: discordData.providerAccountId,
    username: discordData.username,
    displayName: discordData.displayName,
    avatarUrl: discordData.avatarUrl,
    email: discordData.email,
    scope: 'identify email',
    createdAt: store.accounts[accountKey]?.createdAt || now,
    updatedAt: now,
  };

  // Update user profile with Discord linkage while strictly preserving user's existing role
  user.discordId = discordData.providerAccountId;
  user.discordUsername = discordData.username;
  if (!user.avatarUrl && discordData.avatarUrl) {
    user.avatarUrl = discordData.avatarUrl;
  }
  user.updatedAt = now;

  store.users[userId] = user;
  store.accounts[accountKey] = account;
  persistStore();
  await syncUserToPostgres(user);
  await syncAccountToPostgres(account);

  return { user, account };
}

/**
 * Returns security PIN configuration status for a given user.
 * NEVER returns the PIN hash or any sensitive secrets.
 */
export function getUserPinStatus(userId: string): {
  hasPin: boolean;
  isLocked: boolean;
  lockedUntil?: string | null;
  remainingAttempts: number;
} {
  const store = ensureInitialized();
  const user = store.users[userId];
  if (!user) {
    return { hasPin: false, isLocked: false, remainingAttempts: 5 };
  }
  const isLocked = Boolean(user.pinLockedUntil && new Date(user.pinLockedUntil).getTime() > Date.now());
  const failedAttempts = user.pinFailedAttempts || 0;
  const remainingAttempts = isLocked ? 0 : Math.max(0, 5 - failedAttempts);
  return {
    hasPin: Boolean(user.securityPinHash),
    isLocked,
    lockedUntil: isLocked ? user.pinLockedUntil : null,
    remainingAttempts,
  };
}

/**
 * Creates or resets a customer's security PIN.
 * If user already has a PIN and password, requires verification of account password.
 */
export async function setUserSecurityPin(
  userId: string,
  pin: string,
  passwordVerify?: string
): Promise<{ success: boolean; error?: string }> {
  const store = ensureInitialized();
  const user = store.users[userId];
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const sanitizedPin = (pin || '').trim();
  if (!/^\d{4,6}$/.test(sanitizedPin)) {
    return { success: false, error: 'PIN must be between 4 and 6 numeric digits' };
  }

  // If user already has a PIN and has an account password, verify password identity
  if (user.securityPinHash && user.passwordHash) {
    if (!passwordVerify) {
      return { success: false, error: 'Account password is required to reset your security PIN' };
    }
    const isPasswordValid = await verifyPasswordHash(passwordVerify, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect account password' };
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPin = await bcrypt.hash(sanitizedPin, salt);
  const now = new Date().toISOString();

  user.securityPinHash = hashedPin;
  user.securityPinCreatedAt = now;
  user.pinFailedAttempts = 0;
  user.pinLockedUntil = null;
  user.updatedAt = now;

  store.users[userId] = user;
  persistStore();
  return { success: true };
}

/**
 * Verifies a customer's security PIN with rate limiting, attempt tracking, and 15-minute lockouts.
 * On success, returns an order-scoped, short-lived HMAC-signed authorization token.
 */
export async function verifyUserSecurityPin(
  userId: string,
  pin: string,
  orderId?: string
): Promise<{
  success: boolean;
  pinAuthToken?: string;
  expiresAt?: string;
  locked?: boolean;
  lockedUntil?: string | null;
  remainingAttempts?: number;
  noPinConfigured?: boolean;
  error?: string;
}> {
  const store = ensureInitialized();
  const user = store.users[userId];
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // 1. Check temporary brute-force lockout
  if (user.pinLockedUntil && new Date(user.pinLockedUntil).getTime() > Date.now()) {
    const lockMs = new Date(user.pinLockedUntil).getTime() - Date.now();
    const minutesLeft = Math.ceil(lockMs / 60000);
    return {
      success: false,
      locked: true,
      lockedUntil: user.pinLockedUntil,
      remainingAttempts: 0,
      error: `PIN verification is temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
    };
  }

  // 2. Check if user has a configured PIN
  if (!user.securityPinHash) {
    return {
      success: false,
      noPinConfigured: true,
      error: 'No security PIN is configured for your account. Please set up a PIN.',
    };
  }

  const sanitizedPin = (pin || '').trim();
  const isMatch = await bcrypt.compare(sanitizedPin, user.securityPinHash);
  const now = new Date().toISOString();

  // 3. Failed Attempt Handling
  if (!isMatch) {
    user.pinFailedAttempts = (user.pinFailedAttempts || 0) + 1;
    const maxAttempts = 5;
    const remaining = Math.max(0, maxAttempts - user.pinFailedAttempts);

    if (remaining === 0) {
      // 15-minute lockout on 5 consecutive failures
      const lockDuration = 15 * 60 * 1000;
      const lockedUntil = new Date(Date.now() + lockDuration).toISOString();
      user.pinLockedUntil = lockedUntil;
      user.updatedAt = now;
      persistStore();
      return {
        success: false,
        locked: true,
        lockedUntil,
        remainingAttempts: 0,
        error: 'Too many incorrect attempts. Security PIN verification is locked for 15 minutes.',
      };
    }

    user.updatedAt = now;
    persistStore();
    return {
      success: false,
      remainingAttempts: remaining,
      error: `Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // 4. Successful Verification: Reset attempts and lockout
  user.pinFailedAttempts = 0;
  user.pinLockedUntil = null;
  user.updatedAt = now;
  persistStore();

  // 5. Generate short-lived order-scoped HMAC authorization token (10 minutes TTL)
  const expiryTime = Date.now() + 10 * 60 * 1000;
  const payload = {
    userId: user.id,
    orderId: orderId || '*',
    exp: expiryTime,
    iat: Date.now(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret =
    process.env.SESSION_SECRET ||
    process.env.GAME_KEY_ENCRYPTION_KEY ||
    'vortex-delivery-pin-secret-key-default-salt-32b';
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const pinAuthToken = `${payloadB64}.${signature}`;

  return {
    success: true,
    pinAuthToken,
    expiresAt: new Date(expiryTime).toISOString(),
  };
}

/**
 * Validates a short-lived order-scoped PIN authorization token.
 */
export function verifyPinAuthToken(
  token: string | null | undefined,
  expectedOrderId?: string | null,
  expectedUserId?: string | null
): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;

  const secret =
    process.env.SESSION_SECRET ||
    process.env.GAME_KEY_ENCRYPTION_KEY ||
    'vortex-delivery-pin-secret-key-default-salt-32b';
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return false; // Expired
    }
    if (expectedUserId && payload.userId !== expectedUserId) {
      return false; // Mismatched user
    }
    if (expectedOrderId && payload.orderId !== '*' && payload.orderId !== expectedOrderId) {
      return false; // Mismatched order
    }
    return true;
  } catch {
    return false;
  }
}
