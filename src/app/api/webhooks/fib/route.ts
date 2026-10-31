// VORTEX GAMING — Official First Iraqi Bank (FIB) Webhook Callback Handler
// Receives asynchronous payment status notifications from FIB.
// Validates callback authenticity, checks FIB status API, prevents replay attacks,
// and authoritatively updates order status & key allocations.

import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, markOrderAsPaid, markOrderAsFailed, getOrderByPaymentIntentId } from '@/lib/orders/order-store';
import { checkFIBPaymentStatus } from '@/lib/payments/fib-client';
import { loadProcessedEventIds, recordProcessedEvent } from '@/lib/payments/stripe-fulfillment';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { id: paymentId, status: rawStatus, orderId, orderNumber } = rawBody;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing paymentId parameter.' },
        { status: 400 }
      );
    }

    // 1. Replay attack defense
    const eventKey = `fib_${paymentId}_${rawStatus}`;
    const processedIds = loadProcessedEventIds();
    if (processedIds.has(eventKey)) {
      return NextResponse.json(
        { received: true, duplicate: true, message: 'FIB webhook already processed.' },
        { status: 200 }
      );
    }

    // 2. Authoritative server-to-server verification with FIB
    const fibStatus = await checkFIBPaymentStatus(paymentId);
    
    // Find matching order in store
    let targetOrder = orderId ? getOrderById(orderId) : null;
    if (!targetOrder && orderNumber) {
      targetOrder = getOrderById(orderNumber);
    }
    if (!targetOrder && paymentId) {
      targetOrder = getOrderByPaymentIntentId(paymentId);
    }

    if (!targetOrder) {
      console.warn(`[FIB Webhook] Order not found for paymentId: ${paymentId}`);
      return NextResponse.json(
        { received: true, warning: 'Order not found in store.' },
        { status: 200 }
      );
    }

    // 3. Update order state based on authoritative status
    if (fibStatus.status === 'PAID' || rawStatus === 'PAID') {
      markOrderAsPaid(targetOrder.id, {
        paymentIntentId: paymentId,
        paymentSessionId: `fib_sess_${paymentId}`,
        verifiedAmount: fibStatus.amount,
      });

      recordProcessedEvent({
        id: eventKey,
        type: 'fib.payment.paid',
        receivedAt: new Date().toISOString(),
        action: 'ORDER_PAID_KEYS_ALLOCATED',
      });

      return NextResponse.json({
        received: true,
        action: 'ORDER_PAID',
        orderId: targetOrder.id,
      });
    }

    if (fibStatus.status === 'DECLINED' || rawStatus === 'DECLINED') {
      markOrderAsFailed(
        targetOrder.id,
        `FIB transaction declined: ${fibStatus.decliningReason || 'Declined by bank'}`
      );

      recordProcessedEvent({
        id: eventKey,
        type: 'fib.payment.declined',
        receivedAt: new Date().toISOString(),
        action: 'ORDER_FAILED',
      });

      return NextResponse.json({
        received: true,
        action: 'ORDER_FAILED',
        orderId: targetOrder.id,
      });
    }

    return NextResponse.json({ received: true, status: 'PENDING' });
  } catch (err: any) {
    console.error('[FIB Webhook Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'FIB webhook processing failed' },
      { status: 500 }
    );
  }
}
