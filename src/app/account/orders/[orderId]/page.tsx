'use client';

// VORTEX GAMING — Authoritative Order Details & Secure PIN-Protected Digital Delivery System
// Features: 4-stage stepper, timestamped event timeline, AES-256-GCM digital key vault,
// Protected Content security card, customer PIN verification modal (setup/verify/reset),
// unlocked delivery credentials for Game Accounts, Keys, Gift Cards, and Subscriptions.

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
  Unlock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  FileText,
  AlertTriangle,
  Zap,
  KeyRound,
  X,
  Mail,
  UserCheck,
  Globe,
} from 'lucide-react';
import { GAMES_CATALOG } from '@/lib/data/games';
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

interface DeliveryItemDetail {
  gameId: string;
  title: string;
  platform: string;
  productType: 'GAME' | 'DLC' | 'GIFT_CARD' | 'SUBSCRIPTION' | 'GAME_ACCOUNT' | 'TOP_UP' | 'ITUNES';
  plainTextKey?: string;
  redemptionCode?: string;
  activationGuide?: string;
  accountUsername?: string;
  accountPassword?: string;
  accountEmail?: string;
  emailPassword?: string;
  platformWebsite?: string;
  fulfillmentStatus?: string;
  notes?: string;
}

interface PinStatus {
  hasPin: boolean;
  isLocked: boolean;
  lockedUntil?: string | null;
  remainingAttempts: number;
}

function OrderDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawOrderId = params?.orderId as string;
  const token = searchParams.get('token');

  const { user, isAuthenticated, token: authToken } = useAuthStore();
  const { t, isRTL } = useTranslation();
  const { format } = useCurrencyStore();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delivery & Key State
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinAuthToken, setPinAuthToken] = useState<string | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryItemDetail[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  // Field toggles & copy notifications
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showEmailPasswordMap, setShowEmailPasswordMap] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // PIN Modal & Authentication State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'verify' | 'setup' | 'reset'>('verify');
  const [pinStatus, setPinStatus] = useState<PinStatus>({
    hasPin: false,
    isLocked: false,
    remainingAttempts: 5,
  });
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [accountPasswordInput, setAccountPasswordInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [unlockedExpiry, setUnlockedExpiry] = useState<number | null>(null);

  // Sandbox simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Fetch PIN Configuration Status from API
  const fetchPinStatus = async () => {
    if (!user?.id && !user?.email) return;
    try {
      const headers: Record<string, string> = {};
      if (user?.id) headers['x-user-id'] = user.id;
      if (user?.email) headers['x-user-email'] = user.email;

      const res = await fetch(`/api/account/pin/status?userId=${encodeURIComponent(user?.id || '')}`, {
        headers,
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setPinStatus({
          hasPin: Boolean(data.hasPin),
          isLocked: Boolean(data.isLocked),
          lockedUntil: data.lockedUntil,
          remainingAttempts: data.remainingAttempts ?? 5,
        });
      }
    } catch {
      // Background check failure graceful fallback
    }
  };

  // Fetch Order Data from Authoritative API
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
    fetchPinStatus();

    // Poll every 8s if pending payment to detect webhook completion
    const interval = setInterval(() => {
      if (order && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'PROCESSING')) {
        fetchOrder(false);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [rawOrderId, token, user?.id, user?.email]);

  // Session timer: automatically re-lock when short-lived PIN authorization expires
  useEffect(() => {
    if (!unlockedExpiry) return;
    const checkTimer = setInterval(() => {
      if (Date.now() >= unlockedExpiry) {
        handleLockContent();
      }
    }, 2000);
    return () => clearInterval(checkTimer);
  }, [unlockedExpiry]);

  // Open PIN Modal
  const handleOpenPinModal = () => {
    setPinError(null);
    setPinInput('');
    setPinConfirmInput('');
    setAccountPasswordInput('');

    if (!pinStatus.hasPin) {
      setPinModalMode('setup');
    } else {
      setPinModalMode('verify');
    }
    setIsPinModalOpen(true);
  };

  // Lock Content: Wipes sensitive credentials from memory
  const handleLockContent = () => {
    setIsPinVerified(false);
    setPinAuthToken(null);
    setDeliveryDetails([]);
    setRevealedKeys({});
    setUnlockedExpiry(null);
    setRevealError(null);
  };

  // Execute Decryption & Reveal with verified PIN Auth Token
  const executeRevealWithToken = async (activePinToken: string) => {
    if (!order) return;
    setIsRevealing(true);
    setRevealError(null);

    try {
      const url = `/api/orders/${encodeURIComponent(order.id)}/reveal-delivery`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-pin-auth-token': activePinToken,
      };
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
          pinAuthToken: activePinToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRevealError(data.error || 'Failed to decrypt delivery details.');
      } else {
        setIsPinVerified(true);
        if (data.deliveryDetails) {
          setDeliveryDetails(data.deliveryDetails);
        }
        if (data.keys) {
          const keyMap: Record<string, string> = {};
          data.keys.forEach((k: { gameId: string; plainTextKey: string }) => {
            keyMap[k.gameId] = k.plainTextKey;
          });
          setRevealedKeys(keyMap);
        }
        fetchOrder(false);
      }
    } catch (err: any) {
      setRevealError(err.message || 'Network error decrypting delivery credentials.');
    } finally {
      setIsRevealing(false);
    }
  };

  // Submit PIN Form in Modal
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSubmitting(true);

    try {
      if (pinModalMode === 'verify') {
        // Mode 1: Verify PIN
        if (!pinInput.trim()) {
          setPinError('Please enter your 4-6 digit security PIN.');
          setPinSubmitting(false);
          return;
        }

        const res = await fetch('/api/account/pin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'x-user-id': user.id } : {}),
            ...(user?.email ? { 'x-user-email': user.email } : {}),
          },
          body: JSON.stringify({
            userId: user?.id,
            userEmail: user?.email,
            orderId: order?.id,
            pin: pinInput.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          if (data.locked) {
            setPinError('Too many failed attempts. PIN verification is locked for 15 minutes.');
            setPinStatus((prev) => ({ ...prev, isLocked: true, remainingAttempts: 0 }));
          } else {
            const remaining = data.remainingAttempts ?? 0;
            setPinError(data.error || `Incorrect PIN. ${remaining} attempts remaining.`);
            setPinStatus((prev) => ({ ...prev, remainingAttempts: remaining }));
          }
          setPinSubmitting(false);
          return;
        }

        // Verification Succeeded!
        setPinAuthToken(data.pinAuthToken);
        setUnlockedExpiry(Date.now() + 10 * 60 * 1000);
        setIsPinModalOpen(false);
        setPinInput('');

        // Decrypt protected inventory on-demand
        await executeRevealWithToken(data.pinAuthToken);
      } else if (pinModalMode === 'setup' || pinModalMode === 'reset') {
        // Mode 2 & 3: Set Up or Reset PIN
        if (!/^\d{4,6}$/.test(pinInput.trim())) {
          setPinError('PIN must be 4 to 6 numeric digits.');
          setPinSubmitting(false);
          return;
        }
        if (pinInput.trim() !== pinConfirmInput.trim()) {
          setPinError('PINs do not match. Please re-enter.');
          setPinSubmitting(false);
          return;
        }
        if (pinModalMode === 'reset' && !accountPasswordInput.trim()) {
          setPinError('Your account password is required to verify identity.');
          setPinSubmitting(false);
          return;
        }

        const res = await fetch('/api/account/pin/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'x-user-id': user.id } : {}),
            ...(user?.email ? { 'x-user-email': user.email } : {}),
          },
          body: JSON.stringify({
            userId: user?.id,
            userEmail: user?.email,
            pin: pinInput.trim(),
            accountPassword: accountPasswordInput.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setPinError(data.error || 'Failed to configure security PIN.');
          setPinSubmitting(false);
          return;
        }

        // Successfully created/updated PIN!
        setPinStatus({
          hasPin: true,
          isLocked: false,
          remainingAttempts: 5,
        });

        // Switch immediately to verify or auto-unlock
        setPinModalMode('verify');
        setPinError(null);
        setPinConfirmInput('');
        setAccountPasswordInput('');

        // Auto-verify the newly created PIN
        const verifyRes = await fetch('/api/account/pin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'x-user-id': user.id } : {}),
          },
          body: JSON.stringify({
            userId: user?.id,
            orderId: order?.id,
            pin: pinInput.trim(),
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setPinAuthToken(verifyData.pinAuthToken);
          setUnlockedExpiry(Date.now() + 10 * 60 * 1000);
          setIsPinModalOpen(false);
          setPinInput('');
          await executeRevealWithToken(verifyData.pinAuthToken);
        }
      }
    } catch (err: any) {
      setPinError(err.message || 'Failed to complete PIN verification.');
    } finally {
      setPinSubmitting(false);
    }
  };

  // Copy to Clipboard with field key indicator
  const handleCopy = (textToCopy: string, fieldId: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
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

  // Sandbox simulation payment (only available in sandbox/staging mode)
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

  // Stepper Stage Status Calculations
  const stepper = useMemo(() => {
    if (!order) {
      return { stage1: 'PENDING', stage2: 'PENDING', stage3: 'PENDING', stage4: 'PENDING' };
    }

    const stage1 = 'COMPLETED';

    let stage2 = 'PENDING';
    if (order.paymentStatus === 'PAID') stage2 = 'COMPLETED';
    else if (order.paymentStatus === 'PROCESSING') stage2 = 'PROCESSING';
    else if (order.paymentStatus === 'FAILED') stage2 = 'FAILED';
    else if (order.paymentStatus === 'REFUNDED') stage2 = 'REFUNDED';

    let stage3 = 'PENDING';
    if (order.fulfillmentStatus === 'COMPLETED') stage3 = 'COMPLETED';
    else if (order.fulfillmentStatus === 'RESERVED') stage3 = 'PROCESSING';
    else if (order.fulfillmentStatus === 'FAILED') stage3 = 'FAILED';
    else if (order.fulfillmentStatus === 'REVOKED') stage3 = 'REVOKED';

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

  const totalItemCount = order.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const deliveredCount = order.canReveal ? totalItemCount : 0;

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

        {/* ── SANDBOX SIMULATION TESTING BAR ── */}
        {order.isSandbox && order.paymentStatus !== 'PAID' && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Zap className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Sandbox test order. You can simulate instant payment settlement.</span>
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

        {/* ── 1. ORDER STATUS PROGRESS TIMELINE ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#101018] border border-white/10 shadow-xl space-y-6">
          <div className="relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10 -z-0" />
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

        {/* ── 2. TOTAL DELIVERED COUNTER STRIP ── */}
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

        {/* ── 3. REAL TIMESTAMPED EVENT TIMELINE ── */}
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

        {/* ── 4. PURCHASED PRODUCTS & DIGITAL DELIVERY CARDS ── */}
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const gameCatalogItem = GAMES_CATALOG.find(
              (g) => g.id === item.gameId || g.slug === item.gameId
            );

            const isExpanded = !!expandedItems[item.gameId];
            const isDelivered = order.canReveal;
            const itemDelivery = deliveryDetails.find((d) => d.gameId === item.gameId);
            const rawKeyText = revealedKeys[item.gameId] || itemDelivery?.plainTextKey;
            const productType = itemDelivery?.productType || gameCatalogItem?.productType || 'GAME';

            return (
              <div
                key={item.gameId + idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#101018] border border-white/10 hover:border-[#0070f3]/40 transition-all shadow-xl space-y-4"
              >
                {/* Main Product Info Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
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

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="text-[#6b6b80]">
                          #{order.orderNumber} ×{item.quantity || 1}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#00d4ff] uppercase">
                          {productType}
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

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-base font-black text-white font-mono">
                      {format(
                        (item.unitPriceUSD || 0) * (item.quantity || 1),
                        (item.unitPriceIQD || 0) * (item.quantity || 1)
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/game/${gameCatalogItem?.slug || item.gameId}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>{t('orderDetails.rateNow')}</span>
                      </Link>

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
                    onClick={() => setExpandedItems((prev) => ({ ...prev, [item.gameId]: !prev[item.gameId] }))}
                    className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>
                      {isExpanded ? t('orderDetails.hideDetails') : t('orderDetails.viewDetails')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="text-[11px] text-[#6b6b80]">
                    {t('orderDetails.boughtBy')}{' '}
                    <span className="text-[#a0a0b8] font-medium">
                      {order.customerName || user?.displayName || 'Customer'}
                    </span>
                  </div>
                </div>

                {/* ── EXPANDABLE PRODUCT DETAILS & PIN-PROTECTED DIGITAL DELIVERY ── */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-4 text-xs">
                    
                    {/* CASE 1: UNPAID OR PENDING ORDER */}
                    {!isDelivered ? (
                      <div className="p-4 rounded-xl bg-[#12121a] border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-amber-300">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Locked • Delivery credentials will unlock automatically once payment is verified.</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold shrink-0">
                          Awaiting Payment
                        </span>
                      </div>
                    ) : !isPinVerified ? (
                      /* CASE 2: PAID ORDER BUT PIN NOT VERIFIED (PROTECTED CONTENT CARD) */
                      <div className="rounded-2xl bg-gradient-to-r from-[#0c1630] via-[#0b1633] to-[#070b18] border border-[#0070f3]/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-[#0070f3]/15 border border-[#0070f3]/40 flex items-center justify-center text-[#00d4ff] shadow-inner shadow-[#0070f3]/30 shrink-0">
                              <ShieldCheck className="w-6 h-6 text-[#00d4ff]" />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                                <span>Protected Content</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/30">
                                  AES-256-GCM
                                </span>
                              </h4>
                              <p className="text-xs text-[#8a99b5] mt-0.5">
                                Verify your PIN to view delivery details
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={handleOpenPinModal}
                            disabled={isRevealing}
                            className="px-6 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/40 transition-all hover:scale-105 active:scale-95 shrink-0"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>Verify PIN</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#6b6b80]">
                          <span>End-to-end encrypted delivery credentials</span>
                          <span className="flex items-center gap-1 text-[#00d4ff]/80 font-medium">
                            <Lock className="w-3 h-3" />
                            <span>PIN Protection Active</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* CASE 3: PIN VERIFIED — UNLOCKED DELIVERY DETAILS PANEL */
                      <div className="space-y-4">
                        {/* Unlocked Banner with Re-Lock Control */}
                        <div className="p-3.5 rounded-xl bg-[#0070f3]/10 border border-[#0070f3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>PIN Verified • Delivery Details Unlocked</span>
                            <span className="text-[10px] text-[#8a99b5] font-normal hidden sm:inline">
                              (Valid for active session)
                            </span>
                          </div>

                          <button
                            onClick={handleLockContent}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto border border-white/10"
                            title="Re-lock digital credentials"
                          >
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>Lock Content</span>
                          </button>
                        </div>

                        {/* SUB-CASE A: GAME ACCOUNT DELIVERY DETAILS */}
                        {productType === 'GAME_ACCOUNT' ? (
                          <div className="p-4 sm:p-5 rounded-xl bg-[#101424] border border-[#0070f3]/30 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                              <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-[#00d4ff]" />
                                <span>Verified Game Account Credentials</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Ready To Play
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Account Username */}
                              <div className="p-3 rounded-xl bg-[#0a0d18] border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                                  Account Username / ID
                                </span>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-white text-xs select-all truncate">
                                    {itemDelivery?.accountUsername || 'vtx_pilot_acc'}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(itemDelivery?.accountUsername || '', `user-${item.gameId}`)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-[#00d4ff] transition-colors"
                                    title="Copy Username"
                                  >
                                    {copiedField === `user-${item.gameId}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Account Password */}
                              <div className="p-3 rounded-xl bg-[#0a0d18] border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                                  Account Password
                                </span>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-white text-xs select-all truncate">
                                    {showPasswordMap[item.gameId]
                                      ? itemDelivery?.accountPassword || '••••••••'
                                      : '••••••••••••'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setShowPasswordMap((prev) => ({ ...prev, [item.gameId]: !prev[item.gameId] }))}
                                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#8a99b5] hover:text-white transition-colors"
                                      title={showPasswordMap[item.gameId] ? 'Hide' : 'Reveal'}
                                    >
                                      {showPasswordMap[item.gameId] ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleCopy(itemDelivery?.accountPassword || '', `pass-${item.gameId}`)}
                                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#00d4ff] transition-colors"
                                      title="Copy Password"
                                    >
                                      {copiedField === `pass-${item.gameId}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Associated Email (if included) */}
                              {itemDelivery?.accountEmail && (
                                <div className="p-3 rounded-xl bg-[#0a0d18] border border-white/5 space-y-1">
                                  <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                                    Associated Email
                                  </span>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-bold text-white text-xs select-all truncate">
                                      {itemDelivery.accountEmail}
                                    </span>
                                    <button
                                      onClick={() => handleCopy(itemDelivery.accountEmail || '', `email-${item.gameId}`)}
                                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#00d4ff] transition-colors"
                                      title="Copy Email"
                                    >
                                      {copiedField === `email-${item.gameId}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Email Access Credentials (if included) */}
                              {itemDelivery?.emailPassword && (
                                <div className="p-3 rounded-xl bg-[#0a0d18] border border-white/5 space-y-1">
                                  <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                                    Email Access Key
                                  </span>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-bold text-white text-xs select-all truncate">
                                      {showEmailPasswordMap[item.gameId]
                                        ? itemDelivery.emailPassword
                                        : '••••••••••••'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setShowEmailPasswordMap((prev) => ({ ...prev, [item.gameId]: !prev[item.gameId] }))}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#8a99b5] hover:text-white transition-colors"
                                        title={showEmailPasswordMap[item.gameId] ? 'Hide' : 'Reveal'}
                                      >
                                        {showEmailPasswordMap[item.gameId] ? (
                                          <EyeOff className="w-3.5 h-3.5" />
                                        ) : (
                                          <Eye className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleCopy(itemDelivery.emailPassword || '', `emailpass-${item.gameId}`)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#00d4ff] transition-colors"
                                        title="Copy Email Password"
                                      >
                                        {copiedField === `emailpass-${item.gameId}` ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Platform Login Link Button */}
                            {itemDelivery?.platformWebsite && (
                              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                                <span className="text-[11px] text-[#8a99b5]">
                                  Official Platform Authentication Portal:
                                </span>
                                <a
                                  href={itemDelivery.platformWebsite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                                >
                                  <span>Open Platform Website</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}

                            {/* Security Advisory */}
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                              <strong>Important Security Notice:</strong> For your security, log into the official platform immediately, update the account password, and configure your own two-factor authentication (2FA).
                            </div>
                          </div>
                        ) : (
                          /* SUB-CASE B: GAME KEYS, GIFT CARDS & SUBSCRIPTIONS */
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#14141e] border border-white/10">
                              <div>
                                <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                                  Digital Activation Key / Code
                                </span>
                                <div className="font-mono text-base font-black text-white tracking-widest break-all mt-1">
                                  {rawKeyText || '••••-••••-••••-••••'}
                                </div>
                              </div>

                              <button
                                onClick={() => rawKeyText && handleCopy(rawKeyText, `key-${item.gameId}`)}
                                disabled={!rawKeyText}
                                className="px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0070f3]/30 transition-all active:scale-95 shrink-0"
                              >
                                {copiedField === `key-${item.gameId}` ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>{t('orderDetails.copied')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span>{t('orderDetails.copyKey')}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Activation Instructions */}
                            {(itemDelivery?.activationGuide || gameCatalogItem?.activationGuide) && (
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                                  <FileText className="w-3.5 h-3.5 text-[#00d4ff]" />
                                  <span>{t('orderDetails.activationGuide')}</span>
                                </div>
                                <p className="text-[#a0a0b8] text-[11px] whitespace-pre-line leading-relaxed">
                                  {itemDelivery?.activationGuide || gameCatalogItem?.activationGuide}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {revealError && (
                      <div className="text-rose-400 text-xs font-semibold p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        {revealError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 5. ORDER SUMMARY SECTION ── */}
        <div className="p-6 rounded-2xl bg-[#101018] border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
            {t('orderDetails.orderSummary')}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0b8]">{t('orderDetails.subtotal')}</span>
              <span className="font-mono font-bold text-white">
                {format(order.total, order.total)}
              </span>
            </div>

            {order.discountApplied > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>{t('orderDetails.discount')}</span>
                <span className="font-mono font-bold">
                  -{format(order.discountApplied, order.discountApplied)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-sm font-black text-white">
              <span>{t('orderDetails.total')}</span>
              <span className="font-mono text-base text-[#00d4ff]">
                {format(order.total, order.total)}
              </span>
            </div>

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

      {/* ── SECURE PIN VERIFICATION & SETUP MODAL ── */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0c1224] border border-[#1b2a4a] p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0070f3]/20 border border-[#0070f3]/40 flex items-center justify-center text-[#00d4ff]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {pinModalMode === 'setup'
                      ? 'Set Up Security PIN'
                      : pinModalMode === 'reset'
                      ? 'Reset Security PIN'
                      : 'Enter Security PIN'}
                  </h3>
                  <p className="text-xs text-[#8a99b5]">
                    {pinModalMode === 'setup'
                      ? 'Protect your digital delivery credentials'
                      : pinModalMode === 'reset'
                      ? 'Verify password to update your PIN'
                      : 'Confirm identity to reveal delivery details'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-2 rounded-xl text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Active Lockout Notice */}
            {pinStatus.isLocked && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>PIN Verification Temporarily Locked</span>
                </div>
                <p className="text-[11px] text-rose-400/80">
                  Too many consecutive failed attempts. Please try again in 15 minutes.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              {/* Account Password input (Only in Reset mode) */}
              {pinModalMode === 'reset' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8a99b5]">
                    Account Password
                  </label>
                  <input
                    type="password"
                    value={accountPasswordInput}
                    onChange={(e) => setAccountPasswordInput(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full h-11 px-4 rounded-xl bg-[#141a2e] border border-[#1b2a4a] text-sm text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-all"
                    required
                  />
                </div>
              )}

              {/* Main PIN input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8a99b5] flex items-center justify-between">
                  <span>
                    {pinModalMode === 'setup'
                      ? 'New Security PIN (4-6 digits)'
                      : pinModalMode === 'reset'
                      ? 'New Security PIN (4-6 digits)'
                      : 'Security PIN'}
                  </span>
                  {pinModalMode === 'verify' && pinStatus.remainingAttempts < 5 && (
                    <span className="text-[11px] text-amber-400 font-mono">
                      {pinStatus.remainingAttempts} attempts left
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  disabled={pinStatus.isLocked}
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl bg-[#141a2e] border border-[#1b2a4a] text-center font-mono text-xl tracking-[0.5em] text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>

              {/* Confirm PIN input (In setup or reset mode) */}
              {(pinModalMode === 'setup' || pinModalMode === 'reset') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8a99b5]">
                    Confirm Security PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinConfirmInput}
                    onChange={(e) => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full h-12 px-4 rounded-xl bg-[#141a2e] border border-[#1b2a4a] text-center font-mono text-xl tracking-[0.5em] text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-all"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pinSubmitting || pinStatus.isLocked}
                  className="w-full h-11 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {pinSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    {pinModalMode === 'setup'
                      ? 'Create Security PIN'
                      : pinModalMode === 'reset'
                      ? 'Update Security PIN'
                      : 'Verify & Unlock Details'}
                  </span>
                </button>
              </div>

              {/* Forgot PIN / Reset Link */}
              {pinModalMode === 'verify' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinError(null);
                      setPinInput('');
                      setPinModalMode('reset');
                    }}
                    className="text-xs text-[#00d4ff] hover:underline font-semibold"
                  >
                    Forgot your PIN? Reset with account password
                  </button>
                </div>
              )}

              {pinModalMode === 'reset' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinError(null);
                      setPinInput('');
                      setPinModalMode('verify');
                    }}
                    className="text-xs text-[#8a99b5] hover:text-white hover:underline"
                  >
                    Back to PIN verification
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

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
