import React from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCcw, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>CONSUMER PROTECTION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            DIGITAL GOODS <span className="vortex-gradient-text">REFUND POLICY</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8]">
            Effective Date: January 1, 2026 • VORTEX GAMING Marketplace
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl space-y-8 text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00d4ff]" />
              1. Our 100% Activation Guarantee
            </h2>
            <p>
              At VORTEX GAMING, customer trust is our top priority. Every activation key and digital voucher offered on our platform is sourced through official publisher feeds and verified distributors. If an activation key fails due to a publisher revocation or duplicate allocation on our end, you are entitled to an immediate replacement or 100% refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              2. Eligibility Criteria for Unredeemed Keys
            </h2>
            <p>
              Due to the unique, irreversible nature of digital activation credentials:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/90">
              <li>
                <strong>Unrevealed Keys:</strong> If you have not clicked "Reveal Key" in your account dashboard and request a cancellation within 14 days of purchase, a full refund to your original payment method or VORTEX Wallet will be processed promptly.
              </li>
              <li>
                <strong>Defective / Invalid Codes:</strong> If a key reports "Invalid" upon entry in Steam, PSN, or Xbox, please submit a support ticket within 48 hours. Once our verification system confirms the code status, you will be issued a fresh replacement code or full refund.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              3. Ineligible Circumstances
            </h2>
            <p>
              Refunds cannot be issued under the following scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/90">
              <li>Keys that have been successfully redeemed or activated onto your personal platform account.</li>
              <li>Purchases made for the wrong regional account where the product page clearly stated the regional restriction (e.g. attempting to activate an EU key on a North American account).</li>
              <li>Hardware incompatibility or system specification deficiencies of your PC or console.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. How to Request a Refund</h2>
            <p>
              To initiate a refund request, navigate to your <Link href="/account?tab=orders" className="text-[#00d4ff] hover:underline">Order History</Link>, locate the purchase, and click "Request Assistance", or contact our support team via the Support Widget with your order number.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
