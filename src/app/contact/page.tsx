'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, MapPin, Headphones, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const handleOpenLiveChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vtx_open_support_widget'));
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <Headphones className="w-3.5 h-3.5" />
            <span>DIRECT SUPPORT CHANNELS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            CONTACT <span className="vortex-gradient-text">VORTEX SUPPORT</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8] leading-relaxed">
            Have questions about an order, game activation, or digital partnership? Connect with our team 24 hours a day.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#12121a] border border-[#00d4ff]/30 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Customer Chat</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Connect in real-time with an active support agent. Typical response time is under 3 minutes.
              </p>
            </div>
            <button
              onClick={handleOpenLiveChat}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00d4ff]/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <span>Launch Live Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Email Assistance</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                For order investigations, licensing, or publisher inquiries. Note: Direct MX mail routing is currently being configured; please use the on-site Support Widget for fastest guaranteed reply.
              </p>
              <div className="text-xs font-mono font-bold text-[#00d4ff]">
                support@vortexgaming.gg
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('vtx_open_support_widget'));
                }
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider text-center transition-colors block"
            >
              Open Support Ticket Desk
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Operating Hours</h3>
              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Automated key vault release operates continuously upon payment clearance. Support desk tickets are monitored with guaranteed replies within 1 business day.
              </p>
            </div>
            <Link
              href="/faq"
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider text-center transition-colors block"
            >
              View Self-Service FAQ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
