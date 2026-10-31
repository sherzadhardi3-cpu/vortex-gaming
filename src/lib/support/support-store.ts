// VORTEX GAMING — Customer Support Ticket & Chat Persistence Store
// Stores support tickets and messages persistently in PostgreSQL with in-memory cache,
// customer-isolation authorization, and two-way Discord Live Support synchronization.

import fs from 'fs';
import path from 'path';
import { getPrismaClient } from '../prisma.ts';
import {
  isDiscordSupportConfigured,
  createDiscordSupportThread,
  sendCustomerMessageToDiscordThread,
  fetchDiscordThreadReplies,
  updateDiscordThreadArchived,
  sanitizeMessageForDiscord,
  getDiscordConfig,
} from '../discord/discord-service.ts';

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: 'CUSTOMER' | 'SUPPORT_AGENT' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  discordMessageId?: string;
}

export type TicketStatusType = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: TicketStatusType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  orderId?: string;
  assignedTo?: string;
  discordThreadId?: string;
  discordChannelId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'support-tickets.json');

// In-memory cache synchronized with PostgreSQL and disk
let ticketsCache: Record<string, SupportTicket> | null = null;

const DEFAULT_TICKETS: Record<string, SupportTicket> = {
  'tkt_welcome_demo': {
    id: 'tkt_welcome_demo',
    ticketNumber: 'TKT-0001',
    userId: 'customer_demo_001',
    userEmail: 'customer@vortexgaming.com',
    userName: 'Alex Mercer',
    subject: 'Welcome to VORTEX Gaming Support',
    status: 'OPEN',
    priority: 'MEDIUM',
    category: 'GENERAL',
    messages: [
      {
        id: 'msg_welcome_1',
        ticketId: 'tkt_welcome_demo',
        sender: 'SUPPORT_AGENT',
        senderName: 'VORTEX Sentinel Agent',
        senderAvatar: '/icon.svg',
        message: 'Hello and welcome to VORTEX Gaming Support! If you need assistance with digital key redemption, order fulfillment, or account settings, our team is standing by.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
};

function ensureInitialized(): Record<string, SupportTicket> {
  if (ticketsCache) return ticketsCache;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8').trim();
      if (content) {
        ticketsCache = JSON.parse(content);
      } else {
        ticketsCache = JSON.parse(JSON.stringify(DEFAULT_TICKETS));
      }
    } else {
      ticketsCache = JSON.parse(JSON.stringify(DEFAULT_TICKETS));
      persistTickets();
    }
  } catch {
    ticketsCache = JSON.parse(JSON.stringify(DEFAULT_TICKETS));
  }

  return ticketsCache!;
}

function persistTickets() {
  if (!ticketsCache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(ticketsCache, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch {
    // Disk persistence fallback
  }
}

/**
 * Synchronize ticket directly to persistent PostgreSQL database.
 */
export async function syncTicketToPostgres(ticket: SupportTicket): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    const userEmail = ticket.userEmail.toLowerCase().trim();
    const user = await client.user.upsert({
      where: { email: userEmail },
      create: {
        id: ticket.userId || `usr_sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: userEmail,
        firstName: ticket.userName.split(' ')[0] || 'Customer',
        lastName: ticket.userName.split(' ').slice(1).join(' ') || 'Support',
        displayName: ticket.userName,
        role: 'CUSTOMER',
      },
      update: {
        displayName: ticket.userName || undefined,
      },
    });

    const statusMap: Record<string, any> = {
      OPEN: 'OPEN',
      IN_PROGRESS: 'IN_PROGRESS',
      AWAITING_CUSTOMER: 'AWAITING_CUSTOMER',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED',
    };

    const priorityMap: Record<string, any> = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
    };

    await client.supportTicket.upsert({
      where: { ticketNumber: ticket.ticketNumber || ticket.id },
      create: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber || ticket.id,
        userId: user.id,
        subject: ticket.subject,
        status: statusMap[ticket.status] || 'OPEN',
        priority: priorityMap[ticket.priority] || 'MEDIUM',
        category: ticket.category,
        orderId: ticket.orderId || null,
        assignedTo: ticket.assignedTo || null,
        discordThreadId: ticket.discordThreadId || null,
        discordChannelId: ticket.discordChannelId || null,
      },
      update: {
        status: statusMap[ticket.status] || 'OPEN',
        priority: priorityMap[ticket.priority] || 'MEDIUM',
        orderId: ticket.orderId || undefined,
        assignedTo: ticket.assignedTo || undefined,
        discordThreadId: ticket.discordThreadId || undefined,
        discordChannelId: ticket.discordChannelId || undefined,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    // Gracefully handle PostgreSQL offline during local tests
  }
}

/**
 * Synchronize support ticket message to persistent PostgreSQL database.
 */
export async function syncMessageToPostgres(message: SupportMessage, ticket: SupportTicket): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    const userEmail = ticket.userEmail.toLowerCase().trim();
    const user = await client.user.upsert({
      where: { email: userEmail },
      create: {
        id: ticket.userId || `usr_sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: userEmail,
        firstName: ticket.userName.split(' ')[0] || 'Customer',
        lastName: ticket.userName.split(' ').slice(1).join(' ') || 'Support',
        displayName: ticket.userName,
        role: 'CUSTOMER',
      },
      update: {},
    });

    await client.ticketMessage.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        ticketId: ticket.id,
        userId: user.id,
        content: message.message,
        isStaff: message.sender === 'SUPPORT_AGENT',
        senderName: message.senderName || null,
        discordMessageId: message.discordMessageId || null,
      },
      update: {
        content: message.message,
        senderName: message.senderName || undefined,
        discordMessageId: message.discordMessageId || undefined,
      },
    });
  } catch (err) {
    // Gracefully handle PostgreSQL offline during local tests
  }
}

/**
 * Hydrate tickets from PostgreSQL database if available
 */
async function hydrateFromPostgresIfAvailable(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = getPrismaClient();
    if (!client) return;

    const dbTickets = await client.supportTicket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: true,
      },
      take: 100,
    });

    const store = ensureInitialized();
    for (const t of dbTickets) {
      const msgs: SupportMessage[] = t.messages.map((m) => ({
        id: m.id,
        ticketId: t.id,
        sender: m.isStaff ? 'SUPPORT_AGENT' : 'CUSTOMER',
        senderName: m.senderName || (m.isStaff ? 'VORTEX Staff' : t.user.displayName || 'Customer'),
        message: m.content,
        timestamp: m.createdAt.toISOString(),
        discordMessageId: m.discordMessageId || undefined,
      }));

      store[t.id] = {
        id: t.id,
        ticketNumber: t.ticketNumber,
        userId: t.userId,
        userEmail: t.user.email,
        userName: t.user.displayName || `${t.user.firstName} ${t.user.lastName}`.trim(),
        subject: t.subject,
        status: t.status as TicketStatusType,
        priority: t.priority as any,
        category: t.category || 'GENERAL',
        orderId: t.orderId || undefined,
        assignedTo: t.assignedTo || undefined,
        discordThreadId: t.discordThreadId || undefined,
        discordChannelId: t.discordChannelId || undefined,
        messages: msgs,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      };
    }
  } catch {
    // Fail safe to in-memory/disk store
  }
}

/**
 * Get tickets accessible to a specific user (Enforces strict customer isolation)
 */
export async function getTicketsForUser({
  userId,
  userEmail,
  isAdmin = false,
}: {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}): Promise<SupportTicket[]> {
  await hydrateFromPostgresIfAvailable();
  const store = ensureInitialized();
  const allTickets = Object.values(store);

  // Admins can see all tickets
  if (isAdmin) {
    return allTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Customers can strictly see only tickets matching their userId or userEmail
  const normalizedEmail = userEmail?.toLowerCase().trim();
  return allTickets
    .filter((t) => {
      if (userId && t.userId === userId) return true;
      if (normalizedEmail && t.userEmail.toLowerCase().trim() === normalizedEmail) return true;
      return false;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get a single ticket by ID with customer isolation check
 */
export async function getTicketById({
  ticketId,
  requestingUserId,
  requestingEmail,
  isAdmin = false,
}: {
  ticketId: string;
  requestingUserId?: string;
  requestingEmail?: string;
  isAdmin?: boolean;
}): Promise<SupportTicket | null> {
  const store = ensureInitialized();
  const ticket = store[ticketId];
  if (!ticket) return null;

  if (!isAdmin) {
    const isOwner =
      (requestingUserId && ticket.userId === requestingUserId) ||
      (requestingEmail && ticket.userEmail.toLowerCase().trim() === requestingEmail.toLowerCase().trim());
    if (!isOwner) {
      throw new Error('Unauthorized to access this ticket');
    }
  }

  return ticket;
}

/**
 * Find ticket associated with a Discord thread ID
 */
export function getTicketByDiscordThreadId(threadId: string): SupportTicket | null {
  const store = ensureInitialized();
  for (const ticket of Object.values(store)) {
    if (ticket.discordThreadId === threadId) {
      return ticket;
    }
  }
  return null;
}

/**
 * Create a new ticket and bridge to Discord thread
 */
export async function createTicket({
  userId,
  userEmail,
  userName,
  subject,
  category = 'GENERAL',
  orderId,
  initialMessage,
  message,
}: {
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  category?: string;
  orderId?: string;
  initialMessage?: string;
  message?: string;
}): Promise<SupportTicket> {
  const store = ensureInitialized();
  const ticketRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
  const ticketNumber = `TKT-${Date.now().toString().slice(-4)}-${ticketRandom}`;
  const ticketId = `tkt_${Date.now()}_${ticketRandom.toLowerCase()}`;
  const now = new Date().toISOString();
  const rawMessage = (initialMessage || message || '').trim();

  const newTicket: SupportTicket = {
    id: ticketId,
    ticketNumber,
    userId,
    userEmail: userEmail.toLowerCase().trim(),
    userName,
    subject: subject.trim(),
    status: 'OPEN',
    priority: 'MEDIUM',
    category,
    orderId: orderId?.trim() || undefined,
    messages: [
      {
        id: `msg_${Date.now()}_1`,
        ticketId,
        sender: 'CUSTOMER',
        senderName: userName,
        message: rawMessage,
        timestamp: now,
      },
      // Automated instant acknowledgment
      {
        id: `msg_${Date.now()}_2`,
        ticketId,
        sender: 'SUPPORT_AGENT',
        senderName: 'VORTEX Sentinel Bot',
        senderAvatar: '/icon.svg',
        message: 'Thank you for reaching out to VORTEX Gaming Support! Your inquiry has been dispatched to our on-duty support team in Discord. We will reply directly in this chat.',
        timestamp: new Date(Date.now() + 500).toISOString(),
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Synchronize to Discord Support Channel if configured
  if (isDiscordSupportConfigured()) {
    try {
      const threadRes = await createDiscordSupportThread({
        id: newTicket.id,
        ticketNumber: newTicket.ticketNumber,
        subject: newTicket.subject,
        userName: newTicket.userName,
        userEmail: newTicket.userEmail,
        category: newTicket.category,
        orderId: newTicket.orderId,
        priority: newTicket.priority,
        initialMessage: rawMessage,
      });

      if (threadRes?.threadId) {
        newTicket.discordThreadId = threadRes.threadId;
        const config = getDiscordConfig();
        newTicket.discordChannelId = config.supportChannelId || undefined;
      }
    } catch (err: any) {
      console.warn('Discord support bridge notice:', err?.message || err);
    }
  }

  store[ticketId] = newTicket;
  persistTickets();
  syncTicketToPostgres(newTicket).catch(() => {});
  for (const msg of newTicket.messages) {
    syncMessageToPostgres(msg, newTicket).catch(() => {});
  }
  return newTicket;
}

/**
 * Update support ticket status with customer isolation check
 */
export async function updateTicketStatus({
  ticketId,
  status,
  requestingUserId,
  requestingEmail,
  isAdmin = false,
}: {
  ticketId: string;
  status: TicketStatusType;
  requestingUserId?: string;
  requestingEmail?: string;
  isAdmin?: boolean;
}): Promise<SupportTicket> {
  const store = ensureInitialized();
  const ticket = store[ticketId];

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Security check: non-admin can only close/modify their own ticket
  if (!isAdmin) {
    const isOwner =
      (requestingUserId && ticket.userId === requestingUserId) ||
      (requestingEmail && ticket.userEmail.toLowerCase().trim() === requestingEmail.toLowerCase().trim());
    if (!isOwner) {
      throw new Error('Unauthorized to modify this ticket');
    }
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  // If closed or resolved, archive discord thread
  if (ticket.discordThreadId && (status === 'CLOSED' || status === 'RESOLVED')) {
    updateDiscordThreadArchived(ticket.discordThreadId, true).catch(() => {});
  } else if (ticket.discordThreadId && status === 'OPEN') {
    updateDiscordThreadArchived(ticket.discordThreadId, false).catch(() => {});
  }

  persistTickets();
  syncTicketToPostgres(ticket).catch(() => {});
  return ticket;
}

/**
 * Add a message to an existing ticket with customer isolation verification
 * and bidirectional Discord forwarding
 */
export async function addMessageToTicket({
  ticketId,
  sender,
  senderName,
  senderAvatar,
  message,
  requestingUserId,
  requestingEmail,
  isAdmin = false,
  discordMessageId,
}: {
  ticketId: string;
  sender: 'CUSTOMER' | 'SUPPORT_AGENT' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  message: string;
  requestingUserId?: string;
  requestingEmail?: string;
  isAdmin?: boolean;
  discordMessageId?: string;
}): Promise<SupportMessage> {
  const store = ensureInitialized();
  const ticket = store[ticketId];

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Security check: non-admin can only post to their own ticket
  if (!isAdmin && sender === 'CUSTOMER') {
    const isOwner =
      (requestingUserId && ticket.userId === requestingUserId) ||
      (requestingEmail && ticket.userEmail.toLowerCase().trim() === requestingEmail.toLowerCase().trim());
    if (!isOwner) {
      throw new Error('Unauthorized to message this ticket');
    }
  }

  // Prevent posting to closed tickets unless reopened
  if (ticket.status === 'CLOSED' && sender === 'CUSTOMER') {
    throw new Error('Ticket is closed. Please reopen the ticket to send new messages.');
  }

  // Deduplication check for Discord messages
  if (discordMessageId) {
    const duplicate = ticket.messages.find((m) => m.discordMessageId === discordMessageId);
    if (duplicate) {
      return duplicate;
    }
  }

  const now = new Date().toISOString();
  const newMessage: SupportMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ticketId,
    sender,
    senderName,
    senderAvatar,
    message: message.trim(),
    timestamp: now,
    discordMessageId,
  };

  ticket.messages.push(newMessage);
  ticket.updatedAt = now;

  if (sender === 'CUSTOMER') {
    ticket.status = 'OPEN';
    // Forward message to Discord Thread
    if (ticket.discordThreadId && isDiscordSupportConfigured()) {
      sendCustomerMessageToDiscordThread(
        ticket.discordThreadId,
        senderName,
        message
      ).catch(() => {});
    }
  } else if (sender === 'SUPPORT_AGENT') {
    ticket.status = 'AWAITING_CUSTOMER';
  }

  persistTickets();
  syncMessageToPostgres(newMessage, ticket).catch(() => {});
  syncTicketToPostgres(ticket).catch(() => {});
  return newMessage;
}

/**
 * Poll and synchronize new Discord staff replies into the website ticket
 */
export async function syncDiscordRepliesForTicket(ticketId: string): Promise<SupportMessage[]> {
  const store = ensureInitialized();
  const ticket = store[ticketId];
  if (!ticket || !ticket.discordThreadId || !isDiscordSupportConfigured()) {
    return [];
  }

  try {
    const knownIds = new Set<string>();
    for (const msg of ticket.messages) {
      if (msg.discordMessageId) {
        knownIds.add(msg.discordMessageId);
      }
    }

    const discordReplies = await fetchDiscordThreadReplies(ticket.discordThreadId, knownIds);
    if (discordReplies.length === 0) return [];

    const added: SupportMessage[] = [];
    for (const reply of discordReplies) {
      // Re-verify deduplication
      if (ticket.messages.some((m) => m.discordMessageId === reply.id)) continue;

      const newMsg: SupportMessage = {
        id: `msg_dc_${reply.id}`,
        ticketId: ticket.id,
        sender: 'SUPPORT_AGENT',
        senderName: `${reply.authorName} (Staff)`,
        senderAvatar: reply.authorAvatar || '/icon.svg',
        message: reply.content,
        timestamp: reply.timestamp,
        discordMessageId: reply.id,
      };

      ticket.messages.push(newMsg);
      ticket.updatedAt = new Date().toISOString();
      ticket.status = 'AWAITING_CUSTOMER';
      added.push(newMsg);

      syncMessageToPostgres(newMsg, ticket).catch(() => {});
    }

    if (added.length > 0) {
      persistTickets();
      syncTicketToPostgres(ticket).catch(() => {});
    }

    return added;
  } catch (err: any) {
    console.warn('Error synchronizing Discord replies:', err?.message || err);
    return [];
  }
}
