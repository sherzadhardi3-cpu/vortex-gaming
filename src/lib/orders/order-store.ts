// VORTEX GAMING — Authoritative Order & Inventory Fulfillment Store
// Implements strict payment-first key allocation, atomic locking, ownership validation,
// and complete isolation between live inventory and sandbox dummy keys.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  type PaymentState,
  type FulfillmentState,
  canTransitionPayment,
  canTransitionFulfillment,
  canRevealActivationKey,
} from './order-state-machine.ts';
import { encryptGameKey, decryptGameKey, hashGameKey } from '../crypto/key-vault.ts';
import { getPrismaClient } from '../prisma.ts';
import { GAMES_CATALOG } from '../data/games.ts';

export interface OrderItem {
  gameId: string;
  title: string;
  platform: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceIQD: number;
}

export interface AllocatedKeyRecord {
  keyId: string;
  gameId: string;
  encryptedKey: string;
  isSandboxKey: boolean;
  revealedAt?: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerId: string | null;
  customerName?: string;
  orderAccessToken: string; // High-entropy token for guest ownership validation
  paymentProvider: 'stripe' | 'fib' | 'fastpay' | 'qi_card';
  paymentStatus: PaymentState;
  fulfillmentStatus: FulfillmentState;
  items: OrderItem[];
  total: number;
  currency: 'USD' | 'IQD' | string;
  displayCurrency?: string;
  exchangeRate?: number;
  convertedTotal?: number;
  rateTimestamp?: string;
  discountApplied: number;
  isSandbox: boolean;
  paymentSessionId?: string;
  paymentIntentId?: string;
  allocatedKeys: AllocatedKeyRecord[];
  statusHistory: Array<{
    statusType: 'PAYMENT' | 'FULFILLMENT';
    from: string;
    to: string;
    timestamp: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  revokedAt?: string;
  refundReason?: string;
}

export interface StoredInventoryKey {
  id: string;
  gameId: string;
  encryptedKey: string;
  keyHash: string;
  status: 'AVAILABLE' | 'RESERVED' | 'DELIVERED' | 'REVOKED';
  isSandboxKey: boolean;
  orderId: string | null;
  allocatedToEmail: string | null;
  reservedAt: string | null;
  deliveredAt: string | null;
  revokedAt: string | null;
  lockVersion: number;
}

interface OrdersDatabase {
  orders: Record<string, StoredOrder>;
  inventory: Record<string, StoredInventoryKey>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders-store.json');

let memoryStore: OrdersDatabase | null = null;
const inventoryLocks = new Set<string>();

/**
 * Initializes and syncs the persistent storage with memory fallback.
 */
function ensureInitialized(): OrdersDatabase {
  if (memoryStore) return memoryStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8').trim();
      if (raw) {
        memoryStore = JSON.parse(raw);
      } else {
        memoryStore = { orders: {}, inventory: {} };
      }
    } else {
      memoryStore = { orders: {}, inventory: {} };
      persistStore();
    }
  } catch (err) {
    memoryStore = { orders: {}, inventory: {} };
  }

  // Pre-seed some sample AVAILABLE production inventory if empty (for test orders)
  if (Object.keys(memoryStore!.inventory).length === 0) {
    seedInitialInventory(memoryStore!);
  }

  return memoryStore!;
}

function persistStore() {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tempFile = `${ORDERS_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryStore, null, 2), 'utf8');
    fs.renameSync(tempFile, ORDERS_FILE);
  } catch (err) {
    // Disk persistence fallback
  }
}

/**
 * Synchronizes an order to persistent PostgreSQL storage.
 */
export async function syncOrderToPostgres(order: StoredOrder): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    const customerEmail = order.customerEmail.toLowerCase().trim();
    const customerUser = await client.user.upsert({
      where: { email: customerEmail },
      create: {
        id: order.customerId || `usr_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: customerEmail,
        firstName: order.customerName?.split(' ')[0] || 'Customer',
        lastName: order.customerName?.split(' ').slice(1).join(' ') || 'Order',
        displayName: order.customerName || 'Vortex Customer',
        role: 'CUSTOMER',
      },
      update: {
        displayName: order.customerName || undefined,
      },
    });

    const statusMap: Record<string, any> = {
      PENDING: 'PENDING',
      PAID: 'PAID',
      PROCESSING: 'FULFILLMENT_PROCESSING',
      FAILED: 'FULFILLMENT_FAILED',
      REFUNDED: 'REFUNDED',
      CANCELLED: 'CANCELLED',
    };

    const prismaStatus = statusMap[order.paymentStatus] || 'PENDING';

    await client.order.upsert({
      where: { orderNumber: order.orderNumber },
      create: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: customerUser.id,
        status: prismaStatus,
        currency: order.currency,
        subtotalAmount: Math.round(order.total * 100),
        discountAmount: Math.round(order.discountApplied * 100),
        totalAmount: Math.round(order.total * 100),
        customerEmail,
        customerName: order.customerName || 'Customer',
        idempotencyKey: order.orderAccessToken,
        paidAt: order.paidAt ? new Date(order.paidAt) : null,
        fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : null,
        refundedAt: order.refundReason ? new Date() : null,
      },
      update: {
        status: prismaStatus,
        paidAt: order.paidAt ? new Date(order.paidAt) : null,
        fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : null,
        refundedAt: order.refundReason ? new Date() : null,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    // Gracefully handle PostgreSQL offline in local test runs
  }
}

/**
 * Synchronizes an inventory key to persistent PostgreSQL storage.
 */
export async function syncInventoryKeyToPostgres(key: StoredInventoryKey): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    // Retrieve genuine catalog item from authoritative GAMES_CATALOG
    const catalogItem = GAMES_CATALOG.find((g) => g.id === key.gameId || g.slug === key.gameId);
    if (!catalogItem) {
      // Do not invent product images or silently fabricate inventory for unknown products
      return;
    }

    const platformSlug = catalogItem.platform;
    const platform = await client.platform.upsert({
      where: { slug: platformSlug },
      create: {
        id: platformSlug,
        slug: platformSlug,
        name: catalogItem.platformName,
        logoUrl: `/images/platforms/${platformSlug}.svg`,
      },
      update: {},
    });

    const product = await client.product.upsert({
      where: { slug: catalogItem.slug },
      create: {
        id: catalogItem.id,
        title: catalogItem.title,
        slug: catalogItem.slug,
        description: catalogItem.description,
        shortDescription: catalogItem.shortDescription,
        coverImage: `/images/games/${catalogItem.slug}.jpg`,
        platformId: platform.id,
        priceUSD: catalogItem.priceUSD,
        priceIQD: catalogItem.priceIQD,
        isActive: true,
        stockCount: catalogItem.stockCount,
      },
      update: {
        title: catalogItem.title,
        description: catalogItem.description,
        priceUSD: catalogItem.priceUSD,
        priceIQD: catalogItem.priceIQD,
        isActive: true,
      },
    });

    const keyStatusMap: Record<string, any> = {
      AVAILABLE: 'AVAILABLE',
      RESERVED: 'RESERVED',
      DELIVERED: 'DELIVERED',
      REVOKED: 'REVOKED',
    };

    await client.gameKey.upsert({
      where: { keyHash: key.keyHash },
      create: {
        id: key.id,
        productId: product.id,
        encryptedKey: key.encryptedKey,
        keyHash: key.keyHash,
        status: keyStatusMap[key.status] || 'AVAILABLE',
        orderId: key.orderId,
        reservedAt: key.reservedAt ? new Date(key.reservedAt) : null,
        deliveredAt: key.deliveredAt ? new Date(key.deliveredAt) : null,
        revokedAt: key.revokedAt ? new Date(key.revokedAt) : null,
      },
      update: {
        status: keyStatusMap[key.status] || 'AVAILABLE',
        orderId: key.orderId,
        reservedAt: key.reservedAt ? new Date(key.reservedAt) : null,
        deliveredAt: key.deliveredAt ? new Date(key.deliveredAt) : null,
        revokedAt: key.revokedAt ? new Date(key.revokedAt) : null,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    // Gracefully handle PostgreSQL offline in local test runs
  }
}

function seedInitialInventory(store: OrdersDatabase) {
  const games = ['steam-cyberpunk-phantom-liberty', 'elden-ring', 'gta-v', 'starfield'];
  for (const gameId of games) {
    for (let i = 1; i <= 3; i++) {
      const plainKey = `PROD-${gameId.substring(0, 8).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}-KEY${i}`;
      const encryptedKey = encryptGameKey(plainKey);
      const keyId = `key_${gameId}_${i}_${crypto.randomBytes(4).toString('hex')}`;
      store.inventory[keyId] = {
        id: keyId,
        gameId,
        encryptedKey,
        keyHash: hashGameKey(plainKey),
        status: 'AVAILABLE',
        isSandboxKey: false,
        orderId: null,
        allocatedToEmail: null,
        reservedAt: null,
        deliveredAt: null,
        revokedAt: null,
        lockVersion: 1,
      };
    }
  }
}

/**
 * Check if the current runtime environment strictly mandates sandbox mode.
 */
export function isEnvironmentForcedSandbox(): boolean {
  return (
    process.env.FORCE_SANDBOX === 'true' ||
    process.env.APP_ENV === 'staging' ||
    process.env.NODE_ENV !== 'production'
  );
}

/**
 * Creates an authoritative order in PENDING status with zero key exposure.
 */
export function createAuthoritativeOrder(params: {
  orderId?: string;
  orderNumber: string;
  customerEmail: string;
  customerId?: string | null;
  customerName?: string;
  items: OrderItem[];
  total: number;
  currency: 'USD' | 'IQD' | string;
  displayCurrency?: string;
  exchangeRate?: number;
  convertedTotal?: number;
  rateTimestamp?: string;
  discountApplied?: number;
  paymentProvider: 'stripe' | 'fib' | 'fastpay' | 'qi_card';
  isSandbox?: boolean;
}): StoredOrder {
  const store = ensureInitialized();
  const orderId = params.orderId || `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const orderAccessToken = crypto.randomBytes(32).toString('hex');

  const isSandbox = params.isSandbox ?? isEnvironmentForcedSandbox();

  const newOrder: StoredOrder = {
    id: orderId,
    orderNumber: params.orderNumber,
    customerEmail: params.customerEmail.toLowerCase().trim(),
    customerId: params.customerId || null,
    customerName: params.customerName || '',
    orderAccessToken,
    paymentProvider: params.paymentProvider,
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'NOT_STARTED',
    items: params.items,
    total: params.total,
    currency: params.currency,
    displayCurrency: params.displayCurrency || params.currency,
    exchangeRate: params.exchangeRate,
    convertedTotal: params.convertedTotal,
    rateTimestamp: params.rateTimestamp || (params.exchangeRate ? now : undefined),
    discountApplied: params.discountApplied || 0,
    isSandbox,
    allocatedKeys: [],
    statusHistory: [
      {
        statusType: 'PAYMENT',
        from: 'NONE',
        to: 'PENDING',
        timestamp: now,
        reason: 'Order initiated at checkout',
      },
      {
        statusType: 'FULFILLMENT',
        from: 'NONE',
        to: 'NOT_STARTED',
        timestamp: now,
        reason: 'Awaiting verified payment confirmation',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.orders[orderId] = newOrder;
  persistStore();
  syncOrderToPostgres(newOrder).catch(() => {});
  return newOrder;
}

/**
 * Retrieves an order by ID or orderNumber.
 */
export function getOrderById(orderIdOrNumber: string): StoredOrder | null {
  const store = ensureInitialized();
  if (!orderIdOrNumber) return null;
  if (store.orders[orderIdOrNumber]) return store.orders[orderIdOrNumber];
  return (
    Object.values(store.orders).find(
      (o) =>
        o.orderNumber.toUpperCase() === orderIdOrNumber.toUpperCase() ||
        o.id.toUpperCase() === orderIdOrNumber.toUpperCase()
    ) || null
  );
}

/**
 * Retrieves all orders belonging to a customer by user ID or email.
 */
export function getOrdersByCustomer(
  customerId?: string | null,
  email?: string | null
): StoredOrder[] {
  const store = ensureInitialized();
  const cId = customerId?.trim();
  const em = email?.toLowerCase().trim();
  if (!cId && !em) return [];

  return Object.values(store.orders)
    .filter((order) => {
      if (cId && order.customerId === cId) return true;
      if (em && order.customerEmail.toLowerCase().trim() === em) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Verifies whether the requesting user/session owns the specified order.
 * Strictly prevents IDOR (Insecure Direct Object Reference) access.
 */
export function verifyOrderOwnership(
  order: StoredOrder,
  credentials: {
    userId?: string | null;
    email?: string | null;
    orderAccessToken?: string | null;
  }
): boolean {
  if (!order) return false;

  // 1. Valid high-entropy token match (from checkout session or confirmation link)
  if (
    credentials.orderAccessToken &&
    credentials.orderAccessToken === order.orderAccessToken
  ) {
    return true;
  }

  // 2. Authenticated user ID match
  if (
    credentials.userId &&
    order.customerId &&
    credentials.userId === order.customerId
  ) {
    return true;
  }

  // 3. Authenticated email match
  if (
    credentials.email &&
    credentials.email.toLowerCase().trim() === order.customerEmail.toLowerCase().trim()
  ) {
    return true;
  }

  return false;
}

/**
 * Authoritatively marks an order as PAID upon cryptographic/provider verification.
 * Automatically triggers atomic key allocation.
 */
export function markOrderAsPaid(
  orderId: string,
  paymentDetails?: {
    paymentIntentId?: string;
    paymentSessionId?: string;
    verifiedAmount?: number;
  }
): { success: boolean; order?: StoredOrder; error?: string } {
  const store = ensureInitialized();
  const order = store.orders[orderId];
  if (!order) return { success: false, error: 'Order not found' };

  if (order.paymentStatus === 'PAID') {
    // Idempotent return if already paid
    return { success: true, order };
  }

  if (!canTransitionPayment(order.paymentStatus, 'PAID')) {
    return {
      success: false,
      error: `Illegal payment transition from ${order.paymentStatus} to PAID`,
    };
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'PAID';
  order.paidAt = now;
  order.updatedAt = now;
  if (paymentDetails?.paymentIntentId) order.paymentIntentId = paymentDetails.paymentIntentId;
  if (paymentDetails?.paymentSessionId) order.paymentSessionId = paymentDetails.paymentSessionId;

  order.statusHistory.push({
    statusType: 'PAYMENT',
    from: 'PENDING',
    to: 'PAID',
    timestamp: now,
    reason: 'Verified by payment provider webhook/authority',
  });

  // Trigger atomic fulfillment
  const allocation = allocateGameKeysForOrder(order);
  persistStore();
  syncOrderToPostgres(order).catch(() => {});

  return { success: true, order };
}

/**
 * Transitions an order to PROCESSING status (e.g. while payment is pending confirmation).
 */
export function markOrderAsProcessing(
  orderId: string,
  reason = 'Payment is being processed by gateway'
): { success: boolean; order?: StoredOrder; error?: string } {
  const store = ensureInitialized();
  const order = store.orders[orderId];
  if (!order) return { success: false, error: 'Order not found' };

  if (order.paymentStatus === 'PROCESSING') return { success: true, order };

  if (!canTransitionPayment(order.paymentStatus, 'PROCESSING')) {
    return {
      success: false,
      error: `Illegal payment transition from ${order.paymentStatus} to PROCESSING`,
    };
  }

  const now = new Date().toISOString();
  order.statusHistory.push({
    statusType: 'PAYMENT',
    from: order.paymentStatus,
    to: 'PROCESSING',
    timestamp: now,
    reason,
  });

  order.paymentStatus = 'PROCESSING';
  order.updatedAt = now;
  persistStore();
  syncOrderToPostgres(order).catch(() => {});

  return { success: true, order };
}

/**
 * Marks an order as FAILED when payment authorization fails or expires.
 * Strictly guarantees fulfillment is marked FAILED and NO keys are allocated.
 */
export function markOrderAsFailed(
  orderId: string,
  reason = 'Payment failed or declined by provider'
): { success: boolean; order?: StoredOrder; error?: string } {
  const store = ensureInitialized();
  const order = store.orders[orderId];
  if (!order) return { success: false, error: 'Order not found' };

  if (order.paymentStatus === 'FAILED') return { success: true, order };

  if (!canTransitionPayment(order.paymentStatus, 'FAILED')) {
    return {
      success: false,
      error: `Illegal payment transition from ${order.paymentStatus} to FAILED`,
    };
  }

  const now = new Date().toISOString();
  order.statusHistory.push({
    statusType: 'PAYMENT',
    from: order.paymentStatus,
    to: 'FAILED',
    timestamp: now,
    reason,
  });

  order.paymentStatus = 'FAILED';

  if (canTransitionFulfillment(order.fulfillmentStatus, 'FAILED')) {
    order.statusHistory.push({
      statusType: 'FULFILLMENT',
      from: order.fulfillmentStatus,
      to: 'FAILED',
      timestamp: now,
      reason: 'Fulfillment aborted due to failed payment',
    });
    order.fulfillmentStatus = 'FAILED';
  }

  order.updatedAt = now;
  persistStore();
  syncOrderToPostgres(order).catch(() => {});

  return { success: true, order };
}

/**
 * Atomically allocates game keys for a verified paid order.
 * Ensures strict concurrency protection, duplicate prevention, and sandbox isolation.
 */
export function allocateGameKeysForOrder(order: StoredOrder): {
  success: boolean;
  allocatedCount: number;
  error?: string;
} {
  const store = ensureInitialized();

  // RULE: Only PAID orders may allocate keys
  if (order.paymentStatus !== 'PAID') {
    return {
      success: false,
      allocatedCount: 0,
      error: 'Cannot allocate keys for unpaid orders.',
    };
  }

  if (order.fulfillmentStatus === 'COMPLETED') {
    // Already fulfilled idempotently
    return { success: true, allocatedCount: order.allocatedKeys.length };
  }

  const lockKey = `lock_${order.id}`;
  if (inventoryLocks.has(lockKey)) {
    return { success: false, allocatedCount: 0, error: 'Fulfillment lock active' };
  }
  inventoryLocks.add(lockKey);

  try {
    const now = new Date().toISOString();
    order.fulfillmentStatus = 'RESERVED';

    const allocatedList: AllocatedKeyRecord[] = [];

    for (const item of order.items) {
      const requiredQty = item.quantity || 1;

      for (let q = 0; q < requiredQty; q++) {
        if (order.isSandbox) {
          // SANDBOX / STAGING RULE: Use ONLY clearly labeled dummy keys
          const dummyKey = `VTX-SANDBOX-DEMO-${item.gameId.substring(0, 10).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          const encryptedDummy = encryptGameKey(dummyKey);
          const keyRecord: AllocatedKeyRecord = {
            keyId: `sandbox_key_${Date.now()}_${q}`,
            gameId: item.gameId,
            encryptedKey: encryptedDummy,
            isSandboxKey: true,
          };
          allocatedList.push(keyRecord);
        } else {
          // PRODUCTION RULE: Atomically acquire an AVAILABLE production key from inventory
          const availableKey = Object.values(store.inventory).find(
            (k) => k.gameId === item.gameId && k.status === 'AVAILABLE' && !k.isSandboxKey
          );

          if (!availableKey) {
            // OUT OF STOCK: Set fulfillment to FAILED, do NOT fabricate keys
            order.fulfillmentStatus = 'FAILED';
            order.statusHistory.push({
              statusType: 'FULFILLMENT',
              from: 'RESERVED',
              to: 'FAILED',
              timestamp: now,
              reason: `Inventory out of stock for product: ${item.gameId}`,
            });
            persistStore();
            return {
              success: false,
              allocatedCount: 0,
              error: `Insufficient stock for product ${item.gameId}`,
            };
          }

          // Atomic transition to DELIVERED
          availableKey.status = 'DELIVERED';
          availableKey.orderId = order.id;
          availableKey.allocatedToEmail = order.customerEmail;
          availableKey.deliveredAt = now;
          availableKey.lockVersion += 1;

          allocatedList.push({
            keyId: availableKey.id,
            gameId: availableKey.gameId,
            encryptedKey: availableKey.encryptedKey,
            isSandboxKey: false,
          });
        }
      }
    }

    order.allocatedKeys = allocatedList;
    order.fulfillmentStatus = 'COMPLETED';
    order.fulfilledAt = now;
    order.updatedAt = now;

    order.statusHistory.push({
      statusType: 'FULFILLMENT',
      from: 'RESERVED',
      to: 'COMPLETED',
      timestamp: now,
      reason: `Allocated ${allocatedList.length} game keys to buyer vault`,
    });

    persistStore();
    syncOrderToPostgres(order).catch(() => {});
    for (const alloc of allocatedList) {
      if (store.inventory[alloc.keyId]) {
        syncInventoryKeyToPostgres(store.inventory[alloc.keyId]).catch(() => {});
      }
    }
    return { success: true, allocatedCount: allocatedList.length };
  } finally {
    inventoryLocks.delete(lockKey);
  }
}

/**
 * Decrypts and reveals activation keys ONLY if payment is verified and ownership is authenticated.
 */
export function revealOrderActivationKeys(
  orderId: string,
  credentials: {
    userId?: string | null;
    email?: string | null;
    orderAccessToken?: string | null;
  }
): {
  success: boolean;
  keys?: Array<{ gameId: string; plainTextKey: string }>;
  isSandbox?: boolean;
  notice?: string;
  error?: string;
  statusCode: number;
} {
  const store = ensureInitialized();
  const order = store.orders[orderId];

  if (!order) {
    return { success: false, error: 'Order not found.', statusCode: 404 };
  }

  // 1. Strict Ownership Check
  if (!verifyOrderOwnership(order, credentials)) {
    return {
      success: false,
      error: 'Forbidden: You do not have permission to access this order.',
      statusCode: 403,
    };
  }

  // 2. Strict Payment & Fulfillment Verification
  if (!canRevealActivationKey(order.paymentStatus, order.fulfillmentStatus)) {
    if (order.paymentStatus !== 'PAID') {
      return {
        success: false,
        error: 'Awaiting Payment Confirmation: Keys cannot be revealed before verified payment.',
        statusCode: 400,
      };
    }
    return {
      success: false,
      error: 'Fulfillment Incomplete: Keys are being prepared.',
      statusCode: 400,
    };
  }

  // 3. Decrypt Keys
  try {
    const now = new Date().toISOString();
    const decryptedKeys = order.allocatedKeys.map((record) => {
      record.revealedAt = now;
      const plainText = decryptGameKey(record.encryptedKey);
      return {
        gameId: record.gameId,
        plainTextKey: plainText,
      };
    });

    // If first time delivered/revealed, record timeline event
    const alreadyLoggedDelivery = order.statusHistory.some((h) => h.to === 'DELIVERED');
    if (!alreadyLoggedDelivery) {
      order.statusHistory.push({
        statusType: 'FULFILLMENT',
        from: 'COMPLETED',
        to: 'DELIVERED',
        timestamp: now,
        reason: 'Digital product delivered and revealed in customer vault',
      });
    }

    order.updatedAt = now;
    persistStore();

    return {
      success: true,
      keys: decryptedKeys,
      isSandbox: order.isSandbox,
      notice: order.isSandbox ? 'TEST ORDER — NO REAL PAYMENT' : undefined,
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Failed to decrypt keys from secure vault.',
      statusCode: 500,
    };
  }
}

/**
 * Reconciles refund or chargeback by revoking store access to digital keys.
 */
export function reconcileOrderRefund(orderId: string, reason: string): boolean {
  const store = ensureInitialized();
  const order = store.orders[orderId];
  if (!order) return false;

  const now = new Date().toISOString();
  order.paymentStatus = 'REFUNDED';
  order.fulfillmentStatus = 'REVOKED';
  order.revokedAt = now;
  order.refundReason = reason;
  order.updatedAt = now;

  // Revoke inventory records
  for (const record of order.allocatedKeys) {
    if (store.inventory[record.keyId]) {
      store.inventory[record.keyId].status = 'REVOKED';
      store.inventory[record.keyId].revokedAt = now;
    }
  }

  order.statusHistory.push({
    statusType: 'PAYMENT',
    from: 'PAID',
    to: 'REFUNDED',
    timestamp: now,
    reason,
  });

  order.statusHistory.push({
    statusType: 'FULFILLMENT',
    from: 'COMPLETED',
    to: 'REVOKED',
    timestamp: now,
    reason: 'Key revoked in store records due to refund',
  });

  persistStore();
  syncOrderToPostgres(order).catch(() => {});
  for (const record of order.allocatedKeys) {
    if (store.inventory[record.keyId]) {
      syncInventoryKeyToPostgres(store.inventory[record.keyId]).catch(() => {});
    }
  }
  return true;
}

/**
 * Adds stock keys to the production vault (Admin utility).
 */
export function addInventoryKeys(gameId: string, plainTextKeys: string[], isSandboxKey = false) {
  const store = ensureInitialized();
  const addedKeys: StoredInventoryKey[] = [];
  for (const plainKey of plainTextKeys) {
    const keyId = `key_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newKey: StoredInventoryKey = {
      id: keyId,
      gameId,
      encryptedKey: encryptGameKey(plainKey),
      keyHash: hashGameKey(plainKey),
      status: 'AVAILABLE',
      isSandboxKey,
      orderId: null,
      allocatedToEmail: null,
      reservedAt: null,
      deliveredAt: null,
      revokedAt: null,
      lockVersion: 1,
    };
    store.inventory[keyId] = newKey;
    addedKeys.push(newKey);
  }
  persistStore();
  for (const k of addedKeys) {
    syncInventoryKeyToPostgres(k).catch(() => {});
  }
}

/**
 * Returns clean customer-safe order details (ZERO KEYS INCLUDED).
 */
export function sanitizeOrderForCustomer(order: StoredOrder) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    paymentProvider: order.paymentProvider,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    total: order.total,
    discountApplied: order.discountApplied || 0,
    isSandbox: order.isSandbox,
    items: order.items.map((i) => ({
      gameId: i.gameId,
      title: i.title,
      platform: i.platform,
      quantity: i.quantity,
      unitPriceUSD: i.unitPriceUSD,
      unitPriceIQD: i.unitPriceIQD,
    })),
    statusHistory: order.statusHistory || [],
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    fulfilledAt: order.fulfilledAt,
    revokedAt: order.revokedAt,
    refundReason: order.refundReason,
    allocatedKeysCount: order.allocatedKeys?.length || 0,
    hasKeysAllocated: order.allocatedKeys.length > 0,
    canReveal: canRevealActivationKey(order.paymentStatus, order.fulfillmentStatus),
    notice: order.isSandbox ? 'TEST ORDER — NO REAL PAYMENT' : undefined,
  };
}
