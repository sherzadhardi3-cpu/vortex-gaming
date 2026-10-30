// VORTEX GAMING — Server-Authoritative Price & Discount Calculator
// Discards any client-submitted prices or amounts to prevent tampering.
// Supports multi-currency conversion with benchmark exchange rates.

import { GAMES_CATALOG } from '../data/games.ts';
import {
  type CurrencyCode,
  getCurrencyConfig,
  convertUSDCents,
} from '../constants/currencies.ts';

const VALID_PROMOS: Record<string, number> = {
  VORTEX10: 10,
  LAUNCH20: 20,
  KURDISTAN15: 15,
};

export interface CheckoutItemInput {
  id: string;
  slug?: string;
  quantity?: number;
  [key: string]: any;
}

export function calculateAuthoritativeTotals(
  items: CheckoutItemInput[],
  currency: CurrencyCode | string = 'USD',
  couponCode?: string
) {
  let subtotalUSD = 0;
  let subtotalIQD = 0;
  const verifiedItems = [];

  for (const item of items) {
    const catalogGame = GAMES_CATALOG.find((g) => g.id === item.id || g.slug === item.slug);
    if (!catalogGame) {
      throw new Error(`Product not found in catalog: ${item.id}`);
    }

    const qty = Math.min(Math.max(Number(item.quantity) || 1, 1), 5); // Max 5 per item
    const itemTotalUSD = catalogGame.priceUSD * qty;
    const itemTotalIQD = catalogGame.priceIQD * qty;

    subtotalUSD += itemTotalUSD;
    subtotalIQD += itemTotalIQD;

    verifiedItems.push({
      gameId: catalogGame.id,
      title: catalogGame.title,
      platform: catalogGame.platformName,
      quantity: qty,
      unitPriceUSD: catalogGame.priceUSD,
      unitPriceIQD: catalogGame.priceIQD,
    });
  }

  let discountPercent = 0;
  if (couponCode && typeof couponCode === 'string') {
    const normalized = couponCode.trim().toUpperCase();
    if (VALID_PROMOS[normalized]) {
      discountPercent = VALID_PROMOS[normalized];
    }
  }

  const discountUSD = Math.round((subtotalUSD * discountPercent) / 100);
  const discountIQD = Math.round((subtotalIQD * discountPercent) / 100);

  const totalUSD = subtotalUSD - discountUSD;
  const totalIQD = subtotalIQD - discountIQD;

  const validCurrency = (getCurrencyConfig(currency)?.code || 'USD') as CurrencyCode;
  const converted = convertUSDCents(totalUSD, validCurrency, totalIQD);

  return {
    verifiedItems,
    discountPercent,
    subtotalUSD,
    subtotalIQD,
    totalUSD,
    totalIQD,
    displayCurrency: validCurrency,
    exchangeRate: converted.rate,
    convertedTotal: converted.amount,
    formattedTotal: converted.formatted,
    authoritativeTotal: validCurrency === 'IQD' ? totalIQD : totalUSD,
  };
}
