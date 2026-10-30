'use client';

// VORTEX GAMING — Multi-Provider Secure Checkout
// Integrates FIB, FastPay, Qi Card, Visa / Mastercard (Stripe)
// Strictly follows payment security: server-recalculated totals, sandbox status labeling, idempotent order keys

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

type PaymentMethodId = 'stripe' | 'fib' | 'fastpay' | 'qi_card';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalUSD, getTotalIQD, clearCart, couponCode, discountPercent } = useCartStore();
  const { currency, format } = useCurrencyStore();
  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('stripe');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <Link href="/" className="mt-4 inline-block text-xs text-[#00d4ff] underline">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerEmail.trim()) {
      setErrorMessage('Please provide a valid delivery email.');
      return;
    }

    setIsProcessing(true);

    try {
      // Call server-side checkout endpoint for authoritative amount calculation
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.game.id,
            slug: i.game.slug,
            quantity: i.quantity,
          })),
          currency,
          paymentProvider: paymentMethod,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || 'Gamer Customer',
          couponCode: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Checkout initiation failed. Please try again.');
      }

      clearCart();

      // If official provider checkout URL is available (e.g. Stripe Checkout)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Otherwise proceed to authoritative order status screen
      const tokenQuery = data.orderAccessToken ? `&token=${encodeURIComponent(data.orderAccessToken)}` : '';
      router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderId)}&orderNumber=${encodeURIComponent(data.orderNumber)}&provider=${encodeURIComponent(paymentMethod)}${tokenQuery}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12121a] border border-white/10 text-xs font-semibold text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>256-BIT TLS ENCRYPTED CHECKOUT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            CONFIRM & ACTIVATE KEYS
          </h1>
          <p className="text-xs text-[#a0a0b8]">
            Authoritative amount is calculated server-side. Payment and key fulfillment follow strict idempotent state separation.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Delivery & Payment Provider Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Delivery Details */}
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00d4ff] text-black text-xs font-black flex items-center justify-center">
                  1
                </span>
                <span>Digital Delivery Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#a0a0b8] font-semibold">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#a0a0b8] font-semibold">Delivery Email (Important)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your-email@domain.com"
                    className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#6b6b80]">
                Keys are automatically delivered to your VORTEX account and sent to this email address.
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00d4ff] text-black text-xs font-black flex items-center justify-center">
                  2
                </span>
                <span>Select Payment Gateway</span>
              </h3>

              {/* Provider Options */}
              <div className="space-y-3">
                
                {/* Stripe / Visa / Mastercard */}
                <label
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'stripe'
                      ? 'bg-blue-500/10 border-[#00d4ff] text-white shadow-lg shadow-[#00d4ff]/10'
                      : 'bg-white/5 border-white/10 text-[#a0a0b8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="text-[#00d4ff]"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Visa / Mastercard</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-[#00d4ff] font-bold">
                          PCI DSS Gateway
                        </span>
                      </div>
                      <div className="text-xs text-[#a0a0b8] mt-0.5">
                        International debit and credit cards with 3D Secure verification.
                      </div>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </label>

                {/* FIB (First Iraqi Bank) */}
                <label
                  onClick={() => setPaymentMethod('fib')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'fib'
                      ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-400/10'
                      : 'bg-white/5 border-white/10 text-[#a0a0b8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'fib'}
                      onChange={() => setPaymentMethod('fib')}
                      className="text-emerald-400"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>FIB (First Iraqi Bank)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          SANDBOX TEST MODE
                        </span>
                      </div>
                      <div className="text-xs text-[#a0a0b8] mt-0.5">
                        Direct app payment simulation. Real transactions disabled pending official merchant integration.
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-400 font-mono">FIB</span>
                </label>

                {/* FastPay */}
                <label
                  onClick={() => setPaymentMethod('fastpay')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'fastpay'
                      ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                      : 'bg-white/5 border-white/10 text-[#a0a0b8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'fastpay'}
                      onChange={() => setPaymentMethod('fastpay')}
                      className="text-amber-400"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>FastPay Mobile Wallet</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                          SANDBOX TEST MODE
                        </span>
                      </div>
                      <div className="text-xs text-[#a0a0b8] mt-0.5">
                        Mobile wallet deduction simulation. Real charges disabled pending FastPay merchant onboarding.
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-400 font-mono">FastPay</span>
                </label>

                {/* Qi Card */}
                <label
                  onClick={() => setPaymentMethod('qi_card')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'qi_card'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-400/10'
                      : 'bg-white/5 border-white/10 text-[#a0a0b8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'qi_card'}
                      onChange={() => setPaymentMethod('qi_card')}
                      className="text-cyan-400"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Qi Card (Electronic National Card)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                          SANDBOX TEST MODE
                        </span>
                      </div>
                      <div className="text-xs text-[#a0a0b8] mt-0.5">
                        National payment gateway simulation. Real charges disabled pending Qi Card merchant registration.
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-cyan-400 font-mono">Qi</span>
                </label>
              </div>

              {/* Sandbox Notice Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Sandbox Testing Mode Active:</span> All 4 adapters operate in secure sandbox mode. Real production merchant API keys can be entered into the Admin Dashboard before going live.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Pay CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-6 sticky top-28">
              
              <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
                Order Review ({items.length} titles)
              </h3>

              {/* Items List Snapshot */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2 divide-y divide-white/5 text-xs">
                {items.map(({ game, quantity }) => (
                  <div key={game.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white line-clamp-1">{game.title}</div>
                      <div className="text-[10px] text-[#6b6b80]">
                        Qty: {quantity} • {game.platformName}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white">
                      {format(game.priceUSD * quantity, game.priceIQD * quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#a0a0b8]">
                  <span>Currency Lock:</span>
                  <span className="font-bold text-white">{currency}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Discount Voucher:</span>
                    <span className="font-bold">-{discountPercent}%</span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Final Total:</span>
                  <span className="text-2xl font-black text-[#00d4ff] font-mono">
                    {format(getTotalUSD(), getTotalIQD())}
                  </span>
                </div>

                {currency !== 'USD' && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-[#a0a0b8] space-y-1">
                    <div className="flex items-center justify-between text-[#00d4ff] font-semibold">
                      <span>Base Canonical Amount:</span>
                      <span className="font-mono">${(getTotalUSD() / 100).toFixed(2)} USD</span>
                    </div>
                    <p className="text-[10px] text-[#6b6b80] leading-relaxed">
                      Converted total ({currency}) is an estimate using official central bank benchmark reference rates.
                    </p>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-black text-sm uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing & Allocating Keys...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Complete Payment</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-[#6b6b80] leading-relaxed">
                By clicking Authorize, you acknowledge that digital activation keys will be allocated immediately and revealed in your vault upon payment confirmation.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
