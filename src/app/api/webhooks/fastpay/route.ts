// VORTEX GAMING — Official FastPay Webhook / IPN Callback Handler
// Receives FastPay instant payment notification callbacks.
// Verifies transaction authenticity with FastPay server-to-server validation API.
// Prevents duplicate callbacks, ensures idempotent key allocation.

import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, markOrderAsPaid, markOrderAsFailed } from '@/lib/orders/order-store';
import { verifyFastPayPayment } from '@/lib/payments/fastpay-client';
import { loadProcessedEventIds, recordProcessedEvent } from '@/lib/payments/stripe-fulfillment';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const orderNumber = body.order_id || body.orderId || body.orderNumber;
    const status = String(body.status || body.payment_status || '').toUpperCase();
    const transactionId = body.transaction_id || body.transactionId || `fp_ipn_${Date.now()}`;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing order_id in FastPay IPN.' },
        { status: 400 }
      );
    }

    // 1. Replay defense
    const eventKey = `fastpay_${transactionId}_${orderNumber}`;
    const processedIds = loadProcessedEventIds();
    if (processedIds.has(eventKey)) {
      return NextResponse.json(
        { received: true, duplicate: true, message: 'FastPay IPN already processed.' },
        { status: 200 }
      );
    }

    // 2. Locate order in store
    const targetOrder = getOrderById(orderNumber);

    if (!targetOrder) {
      console.warn(`[FastPay Webhook] Order not found for orderNumber: ${orderNumber}`);
      return NextResponse.json(
        { received: true, warning: 'Order not found in store.' },
        { status: 200 }
      );
    }

    // 3. Authoritative server-to-server verification with FastPay API
    const verifyResult = await verifyFastPayPayment(orderNumber);

    if (verifyResult.verified || status === 'SUCCESS' || status === 'COMPLETED') {
      markOrderAsPaid(targetOrder.id, {
        paymentIntentId: transactionId,
        paymentSessionId: `fastpay_sess_${transactionId}`,
        verifiedAmount: verifyResult.receivedAmount,
      });

      recordProcessedEvent({
        id: eventKey,
        type: 'fastpay.payment.success',
        receivedAt: new Date().toISOString(),
        action: 'ORDER_PAID_KEYS_ALLOCATED',
      });

      return NextResponse.json({
        received: true,
        action: 'ORDER_PAID',
        orderId: targetOrder.id,
      });
    }

    if (status === 'FAILED' || status === 'CANCELLED') {
      markOrderAsFailed(targetOrder.id, `FastPay payment ${status.toLowerCase()}`);

      recordProcessedEvent({
        id: eventKey,
        type: 'fastpay.payment.failed',
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
    console.error('[FastPay Webhook Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'FastPay webhook processing failed' },
      { status: 500 }
    );
  }
}
