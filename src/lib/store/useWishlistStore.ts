'use client';

// VORTEX GAMING — Wishlist State Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameItem } from '@/lib/data/games';

interface WishlistState {
  items: GameItem[];
  toggleWishlist: (game: GameItem) => void;
  isInWishlist: (gameId: string) => boolean;
  removeItem: (gameId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (game: GameItem) => {
        const { items } = get();
        const exists = items.some((item) => item.id === game.id);
        if (exists) {
          set({ items: items.filter((item) => item.id !== game.id) });
        } else {
          set({ items: [...items, game] });
        }
      },
      isInWishlist: (gameId: string) => {
        return get().items.some((item) => item.id === gameId);
      },
      removeItem: (gameId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== gameId),
        }));
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'vortex-wishlist-store',
    }
  )
);
