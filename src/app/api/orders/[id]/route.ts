// VORTEX GAMING — Authoritative Order Status API
// Strictly verifies customer or token ownership.
// NEVER returns activation keys (plain or encrypted).

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  verifyOrderOwnership,
  sanitizeOrderForCustomer,
} from '@/lib/orders/order-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order identifier is required' },
        { status: 400 }
      );
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Extract ownership credentials
    const searchParams = req.nextUrl.searchParams;
    const token =
      searchParams.get('token') ||
      req.headers.get('x-order-token') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      null;

    const userId = req.headers.get('x-user-id') || null;
    const email = req.headers.get('x-user-email') || null;

    // Strict ownership verification (Token or User ID or Customer Email)
    const isOwner = verifyOrderOwnership(order, {
      orderAccessToken: token,
      userId,
      email,
    });

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to view this order.',
        },
        { status: 403 }
      );
    }

    // Return strictly sanitized customer-safe order details (NO KEYS)
    return NextResponse.json({
      success: true,
      order: sanitizeOrderForCustomer(order),
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('[Orders API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
