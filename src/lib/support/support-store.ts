// VORTEX GAMING — Customer Support Ticket & Chat Persistence Store
// Stores support tickets and messages persistently with customer-isolation authorization

import fs from 'fs';
import path from 'path';

export interface SupportMessage {
  id: string;
  ticketId: string;
  sender: 'CUSTOMER' | 'SUPPORT_AGENT' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'KEY_ACTIVATION' | 'ORDER_INQUIRY' | 'PAYMENT' | 'ACCOUNT' | 'GENERAL';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'support-tickets.json');

// In-memory cache synchronized with disk
let ticketsCache: Record<string, SupportTicket> | null = null;

const DEFAULT_TICKETS: Record<string, SupportTicket> = {
  'tkt_welcome_demo': {
    id: 'tkt_welcome_demo',
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
        senderAvatar: '/favicon.ico',
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
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      ticketsCache = JSON.parse(content);
    } else {
      ticketsCache = JSON.parse(JSON.stringify(DEFAULT_TICKETS));
      fs.writeFileSync(DATA_FILE, JSON.stringify(ticketsCache, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[SupportStore] Filesystem fallback to memory:', err);
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
    fs.writeFileSync(DATA_FILE, JSON.stringify(ticketsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[SupportStore] Error persisting tickets:', err);
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
 * Create a new ticket or get active conversation
 */
export async function createTicket({
  userId,
  userEmail,
  userName,
  subject,
  category = 'GENERAL',
  initialMessage,
}: {
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  category?: SupportTicket['category'];
  initialMessage: string;
}): Promise<SupportTicket> {
  const store = ensureInitialized();
  const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    id: ticketId,
    userId,
    userEmail: userEmail.toLowerCase().trim(),
    userName,
    subject: subject.trim(),
    status: 'OPEN',
    priority: 'MEDIUM',
    category,
    messages: [
      {
        id: `msg_${Date.now()}_1`,
        ticketId,
        sender: 'CUSTOMER',
        senderName: userName,
        message: initialMessage.trim(),
        timestamp: now,
      },
      // Automated instant confirmation
      {
        id: `msg_${Date.now()}_2`,
        ticketId,
        sender: 'SUPPORT_AGENT',
        senderName: 'VORTEX Support Sentinel',
        message: 'Thank you for reaching out to VORTEX Gaming Support! Your ticket has been received by our on-duty agents. We will reply shortly.',
        timestamp: new Date(Date.now() + 500).toISOString(),
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store[ticketId] = newTicket;
  persistTickets();
  return newTicket;
}

/**
 * Add a message to an existing ticket with customer isolation verification
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
}: {
  ticketId: string;
  sender: 'CUSTOMER' | 'SUPPORT_AGENT';
  senderName: string;
  senderAvatar?: string;
  message: string;
  requestingUserId?: string;
  requestingEmail?: string;
  isAdmin?: boolean;
}): Promise<SupportMessage> {
  const store = ensureInitialized();
  const ticket = store[ticketId];

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Security check: non-admin can only post to their own ticket
  if (!isAdmin) {
    const isOwner =
      (requestingUserId && ticket.userId === requestingUserId) ||
      (requestingEmail && ticket.userEmail.toLowerCase().trim() === requestingEmail.toLowerCase().trim());
    if (!isOwner) {
      throw new Error('Unauthorized to message this ticket');
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
  };

  ticket.messages.push(newMessage);
  ticket.updatedAt = now;
  if (sender === 'CUSTOMER') {
    ticket.status = 'OPEN';
  }

  persistTickets();
  return newMessage;
}
