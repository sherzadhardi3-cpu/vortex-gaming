// VORTEX GAMING — Production User & Account Persistence Store
// Manages customer and administrator identities, prevents account takeover,
// enforces role constraints (strictly CUSTOMER for OAuth), and requires MFA for administrators.
// ZERO HARDCODED DEMO CREDENTIALS — Initial administrator must be provisioned via secure setup or environment.

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(content);
      
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
      fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[UserStore] Filesystem persistence fallback to memory:', err);
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
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[UserStore] Error saving store to disk:', err);
  }
}

/**
 * Retrieve user by email (case-insensitive)
 */
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const store = ensureInitialized();
  const normalized = email.toLowerCase().trim();
  for (const user of Object.values(store.users)) {
    if (user.email.toLowerCase().trim() === normalized) {
      return user;
    }
  }
  return null;
}

/**
 * Retrieve user by unique ID
 */
export async function getUserById(id: string): Promise<StoredUser | null> {
  const store = ensureInitialized();
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

  return { user, account };
}
