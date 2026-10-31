// VORTEX GAMING — Discord Order Notification System
// Formats and dispatches real-time, professional order embeds to the private #orders channel.
// Supports in-place message updates (editing original message upon status change),
// status-specific color coding, privacy sanitization, and exponential-backoff retries.

import https from 'https';
import { GAMES_CATALOG } from '../data/games.ts';
import type { StoredOrder } from '../orders/order-store.ts';

export type OrderEventType =
  | 'CREATED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'DELIVERED';

export interface DiscordOrdersConfig {
  guildId: string | null;
  ordersChannelId: string | null;
  botToken: string | null;
}

export function getDiscordOrdersConfig(): DiscordOrdersConfig {
  const clean = (val?: string) => {
    if (!val) return null;
    const trimmed = val.trim().replace(/^["']|["']$/g, '');
    if (trimmed === 'undefined' || trimmed === 'null' || trimmed.length === 0) return null;
    return trimmed;
  };

  return {
    guildId: clean(process.env.DISCORD_GUILD_ID),
    ordersChannelId: clean(process.env.DISCORD_ORDERS_CHANNEL_ID),
    botToken: clean(process.env.DISCORD_BOT_TOKEN),
  };
}

export function isDiscordOrdersConfigured(): boolean {
  const config = getDiscordOrdersConfig();
  return Boolean(config.botToken && config.ordersChannelId);
}

/**
 * Maps payment & fulfillment status to official Discord embed hex colors:
 * - Green (0x22c55e): Verified PAID / Delivered
 * - Yellow (0xeab308): PENDING / Awaiting Payment
 * - Blue (0x3b82f6): PROCESSING
 * - Red (0xef4444): FAILED
 * - Gray (0x6b7280): CANCELED
 * - Orange (0xf97316): REFUNDED
 */
export function getOrderEventColor(event: OrderEventType): number {
  switch (event) {
    case 'PAID':
    case 'DELIVERED':
      return 0x22c55e; // Green
    case 'CREATED':
      return 0xeab308; // Yellow
    case 'PROCESSING':
      return 0x3b82f6; // Blue
    case 'FAILED':
      return 0xef4444; // Red
    case 'CANCELLED':
      return 0x6b7280; // Gray
    case 'REFUNDED':
      return 0xf97316; // Orange
    default:
      return 0xeab308;
  }
}

/**
 * Returns formatted status title and badge text
 */
export function getOrderEventHeader(event: OrderEventType): { title: string; statusBadge: string; description: string } {
  switch (event) {
    case 'CREATED':
      return {
        title: '🛒 New VORTEX GAMING Order',
        statusBadge: '🟡 **PENDING (Awaiting Payment)**',
        description: 'A new digital order has been submitted through checkout and awaits payment verification.',
      };
    case 'PROCESSING':
      return {
        title: '🛒 VORTEX GAMING Order — PROCESSING',
        statusBadge: '🔵 **PROCESSING (Gateway Verification)**',
        description: 'Payment transaction is undergoing security validation and 3D Secure verification.',
      };
    case 'PAID':
      return {
        title: '🛒 VORTEX GAMING Order — VERIFIED PAID',
        statusBadge: '🟢 **VERIFIED PAID**',
        description: 'Payment authoritatively verified by financial gateway. Digital inventory allocated.',
      };
    case 'DELIVERED':
      return {
        title: '🛒 VORTEX GAMING Order — DIGITAL FULFILLMENT COMPLETED',
        statusBadge: '🟢 **VERIFIED PAID • DELIVERED**',
        description: 'Customer accessed and revealed digital activation items in their personal key vault.',
      };
    case 'FAILED':
      return {
        title: '🛒 VORTEX GAMING Order — PAYMENT FAILED',
        statusBadge: '🔴 **FAILED (Transaction Declined)**',
        description: 'Payment authorization failed, was declined by provider, or timed out. Inventory preserved.',
      };
    case 'CANCELLED':
      return {
        title: '🛒 VORTEX GAMING Order — CANCELED',
        statusBadge: '⚪ **CANCELED**',
        description: 'Order was canceled prior to completion. No charges were captured.',
      };
    case 'REFUNDED':
      return {
        title: '🛒 VORTEX GAMING Order — REFUNDED',
        statusBadge: '🟠 **REFUNDED (Access Revoked)**',
        description: 'Transaction was refunded. Digital activation licenses have been revoked in store records.',
      };
  }
}

/**
 * Clean human-readable payment provider label
 */
export function formatPaymentProvider(provider: string, isSandbox = true): string {
  const p = (provider || '').toLowerCase();
  const sandboxTag = isSandbox ? ' (Sandbox)' : '';
  if (p === 'fib') return `FIB Bank QR${sandboxTag}`;
  if (p === 'fastpay') return `FastPay QR${sandboxTag}`;
  if (p === 'qi_card') return `Qi Card (Iraqi Local)${sandboxTag}`;
  if (p === 'iraqi_cards') return `Iraqi Local Cards (Switch/Qi/Neo)${sandboxTag}`;
  if (p === 'international_cards' || p === 'stripe') return `International Visa/Mastercard${sandboxTag}`;
  if (p === 'vortex_wallet') return `VORTEX Digital Wallet`;
  return `${provider}${sandboxTag}`;
}

/**
 * Builds the comprehensive Discord embed matching reference specification:
 * - 📦 Product Name
 * - 🎮 Product Type
 * - ⏱️ Duration (if applicable)
 * - 👤 Account Type (if applicable)
 * - 🔢 Quantity
 * - 💰 Total Price
 * - 💱 Currency
 * - 🔗 Platform
 * - 📋 Order ID
 * - 👤 Customer Display Name
 * - 💳 Payment Method
 * - 📊 Payment Status
 * - 📅 Order Date and Time
 */
export function buildDiscordOrderEmbed(order: StoredOrder, event: OrderEventType): any {
  const { title, statusBadge, description } = getOrderEventHeader(event);
  const color = getOrderEventColor(event);

  // Extract catalog item details for first item or aggregate
  const firstItem = order.items[0];
  const catalogItem = firstItem ? GAMES_CATALOG.find((g) => g.id === firstItem.gameId || g.slug === firstItem.gameId) : null;

  // Product Name
  const productName = order.items.length === 1
    ? (firstItem?.title || catalogItem?.title || 'Digital Product')
    : order.items.map((i) => `${i.quantity}x ${i.title}`).join('\n');

  // Product Type
  let productType = 'Digital Game Key';
  if (catalogItem?.productType === 'GAME_ACCOUNT' || catalogItem?.category === 'game-accounts') {
    productType = 'Full Access Game Account';
  } else if (catalogItem?.productType === 'SUBSCRIPTION' || catalogItem?.category === 'subscriptions') {
    productType = 'Digital Subscription Pass';
  } else if (catalogItem?.productType === 'GIFT_CARD' || catalogItem?.category === 'gift-cards') {
    productType = 'Store Gift Card / Wallet Code';
  }

  // Platform
  const platform = firstItem?.platform || catalogItem?.platformName || 'PC';

  // Total Quantity
  const totalQty = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Price formatting
  const formattedTotal = order.currency === 'IQD'
    ? `${(order.total || 0).toLocaleString()} IQD`
    : `$${(order.total || 0).toFixed(2)}`;

  // Customer Display Name (Strict Privacy: never expose full email or passwords)
  const customerDisplayName = order.customerName && order.customerName.trim().length > 0
    ? order.customerName.trim()
    : (order.customerEmail ? order.customerEmail.split('@')[0] : 'Vortex Gamer');

  // Order Timestamp (Discord relative and full formats)
  const createdAtMs = new Date(order.createdAt).getTime() || Date.now();
  const unixSec = Math.floor(createdAtMs / 1000);
  const discordTime = `<t:${unixSec}:F> (<t:${unixSec}:R>)`;

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: '📦 Product Name', value: productName.substring(0, 250), inline: false },
    { name: '🎮 Product Type', value: productType, inline: true },
    { name: '🔗 Platform', value: platform, inline: true },
    { name: '🔢 Quantity', value: `${totalQty} item(s)`, inline: true },
  ];

  // Optional Duration (for subscriptions / passes)
  const isSubscription = catalogItem?.productType === 'SUBSCRIPTION' || catalogItem?.category === 'subscriptions';
  if (isSubscription) {
    const durationMatch = (catalogItem?.title || '').match(/\b(\d+\s*(?:Month|Months|Year|Years|Day|Days))\b/i);
    const duration = durationMatch ? durationMatch[1] : '1 Month';
    fields.push({ name: '⏱️ Duration', value: duration, inline: true });
  }

  // Optional Account Type (for Game Accounts)
  const isAccount = catalogItem?.productType === 'GAME_ACCOUNT' || catalogItem?.category === 'game-accounts';
  if (isAccount) {
    fields.push({ name: '👤 Account Type', value: 'Full Access (Fresh Credentials)', inline: true });
  }

  fields.push(
    { name: '💰 Total Price', value: `**${formattedTotal}**`, inline: true },
    { name: '💱 Currency', value: order.currency || 'USD', inline: true },
    { name: '📋 Order ID', value: `\`#${order.orderNumber || order.id}\``, inline: true },
    { name: '👤 Customer Display Name', value: `👤 ${customerDisplayName}`, inline: true },
    { name: '💳 Payment Method', value: formatPaymentProvider(order.paymentProvider, order.isSandbox), inline: true },
    { name: '📊 Payment Status', value: statusBadge, inline: false },
    { name: '📅 Order Date and Time', value: discordTime, inline: false }
  );

  return {
    title,
    description,
    color,
    fields,
    footer: {
      text: 'VORTEX GAMING Automated Order Dispatch • Server ID: 1546561132456579222',
      icon_url: 'https://vortexgaming.gg/icon.svg',
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute an authenticated HTTP request to Discord REST API with retries
 */
function discordApiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body: any,
  botToken: string,
  retries = 2
): Promise<{ status: number; data: T }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers: Record<string, string> = {
      'Authorization': `Bot ${botToken}`,
      'User-Agent': 'VORTEX-Gaming-Orders-Bot (https://vortexgaming.gg, 1.0.0)',
    };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = https.request(
      {
        hostname: 'discord.com',
        port: 443,
        path: `/api/v10${endpoint}`,
        method,
        headers,
        timeout: 8000,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            if (responseData) parsed = JSON.parse(responseData);
          } catch {
            parsed = responseData;
          }

          // Handle Discord rate limit (429)
          if (res.statusCode === 429 && retries > 0) {
            const retryAfter = (parsed?.retry_after || 1) * 1000;
            setTimeout(() => {
              discordApiRequest(endpoint, method, body, botToken, retries - 1)
                .then(resolve)
                .catch(reject);
            }, Math.min(retryAfter, 3000));
            return;
          }

          resolve({ status: res.statusCode || 200, data: parsed as T });
        });
      }
    );

    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          discordApiRequest(endpoint, method, body, botToken, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 500);
      } else {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        setTimeout(() => {
          discordApiRequest(endpoint, method, body, botToken, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 500);
      } else {
        reject(new Error('Discord API order notification timed out'));
      }
    });

    if (payload) req.write(payload);
    req.end();
  });
}

// In-memory idempotency deduplication cache to prevent webhook replay duplicate messages
const notificationDeduplicationCache = new Set<string>();

/**
 * Dispatches or updates the Discord order notification embed.
 * - If order already has a discordMessageId: Edits existing Discord message in-place.
 * - Otherwise: Posts a new message and returns discordMessageId.
 * - Guaranteed non-blocking and fail-safe.
 */
export async function sendDiscordOrderNotification(
  order: StoredOrder,
  event: OrderEventType
): Promise<{ success: boolean; messageId?: string; edited?: boolean; reason?: string }> {
  const config = getDiscordOrdersConfig();
  if (!config.botToken || !config.ordersChannelId) {
    return { success: false, reason: 'Discord orders notification is not configured in environment.' };
  }

  // Idempotency check: prevent duplicate notifications for same order and event
  const deduplicationKey = `${order.id}_${event}`;
  if (notificationDeduplicationCache.has(deduplicationKey)) {
    return { success: true, messageId: order.discordMessageId, edited: true, reason: 'Duplicate event skipped by idempotency.' };
  }

  // Unit testing / test runner mock mode guard
  const isTestRunner =
    process.env.NODE_ENV === 'test' ||
    process.env.npm_lifecycle_event === 'test' ||
    Boolean(process.env.TEST_MOCK_DISCORD);
  const allowLive = process.env.DISCORD_LIVE_DISPATCH === 'true';

  if ((isTestRunner && !allowLive) || config.botToken.endsWith('.test')) {
    notificationDeduplicationCache.add(deduplicationKey);
    const mockId = order.discordMessageId || `mock_msg_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    order.discordMessageId = mockId;
    order.discordChannelId = config.ordersChannelId;
    return { success: true, messageId: mockId, edited: Boolean(order.discordMessageId) };
  }

  try {
    const embed = buildDiscordOrderEmbed(order, event);

    // 1. Try editing existing Discord message if already posted
    if (order.discordMessageId) {
      try {
        const patchRes = await discordApiRequest(
          `/channels/${config.ordersChannelId}/messages/${order.discordMessageId}`,
          'PATCH',
          { embeds: [embed] },
          config.botToken
        );

        if (patchRes.status === 200) {
          notificationDeduplicationCache.add(deduplicationKey);
          return { success: true, messageId: order.discordMessageId, edited: true };
        }
      } catch (err: any) {
        console.warn(`[Discord Orders] Failed to edit message ${order.discordMessageId}, sending fallback:`, err?.message || err);
      }
    }

    // 2. Post new message to #orders channel
    const postRes = await discordApiRequest<{ id?: string }>(
      `/channels/${config.ordersChannelId}/messages`,
      'POST',
      { embeds: [embed] },
      config.botToken
    );

    if (postRes.status === 200 || postRes.status === 201) {
      const newMessageId = postRes.data?.id;
      if (newMessageId) {
        order.discordMessageId = newMessageId;
        order.discordChannelId = config.ordersChannelId;
        notificationDeduplicationCache.add(deduplicationKey);
        return { success: true, messageId: newMessageId, edited: false };
      }
    }

    console.warn('[Discord Orders] Discord returned non-success status:', postRes.status, postRes.data);
    return { success: false, reason: `Discord API returned status ${postRes.status}` };
  } catch (err: any) {
    console.warn('[Discord Orders] Non-fatal notification error:', err?.message || err);
    return { success: false, reason: err?.message || 'Network exception' };
  }
}
