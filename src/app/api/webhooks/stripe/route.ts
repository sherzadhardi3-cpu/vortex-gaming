// VORTEX GAMING — Cryptographically Verified Stripe Webhook Endpoint
// Handles checkout.session.completed, charge.refunded, and payment_intent.payment_failed.
// Enforces webhook signature validation, replay defense idempotency, atomic key release, and refund revocation.

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhookSignature } from '@/lib/stripe';
import { handleVerifiedStripeEvent } from '@/lib/payments/stripe-fulfillment';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header.' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_WEBHOOK_SECRET environment variable is not configured.' },
        { status: 500 }
      );
    }

    // 1. Cryptographic Signature Verification
    let event: any;
    try {
      event = verifyStripeWebhookSignature(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook Verification Error]:', err.message);
      return NextResponse.json(
        { success: false, error: `Invalid webhook signature: ${err.message}` },
        { status: 400 }
      );
    }

    // 2. Process Verified Event with Replay Defense
    const result = handleVerifiedStripeEvent(event);

    if (result.duplicate) {
      return NextResponse.json(
        { received: true, duplicate: true, action: result.action },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { received: true, action: result.action, orderId: result.orderId },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[Stripe Webhook Handler Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
