// VORTEX GAMING — Unified Server-Authoritative Payment Verification API
// Queried when a customer clicks "Check Payment Status" or when the frontend polls.
// Contacts the authoritative payment provider (FIB, FastPay, Stripe) directly server-to-server.
// Never relies on client claims or unverified browser state.

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  markOrderAsPaid,
  markOrderAsFailed,
  verifyOrderOwnership,
} from '@/lib/orders/order-store';
import { checkFIBPaymentStatus } from '@/lib/payments/fib-client';
import { verifyFastPayPayment } from '@/lib/payments/fastpay-client';
import { checkRateLimit, getClientIp } from '@/lib/payments/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`verify:${ip}`, 30, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many status check requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { orderId, orderAccessToken } = body;

    if (!orderId || !orderAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Order ID and access token are required.' },
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

    if (!verifyOrderOwnership(order, { orderAccessToken })) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Invalid order access credentials.' },
        { status: 403 }
      );
    }

    // 1. If order is already PAID, return verified state immediately
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        paymentStatus: 'PAID',
        fulfillmentStatus: order.fulfillmentStatus,
        orderId: order.id,
        orderNumber: order.orderNumber,
        isSandbox: order.isSandbox,
        total: order.total,
        currency: order.currency,
        paidAt: order.paidAt,
        message: 'Payment verified and confirmed. Digital keys are ready in your vault.',
      });
    }

    // 2. If order is FAILED, return failed state
    if (order.paymentStatus === 'FAILED') {
      return NextResponse.json({
        success: false,
        paymentStatus: 'FAILED',
        fulfillmentStatus: order.fulfillmentStatus,
        orderId: order.id,
        orderNumber: order.orderNumber,
        isSandbox: order.isSandbox,
        error: 'Payment was declined or cancelled. You can retry with another payment method.',
        canRetry: true,
      });
    }

    // 3. SERVER-TO-SERVER PROVIDER RE-VERIFICATION
    // For FIB: Query FIB API
    if (order.paymentProvider === 'fib' && order.paymentIntentId) {
      const fibCheck = await checkFIBPaymentStatus(order.paymentIntentId);
      if (fibCheck.status === 'PAID') {
        const paidResult = markOrderAsPaid(order.id, {
          paymentIntentId: fibCheck.paymentId,
          verifiedAmount: fibCheck.amount,
        });
        if (paidResult.success) {
          return NextResponse.json({
            success: true,
            paymentStatus: 'PAID',
            fulfillmentStatus: paidResult.order?.fulfillmentStatus,
            orderId: order.id,
            orderNumber: order.orderNumber,
            isSandbox: order.isSandbox,
            paidAt: paidResult.order?.paidAt,
            message: 'First Iraqi Bank (FIB) payment verified and confirmed.',
          });
        }
      } else if (fibCheck.status === 'DECLINED' || fibCheck.status === 'EXPIRED') {
        markOrderAsFailed(order.id, `FIB payment ${fibCheck.status.toLowerCase()}: ${fibCheck.decliningReason || 'Transaction expired'}`);
        return NextResponse.json({
          success: false,
          paymentStatus: 'FAILED',
          orderId: order.id,
          orderNumber: order.orderNumber,
          error: `FIB transaction was ${fibCheck.status.toLowerCase()}.`,
          canRetry: true,
        });
      }
    }

    // For FastPay: Query FastPay API
    if (order.paymentProvider === 'fastpay') {
      const fpCheck = await verifyFastPayPayment(order.orderNumber);
      if (fpCheck.verified) {
        const paidResult = markOrderAsPaid(order.id, {
          paymentIntentId: fpCheck.transactionId || `fp_tx_${order.orderNumber}`,
          verifiedAmount: fpCheck.receivedAmount,
        });
        if (paidResult.success) {
          return NextResponse.json({
            success: true,
            paymentStatus: 'PAID',
            fulfillmentStatus: paidResult.order?.fulfillmentStatus,
            orderId: order.id,
            orderNumber: order.orderNumber,
            isSandbox: order.isSandbox,
            paidAt: paidResult.order?.paidAt,
            message: 'FastPay payment verified and confirmed.',
          });
        }
      }
    }

    // Order is still pending
    return NextResponse.json({
      success: true,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      orderId: order.id,
      orderNumber: order.orderNumber,
      isSandbox: order.isSandbox,
      message: 'Awaiting payment transfer from provider. Please complete transfer or re-check.',
    });
  } catch (err: any) {
    console.error('[Verify Payment API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
