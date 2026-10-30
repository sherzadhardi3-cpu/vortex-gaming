// VORTEX GAMING — Iraqi Payment Provider Adapters
// These are SANDBOX STUBS awaiting official merchant onboarding.
//
// ⚠️ IMPORTANT: These adapters do NOT process real payments.
// They simulate the expected payment flow for development and testing.
// Before launch, each provider requires:
//   1. Merchant account registration and verification
//   2. Official API documentation review
//   3. Integration certification (if required)
//   4. Production API credentials
//
// DO NOT enable these in production without completing onboarding.

import type {
  PaymentAdapter,
  CreateCheckoutRequest,
  CheckoutSession,
  PaymentVerification,
  WebhookEvent,
  RefundRequest,
  RefundResult,
} from './adapter';

// ─── FIB (First Iraqi Bank) ─────────────────────────────────────────────────
// FIB offers mobile banking and online payment services.
// Official merchant integration requires contacting FIB directly.
// Website: https://fib.iq

export class FIBAdapter implements PaymentAdapter {
  readonly provider = 'fib';
  readonly isSandbox = true;

  get isConfigured(): boolean {
    return !!(
      process.env.FIB_API_URL &&
      process.env.FIB_API_KEY &&
      process.env.FIB_API_SECRET
    );
  }

  async createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession> {
    if (!this.isConfigured) {
      throw new Error(
        '[FIB] Payment adapter not configured. ' +
        'FIB merchant onboarding required. Contact FIB at https://fib.iq for merchant API access.'
      );
    }

    // SANDBOX: Simulate checkout session creation
    // In production, this would call FIB's payment initiation API
    console.warn('[FIB SANDBOX] Simulated checkout session — not a real transaction');
    
    const sessionId = `fib_sandbox_${Date.now()}_${request.orderId}`;
    return {
      sessionId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sandbox/fib?session=${sessionId}`,
      provider: this.provider,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentVerification> {
    // SANDBOX: Always returns pending — never auto-confirm
    console.warn('[FIB SANDBOX] Payment verification — sandbox mode, returning pending');
    return {
      verified: false,
      providerPaymentId,
      status: 'pending',
      amount: { amount: 0, currency: 'IQD' },
    };
  }

  async verifyWebhook(payload: string | Buffer, headers: Record<string, string>): Promise<WebhookEvent> {
    throw new Error('[FIB SANDBOX] Webhook verification not available in sandbox mode');
  }

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    console.warn('[FIB SANDBOX] Refund processing — sandbox mode');
    return {
      success: false,
      status: 'pending',
      message: 'FIB refunds require manual processing. Contact FIB merchant support.',
    };
  }
}

// ─── FastPay ────────────────────────────────────────────────────────────────
// FastPay is an Iraqi mobile payment service.
// Official merchant integration details must be obtained from FastPay directly.

export class FastPayAdapter implements PaymentAdapter {
  readonly provider = 'fastpay';
  readonly isSandbox = true;

  get isConfigured(): boolean {
    return !!(
      process.env.FASTPAY_API_URL &&
      process.env.FASTPAY_API_KEY &&
      process.env.FASTPAY_MERCHANT_ID
    );
  }

  async createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession> {
    if (!this.isConfigured) {
      throw new Error(
        '[FastPay] Payment adapter not configured. ' +
        'FastPay merchant onboarding required. Contact FastPay for merchant API access.'
      );
    }

    console.warn('[FastPay SANDBOX] Simulated checkout session — not a real transaction');
    
    const sessionId = `fastpay_sandbox_${Date.now()}_${request.orderId}`;
    return {
      sessionId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sandbox/fastpay?session=${sessionId}`,
      provider: this.provider,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentVerification> {
    console.warn('[FastPay SANDBOX] Payment verification — sandbox mode, returning pending');
    return {
      verified: false,
      providerPaymentId,
      status: 'pending',
      amount: { amount: 0, currency: 'IQD' },
    };
  }

  async verifyWebhook(payload: string | Buffer, headers: Record<string, string>): Promise<WebhookEvent> {
    throw new Error('[FastPay SANDBOX] Webhook verification not available in sandbox mode');
  }

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    return {
      success: false,
      status: 'pending',
      message: 'FastPay refunds require manual processing via merchant dashboard.',
    };
  }
}

// ─── Qi Card ────────────────────────────────────────────────────────────────
// Qi Card is Iraq's national electronic payment system.
// Merchant integration requires registration with Qi Card.
// Website: https://qi.iq

export class QiCardAdapter implements PaymentAdapter {
  readonly provider = 'qi_card';
  readonly isSandbox = true;

  get isConfigured(): boolean {
    return !!(
      process.env.QI_CARD_API_URL &&
      process.env.QI_CARD_MERCHANT_ID &&
      process.env.QI_CARD_SECRET_KEY
    );
  }

  async createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession> {
    if (!this.isConfigured) {
      throw new Error(
        '[Qi Card] Payment adapter not configured. ' +
        'Qi Card merchant registration required. Visit https://qi.iq for merchant onboarding.'
      );
    }

    console.warn('[Qi Card SANDBOX] Simulated checkout session — not a real transaction');
    
    const sessionId = `qi_sandbox_${Date.now()}_${request.orderId}`;
    return {
      sessionId,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sandbox/qi-card?session=${sessionId}`,
      provider: this.provider,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentVerification> {
    console.warn('[Qi Card SANDBOX] Payment verification — sandbox mode, returning pending');
    return {
      verified: false,
      providerPaymentId,
      status: 'pending',
      amount: { amount: 0, currency: 'IQD' },
    };
  }

  async verifyWebhook(payload: string | Buffer, headers: Record<string, string>): Promise<WebhookEvent> {
    throw new Error('[Qi Card SANDBOX] Webhook verification not available in sandbox mode');
  }

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    return {
      success: false,
      status: 'pending',
      message: 'Qi Card refunds must be processed through the Qi Card merchant portal.',
    };
  }
}
