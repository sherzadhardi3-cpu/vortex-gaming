// VORTEX GAMING — Cryptographic Digital Delivery Reveal API
// Strictly requires valid PIN authorization, confirmed payment, and order ownership.
// Decrypts AES-256-GCM inventory server-side on-demand for authenticated customers.

import { NextRequest, NextResponse } from 'next/server';
import { revealOrderActivationKeys, getOrderById } from '@/lib/orders/order-store';
import { verifyPinAuthToken, getUserByEmail } from '@/lib/auth/user-store';

export async function POST(
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
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty
    }

    const searchParams = req.nextUrl.searchParams;
    const token =
      body.token ||
      searchParams.get('token') ||
      req.headers.get('x-order-token') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      null;

    const pinAuthToken =
      body.pinAuthToken ||
      req.headers.get('x-pin-auth-token') ||
      searchParams.get('pinAuthToken') ||
      null;

    let userId = body.userId || req.headers.get('x-user-id') || null;
    const email = body.email || req.headers.get('x-user-email') || null;

    if (!userId && email) {
      const user = await getUserByEmail(email);
      if (user) userId = user.id;
    }

    // MANDATORY SECURITY REQUIREMENT: Validate PIN Authorization Token
    const isPinAuthorized = verifyPinAuthToken(pinAuthToken, order.id, userId);

    if (!isPinAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Security PIN verification required to view delivery details.',
          pinRequired: true,
        },
        { status: 401 }
      );
    }

    // Reveal Delivery Information via Authoritative Order Store
    const result = revealOrderActivationKeys(order.id, {
      orderAccessToken: token,
      userId,
      email,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.statusCode || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deliveryDetails: result.deliveryDetails,
      keys: result.keys,
      isSandbox: result.isSandbox,
      notice: result.notice,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('[Reveal Delivery API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error revealing delivery details.' },
      { status: 500 }
    );
  }
}
