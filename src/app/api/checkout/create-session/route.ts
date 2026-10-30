// VORTEX GAMING — Server-Authoritative Checkout & Payment Session API
// Recalculates all prices, applies coupons server-side, validates stock, returns payment session

import { NextRequest, NextResponse } from 'next/server';
import { generateOrderNumber } from '@/lib/utils';
import { getStripeClient, isStripeLiveMode } from '@/lib/stripe';
import { calculateAuthoritativeTotals } from '@/lib/checkout/authoritative-calculator';
import { createAuthoritativeOrder } from '@/lib/orders/order-store';

// Server-side authoritative promo codes
const VALID_PROMOS: Record<string, number> = {
  VORTEX10: 10,
  LAUNCH20: 20,
  KURDISTAN15: 15,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, currency, paymentProvider, customerEmail, customerName, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Checkout requires at least one game item.' },
        { status: 400 }
      );
    }

    if (!customerEmail || typeof customerEmail !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid delivery email is mandatory.' },
        { status: 400 }
      );
    }

    // SERVER-AUTHORITATIVE RECALCULATION
    // We NEVER trust amounts or totals submitted by the browser
    const {
      verifiedItems: orderItems,
      discountPercent,
      totalUSD,
      totalIQD,
      displayCurrency,
      exchangeRate,
      convertedTotal,
      authoritativeTotal,
    } = calculateAuthoritativeTotals(items, currency, couponCode);

    const orderNumber = generateOrderNumber();
    const provider = ['stripe', 'fib', 'fastpay', 'qi_card'].includes(paymentProvider)
      ? (paymentProvider as 'stripe' | 'fib' | 'fastpay' | 'qi_card')
      : 'stripe';

    const isIraqiProvider = ['fib', 'fastpay', 'qi_card'].includes(provider);

    // Create authoritative order in PENDING status with ZERO game keys exposed
    const order = createAuthoritativeOrder({
      orderNumber,
      customerEmail,
      customerId: body.customerId || null,
      customerName: customerName || '',
      items: orderItems.map((item) => ({
        gameId: item.gameId,
        title: item.title,
        platform: item.platform,
        quantity: item.quantity,
        unitPriceUSD: item.unitPriceUSD,
        unitPriceIQD: item.unitPriceIQD,
      })),
      total: authoritativeTotal,
      currency: displayCurrency,
      displayCurrency,
      exchangeRate,
      convertedTotal,
      rateTimestamp: new Date().toISOString(),
      discountApplied: discountPercent,
      paymentProvider: provider,
    });

    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // If Stripe is requested and client is configured with real/test keys
    if (provider === 'stripe') {
      const stripe = getStripeClient();
      if (stripe) {
        try {
          const lineItems = orderItems.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.title,
                description: `Platform: ${item.platform} • Digital Key License`,
              },
              unit_amount: Math.round(item.unitPriceUSD * 100 * (1 - discountPercent / 100)),
            },
            quantity: item.quantity,
          }));

          const sessionParams: any = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customerEmail,
            client_reference_id: order.id,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: customerName || '',
              customerEmail,
              discountApplied: discountPercent.toString(),
            },
            success_url: `${origin}/checkout/success?orderId=${order.id}&token=${order.orderAccessToken}`,
            cancel_url: `${origin}/checkout?canceled=true&orderId=${order.id}&token=${order.orderAccessToken}`,
          };

          const session = await stripe.checkout.sessions.create(sessionParams);

          return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderAccessToken: order.orderAccessToken,
            provider: 'stripe',
            isSandbox: order.isSandbox,
            stripeSessionId: session.id,
            checkoutUrl: session.url,
            currency: order.currency,
            authoritativeTotal: order.total,
            discountApplied: discountPercent,
            customerEmail: order.customerEmail,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            status: 'AWAITING_PAYMENT',
          });
        } catch (stripeErr: any) {
          console.warn('Stripe checkout session creation failed, falling back to secure sandbox session:', stripeErr.message);
        }
      }
    }

    // Default or Iraqi providers in Sandbox/Merchant Onboarding mode
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderAccessToken: order.orderAccessToken,
      provider: provider,
      isSandbox: order.isSandbox,
      currency: order.currency,
      authoritativeTotal: order.total,
      discountApplied: discountPercent,
      customerEmail: order.customerEmail,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      status: isIraqiProvider ? 'SANDBOX_PENDING_MERCHANT_ONBOARDING' : 'AWAITING_PAYMENT',
      notice: isIraqiProvider
        ? 'Sandbox testing mode. Real transactions disabled until official merchant onboarding is completed.'
        : 'Sandbox order created in PENDING status. Awaiting payment confirmation before digital key allocation.',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal checkout error' },
      { status: 500 }
    );
  }
}
