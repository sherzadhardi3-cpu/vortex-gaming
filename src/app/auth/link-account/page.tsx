'use client';

// VORTEX GAMING — Secure Discord Account Linking Screen
// Defends against account takeover by requiring password verification for existing email matches

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

function LinkAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const username = searchParams.get('username') || 'Discord User';

  const login = useAuthStore((state) => state.login);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/discord/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to link account');
      }

      login(data.user, data.token);
      router.push('/account?linked=discord');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-widest">
            SECURITY VERIFICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Link Discord to Existing Account
          </h1>
          <p className="text-xs text-[#a0a0b8]">
            An account with <span className="text-white font-semibold">{email}</span> already exists.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Anti-Account Takeover Protection:</span> VORTEX GAMING never automatically links accounts based on email alone. Please confirm password ownership of your existing account to connect Discord user <span className="text-white font-mono font-bold">@{username}</span>.
          </div>
        </div>

        {/* Form Box */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLink} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a0a0b8]">
                Existing Account Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your VORTEX password"
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#5865F2]/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying & Linking...</span>
              ) : (
                <>
                  <span>Verify Password & Link Discord</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs">
            <Link href="/auth/login" className="text-[#a0a0b8] hover:text-white transition-colors">
              Cancel & Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-white">Loading verification...</div>}>
      <LinkAccountContent />
    </Suspense>
  );
}
