import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Award, Gamepad2, ArrowRight } from 'lucide-react';
import { VortexLogo } from '@/components/brand/VortexLogo';

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>THE VORTEX MISSION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ABOUT <span className="vortex-gradient-text">VORTEX GAMING</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
            Empowering gamers worldwide with legitimate, instant-delivery digital game keys, transparent multi-currency pricing, and enterprise-grade cryptographic key protection.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Genuine Publisher Keys</h3>
            <p className="text-xs text-[#a0a0b8] leading-relaxed">
              We partner exclusively with verified distributors and legitimate publishers. Every serial code in our vault is brand new and guaranteed to activate without VPNs or region locks.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Under 60-Second Automated Delivery</h3>
            <p className="text-xs text-[#a0a0b8] leading-relaxed">
              Our automated key allocation engine releases your digital game code immediately after payment verification, storing it permanently in your encrypted account key vault.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Vault Security</h3>
            <p className="text-xs text-[#a0a0b8] leading-relaxed">
              All digital inventory is safeguarded with authenticated AES-256-GCM encryption at rest and SHA-256 deduplication hashing to eliminate duplicate code distribution.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#121226] via-[#16162a] to-[#0d0d1a] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-white">Ready to dive in?</h4>
            <p className="text-xs text-[#a0a0b8]">Explore thousands of discounted titles across Steam, PlayStation, Xbox, and Epic.</p>
          </div>
          <Link
            href="/store"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shrink-0 flex items-center gap-2"
          >
            <span>Explore Store Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
