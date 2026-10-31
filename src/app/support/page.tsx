'use client';

// VORTEX GAMING — Unified Customer Support Center & Knowledge Base
// Integrates breadcrumb navigation, cinematic FAQ banner, 35-item dynamic FAQ accordion,
// category-aware search, PostgreSQL-backed ticket management, and contact channels.

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  HelpCircle,
  MessageSquare,
  Package,
  Headphones,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { SupportTicketDesk } from '@/components/support/SupportTicketDesk';
import { FAQS_DATA } from '@/lib/data/faqs';

type SupportTab = 'faq' | 'tickets' | 'new-ticket' | 'contact';

function SupportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') as SupportTab) || 'faq';
  const initialOrderId = searchParams.get('orderId') || undefined;
  const initialCategory = searchParams.get('category') || undefined;

  const { user, isAuthenticated } = useAuthStore();
  const { language, isRTL } = useTranslation();
  const lang = (language === 'ku' || language === 'ar') ? language : 'en';

  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);
  const [ticketModalCategory, setTicketModalCategory] = useState<string | undefined>(initialCategory);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SupportTab;
    if (tabParam && ['faq', 'tickets', 'new-ticket', 'contact'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SupportTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/support?${params.toString()}`, { scroll: false });
  };

  const handleOpenTicketFromFaq = (category?: string) => {
    setTicketModalCategory(category);
    handleTabChange('new-ticket');
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#060a17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ─── 1. Breadcrumb Navigation ────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#7888a6] overflow-x-auto no-scrollbar"
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
            {activeTab === 'faq'
              ? lang === 'ku' ? 'پرسیارە باوەکان' : lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'
              : activeTab === 'tickets'
              ? lang === 'ku' ? 'تیکتەکانی من' : lang === 'ar' ? 'تذاكر الدعم' : 'My Tickets'
              : activeTab === 'new-ticket'
              ? lang === 'ku' ? 'ناردنی تیکت' : lang === 'ar' ? 'فتح تذكرة' : 'Submit Ticket'
              : lang === 'ku' ? 'کەناڵەکانی پەیوەندی' : lang === 'ar' ? 'قنوات التواصل' : 'Contact Information'}
          </span>
        </nav>

        {/* ─── 2. Cinematic FAQ Banner ─────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden border border-[#1b2a4a] bg-[#080d1f] p-8 sm:p-12 shadow-2xl group">
          {/* Ambient Lighting & High-Tech Imagery */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/hero-game-accounts-banner.jpg"
              alt="VORTEX Support Banner"
              className="w-full h-full object-cover object-right opacity-30 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a17] via-[#060a17]/95 to-[#060a17]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a17] via-transparent to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0070f3]/15 blur-[120px] rounded-full pointer-events-none" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0070f3]/20 border border-[#0070f3]/40 backdrop-blur-md text-[#00d4ff] text-xs font-black uppercase tracking-widest shadow-sm">
              <Headphones className="w-3.5 h-3.5" />
              <span>{lang === 'ku' ? 'مێزی یارمەتی و پشتیوانی گەیمەران' : lang === 'ar' ? 'مكتب مساعدة ودعم اللاعبين' : 'HELP & SUPPORT DESK'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow leading-tight">
              {lang === 'ku' ? (
                <>پرسیارە <span className="text-[#00d4ff]">باوەکان</span></>
              ) : lang === 'ar' ? (
                <>الأسئلة <span className="text-[#00d4ff]">الشائعة</span></>
              ) : (
                <>Frequently Asked <span className="text-[#00d4ff]">Questions</span></>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#a0c4ff] max-w-2xl font-normal leading-relaxed">
              {lang === 'ku'
                ? 'وەڵامی خێرا بدۆزەرەوە بۆ پرسیارە باوەکانی تایبەت بە داواکارییەکان، هەژمارەکان، پارەدان و هیتر.'
                : lang === 'ar'
                ? 'اعثر على إجابات سريعة وموثوقة للأسئلة الشائعة حول الطلبات، الحسابات، المدفوعات والمزيد.'
                : 'Find quick answers to common questions about orders, accounts, payments, and more.'}
            </p>

            {/* Quick Metrics Strip */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0c162d]/80 border border-[#1b2a4a] backdrop-blur-md">
                <div className="text-[#7888a6] text-[10px] uppercase font-bold">Knowledge Base</div>
                <div className="text-sm font-black font-mono text-white mt-0.5">{FAQS_DATA.length} Verified FAQs</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0c162d]/80 border border-[#1b2a4a] backdrop-blur-md">
                <div className="text-[#7888a6] text-[10px] uppercase font-bold">Categories</div>
                <div className="text-sm font-black font-mono text-[#00d4ff] mt-0.5">10 Core Topics</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0c162d]/80 border border-[#1b2a4a] backdrop-blur-md">
                <div className="text-[#7888a6] text-[10px] uppercase font-bold">Ticket Response</div>
                <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">&lt; 1 Business Day</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0c162d]/80 border border-[#1b2a4a] backdrop-blur-md">
                <div className="text-[#7888a6] text-[10px] uppercase font-bold">Key Vault Release</div>
                <div className="text-sm font-black font-mono text-purple-400 mt-0.5">24/7 Automated</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. Main Support Center Tabs ─────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#142038] pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('faq')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === 'faq'
                ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'ku' ? 'پرسیارە باوەکان' : lang === 'ar' ? 'الأسئلة الشائعة' : 'Knowledge Base & FAQs'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
              {FAQS_DATA.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('tickets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === 'tickets'
                ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'ku' ? 'تیکتەکانی من' : lang === 'ar' ? 'تذاكر الدعم' : 'My Support Tickets'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('new-ticket')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === 'new-ticket'
                ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'ku' ? 'ناردنی تیکت' : lang === 'ar' ? 'فتح تذكرة جديدة' : 'Submit a Ticket'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('contact')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === 'contact'
                ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{lang === 'ku' ? 'کەناڵەکانی پەیوەندی' : lang === 'ar' ? 'قنوات التواصل وساعات العمل' : 'Direct Channels & Hours'}</span>
          </button>
        </div>

        {/* ─── 4. Tab Panels ──────────────────────────────────────────────── */}
        
        {/* Tab 1: Knowledge Base & FAQs */}
        {activeTab === 'faq' && (
          <FAQAccordion onOpenTicketModal={handleOpenTicketFromFaq} />
        )}

        {/* Tab 2: My Support Tickets */}
        {activeTab === 'tickets' && (
          <SupportTicketDesk
            initialOrderId={initialOrderId}
            initialCategory={ticketModalCategory}
          />
        )}

        {/* Tab 3: Submit a Ticket */}
        {activeTab === 'new-ticket' && (
          <div className="max-w-3xl mx-auto">
            <SupportTicketDesk
              initialOrderId={initialOrderId}
              initialCategory={ticketModalCategory}
              onTicketCreated={() => handleTabChange('tickets')}
            />
          </div>
        )}

        {/* Tab 4: Direct Channels & Hours */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Channel 1: Ticket Desk */}
            <div className="p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0070f3]/15 border border-[#0070f3]/30 text-[#00d4ff] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Support Ticket Desk</h3>
                <p className="text-xs text-[#8a99b5] leading-relaxed">
                  Best for key activation assistance, order lookups, and account queries. Responses are monitored with typical replies within 1 business day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('new-ticket')}
                className="w-full py-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/30 transition-all"
              >
                <span>Submit Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Channel 2: Official Support Email */}
            <div className="p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Direct Email Inquiries</h3>
                <p className="text-xs text-[#8a99b5] leading-relaxed">
                  For publisher verification, corporate licensing, and bulk orders. All inquiries generate an authorized tracking ticket automatically.
                </p>
                <div className="p-3 rounded-xl bg-[#0c162d] border border-[#1b2a4a] text-xs font-mono font-bold text-[#00d4ff]">
                  support@vortexgaming.gg
                </div>
              </div>
              <a
                href="mailto:support@vortexgaming.gg"
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs text-center transition-colors block"
              >
                Launch Mail Client
              </a>
            </div>

            {/* Channel 3: Operating Hours & Status */}
            <div className="p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Operating Hours</h3>
                <div className="space-y-2 text-xs text-[#8a99b5] leading-relaxed">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Automated Vault:</span>
                    <span className="font-bold text-emerald-400 font-mono">24/7 Continuous</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Help Desk Staff:</span>
                    <span className="font-bold text-white font-mono">09:00 – 22:00 (GMT+3)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Ticket Response:</span>
                    <span className="font-bold text-[#00d4ff] font-mono">&lt; 1 Business Day</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('faq')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs text-center transition-colors block"
              >
                Browse Self-Service FAQs
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="pt-32 min-h-screen bg-[#060a17]" />}>
      <SupportPageContent />
    </Suspense>
  );
}
