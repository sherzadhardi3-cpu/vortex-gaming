import React from 'react';
import Link from 'next/link';
import { FileText, Shield, Lock, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <Scale className="w-3.5 h-3.5" />
            <span>LEGAL AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            TERMS OF <span className="vortex-gradient-text">SERVICE</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8]">
            Last Updated: January 1, 2026 • VORTEX GAMING Marketplace
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl space-y-8 text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00d4ff]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing digital activation keys, top-ups, or subscriptions from VORTEX GAMING ("the Platform", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree to all provisions, you must discontinue use of the platform immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              2. Authentic Digital Goods & Distribution
            </h2>
            <p>
              VORTEX GAMING sells authentic digital keys, serial numbers, and codes provided through legitimate distribution channels. Keys are intended for personal, non-commercial use on designated gaming networks (including Steam, PlayStation Network, Xbox Network, Epic Games Store, EA App, and Ubisoft Connect).
            </p>
            <p>
              All trademarks, game titles, logos, and publisher assets displayed on the platform are the property of their respective owners. VORTEX GAMING is an independent digital retailer and is not directly affiliated with, sponsored, or endorsed by Valve Corporation, Sony Interactive Entertainment, Microsoft Corporation, or Epic Games Inc.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              3. Account Security & Customer Conduct
            </h2>
            <p>
              Customers are responsible for maintaining the confidentiality of their VORTEX account credentials, security PINs, and session tokens. You agree not to resell or distribute purchased activation keys on unauthorized third-party auction sites or engage in fraudulent payment chargebacks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Pricing, Currency & Payments</h2>
            <p>
              All listed prices are displayed in either US Dollars (USD) or Iraqi Dinars (IQD). VORTEX GAMING partners with PCI DSS-compliant payment processors for credit/debit transactions and integrated Iraqi digital payment solutions (FIB Bank, FastPay, Qi Card).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Governing Law</h2>
            <p>
              These Terms of Service are governed by international electronic commerce principles and consumer protection statutes. For dispute resolution or licensing inquiries, contact legal@vortexgaming.gg.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
