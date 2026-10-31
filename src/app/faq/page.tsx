'use client';

// VORTEX GAMING — Complete 35-Item Knowledge Base & Platform Activation Guides
// Unified FAQ accordion, dynamic category counts, search system, and platform activation walkthroughs.

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { useTranslation } from '@/lib/i18n';

const PLATFORM_GUIDES = [
  {
    platform: 'Steam',
    steps: [
      'Launch the Steam desktop client and log into your account.',
      'Click the "+ ADD A GAME" button in the bottom-left corner of the window.',
      'Select "Activate a Product on Steam..." and agree to the Subscriber Agreement.',
      'Enter or paste the activation key copied from your VORTEX Key Vault.',
      'Steam will verify the key and add the game to your permanent Library.',
    ],
  },
  {
    platform: 'PlayStation (PS5 / PS4)',
    steps: [
      'Open the PlayStation Store on your console or through the official PlayStation App.',
      'Navigate to your Profile icon or the "..." options menu at the top.',
      'Select "Redeem Code".',
      'Enter the 12-digit voucher code exactly as revealed in your VORTEX account.',
      'Select "Redeem" to confirm the digital entitlement and begin downloading.',
    ],
  },
  {
    platform: 'Xbox & Microsoft Store',
    steps: [
      'Press the Xbox button on your controller to open the guide, then select Store.',
      'Press the View button or navigate to the left menu and select "Redeem".',
      'Enter the 25-character digital code provided by VORTEX GAMING.',
      'Confirm the game title and select "Confirm" to bind the game to your Xbox Gamertag.',
    ],
  },
  {
    platform: 'Epic Games Store',
    steps: [
      'Open the Epic Games Launcher or visit epicgames.com and sign in.',
      'Click on your username or display avatar in the top right corner.',
      'Click "Redeem Code".',
      'Type or paste your VORTEX key into the prompt and click "Redeem".',
      'Navigate to your Epic Library to install and launch the title.',
    ],
  },
];

export default function FAQPage() {
  const [selectedGuide, setSelectedGuide] = useState('Steam');
  const { language, isRTL } = useTranslation();
  const lang = (language === 'ku' || language === 'ar') ? language : 'en';

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#060a17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#7888a6]"
        >
          <Link href="/" className="hover:text-white transition-colors">
            {lang === 'ku' ? 'سەرەتا' : lang === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <Link href="/support" className="hover:text-white transition-colors">
            {lang === 'ku' ? 'سەنتەری پشتیوانی' : lang === 'ar' ? 'مركز الدعم' : 'Support Center'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-[#00d4ff] font-bold">
            {lang === 'ku' ? 'پرسیارە باوەکان' : lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}
          </span>
        </nav>

        {/* Cinematic FAQ Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#1b2a4a] bg-[#080d1f] p-8 sm:p-12 shadow-2xl group">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/hero-game-accounts-banner.jpg"
              alt="VORTEX Gaming Support"
              className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a17] via-[#060a17]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a17] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0070f3]/20 border border-[#0070f3]/40 text-[#00d4ff] text-xs font-mono font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>35 VERIFIED FAQS & GUIDES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#0070f3]">Questions</span>
            </h1>

            <p className="text-sm sm:text-base text-[#8a99b5] leading-relaxed">
              Find quick answers to common questions about orders, accounts, payments, and more.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/support?tab=new-ticket"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0070f3]/30 transition-all hover:scale-105 active:scale-95"
              >
                <Headphones className="w-4 h-4" />
                <span>Submit Support Ticket</span>
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                <span>My Orders & Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Interactive 35 FAQ Accordion Component ─────────────────────── */}
        <div className="pt-2">
          <FAQAccordion />
        </div>

        {/* ─── Platform Activation Guides ─────────────────────────────────── */}
        <div className="p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2a4a] pb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#00d4ff]" />
                <span>Step-by-Step Platform Activation</span>
              </h2>
              <p className="text-xs text-[#8a99b5] mt-1">
                Select your gaming platform to view precise instructions for key redemption
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {PLATFORM_GUIDES.map((g) => (
                <button
                  key={g.platform}
                  onClick={() => setSelectedGuide(g.platform)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedGuide === g.platform
                      ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/30'
                      : 'bg-[#0c1326] text-[#8a99b5] hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {g.platform}
                </button>
              ))}
            </div>
          </div>

          {/* Active Guide Steps */}
          {PLATFORM_GUIDES.filter((g) => g.platform === selectedGuide).map((g) => (
            <div key={g.platform} className="space-y-4">
              <h3 className="text-sm font-bold text-[#00d4ff]">
                How to activate keys on {g.platform}:
              </h3>
              <ol className="space-y-3">
                {g.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#060a17] border border-[#142038] text-xs text-white"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#0070f3]/20 border border-[#0070f3]/40 text-[#00d4ff] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
