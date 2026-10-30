import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

process.env.GAME_KEY_ENCRYPTION_KEY ||= '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// VORTEX GAMING — Multi-Currency System Test Suite
// Verifies all 6 currencies, exchange rates, decimal-safe conversions, hydration,
// server-authoritative checkout, order persistence, and UI components.

test('Multi-Currency: All 6 benchmark currencies exist with official configurations', async () => {
  const { CURRENCIES, CURRENCY_CONFIGS, getCurrencyConfig } = await import(
    '../src/lib/constants/currencies.ts'
  );

  assert.equal(CURRENCIES.length, 6, 'Must support exactly 6 currencies');
  const expectedCodes = ['USD', 'IQD', 'EUR', 'TRY', 'SAR', 'AED'];
  for (const code of expectedCodes) {
    const config = getCurrencyConfig(code);
    assert.ok(config, `Configuration for ${code} must exist`);
    assert.equal(config.code, code);
    assert.ok(config.symbol, `${code} must have a symbol`);
    assert.ok(config.name, `${code} must have an English name`);
    assert.ok(config.nativeName, `${code} must have a native name`);
    assert.ok(config.rateAgainstUSD > 0, `${code} must have a positive benchmark exchange rate`);
    assert.ok(config.source, `${code} must document its source`);
  }

  // Exact symbols
  assert.equal(CURRENCY_CONFIGS.USD.symbol, '$');
  assert.equal(CURRENCY_CONFIGS.IQD.symbol, 'د.ع');
  assert.equal(CURRENCY_CONFIGS.EUR.symbol, '€');
  assert.equal(CURRENCY_CONFIGS.TRY.symbol, '₺');
  assert.equal(CURRENCY_CONFIGS.SAR.symbol, 'ر.س');
  assert.equal(CURRENCY_CONFIGS.AED.symbol, 'د.إ');

  // Benchmark exchange rates
  assert.equal(CURRENCY_CONFIGS.USD.rateAgainstUSD, 1.0);
  assert.equal(CURRENCY_CONFIGS.IQD.rateAgainstUSD, 1310.0);
  assert.equal(CURRENCY_CONFIGS.EUR.rateAgainstUSD, 0.92);
  assert.equal(CURRENCY_CONFIGS.TRY.rateAgainstUSD, 34.2);
  assert.equal(CURRENCY_CONFIGS.SAR.rateAgainstUSD, 3.75);
  assert.equal(CURRENCY_CONFIGS.AED.rateAgainstUSD, 3.6725);
});

test('Multi-Currency: Decimal-safe conversions and currency-appropriate rounding', async () => {
  const { convertUSDCents, formatCurrencyPrice } = await import(
    '../src/lib/constants/currencies.ts'
  );

  // $39.99 (3999 cents)
  const usd = convertUSDCents(3999, 'USD');
  assert.equal(usd.amount, 39.99);
  assert.equal(usd.formatted, '$39.99');

  const iqd = convertUSDCents(3999, 'IQD', 52000);
  assert.equal(iqd.amount, 52000);
  assert.equal(iqd.formatted, '52,000 د.ع');

  const eur = convertUSDCents(3999, 'EUR');
  assert.equal(eur.amount, 36.79);
  assert.equal(eur.formatted, '€36.79');

  const tri = convertUSDCents(3999, 'TRY');
  assert.equal(tri.amount, 1367.66);
  assert.equal(tri.formatted, '₺1,367.66');

  const sar = convertUSDCents(3999, 'SAR');
  assert.equal(sar.amount, 149.96);
  assert.equal(sar.formatted, '149.96 ر.س');

  const aed = convertUSDCents(3999, 'AED');
  assert.equal(aed.amount, 146.86);
  assert.equal(aed.formatted, '146.86 د.إ');
});

test('Multi-Currency: Zustand store supports switching across all 6 currencies', async () => {
  const { useCurrencyStore } = await import('../src/lib/store/useCurrencyStore.ts');

  // Set hydrated to test active formatting
  useCurrencyStore.getState().setHydrated(true);

  // Test all 6
  const cases = [
    { code: 'USD', expected: '$39.99' },
    { code: 'IQD', expected: '52,000 د.ع' },
    { code: 'EUR', expected: '€36.79' },
    { code: 'TRY', expected: '₺1,367.66' },
    { code: 'SAR', expected: '149.96 ر.س' },
    { code: 'AED', expected: '146.86 د.إ' },
  ];

  for (const c of cases) {
    useCurrencyStore.getState().setCurrency(c.code);
    assert.equal(useCurrencyStore.getState().currency, c.code);
    const formatted = useCurrencyStore.getState().format(3999, 52000);
    assert.equal(formatted, c.expected, `Formatted output for ${c.code} must be ${c.expected}`);
  }
});

test('Multi-Currency: Server-authoritative checkout calculation & order persistence', async () => {
  const { calculateAuthoritativeTotals } = await import(
    '../src/lib/checkout/authoritative-calculator.ts'
  );
  const { createAuthoritativeOrder } = await import('../src/lib/orders/order-store.ts');

  // 1 item: Cyberpunk 2077 (catalog priceUSD is 2999 cents = $29.99)
  const result = calculateAuthoritativeTotals(
    [{ id: 'steam-cyberpunk-phantom-liberty', slug: 'cyberpunk-2077-phantom-liberty', quantity: 1 }],
    'EUR'
  );

  assert.equal(result.totalUSD, 2999);
  assert.equal(result.displayCurrency, 'EUR');
  assert.equal(result.exchangeRate, 0.92);
  assert.equal(result.convertedTotal, 27.59);
  assert.equal(result.formattedTotal, '€27.59');

  // Create authoritative order
  const order = createAuthoritativeOrder({
    orderNumber: 'VX-CURRENCY-TEST-1',
    customerEmail: 'currency.test@vortexgaming.gg',
    items: result.verifiedItems,
    total: result.totalUSD,
    currency: result.displayCurrency,
    displayCurrency: result.displayCurrency,
    exchangeRate: result.exchangeRate,
    convertedTotal: result.convertedTotal,
    paymentProvider: 'stripe',
  });

  assert.equal(order.total, 2999, 'Canonical total must be stored in USD cents');
  assert.equal(order.displayCurrency, 'EUR');
  assert.equal(order.exchangeRate, 0.92);
  assert.equal(order.convertedTotal, 27.59);
  assert.ok(order.rateTimestamp, 'Exchange rate timestamp must be saved');
});

test('Multi-Currency: Header UI dropdown and accessibility inspection', () => {
  const headerCode = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Header.tsx'),
    'utf8'
  );

  assert.ok(headerCode.includes('currencyMenuOpen'), 'Header must manage currencyMenuOpen state');
  assert.ok(headerCode.includes('currencyMenuRef'), 'Header must have ref for click-outside detection');
  assert.ok(headerCode.includes('role="listbox"'), 'Header currency dropdown must have role="listbox"');
  assert.ok(headerCode.includes('aria-expanded={currencyMenuOpen}'), 'Header currency button must have aria-expanded');
  assert.ok(headerCode.includes('grid grid-cols-3'), 'Mobile menu must have a clean 3-column currency grid');
});
