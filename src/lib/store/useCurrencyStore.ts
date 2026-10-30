'use client';

// VORTEX GAMING — Currency State Store
// Multi-currency support for USD and Iraqi Dinar (IQD)
// 1 USD is fixed at 1,310 IQD for display estimation, while authoritative prices are stored per game item

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'USD' | 'IQD';

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amountUSD: number, amountIQD?: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (currency: CurrencyCode) => set({ currency }),
      format: (amountUSD: number, amountIQD?: number) => {
        const { currency } = get();
        if (currency === 'USD') {
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
    }
  )
);
