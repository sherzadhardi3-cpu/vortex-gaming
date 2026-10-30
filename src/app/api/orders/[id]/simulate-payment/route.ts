// VORTEX GAMING — Sandbox Payment Simulator Endpoint
// STRICTLY RESTRICTED: Works ONLY for sandbox orders or staging/test environments.
// Blocks execution if attempted against real production orders.

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  markOrderAsPaid,
  verifyOrderOwnership,
  isEnvironmentForcedSandbox,
} from '@/lib/orders/order-store';

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
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Strict sandbox environment & sandbox order check
    if (!order.isSandbox && !isEnvironmentForcedSandbox()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Forbidden: Payment simulation is prohibited on live production orders.',
        },
        { status: 403 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body allowed
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

    // Verify ownership
    if (!verifyOrderOwnership(order, { orderAccessToken: token, userId, email })) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to simulate payment for this order.',
        },
        { status: 403 }
      );
    }

    // Authoritative payment transition in sandbox
    const result = markOrderAsPaid(order.id, {
      paymentSessionId: `sandbox_session_${Date.now()}`,
      paymentIntentId: `pi_sandbox_${Date.now()}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sandbox payment successfully simulated and verified.',
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      notice: 'TEST ORDER — NO REAL PAYMENT',
    });
  } catch (error: any) {
    console.error('[Simulate Payment API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
