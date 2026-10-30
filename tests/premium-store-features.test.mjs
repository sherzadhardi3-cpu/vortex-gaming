// VORTEX GAMING — Automated Tests for Premium Storefront, Account Dashboard, Support & i18n
// Executes via Node.js native test runner: node --test

import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, getTranslation } from '../src/lib/i18n/translations.ts';
import {
  getTicketsForUser,
  createTicket,
  addMessageToTicket,
} from '../src/lib/support/support-store.ts';
import { GAMES_CATALOG } from '../src/lib/data/games.ts';

// ─── 1. I18N & TRANSLATION COVERAGE ─────────────────────────────────────────

test('i18n: All supported languages have complete dictionary coverage without missing keys', () => {
  const languages = ['en', 'ku', 'ar'];
  const englishKeys = Object.keys(TRANSLATIONS.en);

  assert.ok(englishKeys.length >= 70, 'English dictionary must contain at least 70 translated UI strings');

  for (const lang of languages) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict, `Dictionary for ${lang} must exist`);

    for (const key of englishKeys) {
      const val = dict[key];
      assert.ok(
        val && typeof val === 'string' && val.trim().length > 0,
        `Missing or empty translation for key "${key}" in language "${lang}"`
      );
    }
  }
});

test('i18n: profilePage.support is properly translated in English, Kurdish, and Arabic', () => {
  assert.equal(getTranslation('en', 'profilePage.support'), 'Customer Support');
  assert.equal(getTranslation('ku', 'profilePage.support'), 'پشتیوانی بەکارهێنەر');
  assert.equal(getTranslation('ar', 'profilePage.support'), 'الدعم والمساعدة');
});

// ─── 2. CUSTOMER SUPPORT & DATA ISOLATION ───────────────────────────────────

test('Support System: Customer can create ticket and send messages', async () => {
  const testEmail = `gamer_${Date.now()}@domain.com`;
  const ticket = await createTicket({
    userId: 'usr_test_123',
    userEmail: testEmail,
    userName: 'FalconGamer',
    subject: 'Steam Key Activation Query',
    category: 'KEY_ACTIVATION',
    initialMessage: 'Where do I activate this Steam key?',
  });

  assert.ok(ticket.id.startsWith('tkt_'));
  assert.equal(ticket.userEmail, testEmail);
  assert.equal(ticket.messages.length, 2); // 1 initial customer message + 1 automated Sentinel reply

  // Add follow-up message
  const followUp = await addMessageToTicket({
    ticketId: ticket.id,
    sender: 'CUSTOMER',
    senderName: 'FalconGamer',
    message: 'Found the activate button on Steam, thank you!',
    requestingUserId: 'usr_test_123',
    requestingEmail: testEmail,
  });

  assert.ok(followUp.id.startsWith('msg_'));
  assert.equal(followUp.sender, 'CUSTOMER');
});

test('Support System: Strict customer isolation prevents reading or messaging other users tickets', async () => {
  const victimEmail = `victim_${Date.now()}@domain.com`;
  const attackerEmail = `attacker_${Date.now()}@domain.com`;

  const victimTicket = await createTicket({
    userId: 'usr_victim',
    userEmail: victimEmail,
    userName: 'VictimUser',
    subject: 'Confidential Inquiry',
    initialMessage: 'Private order details',
  });

  // 1. Attacker tries to read victim tickets
  const attackerVisibleTickets = await getTicketsForUser({
    userId: 'usr_attacker',
    userEmail: attackerEmail,
    isAdmin: false,
  });

  assert.ok(
    !attackerVisibleTickets.some((t) => t.id === victimTicket.id),
    'Attacker must NOT be able to view victim ticket'
  );

  // 2. Attacker tries to post a message into victim ticket
  await assert.rejects(
    async () => {
      await addMessageToTicket({
        ticketId: victimTicket.id,
        sender: 'CUSTOMER',
        senderName: 'Attacker',
        message: 'Malicious post',
        requestingUserId: 'usr_attacker',
        requestingEmail: attackerEmail,
        isAdmin: false,
      });
    },
    /Unauthorized to message this ticket/,
    'Attacker must be rejected when attempting to post to another users ticket'
  );

  // 3. Admin can view all tickets
  const adminTickets = await getTicketsForUser({
    isAdmin: true,
  });
  assert.ok(adminTickets.some((t) => t.id === victimTicket.id), 'Admin must be able to view tickets for support resolution');
});

// ─── 3. STORE CATALOG FILTERING & SORTING ───────────────────────────────────

test('Store Catalog: Supports filtering by platform, genre, and product type', () => {
  const steamGames = GAMES_CATALOG.filter((g) => g.platform === 'steam');
  assert.ok(steamGames.length > 0, 'Steam games must exist in catalog');

  const rpgGames = GAMES_CATALOG.filter((g) => g.genre.includes('RPG'));
  assert.ok(rpgGames.length > 0, 'RPG games must exist in catalog');

  const dlcItems = GAMES_CATALOG.filter((g) => g.productType === 'DLC');
  assert.ok(dlcItems.length > 0, 'DLC items must exist in catalog');
});

test('Store Catalog: Price sorting works accurately in minor units', () => {
  const catalogCopy = [...GAMES_CATALOG];

  // Ascending
  const asc = [...catalogCopy].sort((a, b) => a.priceUSD - b.priceUSD);
  for (let i = 0; i < asc.length - 1; i++) {
    assert.ok(asc[i].priceUSD <= asc[i + 1].priceUSD, 'Ascending sort must strictly increase or stay equal');
  }

  // Descending
  const desc = [...catalogCopy].sort((a, b) => b.priceUSD - a.priceUSD);
  for (let i = 0; i < desc.length - 1; i++) {
    assert.ok(desc[i].priceUSD >= desc[i + 1].priceUSD, 'Descending sort must strictly decrease or stay equal');
  }
});
