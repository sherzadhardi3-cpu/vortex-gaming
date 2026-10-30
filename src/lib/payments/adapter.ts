// VORTEX GAMING — Payment Adapter Interface
// Extensible payment system with provider-specific implementations
// All amounts are in integer minor currency units (cents/fils)

export interface PaymentAmount {
  /** Amount in smallest currency unit (cents for USD, smallest unit for IQD) */
  amount: number;
  /** ISO 4217 currency code */
  currency: 'USD' | 'IQD';
}

export interface CreateCheckoutRequest {
  orderId: string;
  orderNumber: string;
  items: CheckoutItem[];
  total: PaymentAmount;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface CheckoutItem {
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface CheckoutSession {
  /** Provider-specific session/transaction ID */
  sessionId: string;
  /** URL to redirect the customer to for payment */
  checkoutUrl: string;
  /** Provider name */
  provider: string;
  /** Expiry timestamp */
  expiresAt?: Date;
}

export interface PaymentVerification {
  /** Whether the payment is confirmed */
  verified: boolean;
  /** Provider payment/transaction ID */
  providerPaymentId: string;
  /** Payment status from provider */
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  /** Amount confirmed by provider */
  amount: PaymentAmount;
  /** Provider-specific metadata (non-sensitive only) */
  metadata?: Record<string, unknown>;
}

export interface WebhookEvent {
  /** Provider's event ID for deduplication */
  eventId: string;
  /** Event type */
  type: string;
  /** Provider payment/transaction ID */
  providerPaymentId: string;
  /** Payment status */
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  /** Amount */
  amount?: PaymentAmount;
  /** Raw event data (non-sensitive) */
  data?: Record<string, unknown>;
}

export interface RefundRequest {
  paymentId: string;
  providerPaymentId: string;
  amount: PaymentAmount;
  reason: string;
  idempotencyKey: string;
}

export interface RefundResult {
  success: boolean;
  providerRefundId?: string;
  status: 'processed' | 'pending' | 'failed';
  message?: string;
}

/**
 * Abstract payment provider adapter.
 * Each provider (Stripe, FIB, FastPay, Qi Card) implements this interface.
 * 
 * IMPORTANT: Never mark an order as PAID based on client-side redirect.
 * Always verify payment server-to-server via verifyPayment() or webhook.
 */
export interface PaymentAdapter {
  /** Provider identifier */
  readonly provider: string;

  /** Whether this provider is in sandbox/test mode */
  readonly isSandbox: boolean;

  /** Whether this provider is fully configured and operational */
  readonly isConfigured: boolean;

  /**
   * Create a checkout session with the provider.
   * Returns a URL to redirect the customer to.
   */
  createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession>;

  /**
   * Verify a payment server-to-server.
   * MUST be called to confirm payment before fulfillment.
   */
  verifyPayment(providerPaymentId: string): Promise<PaymentVerification>;

  /**
   * Verify and parse a webhook event from the provider.
   * Validates signatures/authenticity.
   */
  verifyWebhook(payload: string | Buffer, headers: Record<string, string>): Promise<WebhookEvent>;

  /**
   * Process a refund through the provider.
   */
  processRefund(request: RefundRequest): Promise<RefundResult>;
}

/**
 * Payment provider registry.
 * Manages available payment adapters.
 */
export class PaymentProviderRegistry {
  private adapters = new Map<string, PaymentAdapter>();

  register(adapter: PaymentAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): PaymentAdapter | undefined {
    return this.adapters.get(provider);
  }

  getConfigured(): PaymentAdapter[] {
    return Array.from(this.adapters.values()).filter(a => a.isConfigured);
  }

  getAll(): PaymentAdapter[] {
    return Array.from(this.adapters.values());
  }

  listProviders(): Array<{ provider: string; isSandbox: boolean; isConfigured: boolean }> {
    return Array.from(this.adapters.values()).map(a => ({
      provider: a.provider,
      isSandbox: a.isSandbox,
      isConfigured: a.isConfigured,
    }));
  }
}

// Singleton registry
export const paymentRegistry = new PaymentProviderRegistry();
