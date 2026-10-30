'use client';

// VORTEX GAMING — Admin Command Center & Metrics Dashboard
// Protected administrative area for SUPER_ADMIN, ADMIN, and PRODUCT_MANAGER roles
// Tracks revenue, active vault inventory, orders, fraud review alerts, and audit logs

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  DollarSign,
  Package,
  Key,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Lock,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuthStore();
  const { format } = useCurrencyStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'fraud'>('overview');

  // RBAC Access Guard: Block unauthorized customers or anonymous visitors
  if (!isAdmin) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12121a] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            ERROR 403 • ACCESS RESTRICTED
          </div>
          <h2 className="text-2xl font-black text-white">Administrative Access Required</h2>
          <p className="text-xs text-[#a0a0b8] leading-relaxed">
            This command center requires an authenticated administrative session (SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER) with multi-factor authorization.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Sign In with Administrative Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Simulated aggregate metrics
  const stats = {
    totalRevenueUSD: 18459200, // $184,592.00
    totalOrders: 3412,
    completedOrders: 3389,
    pendingFulfillments: 4,
    totalKeysInVault: 1840,
    availableKeys: 1420,
    deliveredKeys: 410,
    revokedKeys: 10,
    flaggedFraudOrders: 3,
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12121a] border border-amber-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  RESTRICTED COMMAND CENTER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-black uppercase">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                VORTEX Operations Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/inventory"
              className="px-4 py-2.5 rounded-xl bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#00d4ff]/20 transition-all active:scale-95"
            >
              <Key className="w-4 h-4" />
              <span>Key Vault Manager</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Revenue */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
              <span className="font-semibold">Total Verified Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ${(stats.totalRevenueUSD / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% this month</span>
            </div>
          </div>

          {/* Orders */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
              <span className="font-semibold">Completed Orders</span>
              <Package className="w-4 h-4 text-[#00d4ff]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.completedOrders.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#a0a0b8]">
              {stats.pendingFulfillments} in automated fulfillment
            </div>
          </div>

          {/* Key Vault Inventory */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
              <span className="font-semibold">Available Game Keys</span>
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats.availableKeys.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400">
              {stats.deliveredKeys} delivered to customers
            </div>
          </div>

          {/* Fraud Review Queue */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
              <span className="font-semibold">Fraud Review Queue</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {stats.flaggedFraudOrders} Flagged
            </div>
            <div className="text-[11px] text-[#a0a0b8]">
              Requires admin manual review
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-white/10 pb-4 mb-6 text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`font-bold transition-colors pb-1 ${
              activeTab === 'overview' ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]' : 'text-[#a0a0b8]'
            }`}
          >
            Recent Completed Orders
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`font-bold transition-colors pb-1 ${
              activeTab === 'fraud' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-[#a0a0b8]'
            }`}
          >
            Suspicious Fraud Queue ({stats.flaggedFraudOrders})
          </button>
        </div>

        {/* Orders Table Panel */}
        {activeTab === 'overview' && (
          <div className="rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0a0f] text-[#a0a0b8] uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="p-4">Order Number</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Key Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#00d4ff]">VX-9981-L9A</td>
                    <td className="p-4">kurdish.gamer@domain.com</td>
                    <td className="p-4 font-semibold text-emerald-400">FIB Bank</td>
                    <td className="p-4 font-mono">39,000 د.ع</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        PAID
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Fulfilled</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#00d4ff]">VX-8812-B2C</td>
                    <td className="p-4">player_one@domain.com</td>
                    <td className="p-4 font-semibold text-blue-400">Visa / Stripe</td>
                    <td className="p-4 font-mono">$54.99</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        PAID
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Fulfilled</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#00d4ff]">VX-7731-M1F</td>
                    <td className="p-4">gamer_erbil@domain.com</td>
                    <td className="p-4 font-semibold text-amber-400">FastPay</td>
                    <td className="p-4 font-mono">52,000 د.ع</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        PAID
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Fulfilled</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fraud Queue Panel */}
        {activeTab === 'fraud' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                Layered fraud checks flag high-velocity purchases, suspicious geographic IP mismatches, or repeated payment declines.
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-bold text-white text-sm">Flagged Order: VX-SUSP-011</span>
                  <span className="text-[#a0a0b8] block mt-0.5">Customer: temp_user_99@throwaway.io</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-rose-400 font-bold">$249.95 USD</span>
                  <span className="text-[10px] text-[#6b6b80] block">5 high-tier keys requested</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Flag Reason: Velocity spike (3 orders in 45 seconds)</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold">
                    Approve Order
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold">
                    Reject & Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
