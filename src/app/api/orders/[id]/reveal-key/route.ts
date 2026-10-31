// VORTEX GAMING — Cryptographic Activation Key Reveal API
// Strictly enforces payment verification ('PAID') and fulfillment completion ('COMPLETED').
// Decrypts AES-256-GCM keys on demand for authenticated order owners only.

import { NextRequest, NextResponse } from 'next/server';
import { revealOrderActivationKeys } from '@/lib/orders/order-store';

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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body allowed if token is in query or headers
    }

    const searchParams = req.nextUrl.searchParams;
    const token =
      body.token ||
      searchParams.get('token') ||
      req.headers.get('x-order-token') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      null;

    const userId = body.userId || req.headers.get('x-user-id') || null;
    const email = body.email || req.headers.get('x-user-email') || null;

    const result = revealOrderActivationKeys(orderId, {
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
      keys: result.keys,
      deliveryDetails: result.deliveryDetails,
      isSandbox: result.isSandbox,
      notice: result.notice,
    });
  } catch (error: any) {
    console.error('[Reveal Key API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
