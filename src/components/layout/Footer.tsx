'use client';

// VORTEX GAMING — Premium Gaming Storefront Footer & Bottom Utilities
// Features: Brand identity, quick links, services, interactive newsletter with real API,
// trust badges, supported payment methods, bottom legal bar, and back-to-top utility.

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Mail,
  CheckCircle,
  CreditCard,
  Lock,
  ArrowUp,
  Headphones,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { VortexLogo } from '@/components/brand/VortexLogo';
import { useTranslation } from '@/lib/i18n';

// Social media links
const SOCIAL_LINKS = [
  {
    name: 'Official Discord Community (Active)',
    href: 'https://discord.gg/vortexgaming',
    color: 'hover:text-[#5865F2] hover:border-[#5865F2]/40',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  {
    name: 'Official X / Twitter Channel',
    href: 'https://x.com/vortexgaming',
    color: 'hover:text-[#00d4ff] hover:border-[#00d4ff]/40',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Official Instagram Channel',
    href: 'https://instagram.com/vortexgaming',
    color: 'hover:text-pink-400 hover:border-pink-500/40',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'Official YouTube Channel',
    href: 'https://youtube.com/@vortexgaming',
    color: 'hover:text-red-500 hover:border-red-500/40',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'Official Twitch Stream',
    href: 'https://twitch.tv/vortexgaming',
    color: 'hover:text-purple-400 hover:border-purple-500/40',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
    ),
  },
];

export function Footer() {
  const { t, isRTL } = useTranslation();

  // Newsletter state
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    if (!consent) {
      setStatusMessage({
        type: 'error',
        text: 'Please check the consent box to receive game alerts.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, consent }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to subscribe. Please try again.');
      }

      setStatusMessage({
        type: 'success',
        text: data.message || t('footer.subscribedSuccess'),
      });
      setEmail('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Subscription failed. Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#07070a] border-t border-white/10 text-sm text-[#a0a0b8] pt-16 pb-12 relative">
      
      {/* Background Cyber Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7c3aed]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Socials (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <VortexLogo size="md" />

            <p className="text-xs text-[#a0a0b8] leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>

            {/* Support Email */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b80]">
                {t('footer.supportEmailLabel')}
              </span>
              <div>
                <a
                  href="mailto:support@vortexgaming.gg"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00d4ff] hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00d4ff] group-hover:scale-110 transition-transform" />
                  <span>support@vortexgaming.gg</span>
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b80]">
                Official Community & Channels
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className={`w-9 h-9 rounded-xl bg-[#12121a] border border-white/10 flex items-center justify-center text-[#a0a0b8] transition-all duration-200 ${item.color} hover:scale-105 shadow-md`}
                    title={item.name}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Compact Trust Features */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12121a] border border-white/10 text-[11px] text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{t('footer.trustSecureCheckout')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12121a] border border-white/10 text-[11px] text-white">
                <Lock className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span className="font-semibold">{t('footer.trustDataEncryption')}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.quickLinks')}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.store')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.support')}
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.account')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.services')}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/store?type=GAME" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.gameKeys')}
                </Link>
              </li>
              <li>
                <Link href="/store?type=GIFT_CARD" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.giftCards')}
                </Link>
              </li>
              <li>
                <Link href="/store?type=TOP_UP" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.topUps')}
                </Link>
              </li>
              <li>
                <Link href="/store?type=SUBSCRIPTION" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.subscriptions')}
                </Link>
              </li>
              <li>
                <Link href="/store?platform=steam" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.pcGames')}
                </Link>
              </li>
              <li>
                <Link href="/store?platform=playstation" className="hover:text-[#00d4ff] transition-colors">
                  {t('footer.consoleGames')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Subscribe */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.newsletterTitle')}
            </div>
            <p className="text-xs text-[#a0a0b8] leading-relaxed">
              {t('footer.newsletterDesc')}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('footer.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 pr-24 rounded-xl bg-[#12121a] border border-white/10 text-xs text-white placeholder-[#6b6b80] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !consent}
                  className="absolute right-1 top-1 h-8 px-3 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 shadow-md shadow-[#00d4ff]/20"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">{t('footer.subscribing')}</span>
                  ) : (
                    <span>{t('footer.subscribeBtn')}</span>
                  )}
                </button>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-[#6b6b80] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded bg-[#12121a] border-white/10 text-[#00d4ff] focus:ring-0"
                />
                <span className="leading-tight">{t('footer.consentLabel')}</span>
              </label>

              {/* Status Feedback Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-tight">{statusMessage.text}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Middle Trust & Payment Row */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5">
          
          {/* Trust Pillars */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#a0a0b8]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span className="font-semibold text-white">{t('footer.trustInstantDelivery')}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-white">{t('footer.trustSupport')}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">{t('footer.trustSecureCheckout')}</span>
            </div>
          </div>

          {/* Payment Badges & Integrations */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#6b6b80] font-semibold mr-1">
                {t('footer.paymentMethods')}
              </span>
              
              {/* Live PCI DSS Gateway */}
              <div className="px-2.5 py-1 rounded-lg bg-[#12121a] border border-[#00d4ff]/30 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                <CreditCard className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Visa / Mastercard</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00d4ff]/15 text-[#00d4ff] font-extrabold uppercase">
                  {t('footer.paymentLive')}
                </span>
              </div>

              {/* Regional Iraqi Integrations (Clearly labeled Sandbox) */}
              <div className="px-2.5 py-1 rounded-lg bg-[#12121a] border border-white/10 text-[11px] font-bold text-[#a0a0b8] flex items-center gap-1.5 shadow-sm">
                <span className="text-emerald-400/90">FIB Bank</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0b8] font-mono">
                  {t('footer.paymentSandbox')}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#12121a] border border-white/10 text-[11px] font-bold text-[#a0a0b8] flex items-center gap-1.5 shadow-sm">
                <span className="text-amber-400/90">FastPay</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0b8] font-mono">
                  {t('footer.paymentSandbox')}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#12121a] border border-white/10 text-[11px] font-bold text-[#a0a0b8] flex items-center gap-1.5 shadow-sm">
                <span className="text-cyan-400/90">Qi Card</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0b8] font-mono">
                  {t('footer.paymentSandbox')}
                </span>
              </div>
            </div>

            {/* Clear Compliance & Sandbox Notice */}
            <p className="text-[10px] text-[#6b6b80] leading-relaxed max-w-xl">
              * {t('footer.paymentSandboxNotice')}
            </p>
          </div>

        </div>

        {/* Bottom Utility Bar: Legal Links & Back-to-Top */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6b6b80]">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            {t('footer.copyright')}
          </div>

          {/* Legal Links & Back to Top Button */}
          <div className="flex items-center gap-6">
            <ul className="flex items-center gap-4 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  {t('footer.refundPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>

            {/* Back to Top Utility Button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12121a] border border-white/10 text-xs font-semibold text-[#a0a0b8] hover:text-white hover:border-[#00d4ff]/40 hover:bg-white/5 transition-all shadow-md group"
              title={t('footer.backToTop')}
              aria-label={t('footer.backToTop')}
            >
              <span>{t('footer.backToTop')}</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#00d4ff] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
