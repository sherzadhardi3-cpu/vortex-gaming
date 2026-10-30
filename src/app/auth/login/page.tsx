'use client';

// VORTEX GAMING — Production Customer & Admin Login Page
// Secure credential submission with server-side validation and lockout protection

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DiscordButton } from '@/components/auth/DiscordButton';
import { VortexLogo } from '@/components/brand/VortexLogo';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      login(data.user, data.token);
      if (['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(data.user.role)) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <VortexLogo size="lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              SIGN IN TO VORTEX
            </h1>
            <p className="text-xs text-[#a0a0b8] mt-1">
              Access your encrypted game key vault and order history.
            </p>
          </div>
        </div>

        {/* Form Box */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Discord OAuth2 Sign-In Button */}
          <DiscordButton mode="login" />

          {/* Or Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12121a] px-3 text-[10px] uppercase font-mono tracking-widest text-[#6b6b80] shrink-0">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a0a0b8]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                />
                <Mail className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#a0a0b8]">Password</label>
                <Link href="/support" className="text-[11px] text-[#00d4ff] hover:underline">
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                />
                <Lock className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b80]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rate-limited with brute-force defense</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-black text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#a0a0b8]">
            Don't have an account yet?{' '}
            <Link href="/auth/register" className="text-[#00d4ff] font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
