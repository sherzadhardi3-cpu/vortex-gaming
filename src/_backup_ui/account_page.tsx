'use client';

// VORTEX GAMING — Customer Account & Digital Key Vault
// Display authenticated customer profile, purchased keys with toggle reveal, orders, security controls

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PackageCheck,
  Key,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  LogOut,
  Lock,
  Gamepad2,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

interface VaultItem {
  id: string;
  orderNumber: string;
  gameTitle: string;
  platform: string;
  activationRegion: string;
  decryptedKey: string;
  purchasedAt: string;
  priceUSD: number;
}

const SAMPLE_VAULT: VaultItem[] = [
  {
    id: 'vault_101',
    orderNumber: 'VX-K92X-A91',
    gameTitle: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'Steam',
    activationRegion: 'GLOBAL',
    decryptedKey: 'VTX-CYBER-9842-8812-7641',
    purchasedAt: '2026-10-28',
    priceUSD: 2999,
  },
  {
    id: 'vault_102',
    orderNumber: 'VX-M83Y-B72',
    gameTitle: 'Elden Ring: Shadow of the Erdtree',
    platform: 'Steam',
    activationRegion: 'GLOBAL',
    decryptedKey: 'ER-SHADOW-4421-9901-0023',
    purchasedAt: '2026-10-15',
    priceUSD: 3999,
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { format } = useCurrencyStore();

  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12121a] border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-[#00d4ff] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to View Your Vault</h2>
          <p className="text-xs text-[#a0a0b8]">
            Your purchased activation keys, order history, and account settings are securely stored. Please sign in to access your digital licenses.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12121a] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shadow-2xl">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#5865F2]/50 shadow-lg shadow-[#5865F2]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#7c3aed] flex items-center justify-center font-black text-2xl text-black shadow-lg shadow-[#00d4ff]/20">
                {user?.firstName?.[0] || 'G'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user ? (user.displayName || `${user.firstName} ${user.lastName}`) : 'Guest Gamer Vault'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 uppercase">
                  {user?.role || 'CUSTOMER'}
                </span>
                {user?.discordUsername && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 flex items-center gap-1">
                    <span>Discord: @{user.discordUsername}</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-[#a0a0b8] mt-0.5">
                {user?.email || 'customer@vortexgaming.com'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 text-xs font-semibold text-[#a0a0b8] transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Vault Digital Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#00d4ff]" />
              <h2 className="text-xl font-black text-white">
                Purchased Digital Keys Vault
              </h2>
            </div>
            <span className="text-xs text-[#a0a0b8] font-mono">
              {SAMPLE_VAULT.length} Active Licenses
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SAMPLE_VAULT.map((item) => {
              const isRevealed = !!revealedKeys[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[#00d4ff] font-bold border border-white/10">
                        {item.platform}
                      </span>
                      <span className="text-[#6b6b80] font-mono">
                        Order #{item.orderNumber}
                      </span>
                      <span className="text-[#6b6b80]">•</span>
                      <span className="text-[#6b6b80]">{item.purchasedAt}</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{item.gameTitle}</h3>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Permanent License • {item.activationRegion}</span>
                    </div>
                  </div>

                  {/* Right: Key Field with Reveal & Copy */}
                  <div className="flex items-center gap-2 bg-[#0a0a0f] p-2 rounded-xl border border-white/10">
                    <div className="font-mono text-sm font-bold text-white px-3 tracking-widest min-w-[200px]">
                      {isRevealed ? item.decryptedKey : '••••-••••-••••-••••'}
                    </div>

                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white transition-colors"
                      title={isRevealed ? 'Hide Key' : 'Reveal Key'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleCopy(item.decryptedKey)}
                      className="px-3 py-2 rounded-lg bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#00d4ff]/20"
                    >
                      {copiedKey === item.decryptedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Settings Box */}
        <div className="mt-12 p-6 rounded-2xl bg-[#12121a] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Security & Active Sessions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white">Current Browser Session</div>
              <div className="text-[#a0a0b8]">Windows • Chrome (Active Now)</div>
              <div className="text-emerald-400 font-semibold pt-1">● Authenticated Securely</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white">Multi-Factor Authentication (MFA)</div>
              <div className="text-[#a0a0b8]">TOTP Authenticator App</div>
              <div className="text-[#00d4ff] font-semibold pt-1">Configured (Optional Customer MFA)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
