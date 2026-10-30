// VORTEX GAMING — Multi-Currency Configuration & Financial Benchmark Engine
// Canonical pricing currency: USD (minor units: cents)
// Supported display & settlement currencies: USD, IQD, EUR, TRY, SAR, AED
//
// EXCHANGE RATE POLICY & CITATIONS:
// • USD — Canonical base currency (1.0000). All catalog items have authoritative prices in USD cents.
// • IQD — Fixed benchmark rate: 1,310 IQD/USD (Central Bank of Iraq / CBI official benchmark rate).
// • EUR — Reference rate: 0.9200 EUR/USD (European Central Bank / ECB reference benchmark).
// • TRY — Reference rate: 34.2000 TRY/USD (Central Bank of the Republic of Turkey / CBRT benchmark).
// • SAR — Fixed peg rate: 3.7500 SAR/USD (Saudi Central Bank / SAMA official USD peg).
// • AED — Fixed peg rate: 3.6725 AED/USD (Central Bank of the UAE / CBUAE official USD peg).
//
// Rounding policy:
// • Standard currencies (USD, EUR, TRY, SAR, AED): 2 decimal places (cents/fils/halalas/kurus).
// • Non-decimal currency (IQD): 0 decimal places (rounded to nearest integer with comma separators).
// Converted amounts are display estimates; authoritative checkout recalculation happens on the server.

export type CurrencyCode = 'USD' | 'IQD' | 'EUR' | 'TRY' | 'SAR' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  nativeName: string;
  symbol: string;
  locale: string;
  decimals: number;
  rateAgainstUSD: number;
  symbolPosition: 'before' | 'after';
  source: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    nativeName: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
    rateAgainstUSD: 1.0,
    symbolPosition: 'before',
    source: 'Canonical base currency (USD cents)',
  },
  IQD: {
    code: 'IQD',
    name: 'Iraqi Dinar',
    nativeName: 'د.ع عراقي',
    symbol: 'د.ع',
    locale: 'ar-IQ',
    decimals: 0,
    rateAgainstUSD: 1310.0,
    symbolPosition: 'after',
    source: 'Central Bank of Iraq (CBI) official benchmark rate',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    nativeName: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    decimals: 2,
    rateAgainstUSD: 0.92,
    symbolPosition: 'before',
    source: 'European Central Bank (ECB) benchmark reference rate',
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    nativeName: 'Türk Lirası',
    symbol: '₺',
    locale: 'tr-TR',
    decimals: 2,
    rateAgainstUSD: 34.2,
    symbolPosition: 'before',
    source: 'Central Bank of the Republic of Turkey (CBRT) benchmark rate',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    nativeName: 'ريال سعودي',
    symbol: 'ر.س',
    locale: 'ar-SA',
    decimals: 2,
    rateAgainstUSD: 3.75,
    symbolPosition: 'after',
    source: 'Saudi Central Bank (SAMA) USD peg benchmark',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    nativeName: 'درهم إماراتي',
    symbol: 'د.إ',
    locale: 'ar-AE',
    decimals: 2,
    rateAgainstUSD: 3.6725,
    symbolPosition: 'after',
    source: 'Central Bank of the UAE (CBUAE) USD peg benchmark',
  },
};

export const CURRENCIES: readonly CurrencyConfig[] = [
  CURRENCY_CONFIGS.USD,
  CURRENCY_CONFIGS.IQD,
  CURRENCY_CONFIGS.EUR,
  CURRENCY_CONFIGS.TRY,
  CURRENCY_CONFIGS.SAR,
  CURRENCY_CONFIGS.AED,
] as const;

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/**
 * Returns currency configuration for a given currency code. Defaults to USD.
 */
export function getCurrencyConfig(code: string): CurrencyConfig {
  const upper = (code || '').toUpperCase() as CurrencyCode;
  return CURRENCY_CONFIGS[upper] || CURRENCY_CONFIGS.USD;
}

/**
 * Converts a canonical USD minor unit (cents) amount into the target currency.
 * Applies decimal-safe calculations and currency-appropriate rounding.
 */
export function convertUSDCents(
  amountUSDCents: number,
  targetCurrency: CurrencyCode,
  explicitIQD?: number
): {
  amount: number;
  rate: number;
  formatted: string;
} {
  const config = getCurrencyConfig(targetCurrency);
  const baseUSD = (Number(amountUSDCents) || 0) / 100;

  if (config.code === 'USD') {
    const formatted = `$${baseUSD.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    return { amount: baseUSD, rate: 1.0, formatted };
  }

  if (config.code === 'IQD') {
    const val =
      explicitIQD !== undefined && explicitIQD > 0
        ? explicitIQD
        : Math.round(baseUSD * config.rateAgainstUSD);
    const formatted = `${val.toLocaleString('en-US')} د.ع`;
    return { amount: val, rate: config.rateAgainstUSD, formatted };
  }

  // Decimal-safe rounding for EUR, TRY, SAR, AED (rounded to 2 decimal places)
  const converted = Math.round(baseUSD * config.rateAgainstUSD * 100) / 100;
  const numString = converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted =
    config.symbolPosition === 'before'
      ? `${config.symbol}${numString}`
      : `${numString} ${config.symbol}`;

  return { amount: converted, rate: config.rateAgainstUSD, formatted };
}

/**
 * Formats canonical USD minor unit (cents) directly into the target currency string.
 */
export function formatCurrencyPrice(
  amountUSDCents: number,
  targetCurrency: CurrencyCode,
  explicitIQD?: number
): string {
  return convertUSDCents(amountUSDCents, targetCurrency, explicitIQD).formatted;
}
