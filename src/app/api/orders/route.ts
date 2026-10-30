// VORTEX GAMING — Customer Orders History API
// Retrieves list of sanitized orders for authenticated customer.
// ZERO raw keys exposed in list.

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrdersByCustomer,
  sanitizeOrderForCustomer,
} from '@/lib/orders/order-store';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId') || req.headers.get('x-user-id') || null;
    const email = searchParams.get('email') || req.headers.get('x-user-email') || null;

    if (!userId && !email) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orders = getOrdersByCustomer(userId, email);
    const sanitized = orders.map(sanitizeOrderForCustomer);

    return NextResponse.json({
      success: true,
      orders: sanitized,
    });
  } catch (error: any) {
    console.error('[Customer Orders API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
