'use client';

// VORTEX GAMING — Customer Support Ticket Desk & Thread Management
// Full PostgreSQL-backed ticket creation, status tracking, message history,
// order linking, and customer-isolation authorization.

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  PlusCircle,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Package,
  Shield,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  X,
  ArrowLeft,
  Check,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import type { SupportTicket, SupportMessage, TicketStatusType } from '@/lib/support/support-store';

interface SupportTicketDeskProps {
  initialOrderId?: string;
  initialCategory?: string;
  onTicketCreated?: (ticket: SupportTicket) => void;
}

const TICKET_CATEGORIES = [
  { id: 'ORDERS_DELIVERY', label: 'Orders & Key Delivery' },
  { id: 'GAME_ACCOUNTS', label: 'Game Accounts & Credentials' },
  { id: 'PAYMENTS', label: 'Payment & Billing' },
  { id: 'GIFT_CARDS', label: 'Gift Cards & Wallet Codes' },
  { id: 'SUBSCRIPTIONS', label: 'Subscriptions & Passes' },
  { id: 'ACCOUNT_SECURITY', label: 'Account, 2FA & PIN' },
  { id: 'REFUNDS', label: 'Refunds & Returns' },
  { id: 'TECHNICAL', label: 'Technical Assistance' },
  { id: 'OTHER', label: 'General Inquiries & Feedback' },
];

export function SupportTicketDesk({
  initialOrderId,
  initialCategory,
  onTicketCreated,
}: SupportTicketDeskProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { language, isRTL } = useTranslation();
  const lang = (language === 'ku' || language === 'ar') ? language : 'en';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(Boolean(initialOrderId));
  const [loading, setLoading] = useState<boolean>(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Create Form State
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState(initialCategory || 'ORDERS_DELIVERY');
  const [formOrderId, setFormOrderId] = useState(initialOrderId || '');
  const [formMessage, setFormMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const effectiveEmail = isAuthenticated ? user?.email : guestEmail;
  const effectiveName = isAuthenticated
    ? (user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`).trim()
    : guestName || 'Customer';

  // Fetch Tickets
  const fetchTickets = async () => {
    if (!effectiveEmail && !user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user?.id) params.set('userId', user.id);
      if (effectiveEmail) params.set('email', effectiveEmail);
      if (user?.role) params.set('role', user.role);
      if (selectedTicket?.id) params.set('ticketId', selectedTicket.id);

      const res = await fetch(`/api/support/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
        if (selectedTicket) {
          const fresh = data.tickets.find((t: SupportTicket) => t.id === selectedTicket.id);
          if (fresh) setSelectedTicket(fresh);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer orders for order-linking dropdown
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data?.orders) {
            setUserOrders(data.orders);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (effectiveEmail || user?.id) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [effectiveEmail, user?.id, selectedTicket?.id]);

  useEffect(() => {
    if (selectedTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages?.length]);

  // Create Ticket Handler
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const emailToUse = effectiveEmail?.trim();
    if (!emailToUse) {
      setFormError('A valid email address is required to receive support updates.');
      return;
    }

    if (!formSubject.trim() || !formMessage.trim()) {
      setFormError('Subject and message are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_ticket',
          userId: user?.id,
          userEmail: emailToUse,
          userName: effectiveName,
          subject: formSubject.trim(),
          category: formCategory,
          orderId: formOrderId.trim() || undefined,
          message: formMessage.trim(),
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setFormSuccess('Ticket submitted successfully! Our on-duty agents will follow up promptly.');
        setTickets((prev) => [data.ticket, ...prev]);
        setSelectedTicket(data.ticket);
        setIsCreatingTicket(false);
        setFormSubject('');
        setFormMessage('');
        setFormOrderId('');
        if (onTicketCreated) onTicketCreated(data.ticket);
      } else {
        setFormError(data.error || 'Failed to submit support ticket.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Reply to Ticket Handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setReplyLoading(true);
    setReplyError(null);

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          ticketId: selectedTicket.id,
          userId: user?.id,
          userEmail: effectiveEmail,
          userName: effectiveName,
          message: replyMessage.trim(),
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setSelectedTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'OPEN',
            messages: [...prev.messages, data.message],
            updatedAt: new Date().toISOString(),
          };
        });
        setReplyMessage('');
        fetchTickets();
      } else {
        setReplyError(data.error || 'Failed to send message.');
      }
    } catch (err: any) {
      setReplyError(err.message || 'Error delivering message.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Update Status Handler (Resolve / Close)
  const handleUpdateStatus = async (status: TicketStatusType) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          ticketId: selectedTicket.id,
          status,
          userId: user?.id,
          userEmail: effectiveEmail,
          role: user?.role,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (err) {
      console.warn('Status update error:', err);
    }
  };

  const getStatusBadge = (status: TicketStatusType) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/40">
            Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            In Progress
          </span>
        );
      case 'AWAITING_CUSTOMER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Awaiting You
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#8a99b5] border border-white/10">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Control Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Support Ticket Desk</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#0070f3]/20 text-[#00d4ff] border border-[#0070f3]/30">
              {tickets.length} Tickets
            </span>
          </div>
          <p className="text-xs text-[#8a99b5] mt-0.5">
            Real-time ticket tracking, order escalation, and direct assistance from verified support staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTickets}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a99b5] hover:text-white transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00d4ff]' : ''}`} />
          </button>

          {!isCreatingTicket && (
            <button
              type="button"
              onClick={() => {
                setIsCreatingTicket(true);
                setSelectedTicket(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#0070f3]/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Create New Ticket Form Panel ─────────────────────────────────── */}
      {isCreatingTicket && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c162d] border border-[#0070f3]/40 shadow-2xl space-y-6 relative">
          <div className="flex items-center justify-between pb-4 border-b border-[#142038]">
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-[#00d4ff]" />
              <h3 className="text-lg font-black text-white">Submit New Support Ticket</h3>
            </div>
            <button
              onClick={() => setIsCreatingTicket(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#7888a6] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            {/* Guest Details if not logged in */}
            {!isAuthenticated && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-white block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  />
                </div>
                <div>
                  <label className="font-bold text-white block mb-1">Your Contact Email</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  />
                </div>
              </div>
            )}

            {/* Category & Order ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-white block mb-1">Inquiry Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-white block mb-1">
                  Related Order Number <span className="text-[#7888a6] font-normal">(Optional)</span>
                </label>
                {userOrders.length > 0 ? (
                  <select
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  >
                    <option value="">No specific order</option>
                    {userOrders.map((o) => (
                      <option key={o.id} value={o.orderNumber || o.id}>
                        {o.orderNumber || o.id} — {o.status} ({o.items?.length || 1} items)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    placeholder="e.g. VX-9821-X9"
                    className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
                  />
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="font-bold text-white block mb-1">Subject</label>
              <input
                type="text"
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g. Key activation failure on Steam)"
                className="w-full h-11 px-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3]"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="font-bold text-white block mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Please describe what happened, any error codes shown by the platform, and steps you already tried..."
                className="w-full p-3.5 bg-[#080d1f] border border-[#1b2a4a] rounded-xl text-white outline-none focus:border-[#0070f3] resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#0070f3]/40 transition-all flex items-center gap-2"
              >
                <span>{loading ? 'Submitting...' : 'Submit Support Ticket'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingTicket(false)}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#8a99b5] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Ticket Details / Thread View ─────────────────────────────────── */}
      {selectedTicket ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] shadow-2xl space-y-6">
          {/* Thread Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#142038]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a99b5] hover:text-white"
                  title="Back to all tickets"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-black text-white">{selectedTicket.subject}</h3>
                {getStatusBadge(selectedTicket.status)}
              </div>

              <div className="text-xs text-[#7888a6] flex flex-wrap items-center gap-3">
                <span className="font-mono">ID: {selectedTicket.id}</span>
                <span>•</span>
                <span>Category: {selectedTicket.category}</span>
                {selectedTicket.orderId && (
                  <>
                    <span>•</span>
                    <span className="text-[#00d4ff]">
                      Order: {selectedTicket.orderId}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              {selectedTicket.status !== 'CLOSED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('CLOSED')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[#8a99b5] border border-white/10 text-xs font-semibold hover:bg-white/10"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 no-scrollbar">
            {selectedTicket.messages.map((msg) => {
              const isStaff = msg.sender === 'SUPPORT_AGENT';
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    isStaff
                      ? 'bg-[#0070f3]/10 border-[#0070f3]/30 text-blue-100 ml-4 sm:ml-8'
                      : 'bg-[#0c162d] border-[#1b2a4a] text-white mr-4 sm:mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isStaff ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
                          <span className="text-[#00d4ff]">{msg.senderName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#0070f3]/30 text-white font-mono">STAFF</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-[#8a99b5]" />
                          <span>{msg.senderName}</span>
                          <span className="text-[#7888a6] font-normal">(You)</span>
                        </>
                      )}
                    </div>
                    <span className="text-[#7888a6] text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'CLOSED' ? (
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#142038]">
              {replyError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {replyError}
                </div>
              )}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the support team..."
                  disabled={replyLoading}
                  className="w-full h-12 pl-4 pr-24 bg-[#0c162d] border border-[#1b2a4a] rounded-xl text-xs text-white placeholder-[#7888a6] outline-none focus:border-[#0070f3]"
                />
                <button
                  type="submit"
                  disabled={replyLoading || !replyMessage.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#0070f3] hover:bg-[#00d4ff] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-[#8a99b5]">
              This support ticket has been closed. If you have additional inquiries, please submit a new ticket.
            </div>
          )}
        </div>
      ) : (
        /* ─── Ticket List Table / Cards ────────────────────────────────────── */
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#080d1f] border border-[#1b2a4a] text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#00d4ff] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Support Tickets Yet</h3>
              <p className="text-xs text-[#8a99b5] max-w-sm mx-auto">
                Have a question regarding key activation, order status, or account access? Submit a ticket and our agents will assist you.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingTicket(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#00d4ff] text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-[#0070f3]/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Ticket</span>
              </button>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-4 sm:p-5 rounded-2xl bg-[#080d1f] border border-[#1b2a4a] hover:border-[#0070f3]/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors truncate">
                      {t.subject}
                    </h4>
                    {getStatusBadge(t.status)}
                  </div>
                  <div className="text-xs text-[#7888a6] flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px]">{t.id}</span>
                    <span>•</span>
                    <span>{t.category}</span>
                    {t.orderId && (
                      <>
                        <span>•</span>
                        <span className="text-[#00d4ff] font-mono">Order: {t.orderId}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-xs text-[#7888a6] font-medium">
                    {t.messages.length} {t.messages.length === 1 ? 'message' : 'messages'}
                  </span>
                  <div className="p-1 rounded-lg bg-white/5 text-[#8a99b5] group-hover:text-white group-hover:bg-[#0070f3] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
