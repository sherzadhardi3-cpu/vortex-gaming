// VORTEX GAMING — Stripe Payment Adapter (Sandbox)
// Uses Stripe Checkout Sessions for PCI-compliant hosted payment

import type {
  PaymentAdapter,
  CreateCheckoutRequest,
  CheckoutSession,
  PaymentVerification,
  WebhookEvent,
  RefundRequest,
  RefundResult,
} from './adapter';

/**
 * Stripe payment adapter.
 * Uses Stripe Checkout (hosted payment page) for PCI DSS compliance.
 * Card data never touches our servers.
 * 
 * SANDBOX MODE: Will function with Stripe test keys.
 * PRODUCTION: Requires live Stripe keys and completed merchant verification.
 */
export class StripeAdapter implements PaymentAdapter {
  readonly provider = 'stripe';

  get isSandbox(): boolean {
    const key = process.env.STRIPE_SECRET_KEY || '';
    return !key || key.startsWith('sk_test_');
  }

  get isConfigured(): boolean {
    return !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PUBLIC_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  private async getStripe() {
    // Dynamic import to avoid loading Stripe when not configured
    const { default: Stripe } = await import('stripe');
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Stripe secret key not configured');
    return new Stripe(key, { apiVersion: '2024-12-18.acacia' as any });
  }

  async createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession> {
    const stripe = await this.getStripe();

    if (request.total.currency === 'IQD') {
      throw new Error('Stripe does not support IQD. Use a local payment provider for IQD transactions.');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: request.orderId,
      customer_email: request.customerEmail,
      line_items: request.items.map(item => ({
        price_data: {
          currency: request.total.currency.toLowerCase(),
          unit_amount: item.unitPrice,
          product_data: {
            name: item.name,
          },
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: request.orderId,
        orderNumber: request.orderNumber,
        ...request.metadata,
      },
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
    }, {
      idempotencyKey: request.idempotencyKey,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      provider: this.provider,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000)
        : undefined,
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentVerification> {
    const stripe = await this.getStripe();

    // Check if it's a checkout session ID or payment intent ID
    if (providerPaymentId.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(providerPaymentId);
      return {
        verified: session.payment_status === 'paid',
        providerPaymentId: (session.payment_intent as string) || providerPaymentId,
        status: session.payment_status === 'paid' ? 'completed'
              : session.payment_status === 'unpaid' ? 'pending'
              : 'failed',
        amount: {
          amount: session.amount_total || 0,
          currency: (session.currency?.toUpperCase() || 'USD') as 'USD' | 'IQD',
        },
      };
    }

    // Payment Intent
    const intent = await stripe.paymentIntents.retrieve(providerPaymentId);
    return {
      verified: intent.status === 'succeeded',
      providerPaymentId: intent.id,
      status: intent.status === 'succeeded' ? 'completed'
            : intent.status === 'processing' ? 'pending'
            : intent.status === 'canceled' ? 'cancelled'
            : 'failed',
      amount: {
        amount: intent.amount,
        currency: (intent.currency.toUpperCase() || 'USD') as 'USD' | 'IQD',
      },
    };
  }

  async verifyWebhook(
    payload: string | Buffer,
    headers: Record<string, string>
  ): Promise<WebhookEvent> {
    const stripe = await this.getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('Stripe webhook secret not configured');

    const sig = headers['stripe-signature'];
    if (!sig) throw new Error('Missing Stripe signature header');

    // Stripe SDK verifies the webhook signature
    const { default: Stripe } = await import('stripe');
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia' as any,
    });
    const event = stripeInstance.webhooks.constructEvent(
      payload as string,
      sig,
      secret
    );

    let status: 'completed' | 'pending' | 'failed' | 'refunded' = 'pending';
    let providerPaymentId = '';

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      status = session.payment_status === 'paid' ? 'completed' : 'pending';
      providerPaymentId = session.payment_intent || session.id;
    } else if (event.type === 'payment_intent.succeeded') {
      status = 'completed';
      providerPaymentId = (event.data.object as any).id;
    } else if (event.type === 'payment_intent.payment_failed') {
      status = 'failed';
      providerPaymentId = (event.data.object as any).id;
    } else if (event.type === 'charge.refunded') {
      status = 'refunded';
      providerPaymentId = (event.data.object as any).payment_intent;
    }

    return {
      eventId: event.id,
      type: event.type,
      providerPaymentId,
      status,
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    const stripe = await this.getStripe();

    try {
      const refund = await stripe.refunds.create({
        payment_intent: request.providerPaymentId,
        amount: request.amount.amount,
        reason: 'requested_by_customer',
        metadata: { reason: request.reason },
      }, {
        idempotencyKey: request.idempotencyKey,
      });

      return {
        success: refund.status === 'succeeded',
        providerRefundId: refund.id,
        status: refund.status === 'succeeded' ? 'processed' : 'pending',
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Refund failed',
      };
    }
  }
}
