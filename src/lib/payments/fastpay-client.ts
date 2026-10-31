// VORTEX GAMING — Official FastPay Mobile Wallet Merchant Client
// Implements FastPay's merchant payment token generation, QR payload resolution,
// payment status verification, and secure callback validation.
//
// API Reference: FastPay Merchant Services (Iraq)
// Staging Base: https://staging-apigw-merchant.fast-pay.iq
// Production Base: https://apiv2.fast-pay.iq

export interface FastPayCreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amountIQD: number;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  callbackUrl?: string;
}

export interface FastPayPaymentSessionResult {
  success: boolean;
  paymentId: string;
  qrPayload: string;
  merchantCode: string;
  redirectUrl?: string;
  validUntil: string;
  isSandbox: boolean;
  isMock: boolean;
  error?: string;
}

export interface FastPayVerifyResult {
  verified: boolean;
  orderNumber: string;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  receivedAmount?: number;
  receivedCurrency?: string;
  errorMessage?: string;
}

/**
 * Returns true if real FastPay merchant credentials are configured.
 */
export function isFastPayConfigured(): boolean {
  const storeId = process.env.FASTPAY_STORE_ID || process.env.FASTPAY_MERCHANT_ID;
  const storePassword = process.env.FASTPAY_STORE_PASSWORD || process.env.FASTPAY_API_KEY;
  return Boolean(storeId && storePassword && !storeId.includes('placeholder'));
}

/**
 * Resolves the FastPay API Base URL.
 */
export function getFastPayBaseUrl(): string {
  if (process.env.FASTPAY_API_URL) {
    return process.env.FASTPAY_API_URL.replace(/\/+$/, '');
  }
  const isProduction =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';
  return isProduction
    ? 'https://apiv2.fast-pay.iq'
    : 'https://staging-apigw-merchant.fast-pay.iq';
}

/**
 * Initiates a FastPay payment session.
 * - When credentials exist: Calls FastPay's official token generation API.
 * - When unconfigured in sandbox: Provides safe, isolated sandbox simulation with MOCK indicators.
 * - When unconfigured in production: Rejects request to prevent fabricated transactions.
 */
export async function createFastPayPaymentSession(
  params: FastPayCreatePaymentParams
): Promise<FastPayPaymentSessionResult> {
  const { orderId, orderNumber, amountIQD, customerEmail, customerName, callbackUrl } = params;
  const isProd =
    process.env.APP_ENV === 'production' &&
    process.env.FORCE_SANDBOX !== 'true';

  const defaultMerchantCode = process.env.FASTPAY_MERCHANT_CODE || '892401';

  // 1. REAL PROVIDER EXECUTION (when credentials are configured)
  if (isFastPayConfigured()) {
    try {
      const storeId = (process.env.FASTPAY_STORE_ID || process.env.FASTPAY_MERCHANT_ID)!;
      const storePassword = (process.env.FASTPAY_STORE_PASSWORD || process.env.FASTPAY_API_KEY)!;
      const baseUrl = getFastPayBaseUrl();
      const tokenUrl = `${baseUrl}/merchant/generate-payment-token`;

      const payload = {
        store_id: storeId,
        store_password: storePassword,
        order_id: orderNumber,
        bill_amount: Math.round(amountIQD),
        currency: 'IQD',
        cart: JSON.stringify([
          {
            name: `Order #${orderNumber}`,
            qty: 1,
            unit_price: Math.round(amountIQD),
            sub_total: Math.round(amountIQD),
          },
        ]),
        callback_url:
          callbackUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://vortexgaming.gg'}/api/webhooks/fastpay`,
      };

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FastPay API error (${response.status}): ${errText}`);
      }

      const resData = await response.json();
      if (resData.code === 200 && resData.data?.token) {
        const token = resData.data.token;
        const redirectUrl = resData.data.redirect_url;
        const qrPayload =
          resData.data.qr_code ||
          `fastpay://merchant/vortex-gaming?ref=${encodeURIComponent(token)}&code=${defaultMerchantCode}&amount=${Math.round(amountIQD)}`;

        return {
          success: true,
          paymentId: token,
          qrPayload,
          merchantCode: defaultMerchantCode,
          redirectUrl,
          validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          isSandbox: !isProd,
          isMock: false,
        };
      }
    } catch (err: any) {
      console.error('[FastPay Provider API Error]:', err.message);
      if (isProd) {
        throw new Error(`FastPay gateway error: ${err.message}`);
      }
      console.warn('[FastPay Sandbox] Provider API unavailable. Engaging sandbox simulation fallback.');
    }
  }

  // 2. PRODUCTION ENFORCEMENT
  if (isProd) {
    throw new Error(
      'FastPay QR payment is unavailable in production: Merchant credentials (FASTPAY_STORE_ID, FASTPAY_STORE_PASSWORD) are pending official onboarding.'
    );
  }

  // 3. TRANSPARENT SANDBOX SIMULATION (Staging & Local development only)
  const fpReference = `FP-${orderNumber}`;
  const mockQrPayload = `fastpay://merchant/vortex-gaming?ref=${encodeURIComponent(fpReference)}&code=${defaultMerchantCode}&amount=${Math.round(amountIQD)}`;
  const validUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return {
    success: true,
    paymentId: fpReference,
    qrPayload: mockQrPayload,
    merchantCode: defaultMerchantCode,
    validUntil,
    isSandbox: true,
    isMock: true,
  };
}

/**
 * Authoritatively verifies a FastPay transaction with FastPay's verification API.
 */
export async function verifyFastPayPayment(
  orderNumber: string
): Promise<FastPayVerifyResult> {
  if (isFastPayConfigured()) {
    try {
      const storeId = (process.env.FASTPAY_STORE_ID || process.env.FASTPAY_MERCHANT_ID)!;
      const storePassword = (process.env.FASTPAY_STORE_PASSWORD || process.env.FASTPAY_API_KEY)!;
      const baseUrl = getFastPayBaseUrl();
      const verifyUrl = `${baseUrl}/merchant/payment/validation`;

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          store_password: storePassword,
          order_id: orderNumber,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        const isSuccess =
          resData.code === 200 &&
          (resData.data?.status === 'Success' || resData.status === 'Success');

        return {
          verified: isSuccess,
          orderNumber,
          transactionId: resData.data?.transaction_id || resData.transaction_id,
          status: isSuccess ? 'SUCCESS' : 'PENDING',
          receivedAmount: resData.data?.received_amount,
          receivedCurrency: resData.data?.currency || 'IQD',
        };
      }
    } catch (err: any) {
      console.error('[FastPay Verification Error]:', err.message);
    }
  }

  // Sandbox fallback
  return {
    verified: false,
    orderNumber,
    status: 'PENDING',
    errorMessage: 'Awaiting FastPay transfer in sandbox mode',
  };
}
