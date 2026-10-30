'use client';

// VORTEX GAMING — Currency State Store
// Multi-currency support for USD and Iraqi Dinar (IQD)
// 1 USD is fixed at 1,310 IQD for display estimation, while authoritative prices are stored per game item
// Server-safe hydration: ensures initial client render matches server HTML perfectly before activating saved preference

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CurrencyCode = 'USD' | 'IQD';

interface CurrencyState {
  currency: CurrencyCode;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amountUSD: number, amountIQD?: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      isHydrated: false,
      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
      setCurrency: (currency: CurrencyCode) => {
        set({ currency, isHydrated: true });
        if (typeof document !== 'undefined') {
          try {
            document.cookie = `vtx_currency=${currency}; path=/; max-age=31536000; SameSite=Lax`;
          } catch {
            // ignore
          }
        }
      },
      format: (amountUSD: number, amountIQD?: number) => {
        const { currency, isHydrated } = get();
        // Server and initial client render must render USD identically to prevent hydration mismatch.
        // Once hydrated on the client, the saved currency preference is applied.
        const activeCurrency = isHydrated ? currency : 'USD';
        if (activeCurrency === 'USD') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amountUSD / 100);
        }
        
        // For IQD, use explicit amountIQD if provided, or estimate at 1,310 IQD per USD
        const iqdVal = amountIQD !== undefined ? amountIQD : Math.round((amountUSD / 100) * 1310);
        return `${new Intl.NumberFormat('en-US').format(iqdVal)} د.ع`;
      },
    }),
    {
      name: 'vortex-currency-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
