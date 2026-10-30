'use client';

// VORTEX GAMING — Order Confirmation & Digital Key Reveal
// Secure delivery display with toggle reveal, copy button, and activation instructions
// Wrapped in Suspense for static prerender safety

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'VX-2026-CONFIRMED';
  const provider = searchParams.get('provider') || 'Gateway';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const mockDigitalKey = 'VTX-CYBER-9842-8812-7641';

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
          PAYMENT VERIFIED • FULFILLMENT COMPLETED
        </div>
        <h1 className="text-3xl font-black text-white">
          Thank You For Your Order!
        </h1>
        <p className="text-xs text-[#a0a0b8]">
          Order Number: <span className="text-white font-mono font-bold">{orderNumber}</span>
        </p>
      </div>

      {/* Key Vault Reveal Card */}
      <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-[#00d4ff]/30 shadow-inner space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Your Digital Activation Key
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            DELIVERED
          </span>
        </div>

        {/* Key Field with Reveal and Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#12121a] border border-white/15">
          <div className="font-mono text-base font-black tracking-wider text-white pl-2">
            {showKey ? mockDigitalKey : '••••-••••-••••-••••-••••'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#a0a0b8] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showKey ? 'Hide' : 'Reveal'}</span>
            </button>

            <button
              onClick={() => handleCopy(mockDigitalKey)}
              className="px-4 py-2 rounded-lg bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#00d4ff]/20"
            >
              {copiedKey === mockDigitalKey ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#a0a0b8] leading-relaxed">
          This activation key is permanent and securely saved to your VORTEX account vault. You can view it anytime under{' '}
          <Link href="/account" className="text-[#00d4ff] underline font-semibold">
            Account &rarr; Purchased Keys
          </Link>.
        </p>
      </div>

      {/* Action Links */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/account"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Go to Account Vault
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider transition-all"
        >
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-20 text-white">Loading confirmation...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
