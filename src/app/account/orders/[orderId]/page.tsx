'use client';

// VORTEX GAMING — Authoritative Order Details & Payment Lifecycle Page
// Complete 4-stage stepper, real timestamped timeline, payment verification guard,
// cryptographic key delivery, product metadata, and server-authoritative summary.

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Headphones,
  Eye,
  EyeOff,
  Copy,
  Check,
  Package,
  Sparkles,
  Gamepad2,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  FileText,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { GAMES_CATALOG, type GameItem } from '@/lib/data/games';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useTranslation } from '@/lib/i18n';

interface OrderItemData {
  gameId: string;
  title: string;
  platform: string;
  quantity: number;
  unitPriceUSD: number;
  unitPriceIQD: number;
}

interface StatusHistoryEntry {
  statusType: 'PAYMENT' | 'FULFILLMENT';
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  paymentProvider: 'stripe' | 'fib' | 'fastpay' | 'qi_card' | string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: 'NOT_STARTED' | 'RESERVED' | 'COMPLETED' | 'FAILED' | 'REVOKED';
  currency: 'USD' | 'IQD' | string;
  total: number;
  discountApplied: number;
  isSandbox: boolean;
  items: OrderItemData[];
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  revokedAt?: string;
  refundReason?: string;
  allocatedKeysCount: number;
  hasKeysAllocated: boolean;
  canReveal: boolean;
  notice?: string;
}

function OrderDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawOrderId = params?.orderId as string;
  const token = searchParams.get('token');

  const { user, isAuthenticated, token: authToken } = useAuthStore();
  const { t, isRTL } = useTranslation();
  const { format, currency: activeCurrency } = useCurrencyStore();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Key reveal states
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Sandbox simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Fetch order data from authoritative API
  const fetchOrder = async (isInitial = false) => {
    if (!rawOrderId) {
      setError('Order ID missing from URL');
      setLoading(false);
      return;
    }

    try {
      const url = `/api/orders/${encodeURIComponent(rawOrderId)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const headers: Record<string, string> = {};
      if (token) headers['x-order-token'] = token;
      if (user?.id) headers['x-user-id'] = user.id;
      if (user?.email) headers['x-user-email'] = user.email;
      if (authToken) headers['authorization'] = `Bearer ${authToken}`;

      const res = await fetch(url, { headers, cache: 'no-store' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Unable to retrieve order details.');
      } else {
        setOrder(data.order);
        setError(null);
        // Expand first item by default
        if (isInitial && data.order?.items?.[0]) {
          setExpandedItems({ [data.order.items[0].gameId]: true });
        }
      }
    } catch (err: any) {
      if (isInitial) setError(err.message || 'Network error fetching order');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(true);
    // Poll every 8s if pending payment to detect webhook completion
    const interval = setInterval(() => {
      if (order && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'PROCESSING')) {
        fetchOrder(false);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [rawOrderId, token, user?.id, user?.email]);

  // Handle Reveal Key
  const handleRevealKeys = async () => {
    if (!order || !order.canReveal) return;
    setIsRevealing(true);
    setRevealError(null);

    try {
      const url = `/api/orders/${encodeURIComponent(order.id)}/reveal-key`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['x-order-token'] = token;
      if (user?.id) headers['x-user-id'] = user.id;
      if (user?.email) headers['x-user-email'] = user.email;
      if (authToken) headers['authorization'] = `Bearer ${authToken}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token,
          userId: user?.id,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRevealError(data.error || 'Failed to decrypt keys.');
      } else {
        const keyMap: Record<string, string> = {};
        data.keys?.forEach((k: { gameId: string; plainTextKey: string }) => {
          keyMap[k.gameId] = k.plainTextKey;
        });
        setRevealedKeys(keyMap);
        // Re-fetch to get updated timeline entry
        fetchOrder(false);
      }
    } catch (err: any) {
      setRevealError(err.message || 'Network error decrypting activation keys.');
    } finally {
      setIsRevealing(false);
    }
  };

  // Copy Key to Clipboard
  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Open Support Widget with Order Association
  const handleOpenSupport = (itemTitle?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vtx_open_support_widget', {
          detail: {
            orderNumber: order?.orderNumber,
            orderId: order?.id,
            subject: `Order Inquiry #${order?.orderNumber}${itemTitle ? ` - ${itemTitle}` : ''}`,
          },
        })
      );
    }
  };

  // Sandbox simulation payment (only available when isSandbox is true)
  const handleSimulatePayment = async () => {
    if (!order || !order.isSandbox) return;
    setIsSimulating(true);
    setSimMessage(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setSimMessage('Sandbox payment simulated! Order marked as PAID.');
        fetchOrder(false);
      } else {
        setSimMessage(`Simulation error: ${data.error}`);
      }
    } catch (err: any) {
      setSimMessage(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Toggle item details
  const toggleItemExpanded = (gameId: string) => {
    setExpandedItems((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  // Stepper Stage Status Calculations
  const stepper = useMemo(() => {
    if (!order) {
      return {
        stage1: 'PENDING',
        stage2: 'PENDING',
        stage3: 'PENDING',
        stage4: 'PENDING',
      };
    }

    // Stage 1: Order Placed
    const stage1 = 'COMPLETED';

    // Stage 2: Payment Confirmed
    let stage2 = 'PENDING';
    if (order.paymentStatus === 'PAID') stage2 = 'COMPLETED';
    else if (order.paymentStatus === 'PROCESSING') stage2 = 'PROCESSING';
    else if (order.paymentStatus === 'FAILED') stage2 = 'FAILED';
    else if (order.paymentStatus === 'REFUNDED') stage2 = 'REFUNDED';

    // Stage 3: Fulfillment Completed (Rule: only completed after actual allocation)
    let stage3 = 'PENDING';
    if (order.fulfillmentStatus === 'COMPLETED') stage3 = 'COMPLETED';
    else if (order.fulfillmentStatus === 'RESERVED') stage3 = 'PROCESSING';
    else if (order.fulfillmentStatus === 'FAILED') stage3 = 'FAILED';
    else if (order.fulfillmentStatus === 'REVOKED') stage3 = 'REVOKED';

    // Stage 4: Digital Product Delivered
    let stage4 = 'PENDING';
    if (order.fulfillmentStatus === 'COMPLETED' && order.hasKeysAllocated) {
      stage4 = 'COMPLETED';
    } else if (order.fulfillmentStatus === 'FAILED' || order.paymentStatus === 'FAILED') {
      stage4 = 'FAILED';
    }

    return { stage1, stage2, stage3, stage4 };
  }, [order]);

  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#07070a] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0070f3]/20 border border-[#0070f3]/40 flex items-center justify-center text-[#00d4ff] mx-auto animate-pulse">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-sm font-bold text-white">Loading Order Details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#07070a] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#101018] border border-white/10 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('orderDetails.orderNotFound')}</h2>
          <p className="text-xs text-[#a0a0b8] leading-relaxed">
            {error || t('orderDetails.orderNotFoundDesc')}
          </p>
          <div className="pt-2">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#0060df] text-white font-bold text-xs shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t('orderDetails.backToOrders')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Total quantity calculation
  const totalItemCount = order.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const deliveredCount = order.canReveal ? totalItemCount : 0;

  // Format creation date
  const createdDateFormatted = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="pt-24 pb-28 min-h-screen bg-[#07070a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ── TOP NAVIGATION: BACK TO ORDERS ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#a0a0b8] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>{t('orderDetails.backToOrders')}</span>
          </Link>

          {/* Sandbox Mode Badge */}
          {order.isSandbox && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('orderDetails.testOrderNotice')}</span>
            </span>
          )}
        </div>

        {/* ── ORDER HEADER BAR: Order number & Status Badges ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#101018] border border-white/10 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a0a0b8] font-medium">{t('orderDetails.orderNumber')}</span>
              <span className="text-lg font-black text-white font-mono tracking-wide">
                {order.orderNumber}
              </span>
            </div>
            <div className="text-xs text-[#6b6b80]">
              {t('orderDetails.placedOn')} {createdDateFormatted}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Payment Badge */}
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize border shadow-sm ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : order.paymentStatus === 'FAILED'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : order.paymentStatus === 'REFUNDED'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {order.paymentStatus === 'PAID'
                ? t('orderDetails.statusPaid')
                : order.paymentStatus === 'FAILED'
                ? t('orderDetails.statusFailed')
                : order.paymentStatus === 'REFUNDED'
                ? t('orderDetails.statusRefunded')
                : t('orderDetails.statusPending')}
            </span>

            {/* Fulfillment Badge */}
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize border shadow-sm ${
                order.fulfillmentStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : order.fulfillmentStatus === 'FAILED'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : order.fulfillmentStatus === 'REVOKED'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-white/5 text-[#a0a0b8] border-white/10'
              }`}
            >
              {order.fulfillmentStatus === 'COMPLETED'
                ? t('orderDetails.statusCompleted')
                : order.fulfillmentStatus === 'FAILED'
                ? t('orderDetails.statusFailed')
                : t('orderDetails.statusProcessing')}
            </span>
          </div>
        </div>

        {/* ── SANDBOX TESTING CONTROLS (Only visible in sandbox/staging mode) ── */}
        {order.isSandbox && order.paymentStatus !== 'PAID' && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Zap className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Sandbox order in test environment. You can simulate instant payment verification.
              </span>
            </div>
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              {isSimulating ? 'Simulating...' : 'Simulate Verified Payment'}
            </button>
          </div>
        )}
        {simMessage && (
          <div className="p-3 rounded-xl bg-white/5 text-xs text-white border border-white/10">
            {simMessage}
          </div>
        )}

        {/* ── 1. ORDER STATUS TIMELINE (4 Horizontal Stages matching Image 1) ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101018] border border-white/10 shadow-xl space-y-6">
          <div className="relative">
            {/* Horizontal Line Container */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10 -z-0" />
            
            {/* Active Highlight Line */}
            <div
              className={`absolute top-5 left-8 h-0.5 transition-all duration-500 -z-0 ${
                stepper.stage4 === 'COMPLETED'
                  ? 'right-8 bg-[#0070f3]'
                  : stepper.stage3 === 'COMPLETED'
                  ? 'w-2/3 bg-[#0070f3]'
                  : stepper.stage2 === 'COMPLETED'
                  ? 'w-1/3 bg-[#0070f3]'
                  : 'w-0 bg-[#0070f3]'
              }`}
            />

            {/* Stepper Steps Grid */}
            <div className="grid grid-cols-4 relative z-10 text-center">
              {/* Stage 1: Order Placed */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#0070f3] text-white flex items-center justify-center font-bold shadow-lg shadow-[#0070f3]/40 ring-4 ring-[#101018]">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="text-xs font-bold text-white">
                  {t('orderDetails.stageOrderPlaced')}
                </div>
              </div>

              {/* Stage 2: Payment Confirmed */}
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-[#101018] transition-all ${
                    stepper.stage2 === 'COMPLETED'
                      ? 'bg-[#0070f3] text-white shadow-[#0070f3]/40'
                      : stepper.stage2 === 'FAILED'
                      ? 'bg-rose-500 text-white shadow-rose-500/40'
                      : 'bg-[#1a1a24] text-[#6b6b80] border border-white/10'
                  }`}
                >
                  {stepper.stage2 === 'COMPLETED' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : stepper.stage2 === 'FAILED' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`text-xs font-bold ${
                    stepper.stage2 === 'COMPLETED'
                      ? 'text-white'
                      : stepper.stage2 === 'FAILED'
                      ? 'text-rose-400'
                      : 'text-[#6b6b80]'
                  }`}
                >
                  {stepper.stage2 === 'FAILED'
                    ? t('orderDetails.statusFailed')
                    : t('orderDetails.stagePaymentConfirmed')}
                </div>
              </div>

              {/* Stage 3: Fulfillment Completed */}
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-[#101018] transition-all ${
                    stepper.stage3 === 'COMPLETED'
                      ? 'bg-[#0070f3] text-white shadow-[#0070f3]/40'
                      : stepper.stage3 === 'FAILED'
                      ? 'bg-rose-500 text-white shadow-rose-500/40'
                      : 'bg-[#1a1a24] text-[#6b6b80] border border-white/10'
                  }`}
                >
                  {stepper.stage3 === 'COMPLETED' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : stepper.stage3 === 'FAILED' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`text-xs font-bold ${
                    stepper.stage3 === 'COMPLETED'
                      ? 'text-white'
                      : stepper.stage3 === 'FAILED'
                      ? 'text-rose-400'
                      : 'text-[#6b6b80]'
                  }`}
                >
                  {t('orderDetails.stageFulfillmentCompleted')}
                </div>
              </div>

              {/* Stage 4: Digital Product Delivered */}
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-[#101018] transition-all ${
                    stepper.stage4 === 'COMPLETED'
                      ? 'bg-[#0070f3] text-white shadow-[#0070f3]/40'
                      : 'bg-[#1a1a24] text-[#6b6b80] border border-white/10'
                  }`}
                >
                  {stepper.stage4 === 'COMPLETED' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`text-xs font-bold ${
                    stepper.stage4 === 'COMPLETED' ? 'text-white' : 'text-[#6b6b80]'
                  }`}
                >
                  {t('orderDetails.stageDelivered')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. TOTAL DELIVERED COUNTER STRIP (Matching Image 1) ── */}
        <div className="p-4 rounded-2xl bg-[#101018] border border-white/10 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#00d4ff]" />
            <span>
              {t('orderDetails.totalDelivered')}{' '}
              <span className={deliveredCount > 0 ? 'text-emerald-400' : 'text-[#a0a0b8]'}>
                {deliveredCount}/{totalItemCount}
              </span>
            </span>
          </div>

          <div className="text-[11px] text-[#a0a0b8]">
            {order.canReveal ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready in Vault</span>
              </span>
            ) : order.paymentStatus === 'FAILED' ? (
              <span className="text-rose-400">Payment Failed</span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('orderDetails.awaitingPayment')}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── 3. REAL TIMESTAMPED EVENT TIMELINE (Matching Image 1) ── */}
        <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 shadow-xl space-y-3">
          <div className="text-xs font-black uppercase text-[#a0a0b8] tracking-wider border-b border-white/5 pb-2">
            {t('orderDetails.timelineHistory')}
          </div>

          <div className="space-y-2.5 text-xs">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              order.statusHistory.map((event, idx) => {
                const eventDate = new Date(event.timestamp).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                // Format label & color
                let label = event.reason || event.to;
                let colorClass = 'text-[#a0a0b8]';

                if (event.to === 'PAID') {
                  label = t('orderDetails.stagePaymentConfirmed');
                  colorClass = 'text-emerald-400 font-bold';
                } else if (event.to === 'COMPLETED' || event.to === 'DELIVERED') {
                  label =
                    event.to === 'DELIVERED'
                      ? t('orderDetails.stageDelivered')
                      : t('orderDetails.stageFulfillmentCompleted');
                  colorClass = 'text-emerald-400 font-bold';
                } else if (event.to === 'PENDING') {
                  label = t('orderDetails.stageOrderPlaced');
                  colorClass = 'text-white font-medium';
                } else if (event.to === 'PROCESSING') {
                  label = t('orderDetails.statusProcessing');
                  colorClass = 'text-cyan-400 font-medium';
                } else if (event.to === 'FAILED') {
                  label = event.reason || t('orderDetails.statusFailed');
                  colorClass = 'text-rose-400 font-bold';
                } else if (event.to === 'REFUNDED') {
                  label = t('orderDetails.statusRefunded');
                  colorClass = 'text-purple-400 font-bold';
                }

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5 last:border-0"
                  >
                    <span className="text-[11px] text-[#6b6b80] font-mono">{eventDate}</span>
                    <span className={colorClass}>{label}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-[#6b6b80] text-xs">
                {createdDateFormatted} — {t('orderDetails.stageOrderPlaced')}
              </div>
            )}
          </div>
        </div>

        {/* ── 4. PURCHASED PRODUCT ITEM CARDS (Matching Image 1 & 2) ── */}
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const gameCatalogItem = GAMES_CATALOG.find(
              (g) => g.id === item.gameId || g.slug === item.gameId
            );

            const isExpanded = !!expandedItems[item.gameId];
            const revealedKeyText = revealedKeys[item.gameId];
            const isDelivered = order.canReveal;

            return (
              <div
                key={item.gameId + idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#101018] border border-white/10 hover:border-[#0070f3]/40 transition-all shadow-xl space-y-4"
              >
                {/* Main Product Info Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Artwork / Banner Box */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-gradient-to-tr from-slate-900 to-black border border-white/10">
                      <div
                        className={`absolute inset-0 bg-gradient-to-tr ${
                          gameCatalogItem?.bannerGradient || 'from-blue-600 to-purple-900'
                        }`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white/40">
                        <Gamepad2 className="w-7 h-7" />
                      </div>
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate">{item.title}</h3>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="text-[#6b6b80]">
                          #{order.orderNumber} ×{item.quantity || 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#00d4ff] uppercase">
                          {gameCatalogItem?.productType || 'DIGITAL'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-bold">
                          {gameCatalogItem?.activationRegion || 'GLOBAL'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0b8]">
                          {item.platform || gameCatalogItem?.platformName || 'PC'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons (Matching Image 1) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-base font-black text-white font-mono">
                      {format(
                        (item.unitPriceUSD || 0) * (item.quantity || 1),
                        (item.unitPriceIQD || 0) * (item.quantity || 1)
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rate / Review Guide Button */}
                      <Link
                        href={`/game/${gameCatalogItem?.slug || item.gameId}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>{t('orderDetails.rateNow')}</span>
                      </Link>

                      {/* Customer Support Button (Opens VORTEX support widget) */}
                      <button
                        onClick={() => handleOpenSupport(item.title)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{t('orderDetails.customerSupport')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* View Details Toggle */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => toggleItemExpanded(item.gameId)}
                    className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>
                      {isExpanded
                        ? t('orderDetails.hideDetails')
                        : t('orderDetails.viewDetails')}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="text-[11px] text-[#6b6b80]">
                    {t('orderDetails.boughtBy')}{' '}
                    <span className="text-[#a0a0b8] font-medium">
                      {order.customerName || user?.displayName || 'Customer'}
                    </span>
                  </div>
                </div>

                {/* ── EXPANDABLE PRODUCT DETAILS & DIGITAL DELIVERY AREA ── */}
                {isExpanded && (
                  <div className="p-4 rounded-xl bg-[#0a0a0f] border border-white/10 space-y-4 text-xs">
                    {/* Delivery Status and Key Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#a0a0b8] uppercase tracking-wider text-[11px]">
                          Digital Product License & Credentials
                        </span>

                        {isDelivered ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Verified Delivery</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked • Payment Required</span>
                          </span>
                        )}
                      </div>

                      {/* Key Box with Reveal & Copy */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#14141e] border border-white/10">
                        <div className="font-mono text-sm font-black text-white tracking-widest break-all">
                          {isDelivered && revealedKeyText
                            ? revealedKeyText
                            : '••••-••••-••••-••••'}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Reveal Key Button */}
                          <button
                            onClick={handleRevealKeys}
                            disabled={!isDelivered || isRevealing}
                            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                              !isDelivered
                                ? 'bg-white/5 text-[#555] cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/15 text-white'
                            }`}
                          >
                            {isRevealing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : revealedKeyText ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {revealedKeyText
                                ? 'Delivered'
                                : t('orderDetails.revealKey')}
                            </span>
                          </button>

                          {/* Copy Key Button */}
                          <button
                            onClick={() => revealedKeyText && handleCopyKey(revealedKeyText)}
                            disabled={!isDelivered || !revealedKeyText}
                            className={`px-3 py-2 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all ${
                              !isDelivered || !revealedKeyText
                                ? 'bg-white/5 text-[#555] cursor-not-allowed'
                                : 'bg-[#0070f3] hover:bg-[#0060df] text-white shadow-md active:scale-95'
                            }`}
                          >
                            {copiedKey === revealedKeyText ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t('orderDetails.copied')}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{t('orderDetails.copyKey')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {revealError && (
                        <div className="text-rose-400 text-[11px] font-semibold">
                          {revealError}
                        </div>
                      )}
                    </div>

                    {/* Activation Guide Instructions */}
                    {gameCatalogItem?.activationGuide && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-[#00d4ff]" />
                          <span>{t('orderDetails.activationGuide')}</span>
                        </div>
                        <p className="text-[#a0a0b8] text-[11px] whitespace-pre-line leading-relaxed">
                          {gameCatalogItem.activationGuide}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 5. ORDER SUMMARY SECTION (Matching Image 2) ── */}
        <div className="p-6 rounded-2xl bg-[#101018] border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
            {t('orderDetails.orderSummary')}
          </h3>

          <div className="space-y-3 text-xs">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0b8]">{t('orderDetails.subtotal')}</span>
              <span className="font-mono font-bold text-white">
                {format(order.total, order.total)}
              </span>
            </div>

            {/* Discount if applicable */}
            {order.discountApplied > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>{t('orderDetails.discount')}</span>
                <span className="font-mono font-bold">
                  -{format(order.discountApplied, order.discountApplied)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-sm font-black text-white">
              <span>{t('orderDetails.total')}</span>
              <span className="font-mono text-base text-[#00d4ff]">
                {format(order.total, order.total)}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[#a0a0b8]">{t('orderDetails.paymentMethod')}</span>
              <span className="font-mono font-bold text-purple-400 uppercase">
                {order.paymentProvider === 'stripe'
                  ? 'STRIPE_CHECKOUT'
                  : order.paymentProvider === 'fib'
                  ? 'FIB_BANK'
                  : order.paymentProvider === 'fastpay'
                  ? 'FASTPAY'
                  : order.paymentProvider === 'qi_card'
                  ? 'QI_CARD'
                  : order.paymentProvider.toUpperCase()}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0b8]">{t('orderDetails.paymentStatus')}</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  order.paymentStatus === 'PAID'
                    ? 'text-emerald-400'
                    : order.paymentStatus === 'FAILED'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {order.paymentStatus === 'PAID' && <Check className="w-3.5 h-3.5" />}
                <span>
                  {order.paymentStatus === 'PAID'
                    ? t('orderDetails.statusPaid')
                    : order.paymentStatus === 'FAILED'
                    ? t('orderDetails.statusFailed')
                    : t('orderDetails.statusPending')}
                </span>
              </span>
            </div>

            {/* Fulfillment Status */}
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0b8]">{t('orderDetails.fulfillmentStatus')}</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  order.fulfillmentStatus === 'COMPLETED'
                    ? 'text-emerald-400'
                    : order.fulfillmentStatus === 'FAILED'
                    ? 'text-rose-400'
                    : 'text-[#a0a0b8]'
                }`}
              >
                {order.fulfillmentStatus === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                <span>
                  {order.fulfillmentStatus === 'COMPLETED'
                    ? t('orderDetails.statusCompleted')
                    : t('orderDetails.statusProcessing')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t('orderDetails.backToOrders')}</span>
          </Link>

          <button
            onClick={() => handleOpenSupport()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Headphones className="w-4 h-4" />
            <span>{t('orderDetails.customerSupport')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-24 min-h-screen bg-[#07070a] flex items-center justify-center text-white text-xs">
          Loading Order Details...
        </div>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}
