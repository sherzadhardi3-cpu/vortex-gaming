'use client';

// VORTEX GAMING — Interactive FAQ Accordion Section

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How and when will I receive my digital game key?',
    a: 'Instantly after your payment is verified server-to-server, your unique digital key is decrypted and revealed in your VORTEX account under "Purchased Keys". You will also receive an order confirmation email with activation instructions.',
  },
  {
    q: 'Are these digital keys authorized and legitimate?',
    a: 'Yes. VORTEX GAMING exclusively sells genuine activation keys and codes sourced through authorized publishers, official distributors, and legitimate retail supply chains. We strictly prohibit unauthorized accounts and grey-market transfers.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Iraqi electronic payments including FIB (First Iraqi Bank), FastPay, and Qi Card, as well as international Visa and Mastercard via certified PCI DSS-compliant gateways. You can checkout in either USD or Iraqi Dinar (IQD).',
  },
  {
    q: 'What happens if a game key does not activate?',
    a: 'Each key in our inventory vault is unique and tracked. In the rare event of an activation issue, our 24/7 technical support will verify the status directly with the publisher or provider and either provide an immediate replacement or process a full refund.',
  },
  {
    q: 'What is your refund policy on digital goods?',
    a: 'Unredeemed digital keys that have not been exposed or activated are eligible for refund requests within 14 days of purchase in accordance with our transparent Digital Goods Refund Policy.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-[#0a0a0f] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>TRANSPARENCY FIRST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-xs text-[#a0a0b8]">
            Everything you need to know about keys, payments, activation, and security.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl bg-[#12121a] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-[#00d4ff] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#a0a0b8] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00d4ff]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-[#a0a0b8] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 text-xs text-[#a0a0b8]">
          Have more questions? Visit our{' '}
          <Link href="/support" className="text-[#00d4ff] hover:underline font-bold">
            Customer Support Center
          </Link>{' '}
          or create a support ticket.
        </div>
      </div>
    </section>
  );
}
