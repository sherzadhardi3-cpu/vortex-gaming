'use client';

// VORTEX GAMING — Server-Authoritative Order Confirmation & Digital Key Delivery
// Strictly enforces payment verification before revealing game keys.
// Dynamically reads order state from /api/orders/[id].
// Rejects client URL parameter tampering and displays clear sandbox notices.

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface OrderItem {
  gameId: string;
  title: string;
  platform: string;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  paymentProvider: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: 'NOT_STARTED' | 'RESERVED' | 'COMPLETED' | 'FAILED' | 'REVOKED';
  currency: string;
  total: number;
  isSandbox: boolean;
  items: OrderItem[];
  createdAt: string;
  hasKeysAllocated: boolean;
  canReveal: boolean;
  notice?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const fallbackOrderNumber = searchParams.get('orderNumber') || 'VX-CONFIRMED';
  const provider = searchParams.get('provider') || 'Gateway';

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Key reveal state
  const [revealedKeys, setRevealedKeys] = useState<Array<{ gameId: string; plainTextKey: string }> | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKeyText, setShowKeyText] = useState(false);

  // Sandbox simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  // Fetch order status from authoritative server API
  const fetchOrderStatus = async (isInitial = false) => {
    if (!orderId) {
      setFetchError('No order identifier provided in URL.');
      setLoading(false);
      return;
    }

    try {
      const url = `/api/orders/${encodeURIComponent(orderId)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFetchError(data.error || 'Failed to fetch order status.');
      } else {
        setOrder(data.order);
        setFetchError(null);
      }
    } catch (err: any) {
      if (isInitial) {
        setFetchError(err.message || 'Network error fetching order details.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus(true);
  }, [orderId, token]);

  // Polling while payment or fulfillment is in progress
  useEffect(() => {
    if (!order) return;
    const isPending =
      order.paymentStatus === 'PENDING' ||
      order.paymentStatus === 'PROCESSING' ||
      (order.paymentStatus === 'PAID' && order.fulfillmentStatus !== 'COMPLETED' && order.fulfillmentStatus !== 'FAILED');

    if (!isPending) return;

    const interval = setInterval(() => {
      fetchOrderStatus(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.paymentStatus, order?.fulfillmentStatus]);

  // Handle Reveal Key Request (Server Authoritative)
  const handleRevealKeys = async () => {
    if (!orderId) return;
    setIsRevealing(true);
    setRevealError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/reveal-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Key reveal authorization failed.');
      }

      setRevealedKeys(data.keys);
      setShowKeyText(true);
    } catch (err: any) {
      setRevealError(err.message || 'Failed to reveal activation key.');
    } finally {
      setIsRevealing(false);
    }
  };

  // Handle Sandbox Payment Simulation
  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setIsSimulating(true);
    setSimError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment simulation failed.');
      }

      // Re-fetch order status immediately
      await fetchOrderStatus(false);
    } catch (err: any) {
      setSimError(err.message || 'Simulation error.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopy = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-12 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading Authoritative Order Details...</h2>
        <p className="text-xs text-[#a0a0b8]">Verifying transaction security with payment server.</p>
      </div>
    );
  }

  // Error / Unauthorized State
  if (fetchError || !order) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#12121a] border border-red-500/20 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Order Access Prohibited</h1>
          <p className="text-sm text-red-300 max-w-md mx-auto">
            {fetchError || 'Unable to load order. Verification token may be invalid or expired.'}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider inline-block transition-all"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  // Determine current display mode based on State Machine
  const isPaid = order.paymentStatus === 'PAID';
  const isFulfilled = order.fulfillmentStatus === 'COMPLETED';
  const isFailed = order.paymentStatus === 'FAILED' || order.fulfillmentStatus === 'FAILED';
  const isRefunded = order.paymentStatus === 'REFUNDED' || order.fulfillmentStatus === 'REVOKED';
  const isProcessing = order.paymentStatus === 'PROCESSING';
  const isPending = order.paymentStatus === 'PENDING';
  const isVerifiedPreparing = isPaid && !isFulfilled && !isFailed && !isRefunded;

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl space-y-8">
      {/* 1. Header Banner & Dynamic Status Badge */}
      <div className="text-center space-y-4">
        {/* Status Badge */}
        {isFulfilled && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            <CheckCircle className="w-4 h-4" />
            <span>
              {order.isSandbox ? 'TEST ORDER • KEY READY' : 'PAYMENT VERIFIED • FULFILLMENT COMPLETED'}
            </span>
          </div>
        )}

        {isVerifiedPreparing && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>PAYMENT VERIFIED — PREPARING YOUR KEY</span>
          </div>
        )}

        {isProcessing && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>PAYMENT PROCESSING</span>
          </div>
        )}

        {isPending && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
            <Clock className="w-4 h-4" />
            <span>AWAITING PAYMENT CONFIRMATION</span>
          </div>
        )}

        {isFailed && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>PAYMENT FAILED — NO KEY DELIVERED</span>
          </div>
        )}

        {isRefunded && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono font-bold text-purple-400 tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>ORDER REFUNDED — KEY REVOKED</span>
          </div>
        )}

        {/* Dynamic Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isFulfilled && 'Your Game Key Is Ready'}
          {isVerifiedPreparing && 'Payment Verified — Preparing Your Key'}
          {isProcessing && 'Payment Processing'}
          {isPending && 'Awaiting Payment Confirmation'}
          {isFailed && 'Payment Failed — No Key Delivered'}
          {isRefunded && 'Order Refunded — Key Access Revoked'}
        </h1>

        <p className="text-xs sm:text-sm text-[#a0a0b8] max-w-lg mx-auto">
          {isFulfilled && (order.isSandbox
            ? 'Your sandbox test license has been issued. Keys can be revealed below.'
            : 'Payment confirmed by payment authority. Your genuine license has been allocated.')}
          {isVerifiedPreparing && 'Your payment was successfully confirmed. The inventory vault is allocating your digital activation key.'}
          {isProcessing && 'We are currently communicating with your payment provider to verify settlement. Please hold on.'}
          {isPending && 'We have not yet received payment confirmation from the provider. Digital keys will not be released until payment is fully settled.'}
          {isFailed && 'Your transaction could not be verified or was declined. No keys were issued and your card was not charged.'}
          {isRefunded && 'This order was refunded. Digital activation keys associated with this transaction have been revoked in the vault.'}
        </p>

        <div className="text-xs text-[#a0a0b8] font-mono pt-1">
          Order Number: <span className="text-white font-bold">{order.orderNumber}</span> • Total:{' '}
          <span className="text-[#00d4ff] font-bold">
            {order.currency === 'IQD'
              ? `${order.total.toLocaleString()} IQD`
              : `$${(order.total / 100).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* 2. Sandbox Warning Alert (Mandatory Requirement) */}
      {order.isSandbox && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider text-amber-400">
              TEST ORDER — NO REAL PAYMENT
            </div>
            <p className="leading-relaxed text-amber-200/90">
              This order was placed in Sandbox / Staging testing mode. No live payment was charged, and real game inventory was not released. Dummy test activation keys are used for validation.
            </p>
          </div>
        </div>
      )}

      {/* 3. Pending Order Sandbox Simulator (For Developer & Tester Validation) */}
      {isPending && order.isSandbox && (
        <div className="p-5 rounded-2xl bg-[#0a0a0f] border border-[#00d4ff]/30 space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#00d4ff]" />
            <span>Sandbox Verification Helper</span>
          </div>
          <p className="text-xs text-[#a0a0b8] leading-relaxed">
            In staging mode, you can authoritatively simulate the payment webhook callback to test the transition from <code>PENDING</code> to <code>PAID</code> and verify atomic key delivery.
          </p>
          {simError && <p className="text-xs text-red-400 font-semibold">{simError}</p>}
          <button
            onClick={handleSimulatePayment}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Authoritative Settlement...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simulate Verified Payment in Sandbox</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4. Digital Activation Key Vault Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-inner space-y-5 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {isFulfilled ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-[#a0a0b8]" />
            )}
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Digital Activation Keys
            </span>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
              isFulfilled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isFailed
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isFulfilled ? 'DELIVERED & UNLOCKED' : isFailed ? 'PAYMENT UNVERIFIED' : 'AWAITING PAYMENT'}
          </span>
        </div>

        {/* Items and Key Boxes */}
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const revealedKeyObj = revealedKeys?.find((k) => k.gameId === item.gameId) || revealedKeys?.[idx];
            const currentPlainText = revealedKeyObj?.plainTextKey;

            return (
              <div
                key={`${item.gameId}-${idx}`}
                className="p-4 rounded-xl bg-[#12121a] border border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <div className="text-[11px] text-[#a0a0b8]">
                      Platform: <span className="text-white font-medium">{item.platform}</span> • Quantity:{' '}
                      <span className="text-white font-medium">{item.quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Key Reveal & Copy Area */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10">
                  <div className="font-mono text-sm sm:text-base font-black tracking-wider text-white pl-2 break-all">
                    {isFulfilled && revealedKeys && currentPlainText && showKeyText
                      ? currentPlainText
                      : isFulfilled && revealedKeys && currentPlainText && !showKeyText
                      ? '••••-••••-••••-••••-••••'
                      : isFulfilled
                      ? '••••-••••-••••-••••-••••'
                      : '••••-••••-••••-••••-••••'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reveal Button (STRICTLY DISABLED unless isFulfilled) */}
                    <button
                      onClick={revealedKeys ? () => setShowKeyText(!showKeyText) : handleRevealKeys}
                      disabled={!isFulfilled || isRevealing}
                      title={!isFulfilled ? 'Activation key locked until payment confirmation' : undefined}
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        !isFulfilled
                          ? 'bg-white/5 text-[#555] cursor-not-allowed border border-white/5'
                          : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                      }`}
                    >
                      {isRevealing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Decrypting...</span>
                        </>
                      ) : showKeyText && revealedKeys ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Key</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal Key</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button (STRICTLY DISABLED unless isFulfilled AND revealed) */}
                    <button
                      onClick={() => currentPlainText && handleCopy(currentPlainText)}
                      disabled={!isFulfilled || !revealedKeys || !currentPlainText}
                      title={!isFulfilled ? 'Copy disabled until key is unlocked' : undefined}
                      className={`px-4 py-2 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                        !isFulfilled || !revealedKeys || !currentPlainText
                          ? 'bg-white/5 text-[#555] cursor-not-allowed border border-white/5'
                          : 'bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black active:scale-95 shadow-md shadow-[#00d4ff]/20'
                      }`}
                    >
                      {copiedKey === currentPlainText ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {revealError && (
          <p className="text-xs text-red-400 font-semibold">{revealError}</p>
        )}

        <div className="pt-2 border-t border-white/5 text-[11px] text-[#a0a0b8] leading-relaxed space-y-1">
          <p>
            {isFulfilled ? (
              <>
                All activation keys are encrypted at rest with AES-256-GCM. Permanent records are stored in your{' '}
                <Link href="/account" className="text-[#00d4ff] underline font-semibold">
                  VORTEX Account Vault
                </Link>.
              </>
            ) : (
              <>
                Activation keys are held in secure escrow. They will automatically be delivered to your account vault once the payment transaction is authoritatively verified by the network.
              </>
            )}
          </p>
        </div>
      </div>

      {/* 5. Navigation Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        {isFailed ? (
          <>
            <Link
              href="/checkout"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider transition-all text-center"
            >
              Return to Checkout & Retry
            </Link>
            <Link
              href="/account?tab=support"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              Contact Support
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              Go to Account Vault
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider transition-all text-center"
            >
              Continue Browsing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-12 rounded-3xl bg-[#12121a] border border-white/10 text-center py-20 text-white">
              Loading confirmation...
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
