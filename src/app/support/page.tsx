'use client';

// VORTEX GAMING — Customer Support & Help Center
// Dedicated hub for live chat launch, order assistance, key activation, and ticket creation

import React from 'react';
import Link from 'next/link';
import {
  Headphones,
  Key,
  ShieldAlert,
  Clock,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FileText,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { VortexLogo } from '@/components/brand/VortexLogo';

export default function SupportPage() {
  const handleOpenLiveChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vtx_open_support_widget'));
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <Headphones className="w-3.5 h-3.5" />
            <span>DEDICATED SUPPORT DESK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            VORTEX GAMING <span className="vortex-gradient-text">HELP CENTER</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
            Need help redeeming your digital activation key or have questions about a payment? Our specialist support team is available to assist with ticket inquiries within 1 business day.
          </p>
        </div>

        {/* Primary Action Hubs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1: Live Chat */}
          <div className="p-8 rounded-3xl bg-[#12121a] border border-[#00d4ff]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-[#00d4ff] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/10 blur-2xl rounded-full pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Live Customer Chat</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Connect directly with our support specialists. Inquiries and tickets are monitored with typical replies within 1 business day.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <button
                onClick={handleOpenLiveChat}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00d4ff]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Live Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action 2: Key Vault & Orders */}
          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-all">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">My Keys & Orders</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Retrieve your purchased activation keys, check transaction statuses, and copy decrypted codes directly from your vault.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                href="/account?tab=orders"
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Access Key Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Action 3: FAQ & Activation Guide */}
          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Troubleshooting & FAQ</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Step-by-step redemption tutorials for Steam, PlayStation, Xbox, EA App, and Ubisoft Connect platforms.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                href="/faq"
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Read Activation Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Operating Guarantees */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121226] via-[#16162a] to-[#0d0d1a] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">VORTEX Key Authenticity Assurance</h4>
              <p className="text-xs text-[#a0a0b8] max-w-xl">
                Every game key sold on VORTEX GAMING is digitally stamped and sourced from authorized publisher streams. In case of any validation delay, our automated vault issues an immediate replacement or full refund.
              </p>
            </div>
          </div>
          <Link
            href="/refund-policy"
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors shrink-0"
          >
            Review Refund Policy
          </Link>
        </div>

      </div>
    </div>
  );
}
