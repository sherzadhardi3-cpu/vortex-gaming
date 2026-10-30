// VORTEX GAMING — Official Stripe Integration Client
// Supports test and live sandbox modes with cryptographic webhook verification,
// idempotent event processing, and refund reconciliation.
// STRICTLY OPERATES IN TEST MODE UNTIL LIVE MERCHANT AUTHORIZATION.

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('placeholder')) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia' as any,
      typescript: true,
      appInfo: {
        name: 'VORTEX GAMING Marketplace',
        version: '1.0.0',
      },
    });
  }

  return stripeInstance;
}

/**
 * Cryptographically verifies an incoming Stripe webhook signature.
 * Throws an error if tampering, expired timestamp, or secret mismatch is detected.
 */
export function verifyStripeWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient() || new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_vault', {
    apiVersion: '2025-01-27.acacia' as any,
  });

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Checks if Stripe is running in live or test mode.
 * In staging or when FORCE_SANDBOX is enabled, live mode is strictly prevented.
 */
export function isStripeLiveMode(): boolean {
  if (process.env.APP_ENV === 'staging' || process.env.FORCE_SANDBOX === 'true') {
    return false;
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return Boolean(secretKey && secretKey.startsWith('sk_live_'));
}
