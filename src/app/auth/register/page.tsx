'use client';

// VORTEX GAMING — Customer Registration Page

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DiscordButton } from '@/components/auth/DiscordButton';
import { VortexLogo } from '@/components/brand/VortexLogo';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user, data.token);
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Registration error');
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <VortexLogo size="lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              JOIN VORTEX GAMING
            </h1>
            <p className="text-xs text-[#a0a0b8] mt-1">
              Create a secure account for instant game key delivery & wallet tracking.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Discord OAuth2 Register Button */}
          <DiscordButton mode="register" />

          {/* Or Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12121a] px-3 text-[10px] uppercase font-mono tracking-widest text-[#6b6b80] shrink-0">
              OR REGISTER WITH EMAIL
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#a0a0b8]">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First"
                    className="w-full h-11 pl-9 pr-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                  />
                  <User className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#a0a0b8]">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a0a0b8]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@domain.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                />
                <Mail className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a0a0b8]">Password (Min 8 Characters)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                />
                <Lock className="w-4 h-4 text-[#6b6b80] absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-[11px] text-[#a0a0b8]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Passwords are hashed with cryptographic salt. Credentials are never logged.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-black text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#a0a0b8]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#00d4ff] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
