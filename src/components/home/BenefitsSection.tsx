'use client';

// VORTEX GAMING — Customer Benefits & Trust Pillars
// Highlights key guarantees: Instant automated delivery, 100% genuine keys, secure checkout, 24/7 support

import React from 'react';
import { Zap, ShieldCheck, Lock, Headphones } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function BenefitsSection() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Zap,
      title: t('trust.instantDelivery'),
      description: t('trust.instantDeliveryDesc'),
      color: 'text-[#00d4ff]',
      border: 'hover:border-[#00d4ff]/40',
    },
    {
      icon: ShieldCheck,
      title: t('trust.genuineProducts'),
      description: t('trust.genuineProductsDesc'),
      color: 'text-emerald-400',
      border: 'hover:border-emerald-400/40',
    },
    {
      icon: Lock,
      title: t('trust.securePayment'),
      description: t('trust.securePaymentDesc'),
      color: 'text-[#7c3aed]',
      border: 'hover:border-[#7c3aed]/40',
    },
    {
      icon: Headphones,
      title: t('trust.support'),
      description: t('trust.supportDesc'),
      color: 'text-amber-400',
      border: 'hover:border-amber-400/40',
    },
  ];
  return (
    <section className="py-20 bg-[#07070a] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] font-mono">
            THE VORTEX ADVANTAGE
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
            BUILT FOR SERIOUS GAMERS
          </h2>
          <p className="text-xs sm:text-sm text-[#a0a0b8] mt-2">
            Engineered from the ground up for speed, security, and transparent retail excellence.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-[#12121a] border border-white/10 ${item.border} transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black flex flex-col justify-between space-y-4`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-[#a0a0b8] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                  Guaranteed
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
