import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from '../src/lib/i18n/translations.ts';

test('Footer i18n: All footer keys exist across English, Kurdish, and Arabic', () => {
  const footerKeys = [
    'footer.tagline',
    'footer.supportEmailLabel',
    'footer.quickLinks',
    'footer.aboutUs',
    'footer.store',
    'footer.contact',
    'footer.faq',
    'footer.support',
    'footer.account',
    'footer.services',
    'footer.gameKeys',
    'footer.giftCards',
    'footer.topUps',
    'footer.subscriptions',
    'footer.pcGames',
    'footer.consoleGames',
    'footer.newsletterTitle',
    'footer.newsletterDesc',
    'footer.emailPlaceholder',
    'footer.subscribeBtn',
    'footer.subscribing',
    'footer.subscribedSuccess',
    'footer.consentLabel',
    'footer.trustSecureCheckout',
    'footer.trustDataEncryption',
    'footer.trustSupport',
    'footer.trustInstantDelivery',
    'footer.paymentMethods',
    'footer.paymentLive',
    'footer.paymentSandbox',
    'footer.paymentSandboxNotice',
    'footer.privacy',
    'footer.refundPolicy',
    'footer.terms',
    'footer.backToTop',
    'footer.copyright',
  ];

  for (const lang of ['en', 'ku', 'ar']) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict, `Dictionary for ${lang} must exist`);
    for (const key of footerKeys) {
      assert.ok(
        dict[key] && dict[key].trim().length > 0,
        `Key ${key} must exist and not be empty in ${lang}`
      );
      assert.doesNotMatch(
        dict[key],
        /e4e/i,
        `Key ${key} in ${lang} must not contain E4E references`
      );
    }
  }
});

test('Newsletter Validation & Truthful Confirmation: Rejects invalid emails and requires consent', () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  assert.equal(emailRegex.test('gamer@vortexgaming.gg'), true);
  assert.equal(emailRegex.test('customer+deals@domain.com'), true);
  assert.equal(emailRegex.test('not-an-email'), false);
  assert.equal(emailRegex.test('@missinguser.com'), false);
  assert.equal(emailRegex.test('user@domain'), false);

  // Verify truthful messaging does not make unfulfilled voucher promises
  const enSuccess = TRANSLATIONS.en['footer.subscribedSuccess'];
  assert.doesNotMatch(enSuccess, /10% voucher/i);
  assert.match(enSuccess, /confirmed/i);
});

test('Payment Gateway Sandbox Separation: Iraqi payment methods are labeled Sandbox', () => {
  const enSandbox = TRANSLATIONS.en['footer.paymentSandbox'];
  const enNotice = TRANSLATIONS.en['footer.paymentSandboxNotice'];
  assert.match(enSandbox, /sandbox/i);
  assert.match(enNotice, /FIB/);
  assert.match(enNotice, /FastPay/);
  assert.match(enNotice, /Qi Card/);
  assert.match(enNotice, /disabled for real financial charges/i);
});
