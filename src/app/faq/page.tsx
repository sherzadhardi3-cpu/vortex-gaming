'use client';

// VORTEX GAMING — Activation Troubleshooting & FAQ Guide

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, CheckCircle2, Gamepad2, ArrowRight } from 'lucide-react';
import { VortexLogo } from '@/components/brand/VortexLogo';

const GUIDES = [
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

const EXTENDED_FAQS = [
  {
    q: 'How fast do I get my game key after purchasing?',
    a: 'Digital game keys are decrypted and released within 60 seconds of successful server payment confirmation. You will find them immediately in your VORTEX Account under "Purchased Keys".',
  },
  {
    q: 'Do your game keys have region locks?',
    a: 'All region restrictions (Global, NA, EU, MENA, Turkey, Argentina) are clearly marked with badges on each product card. When purchasing, make sure your gaming account region matches the product specification.',
  },
  {
    q: 'What if a key says "Duplicate" or "Already Activated"?',
    a: 'Our inventory uses SHA-256 deduplication and AES-256-GCM encryption, guaranteeing keys are brand new. If a publisher glitch occurs, click "Launch Live Chat" in the support widget or email support with your order number for an immediate replacement or refund.',
  },
  {
    q: 'Can I pay in Iraqi Dinars (IQD)?',
    a: 'Yes! VORTEX GAMING supports both USD and IQD. You can switch your preferred currency in the header navigation at any time.',
  },
];

export default function FAQPage() {
  const [selectedGuide, setSelectedGuide] = useState('Steam');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-xs font-mono font-bold text-[#00d4ff]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE & GUIDES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            ACTIVATION & <span className="vortex-gradient-text">FAQ</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a0a0b8]">
            Quick reference guides for redeeming digital keys across all supported gaming platforms.
          </p>
        </div>

        {/* Platform Redemption Walkthrough */}
        <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Step-by-Step Platform Activation</h2>
              <p className="text-xs text-[#a0a0b8]">Select your gaming platform to view precise instructions</p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {GUIDES.map((g) => (
                <button
                  key={g.platform}
                  onClick={() => setSelectedGuide(g.platform)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedGuide === g.platform
                      ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black shadow-lg shadow-[#00d4ff]/20'
                      : 'bg-white/5 text-[#a0a0b8] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {g.platform}
                </button>
              ))}
            </div>
          </div>

          {/* Active Guide Steps */}
          {GUIDES.filter((g) => g.platform === selectedGuide).map((g) => (
            <div key={g.platform} className="space-y-4">
              <h3 className="text-base font-bold text-[#00d4ff]">
                How to activate keys on {g.platform}:
              </h3>
              <ol className="space-y-3">
                {g.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 text-xs text-white"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* General FAQs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white">Common Questions</h2>
          <div className="space-y-3">
            {EXTENDED_FAQS.map((faq, index) => {
              const isOpen = openFAQ === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#00d4ff] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#a0a0b8] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
