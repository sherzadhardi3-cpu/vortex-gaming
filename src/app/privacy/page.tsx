import React from 'react';
import Link from 'next/link';
import { Lock, Shield, Eye, Database, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <Lock className="w-3.5 h-3.5" />
            <span>DATA INTEGRITY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            PRIVACY & <span className="vortex-gradient-text">DATA POLICY</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8]">
            Effective Date: January 1, 2026 • VORTEX GAMING
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl space-y-8 text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00d4ff]" />
              1. Our Privacy Commitment
            </h2>
            <p>
              VORTEX GAMING respects your privacy and is dedicated to protecting customer data. We never sell, monetize, or rent personal gamer records, payment profiles, or purchase histories to third-party ad networks or brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              2. Data We Collect & Purpose
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-white/90">
              <li>
                <strong>Account Credentials:</strong> Name, email address, salted password hashes, and optional 4-digit security PIN for customer authentication and delivery confirmation.
              </li>
              <li>
                <strong>Discord OAuth Data:</strong> When linking via "Continue with Discord", we receive only your public Snowflake ID, username, discriminator, and avatar URL under the <code>identify</code> and <code>email</code> scopes.
              </li>
              <li>
                <strong>Transaction Logs:</strong> Order numbers, purchased items, timestamp, and payment provider references for key fulfillment and fraud prevention.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              3. Encryption & Vault Security
            </h2>
            <p>
              All sensitive activation credentials in our game key vault are encrypted using industry-standard AES-256-GCM. Session cookies are protected with <code>HttpOnly</code>, <code>SameSite=Lax</code>, and cryptographic signing to prevent cross-site request forgery and token interception.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              4. Your Rights
            </h2>
            <p>
              You have the right to request an export of your order history, revoke linked Discord accounts at any time from your <Link href="/account?tab=discord" className="text-[#00d4ff] hover:underline">Account Dashboard</Link>, or request account closure by contacting support@vortexgaming.gg.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
