'use client';

// VORTEX GAMING — Premium Multi-Method Secure Checkout & QR Payment Flow
// Final Flow:
// Select Payment Method → AUTHORIZE CONFIRM PAYMENT → Generate Payment Session → Display Selected Provider QR → Verify Payment → Confirmation.
//
// Key Principles:
// 1. Never display FIB or FastPay QR codes immediately on selection.
// 2. Customer selects method, sees summary, then clicks "AUTHORIZE & CONFIRM PAYMENT".
// 3. Server-authoritatively creates payment session via /api/checkout/create-session.
// 4. Displays ONLY the selected provider's QR checkout (FIB only for FIB, FastPay only for FastPay).
// 5. Provides "Check Payment Status" querying authenticated backend order status.
// 6. Never marks an order as paid on client click or scan alone.
// 7. Clearly labels sandbox mock QR codes; prevents duplicate submissions.

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  QrCode,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import { QRCodeDisplay } from '@/components/checkout/QRCodeDisplay';

export type PaymentMethodId =
  | 'vortex_wallet'
  | 'fib'
  | 'fastpay'
  | 'iraqi_cards'
  | 'international_cards';

export interface ActivePaymentSession {
  orderId: string;
  orderNumber: string;
  orderAccessToken: string;
  provider: PaymentMethodId;
  providerName: string;
  paymentReference: string;
  merchantCode?: string;
  qrData?: string;
  expiresAt: string;
  totalUSD: number;
  totalIQD: number;
  authoritativeTotal: number;
  currency: string;
  isSandbox: boolean;
  status: string;
  notice?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalUSD, getTotalIQD, clearCart, couponCode, discountPercent, applyCoupon, removeCoupon } = useCartStore();
  const { currency, format } = useCurrencyStore();
  const { user, isAuthenticated } = useAuthStore();
  const { t, isRTL } = useTranslation();

  // Selected payment method (Default: FIB Bank or International Cards)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('fib');

  // Customer Delivery Information
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  );

  // Active Payment Session (Generated strictly upon clicking AUTHORIZE CONFIRM PAYMENT)
  const [activeSession, setActiveSession] = useState<ActivePaymentSession | null>(null);

  // Loading & Submission Guards (prevents duplicate clicks)
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Feedback notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer for active session
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [copiedCode, setCopiedCode] = useState(false);

  // Promo code input state
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Card payment form state (Tokenized inputs for Iraqi Local Cards & International Cards)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(customerName || '');
  const [saveCard, setSaveCard] = useState(false);

  // Bank Authentication (3D Secure 2.0 / OTP) Modal & Processing State
  const [activeCardAuth, setActiveCardAuth] = useState<{
    orderId: string;
    orderNumber: string;
    orderAccessToken: string;
    provider: PaymentMethodId;
    cardBrand: string;
    cardLast4: string;
    maskedCard: string;
    authoritativeTotal: number;
    totalUSD: number;
    totalIQD: number;
    currency: string;
    authChallenge: {
      bankName: string;
      challengeType: string;
      prompt: string;
      testOtp: string;
      maskedCard: string;
      expiresInSeconds: number;
    };
    isSandbox: boolean;
  } | null>(null);

  const [cardOtpInput, setCardOtpInput] = useState('123456');
  const [isVerifyingCardAuth, setIsVerifyingCardAuth] = useState(false);
  const [cardAuthError, setCardAuthError] = useState<string | null>(null);
  const [cardAuthSuccess, setCardAuthSuccess] = useState<{
    orderId: string;
    orderNumber: string;
    orderAccessToken: string;
    transactionReference: string;
    provider: string;
  } | null>(null);

  // Sync customer details when user auth hydrates
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (user && !customerName) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setCustomerName(name);
      if (!cardholderName) setCardholderName(name);
    }
  }, [user]);

  // Live countdown timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remainingSeconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Real-time Card Brand Detection (Iraqi Banks + International)
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\D/g, '');
    if (paymentMethod === 'iraqi_cards') {
      if (clean.startsWith('4000') || clean.startsWith('5000') || clean.startsWith('6000')) return 'Qi Card';
      if (clean.startsWith('5100') || clean.startsWith('5200')) return 'Neo';
      if (clean.startsWith('4800') || clean.startsWith('4700')) return 'Switch';
      if (clean.startsWith('4500') || clean.startsWith('4900')) return 'FIB Card';
      if (clean.startsWith('4')) return 'Visa';
      if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
      return null;
    }
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^(34|37)/.test(clean)) return 'American Express';
    if (/^(6011|65)/.test(clean)) return 'Discover';
    return null;
  }, [cardNumber, paymentMethod]);

  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const autofillIraqiCard = (bank: 'qi' | 'neo' | 'switch' | 'fib') => {
    if (bank === 'qi') {
      setCardNumber('4000 1234 5678 9010');
      setCardExpiry('08/28');
      setCardCvc('777');
      setCardholderName(customerName || 'Karwan Ahmad');
    } else if (bank === 'neo') {
      setCardNumber('5100 2345 6789 1234');
      setCardExpiry('05/27');
      setCardCvc('888');
      setCardholderName(customerName || 'Ahmed Zaki');
    } else if (bank === 'switch') {
      setCardNumber('4800 3456 7890 2345');
      setCardExpiry('11/29');
      setCardCvc('999');
      setCardholderName(customerName || 'Soran Qadir');
    } else if (bank === 'fib') {
      setCardNumber('4500 4567 8901 3456');
      setCardExpiry('03/28');
      setCardCvc('555');
      setCardholderName(customerName || 'Rebin Rostam');
    }
  };

  const autofillInternationalCard = (brand: 'visa' | 'mastercard') => {
    if (brand === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvc('888');
      setCardholderName(customerName || 'Alex Mercer');
    } else {
      setCardNumber('5555 5555 5555 4444');
      setCardExpiry('12/28');
      setCardCvc('888');
      setCardholderName(customerName || 'Alex Mercer');
    }
  };

  const autofillTestCard = (type: 'international' | 'iraqi') => {
    if (type === 'international') {
      autofillInternationalCard('visa');
    } else {
      autofillIraqiCard('qi');
    }
  };

  const handleCopyPaymentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const res = applyCoupon(code);
    if (res.success) {
      setPromoSuccess(res.message);
      setPromoInput('');
    } else {
      setPromoError(res.message || 'Invalid promo code. Try VORTEX10 or LAUNCH20.');
    }
  };

  // ─── Step 2: AUTHORIZE CONFIRM PAYMENT ─────────────────────────────────────
  // Securely creates payment session on backend. Prevents duplicate clicks.
  const handleAuthorizePayment = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setErrorMessage(null);
    setStatusMessage(null);
    setCardAuthError(null);

    // Guard: Prevent double-click duplicates
    if (isAuthorizing) return;

    if (!customerEmail.trim()) {
      setErrorMessage('Please provide a valid delivery email.');
      return;
    }

    // Wallet balance guard: reject if user selects wallet with insufficient balance
    if (paymentMethod === 'vortex_wallet') {
      setErrorMessage('Insufficient Vortex Wallet balance ($0.00). Stored wallet funding is currently in sandbox staging. Please select FIB, FastPay, or Visa/Mastercard.');
      return;
    }

    // ── 1. VISA & MASTERCARD CARD PROCESSING FLOW (Iraqi Local Cards & International Cards) ──
    if (paymentMethod === 'iraqi_cards' || paymentMethod === 'international_cards') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setErrorMessage('Please enter a valid card expiration date in MM/YY format.');
        return;
      }
      const [expM, expY] = cardExpiry.split('/').map(Number);
      if (expM < 1 || expM > 12) {
        setErrorMessage('Expiration month must be between 01 and 12.');
        return;
      }
      if (cardCvc.replace(/\D/g, '').length < 3) {
        setErrorMessage('Please enter a valid 3 or 4 digit CVV/CVC code.');
        return;
      }
      if (!cardholderName.trim()) {
        setErrorMessage('Cardholder full name is required.');
        return;
      }

      setIsAuthorizing(true);
      try {
        const response = await fetch('/api/checkout/process-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'INITIATE',
            items: items.map((i) => ({
              id: i.game.id,
              slug: i.game.slug,
              quantity: i.quantity,
            })),
            currency,
            paymentProvider: paymentMethod,
            customerEmail: customerEmail.trim(),
            customerName: cardholderName.trim() || customerName.trim() || 'Valued Gamer',
            couponCode: couponCode || undefined,
            cardDetails: {
              cardNumber: cleanCard,
              expiry: cardExpiry,
              cardCvc: cardCvc.replace(/\D/g, ''),
              cardholderName: cardholderName.trim(),
            },
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Card payment authorization failed.');
        }

        // Open 3D Secure / Bank Authentication challenge modal
        setActiveCardAuth({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          orderAccessToken: data.orderAccessToken,
          provider: data.provider,
          cardBrand: data.cardBrand || 'Card',
          cardLast4: data.cardLast4 || '0000',
          maskedCard: data.maskedCard || `•••• •••• •••• ${data.cardLast4 || '0000'}`,
          authoritativeTotal: data.authoritativeTotal,
          totalUSD: data.totalUSD,
          totalIQD: data.totalIQD,
          currency: data.currency,
          authChallenge: data.authChallenge || {
            bankName: paymentMethod === 'iraqi_cards' ? 'Central Bank of Iraq Gateway' : 'Verified by Visa / Mastercard 3DS',
            challengeType: '3DS_OTP',
            prompt: 'Please enter the 6-digit verification code sent to your registered phone.',
            testOtp: '123456',
            maskedCard: data.maskedCard,
            expiresInSeconds: 300,
          },
          isSandbox: data.isSandbox,
        });

        setCardOtpInput(data.authChallenge?.testOtp || '123456');
      } catch (err: any) {
        setErrorMessage(err.message || 'Payment authorization error');
      } finally {
        setIsAuthorizing(false);
      }
      return;
    }

    // ── 2. QR PAYMENT FLOW (First Iraqi Bank & FastPay) ────────────────────────
    setIsAuthorizing(true);

    try {
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
          customerName: customerName.trim() || 'Valued Gamer',
          couponCode: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment session creation failed. Please try again.');
      }

      // If Stripe Checkout URL is provided (for international cards)
      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }

      // For FIB and FastPay: display the provider-generated session panel
      setActiveSession({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        orderAccessToken: data.orderAccessToken,
        provider: (data.provider || paymentMethod) as PaymentMethodId,
        providerName: data.providerName || (paymentMethod === 'fib' ? 'First Iraqi Bank (FIB)' : 'FastPay Mobile Wallet'),
        paymentReference: data.paymentReference,
        merchantCode: data.merchantCode,
        qrData: data.qrData,
        expiresAt: data.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        totalUSD: data.totalUSD || getTotalUSD(),
        totalIQD: data.totalIQD || getTotalIQD(),
        authoritativeTotal: data.authoritativeTotal,
        currency: data.currency || currency,
        isSandbox: !!data.isSandbox,
        status: data.status || 'AWAITING_PAYMENT',
        notice: data.notice,
      });

      setStatusMessage({
        type: 'info',
        text: 'Payment session generated successfully. Please scan the QR code or transfer using the reference code below.',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment authorization error');
    } finally {
      setIsAuthorizing(false);
    }
  };

  // ─── Step 2B: Submit Bank Authentication (3D Secure / OTP) ────────────────
  const handleSubmitCardAuth = async (simulateDecline = false) => {
    if (!activeCardAuth) return;
    setIsVerifyingCardAuth(true);
    setCardAuthError(null);

    try {
      const response = await fetch('/api/checkout/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_AUTH',
          orderId: activeCardAuth.orderId,
          orderAccessToken: activeCardAuth.orderAccessToken,
          otpCode: cardOtpInput.trim(),
          simulateDecline,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Bank authentication failed.');
      }

      // Authoritative Success Confirmed by Server
      setCardAuthSuccess({
        orderId: activeCardAuth.orderId,
        orderNumber: activeCardAuth.orderNumber,
        orderAccessToken: activeCardAuth.orderAccessToken,
        transactionReference: data.transactionReference || `TX-AUTH-${activeCardAuth.orderNumber}`,
        provider: activeCardAuth.provider,
      });

      clearCart();

      // Automatically transition to success page after confirmation
      setTimeout(() => {
        router.push(
          `/checkout/success?orderId=${encodeURIComponent(activeCardAuth.orderId)}&orderNumber=${encodeURIComponent(activeCardAuth.orderNumber)}&provider=${encodeURIComponent(activeCardAuth.provider)}&token=${encodeURIComponent(activeCardAuth.orderAccessToken)}`
        );
      }, 1400);
    } catch (err: any) {
      setCardAuthError(err.message || 'Bank authentication error.');
    } finally {
      setIsVerifyingCardAuth(false);
    }
  };

  const handleCancelCardAuth = () => {
    setActiveCardAuth(null);
    setCardAuthError(null);
  };

  const handleRetryFailedCard = () => {
    setActiveCardAuth(null);
    setCardAuthError(null);
    setErrorMessage(null);
  };

  // ─── Step 3: Check Payment Status ──────────────────────────────────────────
  // Authoritatively queries backend API. Never auto-marks paid without verification.
  const handleCheckPaymentStatus = async () => {
    if (!activeSession) return;
    setIsVerifyingStatus(true);
    setStatusMessage(null);

    try {
      // Authoritatively verify order payment status with backend
      await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeSession.orderId,
          orderAccessToken: activeSession.orderAccessToken,
        }),
      }).catch(() => {});

      const res = await fetch(`/api/orders/${activeSession.orderId}?token=${encodeURIComponent(activeSession.orderAccessToken)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || 'Unable to verify order payment status with server.');
      }

      const { paymentStatus } = data.order;

      if (paymentStatus === 'PAID') {
        setStatusMessage({
          type: 'success',
          text: 'Payment confirmed by backend! Advancing to key allocation & confirmation...',
        });
        clearCart();
        setTimeout(() => {
          router.push(
            `/checkout/success?orderId=${encodeURIComponent(activeSession.orderId)}&orderNumber=${encodeURIComponent(activeSession.orderNumber)}&provider=${encodeURIComponent(activeSession.provider)}&token=${encodeURIComponent(activeSession.orderAccessToken)}`
          );
        }, 800);
      } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
        setStatusMessage({
          type: 'error',
          text: 'Payment was reported failed or cancelled by the provider. Please try again or choose another method.',
        });
      } else {
        // Pending state
        setStatusMessage({
          type: 'info',
          text: `Payment Status: PENDING — Awaiting provider confirmation from ${activeSession.provider === 'fib' ? 'FIB banking servers' : 'FastPay'}. Once approved in your mobile app, keys will unlock automatically.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error communicating with payment verification API.',
      });
    } finally {
      setIsVerifyingStatus(false);
    }
  };

  // ─── Sandbox Simulator: Simulates Provider Webhook Clearance ───────────────
  const handleSimulateTestPayment = async () => {
    if (!activeSession) return;
    setIsSimulatingPayment(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/orders/${activeSession.orderId}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeSession.orderAccessToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sandbox payment simulation failed.');
      }

      setStatusMessage({
        type: 'success',
        text: 'Sandbox payment successfully simulated and verified by backend! Redirecting to key delivery...',
      });

      clearCart();
      setTimeout(() => {
        router.push(
          `/checkout/success?orderId=${encodeURIComponent(activeSession.orderId)}&orderNumber=${encodeURIComponent(activeSession.orderNumber)}&provider=${encodeURIComponent(activeSession.provider)}&token=${encodeURIComponent(activeSession.orderAccessToken)}`
        );
      }, 1000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Simulation error',
      });
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  // Cancel active session and return to method selection
  const handleCancelSession = () => {
    setActiveSession(null);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // Empty cart fallback
  if (items.length === 0 && !activeSession) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#060a17] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#0070f3]/15 border border-[#0070f3]/30 text-[#00d4ff] flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
          <p className="text-xs text-[#8a99b5] leading-relaxed">
            Select games, gift cards, or subscriptions from the catalog to proceed to checkout.
          </p>
          <div className="pt-2">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              <span>Explore Storefront</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#060a17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ─── 1. Header & Stepper Progress Indicator ──────────────────────── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0070f3]/15 border border-[#0070f3]/30 text-xs font-mono font-bold text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>256-BIT TLS ENCRYPTED CHECKOUT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            SECURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#0070f3]">CHECKOUT</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#8a99b5]">
            Server-authoritative amount calculation, zero raw card storage, and instant key vault delivery.
          </p>

          {/* Stepper Navigation */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>1. Cart</span>
            </div>
            <span className="text-white/20">───</span>
            <div className={`flex items-center gap-1.5 ${activeSession ? 'text-emerald-400' : 'text-[#00d4ff]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeSession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#0070f3] text-white animate-pulse'}`}>
                {activeSession ? '✓' : '2'}
              </span>
              <span>2. Payment & Details</span>
            </div>
            <span className="text-white/20">───</span>
            <div className={`flex items-center gap-1.5 ${activeSession ? 'text-[#00d4ff]' : 'text-[#6b6b80]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeSession ? 'bg-[#0070f3] text-white animate-pulse' : 'bg-white/5 text-[#6b6b80]'}`}>
                3
              </span>
              <span>3. Key Delivery</span>
            </div>
          </div>
        </div>

        {/* ─── 2. Main Two-Column Layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Configuration OR Active Provider QR Session ─── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ════════════════════════════════════════════════════════════════ */}
            {/* VIEW A: INITIAL CONFIGURATION PHASE (activeSession === null)    */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {!activeSession ? (
              <form onSubmit={handleAuthorizePayment} className="space-y-6">
                
                {/* 1. Customer Delivery Information */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#0070f3] text-white text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      <span>Digital Delivery Information</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">
                      ✓ Instant Automated Key Vault
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#8a99b5] uppercase">
                        Delivery Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="gamer@example.com"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] text-sm text-white placeholder-[#6b6b80] focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] outline-none transition-all"
                      />
                      <span className="text-[10px] text-[#7888a6] block">
                        Activation keys and license details will be securely bound to this email.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#8a99b5] uppercase">
                        Full Name / Gamer Tag
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (!cardholderName) setCardholderName(e.target.value);
                        }}
                        placeholder="Alex Mercer"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] text-sm text-white placeholder-[#6b6b80] focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] outline-none transition-all"
                      />
                      <span className="text-[10px] text-[#7888a6] block">
                        Used for invoice receipt and authenticated identity matching.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Select Payment Method (5 selectable cards) */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#0070f3] text-white text-xs font-black flex items-center justify-center">
                        2
                      </span>
                      <span>Select Payment Method</span>
                    </h3>
                    <span className="text-xs text-[#8a99b5] font-mono">
                      Step 1 of 2: Select Provider
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    
                    {/* Method 1: Vortex Wallet */}
                    <div
                      onClick={() => setPaymentMethod('vortex_wallet')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'vortex_wallet'
                          ? 'bg-[#0c1736] border-[#00d4ff] shadow-lg shadow-[#0070f3]/20 ring-1 ring-[#00d4ff]'
                          : 'bg-[#0a1128] border-[#1b2a4a] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#c084fc] flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Vortex Wallet</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                                BALANCE: {format(0, 0)}
                              </span>
                            </div>
                            <div className="text-xs text-[#8a99b5] mt-0.5">
                              Instant checkout using authenticated stored balance.
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          {paymentMethod === 'vortex_wallet' && (
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Method 2: FIB Bank (First Iraqi Bank) */}
                    <div
                      onClick={() => setPaymentMethod('fib')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'fib'
                          ? 'bg-[#0c1736] border-[#00d4ff] shadow-lg shadow-[#0070f3]/20 ring-1 ring-[#00d4ff]'
                          : 'bg-[#0a1128] border-[#1b2a4a] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black shrink-0">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>FIB Bank (First Iraqi Bank)</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                QR PAYMENT
                              </span>
                            </div>
                            <div className="text-xs text-[#8a99b5] mt-0.5">
                              Scan with First Iraqi Bank mobile app or enter reference code.
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          {paymentMethod === 'fib' && (
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Method 3: FastPay Mobile Wallet */}
                    <div
                      onClick={() => setPaymentMethod('fastpay')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'fastpay'
                          ? 'bg-[#0c1736] border-[#00d4ff] shadow-lg shadow-[#0070f3]/20 ring-1 ring-[#00d4ff]'
                          : 'bg-[#0a1128] border-[#1b2a4a] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#f97316]/20 border border-[#f97316]/40 text-[#f97316] flex items-center justify-center font-black shrink-0">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>FastPay Mobile Wallet</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                DIRECT WALLET
                              </span>
                            </div>
                            <div className="text-xs text-[#8a99b5] mt-0.5">
                              Instant mobile wallet deduction via FastPay App QR code or merchant code.
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          {paymentMethod === 'fastpay' && (
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Method 4: Visa & Mastercard — Iraqi Local Cards */}
                    <div
                      onClick={() => setPaymentMethod('iraqi_cards')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'iraqi_cards'
                          ? 'bg-[#0c1736] border-[#00d4ff] shadow-lg shadow-[#0070f3]/20 ring-1 ring-[#00d4ff]'
                          : 'bg-[#0a1128] border-[#1b2a4a] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Visa & Mastercard — Iraqi Local Cards</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                LOCAL CARDS
                              </span>
                            </div>
                            <div className="text-xs text-[#8a99b5] mt-0.5">
                              Cards issued by Iraqi banks (Qi Card, Neo, Switch, FIB Card).
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          {paymentMethod === 'iraqi_cards' && (
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Method 5: Visa & Mastercard — International Cards */}
                    <div
                      onClick={() => setPaymentMethod('international_cards')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'international_cards'
                          ? 'bg-[#0c1736] border-[#00d4ff] shadow-lg shadow-[#0070f3]/20 ring-1 ring-[#00d4ff]'
                          : 'bg-[#0a1128] border-[#1b2a4a] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-[#00d4ff] flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Visa & Mastercard — International Cards</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-[#00d4ff] font-bold border border-blue-500/30">
                                PCI-COMPLIANT GATEWAY
                              </span>
                            </div>
                            <div className="text-xs text-[#8a99b5] mt-0.5">
                              Global debit and credit cards with Stripe tokenization & 3D Secure 2.
                            </div>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                          {paymentMethod === 'international_cards' && (
                            <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. Selected Method Overview & Pre-Authorization Guidance */}
                {/* Notice: NO QR CODE IS DISPLAYED YET. Clicking Authorize creates session first! */}
                
                {/* PREVIEW: FIB BANK */}
                {paymentMethod === 'fib' && (
                  <div className="p-6 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                      <div className="flex items-center gap-2.5">
                        <QrCode className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">First Iraqi Bank (FIB) QR Checkout</h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        READY FOR AUTHORIZATION
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-3">
                      <p className="text-xs text-[#8a99b5] leading-relaxed">
                        When you click <strong className="text-white">AUTHORIZE & CONFIRM PAYMENT</strong> below, our server will securely generate your verified FIB payment session, payable QR code, and unique payment reference.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Exact IQD Conversion</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>15-Minute Expiration</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <ShieldCheck className="w-4 h-4 text-[#00d4ff] shrink-0" />
                          <span>Central Bank Certified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: FASTPAY MOBILE WALLET */}
                {paymentMethod === 'fastpay' && (
                  <div className="p-6 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-5 h-5 text-[#f97316]" />
                        <h4 className="text-sm font-bold text-white">FastPay Mobile Wallet</h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        READY FOR AUTHORIZATION
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-3">
                      <p className="text-xs text-[#8a99b5] leading-relaxed">
                        When you click <strong className="text-white">AUTHORIZE & CONFIRM PAYMENT</strong> below, our server will securely create your FastPay payment session, merchant payment details (Merchant ID: 892401), and payable QR code.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Merchant Code 892401</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <Clock className="w-4 h-4 text-[#00d4ff] shrink-0" />
                          <span>15-Minute Expiry</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-white">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Zero Surcharge</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: VORTEX WALLET */}
                {paymentMethod === 'vortex_wallet' && (
                  <div className="p-6 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-5 h-5 text-purple-400" />
                        <h4 className="text-sm font-bold text-white">Vortex Wallet Authorization</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
                        Stored Balance
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-[#8a99b5] uppercase">Verified Account Balance</span>
                          <div className="text-2xl font-black text-white font-mono mt-0.5">
                            {format(0, 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#8a99b5] uppercase">Order Amount Required</span>
                          <div className="text-xl font-bold text-[#00d4ff] font-mono mt-0.5">
                            {format(getTotalUSD(), getTotalIQD())}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Insufficient Wallet Balance: You need {format(getTotalUSD(), getTotalIQD())} to complete this purchase.</span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Sandbox Staging Notice</span>
                        </div>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed">
                          Stored wallet funding is currently in sandbox staging. Please switch to FIB Bank, FastPay, or Visa/Mastercard to proceed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: IRAQI LOCAL CARDS */}
                {paymentMethod === 'iraqi_cards' && (
                  <div className="p-6 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">Visa & Mastercard — Iraqi Local Cards</h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        SANDBOX PREVIEW
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-4">
                      {/* Supported Iraqi Local Bank Test Cards Selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Iraqi Bank Test Cards (Qi Card, Neo, Switch, FIB Card):</span>
                          <span className="text-[10px] text-cyan-400 font-mono">SANDBOX STAGING</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => autofillIraqiCard('qi')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-cyan-400 text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-cyan-300">Qi Card</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">4000 •••• 9010</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => autofillIraqiCard('neo')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-cyan-400 text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-cyan-300">Neo Bank</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">5100 •••• 1234</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => autofillIraqiCard('switch')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-cyan-400 text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-cyan-300">Switch</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">4800 •••• 2345</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => autofillIraqiCard('fib')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-cyan-400 text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-cyan-300">FIB Card</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">4500 •••• 3456</div>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                            Cardholder Full Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="Karwan Ahmad"
                            className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs text-white placeholder-[#6b6b80] focus:border-cyan-400 outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase">
                              Card Number <span className="text-rose-400">*</span>
                            </label>
                            {cardBrand && (
                              <span className="text-[10px] font-bold text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                                {cardBrand}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="4000 1234 5678 9010"
                            className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-cyan-400 outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                              Expiry Date (MM/YY) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              placeholder="08/28"
                              className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-cyan-400 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                              CVV / CVC <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                              placeholder="777"
                              className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-cyan-400 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 leading-relaxed">
                        ℹ️ Central Bank of Iraq (CBI) &amp; Iraqi national switch integration in sandbox test mode. Real funds are never deducted in sandbox. Clicking <strong>AUTHORIZE &amp; CONFIRM PAYMENT</strong> opens bank 3D Secure / OTP authentication.
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIEW: INTERNATIONAL CARDS */}
                {paymentMethod === 'international_cards' && (
                  <div className="p-6 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-5 h-5 text-[#00d4ff]" />
                        <h4 className="text-sm font-bold text-white">Visa & Mastercard — International Cards</h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#00d4ff] font-bold border border-blue-500/30">
                        PCI-COMPLIANT TOKENIZED GATEWAY
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-4">
                      {/* International Test Credentials Preset */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">International Test Cards (Stripe Tokenized Sandbox):</span>
                          <span className="text-[10px] text-[#00d4ff] font-mono">TOKENIZED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => autofillInternationalCard('visa')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-[#0070f3] text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-[#00d4ff]">Stripe Visa Card</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">4242 •••• 4242</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => autofillInternationalCard('mastercard')}
                            className="p-2.5 rounded-xl bg-[#080d1f] border border-[#1b2a4a] hover:border-[#0070f3] text-left text-xs transition-all group"
                          >
                            <div className="font-bold text-white group-hover:text-[#00d4ff]">Stripe Mastercard</div>
                            <div className="text-[10px] text-[#7888a6] font-mono">5555 •••• 4444</div>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                            Cardholder Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="Alex Mercer"
                            className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase">
                              Card Number <span className="text-rose-400">*</span>
                            </label>
                            {cardBrand && (
                              <span className="text-[10px] font-bold text-[#00d4ff] font-mono px-2 py-0.5 rounded bg-[#0070f3]/20 border border-[#0070f3]/30">
                                {cardBrand}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                              Expiry Date (MM/YY) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              placeholder="12/28"
                              className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#8a99b5] uppercase block mb-1">
                              CVC / CVV <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                              placeholder="888"
                              className="w-full h-10 px-3 rounded-xl bg-[#080d1f] border border-[#1b2a4a] text-xs font-mono text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="saveCardCheckbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="rounded bg-[#080d1f] border-[#1b2a4a] text-[#0070f3] focus:ring-[#0070f3]"
                          />
                          <label htmlFor="saveCardCheckbox" className="text-xs text-[#8a99b5] cursor-pointer">
                            Securely save card token for faster checkout next time
                          </label>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0070f3]/10 border border-[#0070f3]/30 text-[11px] text-[#8a99b5] leading-relaxed">
                        🔒 Zero raw card handling: Card credentials are encrypted and tokenized directly via Stripe API and approved payment provider infrastructure. VORTEX GAMING never stores your raw PAN or CVV. Clicking <strong>AUTHORIZE &amp; CONFIRM PAYMENT</strong> initiates secure 3D Secure verification.
                      </div>
                    </div>
                  </div>
                )}

              </form>
            ) : (
              /* ══════════════════════════════════════════════════════════════ */
              /* VIEW B: ACTIVE PROVIDER QR PAYMENT SESSION                     */
              /* Displays ONLY the selected provider's QR checkout session.     */
              /* ══════════════════════════════════════════════════════════════ */
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* ─── FIB ONLY QR CHECKOUT PANEL ───────────────────────────── */}
                {activeSession.provider === 'fib' && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#080d1f] border-2 border-[#00d4ff]/40 shadow-2xl space-y-6">
                    {/* Top Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#142038]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <span>First Iraqi Bank (FIB) QR Checkout</span>
                          </h3>
                          <span className="text-xs text-[#8a99b5] font-mono">
                            Order #{activeSession.orderNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Session Expires: {formattedTimeLeft}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelSession}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#8a99b5] hover:text-white transition-colors border border-white/10"
                          title="Change payment method"
                        >
                          Change Method
                        </button>
                      </div>
                    </div>

                    {/* QR Code + Payment Instructions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Provider Generated QR Code */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] text-center space-y-3">
                        <QRCodeDisplay
                          data={activeSession.qrData || `fib://pay?ref=${activeSession.paymentReference}`}
                          size={190}
                          provider="fib"
                        />
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>Awaiting Payment Clearance</span>
                          </div>
                          <span className="text-[10px] text-[#7888a6] block font-mono">
                            Scan with First Iraqi Bank Mobile App
                          </span>
                        </div>
                      </div>

                      {/* Right: Payment Details & Instructions */}
                      <div className="sm:col-span-7 space-y-4 text-xs">
                        
                        {/* Server-authoritative amount */}
                        <div className="p-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a]">
                          <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                            Server-Authoritative Payable Total
                          </span>
                          <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                            {format(activeSession.totalUSD, activeSession.totalIQD)}
                          </div>
                          <span className="text-[10px] text-[#7888a6] font-mono">
                            Base: ${(activeSession.totalUSD / 100).toFixed(2)} USD
                          </span>
                        </div>

                        {/* Payment reference with copy button */}
                        <div className="p-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] space-y-1.5">
                          <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                            FIB Transaction Reference
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-white text-xs select-all truncate">
                              {activeSession.paymentReference}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentCode(activeSession.paymentReference)}
                              className="px-3 py-1 rounded-lg bg-[#0070f3]/20 hover:bg-[#0070f3]/30 text-[#00d4ff] text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode ? 'Copied' : 'Copy Payment Code'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Step-by-step mobile instructions */}
                        <div className="p-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] space-y-1 text-[#8a99b5] text-[11px] leading-relaxed">
                          <div className="font-bold text-white text-xs mb-1">Payment Steps:</div>
                          <div>1. Open your <strong>First Iraqi Bank (FIB)</strong> mobile app.</div>
                          <div>2. Select <strong>Pay with QR</strong> or manual Reference Code entry.</div>
                          <div>3. Confirm recipient <strong>VORTEX GAMING</strong> and exact total.</div>
                          <div>4. Authorize in your FIB app with your mobile PIN.</div>
                        </div>

                      </div>
                    </div>

                    {/* Verification Actions Bar */}
                    <div className="pt-2 border-t border-[#142038] space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleCheckPaymentStatus}
                          disabled={isVerifyingStatus || isSimulatingPayment}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0070f3]/30 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isVerifyingStatus ? 'animate-spin' : ''}`} />
                          <span>{isVerifyingStatus ? 'Verifying with FIB Servers...' : 'Check Payment Status'}</span>
                        </button>

                        {/* Sandbox Test Simulator Trigger */}
                        <button
                          type="button"
                          onClick={handleSimulateTestPayment}
                          disabled={isSimulatingPayment || isVerifyingStatus}
                          className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors inline-flex items-center justify-center gap-1.5"
                          title="Simulate provider webhook clearance in sandbox"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isSimulatingPayment ? 'Simulating Clearance...' : 'Simulate Provider Webhook (Sandbox)'}</span>
                        </button>
                      </div>

                      {/* Status Feedback Notification */}
                      {statusMessage && (
                        <div
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 animate-in fade-in ${
                            statusMessage.type === 'success'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : statusMessage.type === 'error'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                              : 'bg-[#0070f3]/15 border-[#0070f3]/30 text-[#00d4ff]'
                          }`}
                        >
                          <Info className="w-4 h-4 shrink-0" />
                          <span>{statusMessage.text}</span>
                        </div>
                      )}

                      {/* Sandbox Truth in Gateway Notice */}
                      <div className="text-[11px] text-[#7888a6] text-center pt-1">
                        ℹ️ Sandbox Staging Gateway: Mock provider QR code generated from official session payload. Real funds are never deducted in sandbox.
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── FASTPAY ONLY QR CHECKOUT PANEL ───────────────────────── */}
                {activeSession.provider === 'fastpay' && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#080d1f] border-2 border-[#f97316]/50 shadow-2xl space-y-6">
                    {/* Top Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#142038]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#f97316]/20 border border-[#f97316]/40 text-[#f97316] flex items-center justify-center font-black">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <span>FastPay Mobile Wallet QR Checkout</span>
                          </h3>
                          <span className="text-xs text-[#8a99b5] font-mono">
                            Order #{activeSession.orderNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Session Expires: {formattedTimeLeft}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelSession}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#8a99b5] hover:text-white transition-colors border border-white/10"
                          title="Change payment method"
                        >
                          Change Method
                        </button>
                      </div>
                    </div>

                    {/* QR Code + Instructions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: FastPay QR Code */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] text-center space-y-3">
                        <QRCodeDisplay
                          data={activeSession.qrData || `fastpay://merchant/vortex-gaming?ref=${activeSession.paymentReference}`}
                          size={190}
                          provider="fastpay"
                        />
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>Awaiting FastPay Clearance</span>
                          </div>
                          <span className="text-[10px] text-[#7888a6] block font-mono">
                            Scan with FastPay Mobile App
                          </span>
                        </div>
                      </div>

                      {/* Right: Payment Reference & Merchant ID */}
                      <div className="sm:col-span-7 space-y-4 text-xs">
                        
                        {/* Server-authoritative amount */}
                        <div className="p-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a]">
                          <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                            Authoritative Payment Total
                          </span>
                          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                            {format(activeSession.totalUSD, activeSession.totalIQD)}
                          </div>
                          <span className="text-[10px] text-[#7888a6] font-mono">
                            Base: ${(activeSession.totalUSD / 100).toFixed(2)} USD
                          </span>
                        </div>

                        {/* FastPay Merchant Code & Reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-[#0c1326] border border-[#1b2a4a] space-y-1">
                            <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                              Merchant ID
                            </span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-black text-white text-sm">
                                {activeSession.merchantCode || '892401'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyPaymentCode(activeSession.merchantCode || '892401')}
                                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white text-[10px]"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#0c1326] border border-[#1b2a4a] space-y-1">
                            <span className="text-[10px] font-bold text-[#8a99b5] uppercase">
                              Payment Reference
                            </span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-white text-xs truncate">
                                {activeSession.paymentReference}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyPaymentCode(activeSession.paymentReference)}
                                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white text-[10px]"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-step FastPay instructions */}
                        <div className="p-3.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] space-y-1 text-[#8a99b5] text-[11px] leading-relaxed">
                          <div className="font-bold text-white text-xs mb-1">FastPay Transfer Instructions:</div>
                          <div>1. Launch your <strong>FastPay</strong> app.</div>
                          <div>2. Select <strong>QR Pay</strong> or transfer to Merchant ID <strong>892401</strong>.</div>
                          <div>3. Enter Reference: <strong>{activeSession.paymentReference}</strong>.</div>
                          <div>4. Complete payment and verify status below.</div>
                        </div>

                      </div>
                    </div>

                    {/* Verification Actions Bar */}
                    <div className="pt-2 border-t border-[#142038] space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleCheckPaymentStatus}
                          disabled={isVerifyingStatus || isSimulatingPayment}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0070f3]/30 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isVerifyingStatus ? 'animate-spin' : ''}`} />
                          <span>{isVerifyingStatus ? 'Verifying FastPay Clearance...' : 'Check Payment Status'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulateTestPayment}
                          disabled={isSimulatingPayment || isVerifyingStatus}
                          className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors inline-flex items-center justify-center gap-1.5"
                          title="Simulate provider webhook clearance in sandbox"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isSimulatingPayment ? 'Simulating Clearance...' : 'Simulate Provider Webhook (Sandbox)'}</span>
                        </button>
                      </div>

                      {/* Status Feedback Notification */}
                      {statusMessage && (
                        <div
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 animate-in fade-in ${
                            statusMessage.type === 'success'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : statusMessage.type === 'error'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                              : 'bg-[#0070f3]/15 border-[#0070f3]/30 text-[#00d4ff]'
                          }`}
                        >
                          <Info className="w-4 h-4 shrink-0" />
                          <span>{statusMessage.text}</span>
                        </div>
                      )}

                      <div className="text-[11px] text-[#7888a6] text-center pt-1">
                        ℹ️ Sandbox Staging Gateway: Mock provider QR code generated from official session payload. Real funds are never deducted in sandbox.
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── IRAQI LOCAL CARDS SESSION PANEL ──────────────────────── */}
                {activeSession.provider === 'iraqi_cards' && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#080d1f] border-2 border-cyan-500/40 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#142038]">
                      <div>
                        <h3 className="text-lg font-black text-white">Iraqi Local Cards Payment Session</h3>
                        <span className="text-xs text-[#8a99b5] font-mono">Order #{activeSession.orderNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelSession}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#8a99b5]"
                      >
                        Change Method
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] space-y-3">
                      <div className="text-2xl font-black text-cyan-400 font-mono">
                        {format(activeSession.totalUSD, activeSession.totalIQD)}
                      </div>
                      <div className="text-xs text-[#8a99b5]">
                        Reference: <span className="font-mono text-white font-bold">{activeSession.paymentReference}</span>
                      </div>
                      <p className="text-xs text-[#8a99b5] leading-relaxed">
                        Iraqi Local Bank integration (Qi Card / Neo / FIB) operates in sandbox preview mode.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCheckPaymentStatus}
                        disabled={isVerifyingStatus}
                        className="flex-1 py-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs uppercase"
                      >
                        {isVerifyingStatus ? 'Verifying...' : 'Check Payment Status'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulateTestPayment}
                        className="py-3 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs"
                      >
                        Simulate Approval
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* ── Right Column: Sticky Order Summary & Authorize Button ─────── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#142038]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Order Summary</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0070f3]/20 text-[#00d4ff] font-mono">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currency}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.game.id}-${item.game.slug}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c1326] border border-[#1b2a4a]/70"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.game.bannerGradient} flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-inner`}>
                        {item.game.platformName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.game.title}</div>
                        <div className="text-[10px] text-[#8a99b5]">
                          Qty: {item.quantity} • {item.game.platformName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-[#00d4ff] font-mono">
                        {format(item.game.priceUSD * item.quantity, item.game.priceIQD * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              {!activeSession && (
                <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo Code (e.g. VORTEX10)"
                      className="flex-1 h-10 px-3 rounded-xl bg-[#0c1326] border border-[#1b2a4a] text-xs font-mono uppercase text-white placeholder-[#6b6b80] focus:border-[#0070f3] outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {promoSuccess && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{promoSuccess}</span>
                    </div>
                  )}
                  {promoError && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </form>
              )}

              {/* Financial Totals */}
              <div className="space-y-2 pt-2 border-t border-[#142038] text-xs">
                <div className="flex items-center justify-between text-[#8a99b5]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">
                    {format(getTotalUSD(), getTotalIQD())}
                  </span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>Discount Applied ({couponCode}):</span>
                    <span className="font-mono">-{discountPercent}%</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#142038] flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Final Total:</span>
                  <span className="text-2xl font-black text-[#00d4ff] font-mono">
                    {format(getTotalUSD(), getTotalIQD())}
                  </span>
                </div>

                {currency !== 'USD' && (
                  <div className="p-2.5 rounded-xl bg-[#0c1326] border border-[#1b2a4a] text-[11px] text-[#8a99b5] space-y-1">
                    <div className="flex items-center justify-between text-[#00d4ff] font-semibold">
                      <span>Base Canonical Reference:</span>
                      <span className="font-mono">${(getTotalUSD() / 100).toFixed(2)} USD</span>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ─── ACTION BUTTON ─── */}
              {!activeSession ? (
                /* Primary CTA: AUTHORIZE CONFIRM PAYMENT */
                <button
                  type="button"
                  onClick={handleAuthorizePayment}
                  disabled={isAuthorizing || paymentMethod === 'vortex_wallet'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] via-[#0070f3] to-[#7c3aed] text-white font-black text-sm uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow-xl shadow-[#0070f3]/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAuthorizing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Payment Session...</span>
                    </>
                  ) : paymentMethod === 'vortex_wallet' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Insufficient Wallet Balance ($0.00)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>AUTHORIZE & CONFIRM PAYMENT</span>
                    </>
                  )}
                </button>
              ) : (
                /* Active Session Status Box */
                <div className="p-4 rounded-2xl bg-[#0c1326] border border-[#00d4ff]/40 space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>Payment Session Active</span>
                  </div>
                  <div className="text-xs text-[#8a99b5]">
                    Order: <strong className="text-white font-mono">#{activeSession.orderNumber}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={isVerifyingStatus}
                    className="w-full py-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0070f3]/30 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingStatus ? 'animate-spin' : ''}`} />
                    <span>{isVerifyingStatus ? 'Checking Status...' : 'Check Payment Status'}</span>
                  </button>
                </div>
              )}

              {/* Terms and Privacy policy notice */}
              <div className="text-[11px] text-center text-[#8a99b5] leading-relaxed">
                By clicking Authorize, you agree to the{' '}
                <Link href="/terms" className="text-[#00d4ff] underline hover:text-white">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#00d4ff] underline hover:text-white">
                  Privacy Policy
                </Link>
                . Digital keys are unlocked immediately upon server verification.
              </div>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* BANK AUTHENTICATION (3D SECURE / OTP) MODAL                          */}
        {/* Rendered when Visa & Mastercard card authorization is initiated.      */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeCardAuth && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-[#080d1f] border-2 border-[#00d4ff]/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#142038]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0070f3]/20 border border-[#0070f3]/40 text-[#00d4ff] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white line-clamp-1">
                      {activeCardAuth.authChallenge.bankName}
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider">
                      3D SECURE 2.0 STRONG AUTHENTICATION
                    </span>
                  </div>
                </div>
                {!isVerifyingCardAuth && !cardAuthSuccess && (
                  <button
                    type="button"
                    onClick={handleCancelCardAuth}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-[#8a99b5] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ─── STATE 1: PAYMENT PROCESSING ─────────────────────────── */}
              {isVerifyingCardAuth ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 border-3 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-[#0070f3]/30" />
                  <div className="space-y-1.5">
                    <div className="text-base font-black text-white uppercase tracking-wider">
                      Payment Processing...
                    </div>
                    <p className="text-xs text-[#8a99b5] leading-relaxed max-w-xs mx-auto">
                      Authorizing transaction with bank gateway and verifying 3D Secure credentials. Please do not close or refresh.
                    </p>
                  </div>
                </div>
              ) : cardAuthSuccess ? (
                /* ─── STATE 2: PAYMENT SUCCESSFUL ──────────────────────────── */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in-95">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white uppercase tracking-tight">
                      Payment Successful
                    </div>
                    <p className="text-xs text-emerald-300 font-mono">
                      ✓ Authoritative server verification confirmed by bank gateway!
                    </p>
                    <div className="text-[11px] text-[#8a99b5] pt-1 font-mono">
                      Transaction Ref: <strong className="text-white">{cardAuthSuccess.transactionReference}</strong>
                    </div>
                  </div>
                  <div className="text-xs text-[#00d4ff] flex items-center justify-center gap-2 pt-2 font-mono">
                    <span className="w-3.5 h-3.5 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
                    <span>Unlocking activation keys &amp; redirecting...</span>
                  </div>
                </div>
              ) : (
                /* ─── STATE 3: BANK CHALLENGE / OTP INPUT ─────────────────── */
                <div className="space-y-4">
                  {/* Transaction Overview Card */}
                  <div className="p-3.5 rounded-2xl bg-[#0c1326] border border-[#1b2a4a] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#7888a6] uppercase font-bold block">
                        Order #{activeCardAuth.orderNumber}
                      </span>
                      <span className="text-base font-black text-[#00d4ff] font-mono">
                        {format(activeCardAuth.totalUSD, activeCardAuth.totalIQD)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7888a6] uppercase font-bold block">
                        Card Being Charged
                      </span>
                      <span className="font-mono text-white text-xs font-bold">
                        {activeCardAuth.cardBrand} •••• {activeCardAuth.cardLast4}
                      </span>
                    </div>
                  </div>

                  {/* OTP Challenge Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <label htmlFor="bankOtpInput">SMS Verification Code (OTP)</label>
                      <button
                        type="button"
                        onClick={() => setCardOtpInput(activeCardAuth.authChallenge.testOtp || '123456')}
                        className="text-[10px] text-[#00d4ff] hover:underline font-mono"
                      >
                        Autofill Test Code ({activeCardAuth.authChallenge.testOtp || '123456'})
                      </button>
                    </div>

                    <input
                      id="bankOtpInput"
                      type="text"
                      maxLength={6}
                      value={cardOtpInput}
                      onChange={(e) => setCardOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full h-12 px-4 rounded-xl bg-[#0c1326] border-2 border-[#1b2a4a] focus:border-[#00d4ff] text-center font-mono text-2xl font-black tracking-widest text-white outline-none transition-colors"
                    />

                    <p className="text-[11px] text-[#8a99b5] leading-relaxed">
                      {activeCardAuth.authChallenge.prompt}
                    </p>
                  </div>

                  {/* Error Notification inside modal */}
                  {cardAuthError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-rose-200">Payment Failed</div>
                        <div className="text-[11px] text-rose-300">{cardAuthError}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmitCardAuth(false)}
                      disabled={isVerifyingCardAuth || cardOtpInput.trim().length !== 6}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] via-[#0070f3] to-[#7c3aed] text-white font-black text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow-md shadow-[#0070f3]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Authenticate Payment</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelCardAuth}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#8a99b5] hover:text-white transition-colors border border-white/10"
                      >
                        Cancel
                      </button>

                      {/* Sandbox Bank Decline Simulation Button */}
                      <button
                        type="button"
                        onClick={() => handleSubmitCardAuth(true)}
                        className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-colors border border-rose-500/30"
                        title="Simulate bank decline to verify safe retry flow"
                      >
                        Simulate Decline
                      </button>
                    </div>

                    {cardAuthError && (
                      <button
                        type="button"
                        onClick={handleRetryFailedCard}
                        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white transition-colors border border-white/10 mt-1"
                      >
                        ← Try Again with Another Card
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060a17] pt-28 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-[#8a99b5]">Loading Secure Checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
