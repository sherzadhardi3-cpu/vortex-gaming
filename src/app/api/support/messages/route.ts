// VORTEX GAMING — Customer Support Messages API
// Handles ticket retrieval, message sending, and strict RBAC/ownership verification

import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketsForUser,
  createTicket,
  addMessageToTicket,
  updateTicketStatus,
  type TicketStatusType,
} from '@/lib/support/support-store';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    if (!email && !userId && !isAdmin) {
      return NextResponse.json({ success: true, tickets: [] });
    }

    const tickets = await getTicketsForUser({
      userId: userId || undefined,
      userEmail: email || undefined,
      isAdmin,
    });

    return NextResponse.json({
      success: true,
      tickets,
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
    const { action, ticketId, userId, userEmail, userName, subject, category, orderId, message, status, sender, role } = body;

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    if (action === 'create_ticket') {
      if (!userEmail || !message || !subject) {
        return NextResponse.json(
          { success: false, error: 'Email, subject, and message are required.' },
          { status: 400 }
        );
      }

      const ticket = await createTicket({
        userId: userId || undefined,
        userEmail,
        userName: userName || userEmail.split('@')[0],
        subject,
        category: category || 'GENERAL',
        orderId: orderId || undefined,
        initialMessage: message,
      });

      return NextResponse.json({
        success: true,
        ticket,
        message: 'Support ticket created successfully.',
      });
    }

    if (action === 'update_status') {
      if (!ticketId || !status) {
        return NextResponse.json(
          { success: false, error: 'Ticket ID and status are required.' },
          { status: 400 }
        );
      }

      const updated = await updateTicketStatus({
        ticketId,
        status: status as TicketStatusType,
        requestingUserId: userId || undefined,
        requestingEmail: userEmail || undefined,
        isAdmin,
      });

      return NextResponse.json({
        success: true,
        ticket: updated,
        message: 'Ticket status updated successfully.',
      });
    }

    if (action === 'send_message') {
      if (!ticketId || !message) {
        return NextResponse.json(
          { success: false, error: 'Ticket ID and message are required.' },
          { status: 400 }
        );
      }

      const newMessage = await addMessageToTicket({
        ticketId,
        sender: isAdmin ? 'SUPPORT_AGENT' : 'CUSTOMER',
        senderName: userName || (isAdmin ? 'VORTEX Staff' : 'Customer'),
        message,
        requestingUserId: userId || undefined,
        requestingEmail: userEmail || undefined,
        isAdmin,
      });

      return NextResponse.json({
        success: true,
        message: newMessage,
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
