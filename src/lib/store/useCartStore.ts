'use client';

// VORTEX GAMING — Cart State Store
// Manages shopping cart with localStorage persistence
// Server-side authoritative price recalculation takes place during checkout

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameItem } from '@/lib/data/games';

export interface CartItem {
  game: GameItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  addItem: (game: GameItem) => void;
  removeItem: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getTotalCount: () => number;
  getSubtotalUSD: () => number;
  getSubtotalIQD: () => number;
  getTotalUSD: () => number;
  getTotalIQD: () => number;
}

// Valid sample coupons for testing
const PROMO_CODES: Record<string, number> = {
  VORTEX10: 10,
  LAUNCH20: 20,
  KURDISTAN15: 15,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercent: 0,

      addItem: (game: GameItem) => {
        set((state) => {
          const existing = state.items.find((item) => item.game.id === game.id);
          if (existing) {
            // Maximum 5 per digital product to prevent reseller abuse
            if (existing.quantity >= 5) return state;
            return {
              items: state.items.map((item) =>
                item.game.id === game.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { game, quantity: 1 }] };
        });
      },

      removeItem: (gameId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.game.id !== gameId),
        }));
      },

      updateQuantity: (gameId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(gameId);
          return;
        }
        const safeQty = Math.min(Math.max(quantity, 1), 5);
        set((state) => ({
          items: state.items.map((item) =>
            item.game.id === gameId ? { ...item, quantity: safeQty } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountPercent: 0 });
      },

      applyCoupon: (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (PROMO_CODES[normalized]) {
          const discount = PROMO_CODES[normalized];
          set({ couponCode: normalized, discountPercent: discount });
          return { success: true, message: `Coupon applied: ${discount}% OFF!` };
        }
        return { success: false, message: 'Invalid or expired coupon code' };
      },

      removeCoupon: () => {
        set({ couponCode: null, discountPercent: 0 });
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotalUSD: () => {
        return get().items.reduce(
          (sum, item) => sum + item.game.priceUSD * item.quantity,
          0
        );
      },

      getSubtotalIQD: () => {
        return get().items.reduce(
          (sum, item) => sum + item.game.priceIQD * item.quantity,
          0
        );
      },

      getTotalUSD: () => {
        const subtotal = get().getSubtotalUSD();
        const discount = (subtotal * get().discountPercent) / 100;
        return Math.round(subtotal - discount);
      },

      getTotalIQD: () => {
        const subtotal = get().getSubtotalIQD();
        const discount = (subtotal * get().discountPercent) / 100;
        return Math.round(subtotal - discount);
      },
    }),
    {
      name: 'vortex-cart-store',
    }
  )
);
