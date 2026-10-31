'use client';

// VORTEX GAMING — Unified Floating Customer Support Desk
// Features: FAQ search shortcut, Create Support Ticket, View My Tickets,
// Order Help, Contact Support, and PostgreSQL-synced ticket thread messaging.
// Truthful non-simulated support: explicitly states 1 business day human response SLA.

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  ShieldCheck,
  Clock,
  Volume2,
  VolumeX,
  ChevronLeft,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  Search,
  Package,
  Mail,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import type { SupportTicket, SupportMessage } from '@/lib/support/support-store';
import { FAQS_DATA, searchFaqs, getFaqsForCategory } from '@/lib/data/faqs';

type WidgetView = 'faq' | 'tickets' | 'new-ticket' | 'order-help' | 'contact';

export function SupportWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const { t, language, isRTL } = useTranslation();
  const lang = (language === 'ku' || language === 'ar') ? language : 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<WidgetView>('faq');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('KEY_ACTIVATION');
  const [linkedOrderId, setLinkedOrderId] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FAQ Search state inside widget
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Customer orders state for Order Help tab
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const effectiveEmail = isAuthenticated ? user?.email : guestEmail;
  const effectiveName = isAuthenticated
    ? (user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`).trim()
    : guestName || 'Gamer';

  // Fetch tickets for current user
  const fetchTickets = async () => {
    if (!effectiveEmail && !user?.id) return;
    try {
      const params = new URLSearchParams();
      if (user?.id) params.set('userId', user.id);
      if (effectiveEmail) params.set('email', effectiveEmail);
      if (user?.role) params.set('role', user.role);

      const res = await fetch(`/api/support/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);

        if (activeTicket) {
          const updated = data.tickets.find((t: SupportTicket) => t.id === activeTicket.id);
          if (updated) setActiveTicket(updated);
        } else if (data.tickets.length > 0 && currentView === 'tickets') {
          setActiveTicket(data.tickets[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch support messages:', err);
    }
  };

  // Fetch orders for logged-in user
  const fetchCustomerOrders = async () => {
    if (!user?.email && !user?.id) return;
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (user.id) params.set('userId', user.id);
      if (user.email) params.set('email', user.email);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setCustomerOrders(data.orders);
      }
    } catch (err) {
      console.warn('Failed to load orders for support widget:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Listen for open events (including order associations from order details)
  useEffect(() => {
    if (effectiveEmail || user?.id) {
      fetchTickets();
    }

    const handleOpen = (e?: Event) => {
      setIsOpen(true);
      const detail = (e as CustomEvent)?.detail;
      if (detail) {
        if (detail.subject) setNewSubject(detail.subject);
        if (detail.orderId) setLinkedOrderId(detail.orderId);
        setCurrentView('new-ticket');
      }
    };

    window.addEventListener('vtx_open_support_widget', handleOpen);
    return () => window.removeEventListener('vtx_open_support_widget', handleOpen);
  }, [effectiveEmail, user?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
      if (isAuthenticated) {
        fetchCustomerOrders();
      }
      const interval = setInterval(fetchTickets, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, effectiveEmail, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  // Filtered FAQs for widget quick search
  const filteredWidgetFaqs = faqSearchQuery.trim()
    ? searchFaqs(faqSearchQuery, null, lang)
    : getFaqsForCategory(null, lang).slice(0, 5);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const optimisticMsg: SupportMessage = {
      id: `opt_${Date.now()}`,
      ticketId: activeTicket.id,
      sender: 'CUSTOMER',
      senderName: effectiveName,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    setActiveTicket({
      ...activeTicket,
      messages: [...activeTicket.messages, optimisticMsg],
    });

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          ticketId: activeTicket.id,
          userId: user?.id,
          userEmail: effectiveEmail,
          userName: effectiveName,
          message: messageText,
          role: user?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to deliver message:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || !effectiveEmail?.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ticket',
          userId: user?.id,
          userEmail: effectiveEmail.trim(),
          userName: effectiveName.trim(),
          subject: newSubject.trim(),
          category: newCategory,
          orderId: linkedOrderId.trim() || undefined,
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets([data.ticket, ...tickets]);
        setActiveTicket(data.ticket);
        setCurrentView('tickets');
        setNewMessage('');
        setNewSubject('');
        setLinkedOrderId('');
      }
    } catch (err) {
      console.error('Failed to create support ticket:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openOrderTicket = (orderId: string, orderNumber: string) => {
    setLinkedOrderId(orderId);
    setNewCategory('ORDER_INQUIRY');
    setNewSubject(`Inquiry regarding Order #${orderNumber}`);
    setCurrentView('new-ticket');
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative p-3.5 sm:px-4 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#0070f3] text-white font-black shadow-xl shadow-[#0070f3]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
          aria-label={t('support.openChat')}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <div className="relative">
                <Headphones className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#060a17]" />
              </div>
              <span className="hidden sm:inline text-xs tracking-wider uppercase font-black">
                {t('support.openChat')}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Support Chat Panel Drawer */}
      {isOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-[#0a1128] border-b border-[#1b2a4a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTicket && currentView === 'tickets' ? (
                <button
                  onClick={() => setActiveTicket(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#8a99b5]"
                  title="Back to Tickets"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#0070f3]/20 border border-[#0070f3]/40 flex items-center justify-center">
                  <Headphones className="w-4.5 h-4.5 text-[#00d4ff]" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>VORTEX Support Desk</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>SLA: Human reply &lt; 1 Business Day</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-xl text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                title={t('support.soundToggle')}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#8a99b5] hover:text-white hover:bg-white/5 transition-colors"
                title={t('support.closeChat')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Nav Bar (5 Shortcuts) */}
          <div className="px-2 py-1.5 bg-[#070b18] border-b border-[#142038] grid grid-cols-5 gap-1 text-[10px] font-bold">
            <button
              onClick={() => {
                setCurrentView('faq');
                setActiveTicket(null);
              }}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                currentView === 'faq'
                  ? 'bg-[#0070f3] text-white shadow-sm'
                  : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="truncate">FAQs</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('new-ticket');
                setActiveTicket(null);
              }}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                currentView === 'new-ticket'
                  ? 'bg-[#0070f3] text-white shadow-sm'
                  : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="truncate">New Ticket</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('tickets');
                fetchTickets();
              }}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                currentView === 'tickets'
                  ? 'bg-[#0070f3] text-white shadow-sm'
                  : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="truncate">My Tickets</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('order-help');
                if (isAuthenticated) fetchCustomerOrders();
              }}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                currentView === 'order-help'
                  ? 'bg-[#0070f3] text-white shadow-sm'
                  : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="truncate">Order Help</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('contact');
                setActiveTicket(null);
              }}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                currentView === 'contact'
                  ? 'bg-[#0070f3] text-white shadow-sm'
                  : 'text-[#8a99b5] hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">Contact</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#060a17]">
            
            {/* VIEW 1: FAQ SEARCH SHORTCUT */}
            {currentView === 'faq' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    placeholder="Search 35 FAQs (e.g. key, refund, PIN)..."
                    className="w-full h-10 pl-9 pr-4 bg-[#0a1128] text-xs text-white placeholder-[#7888a6] rounded-xl border border-[#1b2a4a] focus:border-[#0070f3] outline-none"
                  />
                  <Search className="w-4 h-4 text-[#7888a6] absolute left-3 top-3 pointer-events-none" />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#8a99b5] uppercase tracking-wider flex items-center justify-between">
                    <span>{faqSearchQuery.trim() ? 'Search Results' : 'Common Questions'}</span>
                    <Link
                      href="/support"
                      className="text-[#00d4ff] hover:underline flex items-center gap-1 lowercase"
                    >
                      <span>full knowledge base</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {filteredWidgetFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    const qText = faq.q;
                    const aText = faq.a;

                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl bg-[#0a1128] border border-[#1b2a4a] overflow-hidden text-xs"
                      >
                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-3 text-left flex items-center justify-between gap-2 hover:bg-white/5"
                        >
                          <span className="font-semibold text-white">{qText}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-[#00d4ff] transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 text-[11px] text-[#8a99b5] leading-relaxed border-t border-[#142038]">
                            {aText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0a1128] border border-[#1b2a4a] text-center space-y-2">
                  <div className="text-xs font-bold text-white">Can't find what you need?</div>
                  <p className="text-[11px] text-[#8a99b5]">
                    Open a support ticket and a specialist will inspect your account or key issue.
                  </p>
                  <button
                    onClick={() => setCurrentView('new-ticket')}
                    className="px-4 py-2 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Submit a Ticket</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: CREATE SUPPORT TICKET */}
            {currentView === 'new-ticket' && (
              <form onSubmit={handleCreateTicket} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>Create Support Ticket</span>
                  {linkedOrderId && (
                    <span className="text-[10px] text-[#00d4ff] bg-[#0070f3]/20 px-2 py-0.5 rounded-full border border-[#0070f3]/30">
                      Order Linked
                    </span>
                  )}
                </div>

                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="text-[10px] text-[#8a99b5] block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full h-9 px-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a99b5] block mb-1">
                        {t('support.guestEmailPrompt')}
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="gamer@example.com"
                        className="w-full h-9 px-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] text-[#8a99b5] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-9 px-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  >
                    <option value="KEY_ACTIVATION">Key Activation Help</option>
                    <option value="ORDER_INQUIRY">Order & License Status</option>
                    <option value="PAYMENT">Payment & Refund</option>
                    <option value="ACCOUNT">Account & PIN Security</option>
                    <option value="GENERAL">General Support</option>
                  </select>
                </div>

                {customerOrders.length > 0 && (
                  <div>
                    <label className="text-[10px] text-[#8a99b5] block mb-1">Associate With Order (Optional)</label>
                    <select
                      value={linkedOrderId}
                      onChange={(e) => setLinkedOrderId(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                    >
                      <option value="">No specific order</option>
                      {customerOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.orderNumber} ({o.paymentStatus} • {o.fulfillmentStatus})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-[#8a99b5] block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder={t('support.subjectPlaceholder')}
                    className="w-full h-9 px-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8a99b5] block mb-1">Inquiry Details</label>
                  <textarea
                    required
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('support.inputPlaceholder')}
                    className="w-full p-3 text-xs bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('faq')}
                    className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#8a99b5] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: VIEW MY TICKETS / CONVERSATION THREAD */}
            {currentView === 'tickets' && (
              <div className="space-y-3">
                {activeTicket ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#0a1128] border border-[#1b2a4a] text-xs">
                      <div className="font-bold text-white">{activeTicket.subject}</div>
                      <div className="text-[10px] text-[#8a99b5] flex items-center justify-between mt-1">
                        <span>Ticket #{activeTicket.ticketNumber || activeTicket.id.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#0070f3]/20 text-[#00d4ff] font-bold">
                          {activeTicket.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {activeTicket.messages.map((msg) => {
                        const isUser = msg.sender === 'CUSTOMER';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                          >
                            <div className="text-[10px] text-[#6b6b80] px-1">
                              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div
                              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-[#0070f3] text-white rounded-br-none shadow-md'
                                  : 'bg-[#142038] text-white rounded-bl-none border border-white/10'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type reply to ticket..."
                        className="flex-1 h-10 px-3 bg-[#0a1128] border border-[#1b2a4a] rounded-xl text-xs text-white outline-none focus:border-[#0070f3]"
                      />
                      <button
                        type="submit"
                        className="px-4 h-10 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white text-xs font-bold transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#8a99b5] uppercase tracking-wider">
                      Your Support History ({tickets.length})
                    </div>
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTicket(t)}
                        className="w-full p-3 rounded-xl bg-[#0a1128] hover:bg-[#0e1736] border border-[#1b2a4a] text-left transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-white truncate">{t.subject}</div>
                          <div className="text-[10px] text-[#8a99b5] mt-0.5">
                            {new Date(t.createdAt).toLocaleDateString()} • {t.messages.length} messages
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/40 shrink-0">
                          {t.status}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00d4ff] mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-white">No active tickets found</div>
                    <p className="text-[11px] text-[#8a99b5] max-w-xs mx-auto">
                      Submit a new ticket to get help with digital delivery, PINs, or game account questions.
                    </p>
                    <button
                      onClick={() => setCurrentView('new-ticket')}
                      className="px-4 py-2 rounded-xl bg-[#0070f3] text-white text-xs font-bold"
                    >
                      Create First Ticket
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: ORDER HELP */}
            {currentView === 'order-help' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white">Select Order for Support</div>
                <p className="text-[11px] text-[#8a99b5]">
                  Need help with PIN verification or key revelation for a recent purchase?
                </p>

                {ordersLoading ? (
                  <div className="text-center py-8 text-xs text-[#8a99b5] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#00d4ff]" />
                    <span>Loading your orders...</span>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-xl bg-[#0a1128] border border-[#1b2a4a] text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Order #{order.orderNumber}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8a99b5]">
                          Fulfillment: {order.fulfillmentStatus} • {order.items?.length || 1} item(s)
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white font-semibold transition-colors"
                          >
                            View Order Details
                          </Link>
                          <button
                            onClick={() => openOrderTicket(order.id, order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-[#0070f3] hover:bg-[#00d4ff] text-[10px] text-white font-bold transition-colors"
                          >
                            Open Order Ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0a1128] border border-[#1b2a4a] text-center space-y-2">
                    <div className="text-xs font-bold text-white">No recent orders found</div>
                    <p className="text-[11px] text-[#8a99b5]">
                      Sign in or complete a store checkout to see your purchase history here.
                    </p>
                    <Link
                      href="/store"
                      className="inline-block px-4 py-2 rounded-xl bg-[#0070f3] text-white text-xs font-bold"
                    >
                      Browse Store
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: CONTACT CHANNELS & HOURS */}
            {currentView === 'contact' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white">Official Contact Information</div>
                <div className="p-4 rounded-2xl bg-[#0a1128] border border-[#1b2a4a] space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0070f3]/20 text-[#00d4ff] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#8a99b5] uppercase">Support Desk Email</div>
                      <a href="mailto:support@vortex-gaming.com" className="text-white font-mono hover:text-[#00d4ff]">
                        support@vortex-gaming.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#8a99b5] uppercase">Operating Hours</div>
                      <div className="text-white">Ticket Intake: 24/7/365</div>
                      <div className="text-[10px] text-[#8a99b5]">Human Resolution: Mon - Sat (09:00 - 22:00 UTC+3)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#8a99b5] uppercase">Response Policy</div>
                      <div className="text-white">Under 1 Business Day SLA</div>
                      <div className="text-[10px] text-[#8a99b5]">Truthful asynchronous support desk</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070b18] border border-[#142038] text-[11px] text-[#8a99b5] leading-relaxed">
                  <strong>Notice:</strong> VORTEX GAMING never asks for your Security PIN, account passwords, or personal banking credentials via chat or email.
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
