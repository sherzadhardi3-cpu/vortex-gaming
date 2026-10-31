'use client';

// VORTEX GAMING — Interactive 35 FAQ Knowledge Base & Accordion System
// Features multi-card expansion, real-time query search, category filtering,
// dynamic question count calculation, and multi-language support (EN, KU, AR).

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  ChevronDown,
  Package,
  Gamepad2,
  CreditCard,
  Gift,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Headphones,
  HelpCircle,
  Layers,
  MessageSquare,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  FAQ_CATEGORIES,
  FAQS_DATA,
  getCategoryQuestionCount,
  type FAQCategory,
  type FAQItem,
} from '@/lib/data/faqs';
import { useTranslation } from '@/lib/i18n';

interface FAQAccordionProps {
  initialCategoryId?: string;
  onOpenTicketModal?: (category?: string) => void;
}

export function FAQAccordion({ initialCategoryId = 'all', onOpenTicketModal }: FAQAccordionProps) {
  const { language, isRTL } = useTranslation();
  const lang = (language === 'ku' || language === 'ar') ? language : 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq_od_1']));

  // Toggle single accordion card without collapsing others
  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Helper to resolve icon component for category
  const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Package':
        return <Package className={className} />;
      case 'Gamepad2':
        return <Gamepad2 className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Gift':
        return <Gift className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'RotateCcw':
        return <RotateCcw className={className} />;
      case 'Headphones':
        return <Headphones className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  // Filtered FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    let pool = FAQS_DATA;
    if (selectedCategory !== 'all') {
      pool = pool.filter((item) => item.categoryId === selectedCategory);
    }

    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return pool;
    }

    return pool.filter((item) => {
      const qText = (item[lang]?.q || item.en.q).toLowerCase();
      const aText = (item[lang]?.a || item.en.a).toLowerCase();
      return qText.includes(trimmed) || aText.includes(trimmed);
    });
  }, [selectedCategory, searchQuery, lang]);

  // Selected category metadata
  const currentCategoryMeta = useMemo(() => {
    if (selectedCategory === 'all') {
      return {
        id: 'all',
        name: lang === 'ku' ? 'هەموو پرسیارەکان' : lang === 'ar' ? 'جميع الأسئلة' : 'All Questions',
        count: FAQS_DATA.length,
        description:
          lang === 'ku'
            ? 'سەرجەم پرسیارە باوەکانی تایبەت بە کلیل، داواکاری، پارەدان و هەژمارەکان.'
            : lang === 'ar'
            ? 'تصفح كافة الأسئلة الشائعة حول المفاتيح والطلبات والمدفوعات والحسابات.'
            : 'Comprehensive knowledge base covering keys, orders, payments, accounts, and policies.',
      };
    }
    const cat = FAQ_CATEGORIES.find((c) => c.id === selectedCategory) || FAQ_CATEGORIES[0];
    return {
      id: cat.id,
      name: cat[lang]?.name || cat.en.name,
      count: getCategoryQuestionCount(cat.id),
      description: cat[lang]?.description || cat.en.description,
    };
  }, [selectedCategory, lang]);

  // Helper to highlight matching text in questions and answers
  const renderHighlighted = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-[#00d4ff]/25 text-[#00d4ff] font-bold px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* ─── Search Bar ────────────────────────────────────────────────────── */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ku'
                ? 'گەڕان بۆ پرسیارێک... (بۆ نموونە: گەیاندن، گەڕاندنەوە، هەژمار)'
                : lang === 'ar'
                ? 'ابحث عن سؤال... (مثال: التسليم، الاسترجاع، الحساب)'
                : 'Search for a question... (e.g. delivery, refund, account)'
            }
            className={`w-full h-13 pl-12 pr-28 bg-[#0c1326] text-sm text-white placeholder-[#7888a6] rounded-2xl border border-[#1b2a4a] focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/30 outline-none transition-all shadow-inner ${
              isRTL ? 'pl-28 pr-12 text-right' : ''
            }`}
          />
          <Search
            className={`w-5 h-5 text-[#7888a6] absolute pointer-events-none ${
              isRTL ? 'right-4' : 'left-4'
            }`}
          />
          
          <div className={`absolute flex items-center gap-2 ${isRTL ? 'left-2.5' : 'right-2.5'}`}>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#7888a6] hover:text-white transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs shadow-md shadow-[#0070f3]/30 transition-all"
            >
              {lang === 'ku' ? 'گەڕان' : lang === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="mt-2 text-xs text-[#7888a6] flex items-center justify-between px-2">
            <span>
              {lang === 'ku'
                ? `ئەنجامەکانی گەڕان بۆ "${searchQuery}": ${filteredFaqs.length} پرسیار دۆزرایەوە`
                : lang === 'ar'
                ? `نتائج البحث عن "${searchQuery}": تم العثور على ${filteredFaqs.length} سؤال`
                : `Search results for "${searchQuery}": found ${filteredFaqs.length} questions`}
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#00d4ff] hover:underline font-semibold"
            >
              {lang === 'ku' ? 'پاککردنەوەی گەڕان' : lang === 'ar' ? 'مسح البحث' : 'Clear search'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Horizontal Category Shortcuts for Mobile & Quick Selection ──── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
              : 'bg-[#0c1326] text-[#8a99b5] hover:text-white border border-[#1b2a4a]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === 'ku' ? 'هەموو' : lang === 'ar' ? 'الكل' : 'All Questions'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {FAQS_DATA.length}
          </span>
        </button>

        {FAQ_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryQuestionCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                  : 'bg-[#0c1326] text-[#8a99b5] hover:text-white border border-[#1b2a4a]'
              }`}
            >
              {getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
              <span>{cat[lang]?.name || cat.en.name}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Two-Column Layout (Desktop Category Sidebar + FAQs Accordion) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Category Sidebar (4 Columns on desktop) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
          <div className="rounded-3xl bg-[#080d1f] border border-[#1b2a4a] p-4 shadow-xl">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-[#7888a6] border-b border-[#142038] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>{lang === 'ku' ? 'بەشەکانی پرسیار' : lang === 'ar' ? 'تصنيفات الأسئلة' : 'FAQ Categories'}</span>
              </span>
              <span className="font-mono text-[#00d4ff] font-bold">{FAQS_DATA.length} Total</span>
            </div>

            <div className="space-y-1">
              {/* All Questions Row */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                    : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[#0c162d] text-[#00d4ff] border border-[#1b2a4a]'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="truncate">
                    {lang === 'ku' ? 'هەموو پرسیارەکان' : lang === 'ar' ? 'جميع الأسئلة' : 'All Questions'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                  selectedCategory === 'all' ? 'bg-black/30 text-white' : 'bg-[#0c162d] text-[#7888a6] border border-[#1b2a4a]'
                }`}>
                  {FAQS_DATA.length}
                </span>
              </button>

              {/* Individual Category Rows */}
              {FAQ_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = getCategoryQuestionCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#0070f3] text-white shadow-lg shadow-[#0070f3]/40 border border-[#0070f3]'
                        : 'text-[#8a99b5] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isSelected ? 'bg-white/20 text-white scale-105' : 'bg-[#0c162d] border border-[#1b2a4a]'
                        }`}
                        style={{ color: isSelected ? '#ffffff' : cat.accentColor }}
                      >
                        {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                      </div>
                      <span className="truncate">{cat[lang]?.name || cat.en.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-[#0c162d] text-[#7888a6] border border-[#1b2a4a]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Support Assistance Card in Sidebar */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0c162d] to-[#080d1f] border border-[#1b2a4a] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Headphones className="w-4 h-4 text-[#00d4ff]" />
              <span>{lang === 'ku' ? 'پێویستت بە یارمەتی زیاترە؟' : lang === 'ar' ? 'تحتاج إلى مساعدة إضافية؟' : 'Need specialized help?'}</span>
            </div>
            <p className="text-xs text-[#8a99b5] leading-relaxed">
              {lang === 'ku'
                ? 'ئەگەر پرسیارەکەت لە لیستی پرسیارە باوەکاندا نییە، تیکتێکی پشتیوانی بنێرە.'
                : lang === 'ar'
                ? 'إذا لم تجد إجابة لسؤالك، تواصل مع فريقنا عبر فتح تذكرة دعم مباشرة.'
                : 'If your inquiry is not answered in the knowledge base, open a support ticket.'}
            </p>
            {onOpenTicketModal && (
              <button
                onClick={() => onOpenTicketModal(selectedCategory !== 'all' ? selectedCategory : undefined)}
                className="w-full py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>{lang === 'ku' ? 'ناردنی تیکتی نوێ' : lang === 'ar' ? 'فتح تذكرة دعم' : 'Submit a Ticket'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </aside>

        {/* Right Main Accordion Area (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Category Header Bar & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[#080d1f] border border-[#1b2a4a] shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {currentCategoryMeta.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/40">
                  {filteredFaqs.length} {lang === 'ku' ? 'پرسیار' : lang === 'ar' ? 'أسئلة' : 'Questions'}
                </span>
              </div>
              <p className="text-xs text-[#8a99b5] mt-0.5 line-clamp-1">
                {currentCategoryMeta.description}
              </p>
            </div>

            {filteredFaqs.length > 0 && (
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#8a99b5] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {lang === 'ku' ? 'کردنەوەی هەموو' : lang === 'ar' ? 'توسيع الكل' : 'Expand All'}
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#8a99b5] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {lang === 'ku' ? 'داخستنی هەموو' : lang === 'ar' ? 'طي الكل' : 'Collapse All'}
                </button>
              </div>
            )}
          </div>

          {/* Empty Results State */}
          {filteredFaqs.length === 0 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#0070f3]/10 border border-[#0070f3]/30 text-[#00d4ff] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'ku' ? 'هیچ ئەنجامێک نەدۆزرایەوە' : lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No matching questions found'}
              </h3>
              <p className="text-xs text-[#8a99b5] max-w-md mx-auto leading-relaxed">
                {lang === 'ku'
                  ? `هیچ پرسیارێک هاوتا نەبوو لەگەڵ پیتەکانی "${searchQuery}". دەتوانیت وشەی گەڕانەکەت بگۆڕیت یان پەیوەندی بە تیمەکەمان بکەیت.`
                  : lang === 'ar'
                  ? `لم نتمكن من العثور على أي أسئلة مطابقة لكلمة "${searchQuery}". يمكنك مسح البحث أو إرسال تذكرة مباشرة لمساعدتك.`
                  : `We couldn't find any questions matching "${searchQuery}". Try a different keyword or create a support ticket.`}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
                >
                  {lang === 'ku' ? 'پاککردنەوەی گەڕان' : lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                </button>
                {onOpenTicketModal && (
                  <button
                    onClick={() => onOpenTicketModal(selectedCategory !== 'all' ? selectedCategory : undefined)}
                    className="px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>{lang === 'ku' ? 'ناردنی تیکت بۆ پشتیوانی' : lang === 'ar' ? 'فتح تذكرة للدعم' : 'Submit Support Ticket'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Accordion Questions List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedIds.has(faq.id);
              const category = FAQ_CATEGORIES.find((c) => c.id === faq.categoryId);
              const qString = faq[lang]?.q || faq.en.q;
              const aString = faq[lang]?.a || faq.en.a;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 overflow-hidden border ${
                    isExpanded
                      ? 'bg-[#0c162d] border-[#0070f3]/60 shadow-lg shadow-[#0070f3]/10 ring-1 ring-[#0070f3]/20'
                      : 'bg-[#080d1f] border-[#1b2a4a] hover:border-[#0070f3]/40'
                  }`}
                >
                  {/* Card Click Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isExpanded}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Category Badge Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isExpanded ? 'scale-105 bg-white/10' : 'bg-[#0c162d] border border-[#1b2a4a]'
                        }`}
                        style={{ color: category?.accentColor || '#00d4ff' }}
                      >
                        {getCategoryIcon(category?.iconName || 'HelpCircle', 'w-4 h-4')}
                      </div>

                      {/* Question Text */}
                      <span className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-2">
                        {renderHighlighted(qString, searchQuery)}
                      </span>
                    </div>

                    {/* Expand Chevron Icon */}
                    <div
                      className={`p-1.5 rounded-lg border transition-all duration-200 shrink-0 ${
                        isExpanded
                          ? 'bg-[#0070f3] text-white border-[#0070f3] rotate-180 shadow-sm shadow-[#0070f3]/40'
                          : 'bg-white/5 text-[#8a99b5] border-white/5 group-hover:text-white'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expanded Answer Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#93c5fd] leading-relaxed border-t border-[#142038] mt-1 space-y-3">
                      <p className="text-[#a0c4ff]/90 leading-relaxed font-normal">
                        {renderHighlighted(aString, searchQuery)}
                      </p>

                      {/* Bottom Footer Tags / Direct Action */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5 text-[11px] text-[#7888a6]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category?.accentColor || '#00d4ff' }} />
                          <span>{category?.[lang]?.name || category?.en.name}</span>
                        </span>

                        {onOpenTicketModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTicketModal(faq.categoryId);
                            }}
                            className="text-[#00d4ff] hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>{lang === 'ku' ? 'پرسیار لەسەر ئەمە' : lang === 'ar' ? 'استفسر حول هذا' : 'Inquire about this'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
