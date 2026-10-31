// VORTEX GAMING — Discord Official REST API Service Layer
// Handles two-way live support bridge between VORTEX GAMING and Discord Staff Channel
// Implements ticket thread creation, customer message forwarding, thread polling,
// and cryptographic privacy & data sanitization defenses.

import https from 'https';

export interface DiscordConfig {
  guildId: string | null;
  supportChannelId: string | null;
  botToken: string | null;
}

export interface DiscordStaffReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
}

// In-memory rate limiter: max 5 messages per 10 seconds per ticket
const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 10000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= limit) {
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

/**
 * Safely retrieve and sanitize Discord bot token and IDs from environment
 */
export function getDiscordConfig(): DiscordConfig {
  const clean = (val?: string) => {
    if (!val) return null;
    const trimmed = val.trim().replace(/^["']|["']$/g, '');
    if (trimmed === 'undefined' || trimmed === 'null' || trimmed.length === 0) return null;
    return trimmed;
  };

  return {
    guildId: clean(process.env.DISCORD_GUILD_ID),
    supportChannelId: clean(process.env.DISCORD_SUPPORT_CHANNEL_ID),
    botToken: clean(process.env.DISCORD_BOT_TOKEN),
  };
}

export function isDiscordSupportConfigured(): boolean {
  const config = getDiscordConfig();
  return Boolean(config.botToken && config.supportChannelId && config.guildId);
}

/**
 * Privacy & Security Sanitizer
 * Strips script tags, masks credit card numbers (PANs), and masks game keys.
 */
export function sanitizeMessageForDiscord(content: string): string {
  if (!content) return '';

  let sanitized = content
    // Strip HTML/script tags
    .replace(/<[^>]*>/g, '')
    // Mask potential credit card / debit card numbers (13-19 digits)
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '••••-••••-••••-••••')
    // Mask digital game keys / license keys (e.g. 5x5 alphanumeric format)
    .replace(/\b([A-Z0-9]{4,5}-[A-Z0-9]{4,5}-[A-Z0-9]{4,5}(?:-[A-Z0-9]{4,5})?)\b/gi, 'XXXX-XXXX-XXXX-KEY')
    // Trim whitespace
    .trim();

  // Enforce Discord 2000 character limit
  if (sanitized.length > 1950) {
    sanitized = sanitized.substring(0, 1950) + '… [message truncated]';
  }

  return sanitized;
}

/**
 * Make an authenticated HTTPS request to Discord REST API v10
 */
export function discordApiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<{ status: number; data: T }> {
  const config = getDiscordConfig();
  if (!config.botToken) {
    return Promise.reject(new Error('DISCORD_BOT_TOKEN is not configured'));
  }

  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers: Record<string, string> = {
      'Authorization': `Bot ${config.botToken}`,
      'User-Agent': 'VORTEX-Gaming-Support-Bot (https://vortexgaming.gg, 1.0.0)',
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
        timeout: 10000,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          let parsed: any = null;
          try {
            if (responseData) {
              parsed = JSON.parse(responseData);
            }
          } catch {
            parsed = responseData;
          }
          resolve({ status: res.statusCode || 200, data: parsed as T });
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Discord API request timed out'));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

/**
 * Create a dedicated Support Thread in Discord for a new ticket
 */
export async function createDiscordSupportThread(ticket: {
  id: string;
  ticketNumber?: string;
  subject: string;
  userName: string;
  userEmail?: string;
  category?: string;
  orderId?: string;
  priority?: string;
  initialMessage?: string;
}): Promise<{ threadId: string; messageId?: string } | null> {
  const config = getDiscordConfig();
  if (!config.botToken || !config.supportChannelId) {
    return null;
  }

  // Unit test mock mode guard
  if (config.botToken.endsWith('.test') || process.env.TEST_MOCK_DISCORD === 'true') {
    return {
      threadId: `th_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      messageId: `msg_mock_${Date.now()}`,
    };
  }

  try {
    const ticketRef = ticket.ticketNumber || ticket.id;
    const safeSubject = ticket.subject.replace(/[^a-zA-Z0-9 _-]/g, '').trim().substring(0, 45) || 'Customer Inquiry';
    const threadName = `🎫 ${ticketRef} — ${safeSubject}`;

    // 1. Create Public Thread in Support Channel
    const threadRes = await discordApiRequest(
      `/channels/${config.supportChannelId}/threads`,
      'POST',
      {
        name: threadName,
        auto_archive_duration: 1440, // 24 hours
        type: 11, // GUILD_PUBLIC_THREAD
      }
    );

    if (threadRes.status !== 201 && threadRes.status !== 200) {
      console.warn('Discord thread creation returned status:', threadRes.status, threadRes.data);
      return null;
    }

    const threadId = (threadRes.data as any)?.id;
    if (!threadId) return null;

    // 2. Post Initial Rich Embed into the Thread
    const sanitizedMsg = sanitizeMessageForDiscord(ticket.initialMessage || 'Customer initiated a live support session.');
    const maskedName = ticket.userName ? ticket.userName.replace(/<[^>]*>/g, '').trim() : 'Customer';

    const embed = {
      title: `🎫 VORTEX Support Ticket: ${ticketRef}`,
      description: sanitizedMsg,
      color: 0x00d4ff, // VORTEX Electric Cyan
      fields: [
        { name: 'Customer', value: `👤 ${maskedName}`, inline: true },
        { name: 'Category', value: `📁 ${ticket.category || 'General'}`, inline: true },
        { name: 'Priority', value: `⚡ ${ticket.priority || 'MEDIUM'}`, inline: true },
      ],
      footer: {
        text: 'VORTEX GAMING Live Support • Type a reply in this thread to respond directly to the customer on the website.',
      },
      timestamp: new Date().toISOString(),
    };

    if (ticket.orderId) {
      embed.fields.push({ name: 'Order ID', value: `📦 #${ticket.orderId}`, inline: true });
    }

    const msgRes = await discordApiRequest(`/channels/${threadId}/messages`, 'POST', {
      embeds: [embed],
    });

    const messageId = (msgRes.data as any)?.id;

    return { threadId, messageId };
  } catch (err: any) {
    console.error('Failed to create Discord support thread:', err?.message || err);
    return null;
  }
}

/**
 * Forward a customer message into the existing Discord thread
 */
export async function sendCustomerMessageToDiscordThread(
  threadId: string,
  senderName: string,
  content: string
): Promise<{ messageId?: string } | null> {
  const config = getDiscordConfig();
  if (!config.botToken || !threadId) return null;

  if (config.botToken.endsWith('.test') || process.env.TEST_MOCK_DISCORD === 'true') {
    return { messageId: `msg_mock_${Date.now()}` };
  }

  try {
    const cleanContent = sanitizeMessageForDiscord(content);
    if (!cleanContent) return null;

    const safeName = senderName.replace(/<[^>]*>/g, '').trim() || 'Customer';
    const payload = {
      content: `💬 **[Customer] ${safeName}:**\n${cleanContent}`,
    };

    const res = await discordApiRequest(`/channels/${threadId}/messages`, 'POST', payload);
    if (res.status === 200 || res.status === 201) {
      return { messageId: (res.data as any)?.id };
    }
    return null;
  } catch (err: any) {
    console.error('Failed to forward customer message to Discord:', err?.message || err);
    return null;
  }
}

/**
 * Fetch messages from Discord thread and extract support agent replies
 */
export async function fetchDiscordThreadReplies(
  threadId: string,
  knownMessageIds: Set<string> = new Set()
): Promise<DiscordStaffReply[]> {
  const config = getDiscordConfig();
  if (!config.botToken || !threadId) return [];

  try {
    const res = await discordApiRequest<any[]>(`/channels/${threadId}/messages?limit=25`, 'GET');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      return [];
    }

    const newReplies: DiscordStaffReply[] = [];

    // Discord returns messages newest first; reverse so they are chronological
    const messages = [...res.data].reverse();

    for (const msg of messages) {
      // Ignore messages created by our bot or any other bot
      if (msg.author?.bot) continue;

      // Ignore if already ingested
      if (knownMessageIds.has(msg.id)) continue;

      // Ignore command triggers (handled by worker/command parser)
      const text = (msg.content || '').trim();
      if (text.startsWith('!status') || text.startsWith('/status')) continue;

      const staffName = msg.member?.nick || msg.author?.global_name || msg.author?.username || 'VORTEX Staff';
      const avatarUrl = msg.author?.avatar
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
        : undefined;

      newReplies.push({
        id: msg.id,
        authorId: msg.author.id,
        authorName: staffName,
        authorAvatar: avatarUrl,
        content: text,
        timestamp: msg.timestamp || new Date().toISOString(),
        isStaff: true,
      });
    }

    return newReplies;
  } catch (err: any) {
    console.warn(`Failed to fetch Discord thread replies for ${threadId}:`, err?.message || err);
    return [];
  }
}

/**
 * Update Discord thread archived/lock status when ticket is resolved or closed
 */
export async function updateDiscordThreadArchived(threadId: string, archived: boolean): Promise<boolean> {
  const config = getDiscordConfig();
  if (!config.botToken || !threadId) return false;

  if (config.botToken.endsWith('.test') || process.env.TEST_MOCK_DISCORD === 'true') {
    return true;
  }

  try {
    const res = await discordApiRequest(`/channels/${threadId}`, 'PATCH', {
      archived,
      locked: archived,
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
