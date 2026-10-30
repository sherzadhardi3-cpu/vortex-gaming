'use client';

// VORTEX GAMING — Secure Shopping Cart
// Recalculates totals, supports promo coupons, adjusts quantities, leads to secure checkout

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle,
  AlertCircle,
  Gamepad2,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    getSubtotalUSD,
    getSubtotalIQD,
    getTotalUSD,
    getTotalIQD,
    getTotalCount,
  } = useCartStore();

  const { currency, format } = useCurrencyStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const isCartEmpty = items.length === 0;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider">
            <span>SECURE ORDER PREPARATION</span>
            <span>•</span>
            <span>ENCRYPTED VAULT RESERVATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            SHOPPING CART ({getTotalCount()} items)
          </h1>
        </div>

        {isCartEmpty ? (
          <div className="text-center py-24 rounded-2xl bg-[#12121a] border border-white/10 p-8 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#00d4ff]">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-[#a0a0b8]">
              Browse thousands of authentic game activation keys, gift cards, and subscriptions with instant digital delivery.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Explore Storefront</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(({ game, quantity }) => (
                <div
                  key={game.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#12121a] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Artwork & Info */}
                  <div className="flex items-center gap-4">
                    <Link href={`/game/${game.slug}`} className="shrink-0">
                      <div
                        className={`w-20 h-20 rounded-xl bg-gradient-to-tr ${game.bannerGradient} flex items-center justify-center p-2 shadow-md`}
                      >
                        <span className="text-[10px] font-bold text-white uppercase text-center line-clamp-2">
                          {game.platformName}
                        </span>
                      </div>
                    </Link>

                    <div className="space-y-1">
                      <div className="text-[10px] text-[#6b6b80] font-mono uppercase">
                        {game.platformName} • {game.activationRegion}
                      </div>
                      <Link
                        href={`/game/${game.slug}`}
                        className="text-sm font-bold text-white hover:text-[#00d4ff] transition-colors line-clamp-1"
                      >
                        {game.title}
                      </Link>
                      <div className="text-xs font-semibold text-emerald-400">
                        ✓ In Stock & Ready for Dispatch
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
                      <button
                        onClick={() => updateQuantity(game.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white/5 text-white hover:bg-white/10 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-2">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(game.id, quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white/5 text-white hover:bg-white/10 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Calculation */}
                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">
                        {format(game.priceUSD * quantity, game.priceIQD * quantity)}
                      </div>
                      {quantity > 1 && (
                        <div className="text-[10px] text-[#6b6b80] font-mono">
                          {format(game.priceUSD, game.priceIQD)} each
                        </div>
                      )}
                    </div>

                    {/* Remove Item */}
                    <button
                      onClick={() => removeItem(game.id)}
                      className="p-2 rounded-xl text-[#6b6b80] hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Security Banner under Cart */}
              <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-blue-500/20 text-xs text-[#a0a0b8] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00d4ff] shrink-0" />
                <span>
                  Authoritative prices are verified server-to-server. Your selected game keys are atomically reserved during checkout.
                </span>
              </div>
            </div>

            {/* Right: Order Summary Box */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-2xl space-y-6">
                
                <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
                  Order Summary
                </h3>

                {/* Promo Code Form */}
                <div className="space-y-2">
                  <div className="text-xs text-[#a0a0b8] flex items-center gap-1 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-[#00d4ff]" />
                    <span>Have a Promo Voucher?</span>
                  </div>

                  {couponCode ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>{couponCode} (-{discountPercent}%)</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-rose-400 hover:underline text-[11px] font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. LAUNCH20"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#6b6b80] outline-none uppercase font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 h-10 rounded-xl bg-white/10 hover:bg-[#00d4ff] hover:text-black text-white text-xs font-bold transition-all"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponFeedback && !couponFeedback.success && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}
                </div>

                {/* Subtotals & Final Amount */}
                <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-[#a0a0b8]">
                    <span>Items Subtotal:</span>
                    <span className="font-mono text-white font-semibold">
                      {format(getSubtotalUSD(), getSubtotalIQD())}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Promo Discount ({discountPercent}%):</span>
                      <span className="font-mono font-semibold">
                        -{format((getSubtotalUSD() * discountPercent) / 100, (getSubtotalIQD() * discountPercent) / 100)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#a0a0b8]">
                    <span>Automated Key Delivery:</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE (INSTANT)</span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Authoritative Total:</span>
                    <span className="text-xl font-black text-[#00d4ff] font-mono">
                      {format(getTotalUSD(), getTotalIQD())}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-[11px] text-center text-[#6b6b80]">
                  Accepted: FIB, FastPay, Qi Card, Visa, Mastercard
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
