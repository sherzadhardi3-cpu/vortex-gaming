// VORTEX GAMING — Iraqi Local Cards & Qi Card Gateway Client
// Supports Qi Card (ISC), Neo, Switch, and FIB Card through approved acquiring gateways.
//
// Key Principles:
// 1. Zero raw card PAN or CVV storage: Sensitive data is never persisted on merchant servers.
// 2. Strict sandbox isolation: Simulated OTP challenges are prohibited in production.
// 3. Official gateway integration: Uses CBI-certified acquiring gateway endpoints when configured.

import crypto from 'crypto';

export interface QiCardInitiateParams {
  orderId: string;
  orderNumber: string;
  amountIQD: number;
  customerEmail: string;
  customerName?: string;
  callbackUrl?: string;
}

export interface QiCardSessionResult {
  success: boolean;
  paymentId: string;
  redirectUrl?: string;
  isSandbox: boolean;
  isMock: boolean;
  error?: string;
}

export interface QiCardVerificationResult {
  verified: boolean;
  orderNumber: string;
  status: 'PAID' | 'FAILED' | 'PENDING';
  transactionReference?: string;
  error?: string;
}

/**
 * Returns true if official Qi Card / CBI acquiring gateway credentials are configured.
 */
export function isQiCardConfigured(): boolean {
  const merchantId = process.env.QI_CARD_MERCHANT_ID;
  const secretKey = process.env.QI_CARD_SECRET_KEY;
  return Boolean(merchantId && secretKey && !merchantId.includes('placeholder'));
}

/**
 * Resolves the Qi Card gateway API URL.
 */
export function getQiCardBaseUrl(): string {
  if (process.env.QI_CARD_API_URL) {
    return process.env.QI_CARD_API_URL.replace(/\/+$/, '');
  }
  const isProduction =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';
  return isProduction
    ? 'https://gateway.qi.iq/api/v1'
    : 'https://staging-gateway.qi.iq/api/v1';
}

/**
 * Initiates an Iraqi local card payment session.
 */
export async function createQiCardPaymentSession(
  params: QiCardInitiateParams
): Promise<QiCardSessionResult> {
  const { orderId, orderNumber, amountIQD, customerEmail, callbackUrl } = params;
  const isProd =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';

  // 1. REAL PROVIDER EXECUTION (when gateway credentials exist)
  if (isQiCardConfigured()) {
    try {
      const merchantId = process.env.QI_CARD_MERCHANT_ID!;
      const secretKey = process.env.QI_CARD_SECRET_KEY!;
      const baseUrl = getQiCardBaseUrl();

      const timestamp = Date.now().toString();
      const payloadString = `${merchantId}|${orderNumber}|${Math.round(amountIQD)}|${timestamp}`;
      const signature = crypto.createHmac('sha256', secretKey).update(payloadString).digest('hex');

      const response = await fetch(`${baseUrl}/checkout/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-ID': merchantId,
          'X-Signature': signature,
        },
        body: JSON.stringify({
          orderId: orderNumber,
          amount: Math.round(amountIQD),
          currency: 'IQD',
          customerEmail,
          timestamp,
          callbackUrl:
            callbackUrl ||
            `${process.env.NEXT_PUBLIC_APP_URL || 'https://vortexgaming.gg'}/api/webhooks/qi-card`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          paymentId: data.transactionId || data.id,
          redirectUrl: data.paymentUrl || data.redirectUrl,
          isSandbox: !isProd,
          isMock: false,
        };
      }
    } catch (err: any) {
      console.error('[Qi Card Gateway Error]:', err.message);
      if (isProd) {
        throw new Error(`Iraqi card gateway error: ${err.message}`);
      }
    }
  }

  // 2. PRODUCTION ENFORCEMENT
  if (isProd) {
    throw new Error(
      'Iraqi Local Cards payment is currently unavailable in production: Central Bank of Iraq acquiring gateway credentials (QI_CARD_MERCHANT_ID) are pending certification.'
    );
  }

  // 3. TRANSPARENT SANDBOX SIMULATION
  const mockRef = `IQ-CARD-${orderNumber}`;
  return {
    success: true,
    paymentId: mockRef,
    isSandbox: true,
    isMock: true,
  };
}
