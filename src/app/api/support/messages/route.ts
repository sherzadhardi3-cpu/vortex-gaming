// VORTEX GAMING — Customer Support Messages API
// Handles ticket retrieval, message sending, strict customer-isolation authorization,
// rate limiting, and two-way Discord Live Support synchronization.

import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketsForUser,
  getTicketById,
  createTicket,
  addMessageToTicket,
  updateTicketStatus,
  syncDiscordRepliesForTicket,
  type TicketStatusType,
} from '@/lib/support/support-store';
import { isDiscordSupportConfigured, isRateLimited } from '@/lib/discord/discord-service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const specificTicketId = searchParams.get('ticketId');

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    if (!email && !userId && !isAdmin && !specificTicketId) {
      return NextResponse.json({
        success: true,
        tickets: [],
        discordConnected: isDiscordSupportConfigured(),
      });
    }

    // If specific ticket requested, sync Discord replies for it
    if (specificTicketId) {
      await syncDiscordRepliesForTicket(specificTicketId).catch(() => {});
      const ticket = await getTicketById({
        ticketId: specificTicketId,
        requestingUserId: userId || undefined,
        requestingEmail: email || undefined,
        isAdmin,
      });

      return NextResponse.json({
        success: true,
        tickets: ticket ? [ticket] : [],
        discordConnected: isDiscordSupportConfigured(),
      });
    }

    const tickets = await getTicketsForUser({
      userId: userId || undefined,
      userEmail: email || undefined,
      isAdmin,
    });

    // Synchronize latest Discord replies for active (non-closed) tickets
    const activeTickets = tickets.filter(
      (t) => t.discordThreadId && (t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'AWAITING_CUSTOMER')
    );

    // Sync at most 3 active tickets to avoid slow responses
    await Promise.allSettled(
      activeTickets.slice(0, 3).map((t) => syncDiscordRepliesForTicket(t.id))
    );

    return NextResponse.json({
      success: true,
      tickets,
      discordConnected: isDiscordSupportConfigured(),
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Support API GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      ticketId,
      userId,
      userEmail,
      userName,
      subject,
      category,
      orderId,
      message,
      status,
      role,
    } = body;

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    // ─── 1. CREATE TICKET ──────────────────────────────────────────────────────
    if (action === 'create_ticket') {
      if (!userEmail || !message || !subject) {
        return NextResponse.json(
          { success: false, error: 'Email, subject, and message are required.' },
          { status: 400 }
        );
      }

      // Rate limit ticket creation
      const clientKey = `create_${userEmail.toLowerCase().trim()}`;
      if (isRateLimited(clientKey, 5, 60000)) {
        return NextResponse.json(
          { success: false, error: 'Too many tickets created. Please wait a moment before trying again.' },
          { status: 429 }
        );
      }

      const ticket = await createTicket({
        userId: userId || undefined,
        userEmail: userEmail.trim(),
        userName: (userName || userEmail.split('@')[0]).trim(),
        subject: subject.trim(),
        category: category || 'GENERAL',
        orderId: orderId?.trim() || undefined,
        initialMessage: message.trim(),
      });

      return NextResponse.json({
        success: true,
        ticket,
        message: 'Support ticket created successfully.',
        discordConnected: isDiscordSupportConfigured(),
      });
    }

    // ─── 2. SEND MESSAGE ───────────────────────────────────────────────────────
    if (action === 'send_message') {
      if (!ticketId || !message) {
        return NextResponse.json(
          { success: false, error: 'Ticket ID and message are required.' },
          { status: 400 }
        );
      }

      // Rate limit messages (max 6 messages per 10 seconds per ticket)
      const rateKey = `msg_${ticketId}_${userEmail || userId || 'anon'}`;
      if (isRateLimited(rateKey, 6, 10000)) {
        return NextResponse.json(
          { success: false, error: 'You are sending messages too quickly. Please wait a few seconds.' },
          { status: 429 }
        );
      }

      const newMessage = await addMessageToTicket({
        ticketId,
        sender: isAdmin ? 'SUPPORT_AGENT' : 'CUSTOMER',
        senderName: userName || (isAdmin ? 'VORTEX Staff' : 'Customer'),
        message: message.trim(),
        requestingUserId: userId || undefined,
        requestingEmail: userEmail || undefined,
        isAdmin,
      });

      return NextResponse.json({
        success: true,
        message: newMessage,
      });
    }

    // ─── 3. UPDATE STATUS / CLOSE / REOPEN ─────────────────────────────────────
    if (action === 'update_status' || action === 'close_ticket' || action === 'reopen_ticket') {
      if (!ticketId) {
        return NextResponse.json(
          { success: false, error: 'Ticket ID is required.' },
          { status: 400 }
        );
      }

      let targetStatus: TicketStatusType = status;
      if (action === 'close_ticket') targetStatus = 'CLOSED';
      if (action === 'reopen_ticket') targetStatus = 'OPEN';

      if (!targetStatus) {
        return NextResponse.json(
          { success: false, error: 'Status is required.' },
          { status: 400 }
        );
      }

      const updated = await updateTicketStatus({
        ticketId,
        status: targetStatus,
        requestingUserId: userId || undefined,
        requestingEmail: userEmail || undefined,
        isAdmin,
      });

      return NextResponse.json({
        success: true,
        ticket: updated,
        message: `Ticket marked as ${targetStatus}.`,
      });
    }

    // ─── 4. SYNC DISCORD REPLIES ──────────────────────────────────────────────
    if (action === 'sync_discord') {
      if (!ticketId) {
        return NextResponse.json(
          { success: false, error: 'Ticket ID is required.' },
          { status: 400 }
        );
      }

      const newReplies = await syncDiscordRepliesForTicket(ticketId);
      return NextResponse.json({
        success: true,
        syncedCount: newReplies.length,
        replies: newReplies,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid support action.' },
      { status: 400 }
    );
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Support API POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Support request processing error.' },
      { status: 500 }
    );
  }
}
