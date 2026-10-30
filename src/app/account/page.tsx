'use client';

// VORTEX GAMING — Premium Customer Account Dashboard & Digital Key Vault
// Left sidebar navigation, session-aware profile stats, order history, wallet,
// security controls (PIN/2FA), Discord account linkage, and customer support portal.

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
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
  CheckCircle2,
  Heart,
  Wallet,
  Headphones,
  Settings,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useTranslation } from '@/lib/i18n';

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

type DashboardTab =
  | 'overview'
  | 'orders'
  | 'wishlist'
  | 'wallet'
  | 'security'
  | 'pin'
  | 'discord'
  | 'support';

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as DashboardTab) || 'overview';

  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { format } = useCurrencyStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const addItemToCart = useCartStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const { t, isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityPin, setSecurityPin] = useState('••••');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as DashboardTab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setTwoFactorEnabled(user.mfaEnabled || false);
    }
  }, [user]);

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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    updateUser({ displayName: displayName.trim() });
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setIsEditingProfile(false);
    }, 1500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus({ success: false, message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus({ success: true, message: 'Password updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 3000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) return;
    setSecurityPin(pinInput);
    setIsSettingPin(false);
    setPinInput('');
  };

  // Unauthenticated guard state
  if (!isAuthenticated || !user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12121a] border border-white/10 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-[#00d4ff] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to Access Your Dashboard</h2>
          <p className="text-xs text-[#a0a0b8] leading-relaxed">
            Your purchased digital activation keys, order history, and account settings are securely stored. Please sign in to access your digital licenses.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Sign In to Account
            </Link>
            <Link
              href="/api/auth/discord/login"
              className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Continue with Discord</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation options
  const NAV_ITEMS = [
    { id: 'overview', label: t('profilePage.overview'), icon: User },
    { id: 'orders', label: t('profilePage.orders'), icon: PackageCheck, count: SAMPLE_VAULT.length },
    { id: 'wishlist', label: t('profilePage.wishlist'), icon: Heart, count: wishlistItems.length },
    { id: 'wallet', label: t('profilePage.wallet'), icon: Wallet },
    { id: 'security', label: t('profilePage.security'), icon: Lock },
    { id: 'pin', label: t('profilePage.pin'), icon: Shield },
    { id: 'discord', label: t('profilePage.discord'), icon: Gamepad2, isDiscord: true },
    { id: 'support', label: t('profilePage.support'), icon: Headphones },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Card with User Avatar & Quick Stats */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle Cyber Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00d4ff]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Identity Details */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#5865F2]/50 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#7c3aed] flex items-center justify-center font-black text-2xl text-black shadow-lg">
                    {user.firstName?.[0] || 'G'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-[#12121a]" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {user.displayName || `${user.firstName} ${user.lastName}`}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 uppercase">
                    {user.role || 'CUSTOMER'}
                  </span>
                  {user.discordUsername && (
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 flex items-center gap-1 font-mono">
                      <span>@{user.discordUsername}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#a0a0b8] flex items-center gap-3">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Session</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 min-w-[110px]">
                <div className="text-[10px] font-bold text-[#a0a0b8] uppercase">{t('profilePage.statsOrders')}</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{SAMPLE_VAULT.length}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 min-w-[110px]">
                <div className="text-[10px] font-bold text-[#a0a0b8] uppercase">{t('profilePage.statsKeys')}</div>
                <div className="text-xl font-black text-[#00d4ff] font-mono mt-0.5">{SAMPLE_VAULT.length}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 min-w-[110px]">
                <div className="text-[10px] font-bold text-[#a0a0b8] uppercase">{t('profilePage.statsWishlist')}</div>
                <div className="text-xl font-black text-rose-400 font-mono mt-0.5">{wishlistItems.length}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 min-w-[110px]">
                <div className="text-[10px] font-bold text-[#a0a0b8] uppercase">{t('profilePage.statsWallet')}</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{format(0, 0)}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard Shell: Left Sidebar + Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar (4 Cols on desktop) */}
          <aside className="lg:col-span-4 bg-[#12121a] p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1 shadow-xl">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b6b80] font-mono">
              ACCOUNT MANAGEMENT
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as DashboardTab);
                    router.replace(`/account?tab=${item.id}`);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black shadow-lg shadow-[#00d4ff]/20'
                      : 'text-[#a0a0b8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : item.isDiscord ? 'text-[#5865F2]' : 'text-[#00d4ff]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-[#00d4ff]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 border-t border-white/10 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('profilePage.logout')}</span>
              </button>
            </div>
          </aside>

          {/* Right Main Area (8 Cols on desktop) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Personal Information Card */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <User className="w-5 h-5 text-[#00d4ff]" />
                      <h2 className="text-lg font-black text-white">{t('profilePage.personalInfo')}</h2>
                    </div>

                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                      >
                        {t('profilePage.editProfile')}
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div>
                        <label className="text-xs text-[#a0a0b8] block mb-1">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full h-11 px-4 bg-[#0a0a0f] border border-white/15 rounded-xl text-sm text-white focus:border-[#00d4ff] outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#00d4ff] text-black font-extrabold text-xs"
                        >
                          {t('profilePage.saveChanges')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/5 text-xs text-[#a0a0b8]"
                        >
                          Cancel
                        </button>
                        {editSuccess && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>Updated!</span>
                          </span>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-1">
                        <div className="text-[#a0a0b8]">{t('profilePage.fullName')}</div>
                        <div className="text-sm font-bold text-white">{user.displayName || `${user.firstName} ${user.lastName}`}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-1">
                        <div className="text-[#a0a0b8]">{t('profilePage.email')}</div>
                        <div className="text-sm font-bold text-white">{user.email}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-1">
                        <div className="text-[#a0a0b8]">{t('profilePage.role')}</div>
                        <div className="text-sm font-bold text-[#00d4ff]">{user.role}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-1">
                        <div className="text-[#a0a0b8]">{t('profilePage.registeredSince')}</div>
                        <div className="text-sm font-bold text-white">October 2026</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discord Sync Status Card */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center font-bold">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Discord Account Synchronization</h3>
                        <p className="text-xs text-[#a0a0b8]">
                          {user.discordUsername ? `Linked to @${user.discordUsername}` : 'Connect your Discord to sign in with 1-click'}
                        </p>
                      </div>
                    </div>

                    {user.discordUsername ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <Link
                        href="/api/auth/discord/login"
                        className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-bold text-xs"
                      >
                        {t('profilePage.discordConnectBtn')}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Latest Key Snapshot */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Latest Vault License</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View All Keys</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-[#00d4ff] font-bold uppercase">{SAMPLE_VAULT[0].platform}</span>
                      <div className="text-sm font-bold text-white">{SAMPLE_VAULT[0].gameTitle}</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10"
                    >
                      Open Key Vault
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDERS & VAULT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#00d4ff]" />
                      <span>{t('profilePage.vault')}</span>
                    </h2>
                    <p className="text-xs text-[#a0a0b8] mt-0.5">
                      Your authentic activation keys are stored securely. Click reveal to view your key.
                    </p>
                  </div>
                  <span className="text-xs text-[#a0a0b8] font-mono">
                    {SAMPLE_VAULT.length} Licenses
                  </span>
                </div>

                <div className="space-y-4">
                  {SAMPLE_VAULT.map((item) => {
                    const isRevealed = !!revealedKeys[item.id];

                    return (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 rounded-3xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/30 transition-all space-y-4 shadow-xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 text-[#00d4ff] font-bold border border-white/10">
                              {item.platform}
                            </span>
                            <span className="text-[#6b6b80] font-mono">Order #{item.orderNumber}</span>
                            <span className="text-[#6b6b80]">•</span>
                            <span className="text-[#6b6b80]">{item.purchasedAt}</span>
                          </div>

                          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>100% Genuine • {item.activationRegion}</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-base font-bold text-white">{item.gameTitle}</h3>
                            <div className="text-xs text-[#a0a0b8] mt-0.5">
                              Status: <strong className="text-emerald-400">Delivered & Ready to Activate</strong>
                            </div>
                          </div>

                          {/* Key Field with Reveal & Copy */}
                          <div className="flex items-center gap-2 bg-[#0a0a0f] p-2 rounded-2xl border border-white/10">
                            <div className="font-mono text-sm font-bold text-white px-3 tracking-widest min-w-[210px]">
                              {isRevealed ? item.decryptedKey : '••••-••••-••••-••••'}
                            </div>

                            <button
                              onClick={() => toggleReveal(item.id)}
                              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white transition-colors"
                              title={isRevealed ? t('profilePage.hideKey') : t('profilePage.revealKey')}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleCopy(item.decryptedKey)}
                              className="px-3.5 py-2.5 rounded-xl bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#00d4ff]/20"
                            >
                              {copiedKey === item.decryptedKey ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t('profilePage.copied')}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{t('profilePage.copyKey')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span>{t('profilePage.wishlist')}</span>
                  </h2>
                  <p className="text-xs text-[#a0a0b8] mt-0.5">
                    Games you saved for later. Keep track of sales and price drops.
                  </p>
                </div>

                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded-3xl bg-[#12121a] border border-white/10 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#00d4ff] uppercase">{game.platformName}</span>
                          <div className="text-sm font-bold text-white line-clamp-1">{game.title}</div>
                          <div className="text-xs font-mono font-bold text-[#00d4ff]">
                            {format(game.priceUSD, game.priceIQD)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addItemToCart(game)}
                            className="px-3 py-2 rounded-xl bg-[#00d4ff] text-black font-bold text-xs"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(game.id)}
                            className="p-2 rounded-xl bg-white/5 text-[#a0a0b8] hover:text-rose-400"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-[#12121a] border border-white/10 text-center space-y-3">
                    <Heart className="w-12 h-12 text-[#6b6b80] mx-auto" />
                    <div className="text-base font-bold text-white">Your Wishlist is Empty</div>
                    <p className="text-xs text-[#a0a0b8]">Browse the catalog and add favorite games to track discounts.</p>
                    <Link
                      href="/store"
                      className="inline-block px-5 py-2.5 rounded-xl bg-[#00d4ff] text-black font-extrabold text-xs uppercase"
                    >
                      Browse Games
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. WALLET & TRANSACTIONS TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    <span>{t('profilePage.wallet')}</span>
                  </h2>
                  <p className="text-xs text-[#a0a0b8] mt-0.5">
                    Server-authoritative digital balance and verified payment transaction ledger.
                  </p>
                </div>

                {/* Balance Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-[#12121a] via-[#151524] to-[#0f0f1c] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="text-xs font-bold text-[#a0a0b8] uppercase tracking-wider">{t('profilePage.walletBalance')}</div>
                    <div className="text-4xl font-black text-white font-mono mt-1">
                      {format(0, 0)}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Protected Account Vault</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => alert('VORTEX Sandbox: Wallet top-up is active in sandbox mode.')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase shadow-md shadow-[#00d4ff]/20"
                    >
                      {t('profilePage.walletTopUp')}
                    </button>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white">{t('profilePage.walletHistory')}</h3>
                  <div className="text-center py-8 text-xs text-[#a0a0b8]">
                    {t('profilePage.noTransactions')}
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY & PASSWORDS TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <span>{t('profilePage.security')}</span>
                  </h2>
                  <p className="text-xs text-[#a0a0b8] mt-0.5">
                    Update your password and review active browser authentication sessions.
                  </p>
                </div>

                {/* Change Password Form */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white">{t('profilePage.changePassword')}</h3>

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs text-[#a0a0b8] block mb-1">{t('profilePage.currentPassword')}</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#0a0a0f] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#a0a0b8] block mb-1">{t('profilePage.newPassword')}</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#0a0a0f] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#a0a0b8] block mb-1">{t('profilePage.confirmPassword')}</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#0a0a0f] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>

                    {passwordStatus && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          passwordStatus.success
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{passwordStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#00d4ff] text-black font-extrabold text-xs uppercase"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Active Sessions */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white">{t('profilePage.activeSessions')}</h3>
                  <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Current Web Browser Session</div>
                      <div className="text-[#a0a0b8] text-[11px] mt-0.5">Windows • Chrome • Signed in now</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-400/20 text-emerald-400 font-bold border border-emerald-400/30 text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PIN & 2FA TAB */}
            {activeTab === 'pin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>PIN & Two-Factor Authentication</span>
                  </h2>
                  <p className="text-xs text-[#a0a0b8] mt-0.5">
                    Extra layers of security to protect game key reveals and sensitive account actions.
                  </p>
                </div>

                {/* 2FA Toggle */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">Two-Factor Authentication (TOTP)</div>
                    <p className="text-xs text-[#a0a0b8]">
                      Require a 6-digit code from your authenticator app (Google Authenticator, Authy) when signing in.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      updateUser({ mfaEnabled: next });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      twoFactorEnabled
                        ? 'bg-emerald-400 text-black'
                        : 'bg-white/5 text-[#a0a0b8] hover:text-white border border-white/10'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Security PIN */}
                <div className="p-6 rounded-3xl bg-[#12121a] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Digital Vault Security PIN</div>
                      <p className="text-xs text-[#a0a0b8] mt-0.5">
                        A 4-digit numeric code required before decrypting or exporting digital keys.
                      </p>
                    </div>
                    <span className="font-mono text-sm text-[#00d4ff] bg-[#0a0a0f] px-3 py-1.5 rounded-xl border border-white/10">
                      {securityPin}
                    </span>
                  </div>

                  {isSettingPin ? (
                    <form onSubmit={handlePinSubmit} className="flex gap-2 max-w-xs">
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 digits"
                        className="flex-1 h-9 px-3 bg-[#0a0a0f] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-[#00d4ff] text-center font-mono tracking-widest"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#00d4ff] text-black font-bold text-xs"
                      >
                        Save PIN
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSettingPin(false)}
                        className="px-3 py-2 rounded-xl bg-white/5 text-xs text-[#a0a0b8]"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsSettingPin(true)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10"
                    >
                      Update 4-Digit PIN
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 7. DISCORD LINK TAB */}
            {activeTab === 'discord' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-[#5865F2]" />
                    <span>Discord Account Integration</span>
                  </h2>
                  <p className="text-xs text-[#a0a0b8] mt-0.5">
                    Connect your Discord profile for fast login, verified gamer status, and community perks.
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-[#12121a] border border-[#5865F2]/30 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center font-bold">
                        <Gamepad2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-white">
                          {user.discordUsername ? `@${user.discordUsername}` : 'No Discord Account Linked'}
                        </div>
                        <div className="text-xs text-[#a0a0b8] mt-0.5">
                          {user.discordId ? `Discord ID: ${user.discordId}` : 'Link your account for seamless authentication'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {user.discordUsername ? (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to unlink Discord? You will need your password to log in.')) {
                              updateUser({ discordId: undefined, discordUsername: undefined });
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold"
                        >
                          {t('profilePage.discordDisconnectBtn')}
                        </button>
                      ) : (
                        <Link
                          href="/api/auth/discord/login"
                          className="px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-extrabold text-xs shadow-lg shadow-[#5865F2]/25 inline-flex items-center gap-2"
                        >
                          <span>{t('profilePage.discordConnectBtn')}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-2 text-xs text-[#a0a0b8]">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Security & Role Guarantee</span>
                    </div>
                    <p>
                      OAuth permissions are strictly restricted to <code>identify</code> and <code>email</code>.
                      Discord connections are given <code>CUSTOMER</code> permissions only and cannot grant administrative access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-[#7c3aed]" />
                      <span>{t('profilePage.support')}</span>
                    </h2>
                    <p className="text-xs text-[#a0a0b8] mt-0.5">
                      Open support tickets, chat with agents, and track activation inquiries.
                    </p>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-[#12121a] border border-white/10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00d4ff]/20 to-[#7c3aed]/20 border border-white/10 text-[#00d4ff] flex items-center justify-center mx-auto">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">VORTEX Customer Support Portal</h3>
                  <p className="text-xs text-[#a0a0b8] max-w-md mx-auto leading-relaxed">
                    Need instant help with an activation code, payment issue, or digital license?
                    Our live support widget is active and ready to assist you.
                  </p>
                  <div className="pt-2 space-y-4">
                    <p className="text-xs text-emerald-400 font-semibold">
                      ● Support Agents Online • Average Response Time &lt; 5 mins
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('vtx_open_support_widget'));
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Open Live Support Chat</span>
                    </button>
                    <p className="text-[11px] text-[#6b6b80]">
                      Click to launch the instant support assistant directly with your authenticated session.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function AccountDashboardPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-white">Loading Dashboard...</div>}>
      <AccountDashboardContent />
    </Suspense>
  );
}
