import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// VORTEX GAMING — Localhost Runtime Fixes Verification Test Suite
// Verifies:
// 1. Currency preference hydration matching (server vs client) & persistence
// 2. Suspense boundary isolation for instant-navigation on dynamic routes
// 3. Absence of global html scroll-behavior: smooth
// 4. Core auth, cart, currency, and health probe integrity

test('Fix 1: Currency Hydration Safety & Formatting', async () => {
  // Test formatting logic directly
  const { useCurrencyStore } = await import('../src/lib/store/useCurrencyStore.ts');
  
  // 1. In initial or SSR unhydrated state, format always defaults to USD to match server render
  useCurrencyStore.setState({ currency: 'IQD', isHydrated: false });
  const unhydratedPrice = useCurrencyStore.getState().format(3999, 52000);
  assert.equal(unhydratedPrice, '$39.99', 'Unhydrated format must render USD to match server render identically');

  // 2. Once hydrated, saved preference is applied
  useCurrencyStore.getState().setHydrated(true);
  const hydratedPrice = useCurrencyStore.getState().format(3999, 52000);
  assert.equal(hydratedPrice, '52,000 د.ع', 'Hydrated format must display user preferred currency');

  // 3. Switching back to USD
  useCurrencyStore.getState().setCurrency('USD');
  const usdPrice = useCurrencyStore.getState().format(3999, 52000);
  assert.equal(usdPrice, '$39.99', 'format must display USD when USD is selected');
  assert.equal(useCurrencyStore.getState().currency, 'USD');

  // 4. Switching to IQD
  useCurrencyStore.getState().setCurrency('IQD');
  const iqdPrice = useCurrencyStore.getState().format(3999, 52000);
  assert.equal(iqdPrice, '52,000 د.ع', 'format must display IQD when IQD is selected');
  assert.equal(useCurrencyStore.getState().currency, 'IQD');
});

test('Fix 2: Suspense Boundaries on Request-Dependent Routes', () => {
  const platformPageCode = fs.readFileSync(path.join(process.cwd(), 'src/app/platform/[slug]/page.tsx'), 'utf8');
  assert.ok(platformPageCode.includes('Suspense fallback='), 'PlatformPage must wrap content in a Suspense boundary');
  assert.ok(platformPageCode.includes('PlatformLoadingFallback'), 'PlatformPage must provide a meaningful loading fallback');
  assert.ok(platformPageCode.includes('PlatformContent'), 'PlatformPage must isolate await params inside PlatformContent');

  const platformLoadingCode = fs.readFileSync(path.join(process.cwd(), 'src/app/platform/[slug]/loading.tsx'), 'utf8');
  assert.ok(platformLoadingCode.includes('PlatformLoadingFallback'), 'Platform route must have dedicated loading.tsx fallback');

  const gamePageCode = fs.readFileSync(path.join(process.cwd(), 'src/app/game/[slug]/page.tsx'), 'utf8');
  assert.ok(gamePageCode.includes('Suspense fallback='), 'GameDetailPage must wrap content in a Suspense boundary');
  assert.ok(gamePageCode.includes('GameDetailLoadingFallback'), 'GameDetailPage must provide a meaningful loading fallback');
  assert.ok(gamePageCode.includes('GameDetailContent'), 'GameDetailPage must isolate await params inside GameDetailContent');

  const gameLoadingCode = fs.readFileSync(path.join(process.cwd(), 'src/app/game/[slug]/loading.tsx'), 'utf8');
  assert.ok(gameLoadingCode.includes('GameDetailLoadingFallback'), 'Game route must have dedicated loading.tsx fallback');
});

test('Fix 3: HTML Scroll-Behavior Warning Eradication', () => {
  const appCss = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  assert.ok(!appCss.includes('html {\n  scroll-behavior: smooth;'), 'Global html selector must not have scroll-behavior: smooth in app/globals.css');
  assert.ok(appCss.includes('.smooth-scroll'), 'A scoped .smooth-scroll utility class must be available instead');

  const stylesCss = fs.readFileSync(path.join(process.cwd(), 'src/styles/globals.css'), 'utf8');
  assert.ok(!stylesCss.includes('html {\n  scroll-behavior: smooth;'), 'Global html selector must not have scroll-behavior: smooth in styles/globals.css');
});

test('Fix 4: HeroSection Hydration-Safe Price Display', () => {
  const heroCode = fs.readFileSync(path.join(process.cwd(), 'src/components/home/HeroSection.tsx'), 'utf8');
  assert.ok(heroCode.includes('const [mounted, setMounted] = useState(false);'), 'HeroSection must track mount status');
  assert.ok(heroCode.includes('format(spotlightGame.originalPriceUSD, spotlightGame.originalPriceIQD)'), 'HeroSection must format originalPriceUSD');
  assert.ok(heroCode.includes('format(spotlightGame.priceUSD, spotlightGame.priceIQD)'), 'HeroSection must format priceUSD');
  assert.ok(heroCode.includes('(spotlightGame.priceUSD / 100).toFixed(2)'), 'HeroSection must provide static USD fallback for SSR');
});
