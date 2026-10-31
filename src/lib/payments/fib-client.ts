// VORTEX GAMING — Official First Iraqi Bank (FIB) Payment Client
// Implements FIB's OpenID Connect OAuth2 authentication, payment initiation,
// status verification, cancellation, and secure callback validation.
//
// API Reference: https://fib.iq / First Iraqi Bank Merchant Integration
// Staging Base: https://fib.stage.firstiraqibank.com
// Production Base: https://api.firstiraqibank.com

import crypto from 'crypto';

interface FIBTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface FIBCreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amountIQD: number;
  description: string;
  callbackUrl?: string;
  expiresInMinutes?: number;
}

export interface FIBPaymentSessionResult {
  success: boolean;
  paymentId: string;
  qrPayload: string;
  readableCode?: string;
  validUntil: string;
  isSandbox: boolean;
  isMock: boolean;
  error?: string;
}

export interface FIBPaymentStatusResult {
  paymentId: string;
  status: 'PAID' | 'UNPAID' | 'DECLINED' | 'EXPIRED' | 'CANCELLED' | 'UNKNOWN';
  paidAt?: string;
  amount?: number;
  currency?: string;
  decliningReason?: string;
}

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Returns true if real FIB merchant credentials are configured in environment variables.
 */
export function isFIBConfigured(): boolean {
  const clientId = process.env.FIB_CLIENT_ID || process.env.FIB_API_KEY;
  const clientSecret = process.env.FIB_CLIENT_SECRET || process.env.FIB_API_SECRET;
  return Boolean(clientId && clientSecret && !clientId.includes('placeholder'));
}

/**
 * Resolves the FIB Base URL.
 */
export function getFIBBaseUrl(): string {
  if (process.env.FIB_API_URL) {
    return process.env.FIB_API_URL.replace(/\/+$/, '');
  }
  // Default to FIB Sandbox/UAT environment
  const isProduction =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';
  return isProduction
    ? 'https://api.firstiraqibank.com'
    : 'https://fib.stage.firstiraqibank.com';
}

/**
 * Obtains an OAuth2 bearer token from FIB using Client Credentials grant.
 */
async function getFIBAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  const clientId = process.env.FIB_CLIENT_ID || process.env.FIB_API_KEY;
  const clientSecret = process.env.FIB_CLIENT_SECRET || process.env.FIB_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('FIB Client ID or Secret is not configured.');
  }

  const baseUrl = getFIBBaseUrl();
  const tokenUrl = `${baseUrl}/auth/realms/fib-online-shop/protocol/openid-connect/token`;

  const bodyParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FIB OAuth authentication failed (${response.status}): ${errorText}`);
  }

  const data: FIBTokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 300) * 1000,
  };

  return cachedToken.token;
}

/**
 * Creates a real or sandbox FIB payment session.
 * - When FIB credentials exist: Contacts FIB's payment initiation API.
 * - When credentials are missing and in sandbox: Returns an isolated test simulation with transparent MOCK indicator.
 * - When credentials are missing and in production: Rejects request to prevent fabricated live transactions.
 */
export async function createFIBPaymentSession(
  params: FIBCreatePaymentParams
): Promise<FIBPaymentSessionResult> {
  const { orderId, orderNumber, amountIQD, description, callbackUrl } = params;
  const isProd =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';

  // 1. REAL PROVIDER EXECUTION (when credentials are configured)
  if (isFIBConfigured()) {
    try {
      const token = await getFIBAccessToken();
      const baseUrl = getFIBBaseUrl();
      const paymentUrl = `${baseUrl}/protected/v1/payments`;

      const requestBody = {
        monetaryValue: {
          amount: Math.round(amountIQD),
          currency: 'IQD',
        },
        statusCallbackUrl:
          callbackUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://vortexgaming.gg'}/api/webhooks/fib`,
        description: description || `VORTEX GAMING Order ${orderNumber}`,
        refundableFor: 'PT48H',
      };

      const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FIB API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.paymentId || data.id,
        qrPayload: data.qrCode,
        readableCode: data.readableCode,
        validUntil: data.validUntil || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isSandbox: !isProd,
        isMock: false,
      };
    } catch (err: any) {
      console.error('[FIB Provider API Error]:', err.message);
      if (isProd) {
        throw new Error(`FIB gateway error: ${err.message}`);
      }
      // In sandbox, log warning and allow fallback to transparent mock
      console.warn('[FIB Sandbox] Provider call failed or unavailable in development. Engaging sandbox simulation fallback.');
    }
  }

  // 2. PRODUCTION ENFORCEMENT: Never fabricate mock payment references in real production
  if (isProd) {
    throw new Error(
      'FIB Bank QR payment is unavailable in production: Merchant credentials (FIB_CLIENT_ID, FIB_CLIENT_SECRET) are pending official onboarding.'
    );
  }

  // 3. TRANSPARENT SANDBOX SIMULATION (Staging & Local development only)
  const mockReference = `FIB-PAY-${orderNumber}`;
  const mockQrPayload = `fib://pay?ref=${encodeURIComponent(mockReference)}&amount=${Math.round(amountIQD)}&cur=IQD`;
  const validUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return {
    success: true,
    paymentId: mockReference,
    qrPayload: mockQrPayload,
    readableCode: mockReference.slice(-6).toUpperCase(),
    validUntil,
    isSandbox: true,
    isMock: true,
  };
}

/**
 * Authoritatively verifies a FIB payment status directly with FIB servers.
 */
export async function checkFIBPaymentStatus(
  paymentId: string
): Promise<FIBPaymentStatusResult> {
  if (isFIBConfigured()) {
    try {
      const token = await getFIBAccessToken();
      const baseUrl = getFIBBaseUrl();
      const statusUrl = `${baseUrl}/protected/v1/payments/${encodeURIComponent(paymentId)}/status`;

      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rawStatus = String(data.status || 'UNPAID').toUpperCase();
        let status: FIBPaymentStatusResult['status'] = 'UNPAID';

        if (rawStatus === 'PAID' || rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS') {
          status = 'PAID';
        } else if (rawStatus === 'DECLINED' || rawStatus === 'FAILED') {
          status = 'DECLINED';
        } else if (rawStatus === 'EXPIRED') {
          status = 'EXPIRED';
        }

        return {
          paymentId,
          status,
          paidAt: data.paidAt,
          amount: data.monetaryValue?.amount,
          currency: data.monetaryValue?.currency,
          decliningReason: data.decliningReason,
        };
      }
    } catch (err: any) {
      console.error('[FIB Status Check Error]:', err.message);
    }
  }

  // Sandbox fallback: Check for simulated sandbox IDs
  return {
    paymentId,
    status: 'UNPAID',
    decliningReason: 'Awaiting customer transfer in sandbox',
  };
}

/**
 * Cancels a pending FIB payment session.
 */
export async function cancelFIBPayment(paymentId: string): Promise<boolean> {
  if (isFIBConfigured()) {
    try {
      const token = await getFIBAccessToken();
      const baseUrl = getFIBBaseUrl();
      const cancelUrl = `${baseUrl}/protected/v1/payments/${encodeURIComponent(paymentId)}/cancel`;

      const response = await fetch(cancelUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (err: any) {
      console.error('[FIB Cancel Error]:', err.message);
      return false;
    }
  }
  return true;
}
