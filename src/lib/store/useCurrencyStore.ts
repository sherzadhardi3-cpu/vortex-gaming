'use client';

// VORTEX GAMING — Multi-Currency State Store
// Supports 6 benchmark currencies: USD, IQD, EUR, TRY, SAR, AED
// Canonical pricing currency: USD (minor units: cents)
// Server-safe hydration: ensures initial client render matches server HTML perfectly before activating saved preference

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type CurrencyCode,
  type CurrencyConfig,
  CURRENCY_CONFIGS,
  getCurrencyConfig,
  formatCurrencyPrice,
  convertUSDCents,
} from '../constants/currencies.ts';

export type { CurrencyCode };

interface CurrencyState {
  currency: CurrencyCode;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amountUSD: number, amountIQD?: number) => string;
  convert: (amountUSD: number, amountIQD?: number) => { amount: number; rate: number; formatted: string };
  getConfig: () => CurrencyConfig;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      isHydrated: false,
      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
      setCurrency: (currency: CurrencyCode) => {
        const validCurrency = CURRENCY_CONFIGS[currency] ? currency : 'USD';
        set({ currency: validCurrency, isHydrated: true });
        if (typeof document !== 'undefined') {
          try {
            document.cookie = `vtx_currency=${validCurrency}; path=/; max-age=31536000; SameSite=Lax`;
          } catch {
            // ignore
          }
        }
      },
      getConfig: () => {
        const { currency, isHydrated } = get();
        const activeCurrency = isHydrated ? currency : 'USD';
        return getCurrencyConfig(activeCurrency);
      },
      convert: (amountUSD: number, amountIQD?: number) => {
        const { currency, isHydrated } = get();
        const activeCurrency = isHydrated ? currency : 'USD';
        return convertUSDCents(amountUSD, activeCurrency, amountIQD);
      },
      format: (amountUSD: number, amountIQD?: number) => {
        const { currency, isHydrated } = get();
        // Server and initial client render must render USD identically to prevent hydration mismatch.
        // Once hydrated on the client, the saved currency preference is applied.
        const activeCurrency = isHydrated ? currency : 'USD';
        return formatCurrencyPrice(amountUSD, activeCurrency, amountIQD);
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
