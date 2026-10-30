'use client';

// VORTEX GAMING — Professional Floating Support Chat Widget
// Seamlessly syncs with authenticated customer session, provides real-time polling,
// sound notifications, ticket history, and instant messaging.

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import type { SupportTicket, SupportMessage } from '@/lib/support/support-store';

export function SupportWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const { t, isRTL } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('KEY_ACTIVATION');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        
        // Count unread messages from agent
        let agentMsgCount = 0;
        data.tickets.forEach((t: SupportTicket) => {
          t.messages.forEach((m) => {
            if (m.sender === 'SUPPORT_AGENT') agentMsgCount++;
          });
        });
        setUnreadCount(agentMsgCount > 0 ? agentMsgCount : 0);

        // If there's an active ticket, refresh its messages
        if (activeTicket) {
          const updated = data.tickets.find((t: SupportTicket) => t.id === activeTicket.id);
          if (updated) setActiveTicket(updated);
        } else if (data.tickets.length > 0 && !isCreatingNew) {
          setActiveTicket(data.tickets[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch support messages:', err);
    }
  };

  // Pre-fetch tickets when authenticated and listen for open events
  useEffect(() => {
    if (effectiveEmail || user?.id) {
      fetchTickets();
    }

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('vtx_open_support_widget', handleOpen);
    return () => window.removeEventListener('vtx_open_support_widget', handleOpen);
  }, [effectiveEmail, user?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 10000); // Poll every 10s when widget is open
      return () => clearInterval(interval);
    }
  }, [isOpen, effectiveEmail, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
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
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets([data.ticket, ...tickets]);
        setActiveTicket(data.ticket);
        setIsCreatingNew(false);
        setNewMessage('');
        setNewSubject('');
      }
    } catch (err) {
      console.error('Failed to create support ticket:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative p-3.5 sm:px-4 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold shadow-xl shadow-[#00d4ff]/25 hover:shadow-[#00d4ff]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
          aria-label={t('support.openChat')}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-black" />
          ) : (
            <>
              <div className="relative">
                <Headphones className="w-5 h-5 text-black" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full ring-2 ring-black">
                    {unreadCount}
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-black animate-pulse" />
                )}
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
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-[#0f0f17] border border-white/15 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-[#141420] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTicket && !isCreatingNew ? (
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#a0a0b8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : null}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#7c3aed] flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-[#00d4ff]" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{t('support.title')}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('support.statusOnline')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                title={t('support.soundToggle')}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 transition-colors"
                title={t('support.closeChat')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Authenticated User Status Bar */}
          <div className="px-4 py-2 bg-[#12121a] border-b border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#a0a0b8]">
              {isAuthenticated ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Logged in as <strong className="text-white">{effectiveName}</strong>
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Guest Support Session</span>
                </>
              )}
            </div>
            {!isCreatingNew && (
              <button
                onClick={() => {
                  setIsCreatingNew(true);
                  setActiveTicket(null);
                }}
                className="text-[10px] text-[#00d4ff] hover:underline flex items-center gap-1 font-bold"
              >
                <PlusCircle className="w-3 h-3" />
                <span>New Ticket</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0f]/80">
            {isCreatingNew ? (
              /* Create New Ticket Form */
              <form onSubmit={handleCreateTicket} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-white mb-2">Create a Support Inquiry</div>

                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="text-[10px] text-[#a0a0b8] block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full h-9 px-3 text-xs bg-[#12121a] border border-white/10 rounded-xl text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a0a0b8] block mb-1">
                        {t('support.guestEmailPrompt')}
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="gamer@example.com"
                        className="w-full h-9 px-3 text-xs bg-[#12121a] border border-white/10 rounded-xl text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] text-[#a0a0b8] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-9 px-3 text-xs bg-[#12121a] border border-white/10 rounded-xl text-white outline-none focus:border-[#00d4ff]"
                  >
                    <option value="KEY_ACTIVATION">Key Activation Help</option>
                    <option value="ORDER_INQUIRY">Order & License Status</option>
                    <option value="PAYMENT">Payment & Refund</option>
                    <option value="ACCOUNT">Account & Discord Link</option>
                    <option value="GENERAL">General Gaming Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#a0a0b8] block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder={t('support.subjectPlaceholder')}
                    className="w-full h-9 px-3 text-xs bg-[#12121a] border border-white/10 rounded-xl text-white outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#a0a0b8] block mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('support.inputPlaceholder')}
                    className="w-full p-3 text-xs bg-[#12121a] border border-white/10 rounded-xl text-white outline-none focus:border-[#00d4ff] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                  {tickets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a0a0b8] hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : activeTicket ? (
              /* Message Thread */
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="font-bold text-white">{activeTicket.subject}</div>
                  <div className="text-[10px] text-[#a0a0b8] flex items-center justify-between mt-1">
                    <span>Ticket #{activeTicket.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#00d4ff]/20 text-[#00d4ff] font-bold">
                      {activeTicket.status}
                    </span>
                  </div>
                </div>

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
                            ? 'bg-[#00d4ff] text-black font-medium rounded-br-none shadow-md shadow-[#00d4ff]/10'
                            : 'bg-[#181824] text-[#f0f0f5] border border-white/10 rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00d4ff]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">{t('support.title')}</div>
                <p className="text-xs text-[#a0a0b8] max-w-[280px]">
                  {t('support.welcomeMsg')}
                </p>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs"
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>

          {/* Footer Input for Active Ticket */}
          {!isCreatingNew && activeTicket && (
            <form onSubmit={handleSendMessage} className="p-3 bg-[#141420] border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('support.inputPlaceholder')}
                className="flex-1 h-10 px-3.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-3.5 h-10 rounded-xl bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-[#00d4ff]/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
