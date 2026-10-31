// VORTEX GAMING — Complete Support Center & FAQ Verification Test Suite
// Verifies:
// 1. All 35 FAQs exist across exact 9 categories with exact distribution
// 2. Full 3-language coverage (English, Kurdish Sorani, Arabic)
// 3. Truthful policies (PIN-protected delivery, AES-256 vault, non-recurring codes, bcrypt hashes)
// 4. Category-aware filtering and search accuracy (as-you-type, multi-language, empty states)
// 5. Support Ticket Store persistence, orderId association, message replies, and customer isolation
// 6. UI component structure: Support Center, FAQ Accordion, Customer Account 10-Item Nav, and Floating Support Widget

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  FAQ_CATEGORIES,
  FAQS_DATA,
  getAllFaqCategories,
  getAllFaqs,
  getCategoryQuestionCount,
  getFaqsForCategory,
  searchFaqs,
} from '../src/lib/data/faqs.ts';

import {
  createTicket,
  getTicketsForUser,
  addMessageToTicket,
  updateTicketStatus,
} from '../src/lib/support/support-store.ts';

// ─── 1. Exact 35 FAQs Count & Category Distribution ─────────────────────────

test('1. Support Center — Total FAQ count is exactly 35', () => {
  assert.equal(FAQS_DATA.length, 35, 'FAQS_DATA must contain exactly 35 items');
  assert.equal(getAllFaqs().length, 35, 'getAllFaqs() helper must return 35 items');
  assert.equal(getCategoryQuestionCount('all'), 35, 'getCategoryQuestionCount("all") must return 35');
});

test('2. Support Center — Exactly 9 categories with precise distribution matching reference', () => {
  assert.equal(FAQ_CATEGORIES.length, 9, 'Must have exactly 9 categories');

  const expectedDistribution = {
    'orders-delivery': 6,
    'game-accounts': 5,
    'payments': 4,
    'gift-cards': 4,
    'subscriptions': 3,
    'account-security': 4,
    'refunds-returns': 4,
    'technical-support': 3,
    'other': 2,
  };

  let totalCount = 0;
  for (const [catId, expectedCount] of Object.entries(expectedDistribution)) {
    const actualCount = getCategoryQuestionCount(catId);
    assert.equal(
      actualCount,
      expectedCount,
      `Category ${catId} must contain exactly ${expectedCount} FAQs (found ${actualCount})`
    );
    totalCount += actualCount;
  }

  assert.equal(totalCount, 35, 'Sum of all category counts must equal 35');
});

// ─── 2. Complete Three-Language Coverage (EN, KU, AR) ───────────────────────

test('3. Localization — All 35 FAQs have complete non-empty EN, KU, and AR translations', () => {
  for (const faq of FAQS_DATA) {
    // English
    assert.ok(faq.en?.q && faq.en.q.trim().length > 5, `FAQ ${faq.id} missing English question`);
    assert.ok(faq.en?.a && faq.en.a.trim().length > 10, `FAQ ${faq.id} missing English answer`);

    // Kurdish Sorani
    assert.ok(faq.ku?.q && faq.ku.q.trim().length > 5, `FAQ ${faq.id} missing Kurdish question`);
    assert.ok(faq.ku?.a && faq.ku.a.trim().length > 10, `FAQ ${faq.id} missing Kurdish answer`);

    // Arabic
    assert.ok(faq.ar?.q && faq.ar.q.trim().length > 5, `FAQ ${faq.id} missing Arabic question`);
    assert.ok(faq.ar?.a && faq.ar.a.trim().length > 10, `FAQ ${faq.id} missing Arabic answer`);
  }
});

test('4. Localization — All 9 categories have complete EN, KU, and AR titles & descriptions', () => {
  for (const cat of FAQ_CATEGORIES) {
    assert.ok(cat.en?.name && cat.en.name.trim().length > 2, `Category ${cat.id} missing EN name`);
    assert.ok(cat.en?.description && cat.en.description.trim().length > 5, `Category ${cat.id} missing EN description`);

    assert.ok(cat.ku?.name && cat.ku.name.trim().length > 2, `Category ${cat.id} missing KU name`);
    assert.ok(cat.ku?.description && cat.ku.description.trim().length > 5, `Category ${cat.id} missing KU description`);

    assert.ok(cat.ar?.name && cat.ar.name.trim().length > 2, `Category ${cat.id} missing AR name`);
    assert.ok(cat.ar?.description && cat.ar.description.trim().length > 5, `Category ${cat.id} missing AR description`);
  }
});

// ─── 3. Truthful Content & Implementation Accuracy ──────────────────────────

test('5. Policy Accuracy — FAQs accurately reflect real platform architecture', () => {
  // Check Orders & Delivery FAQ 1 explains PIN protection
  const odFaq1 = FAQS_DATA.find((f) => f.id === 'faq_od_1');
  assert.ok(odFaq1, 'faq_od_1 must exist');
  assert.ok(odFaq1.en.a.includes('PIN'), 'Delivery FAQ must explain Security PIN protection');
  assert.ok(
    odFaq1.en.a.includes('My Orders') || odFaq1.en.a.includes('Order Details') || odFaq1.en.a.includes('Key Vault'),
    'Must reference real portal paths'
  );

  // Check Refunds FAQ explains irreversible digital reveal policy
  const refFaq1 = FAQS_DATA.find((f) => f.id === 'faq_rr_1');
  assert.ok(refFaq1, 'faq_rr_1 must exist');
  assert.ok(refFaq1.en.a.toLowerCase().includes('revealed') || refFaq1.en.a.toLowerCase().includes('unsealed'), 'Must reference unsealed key policy');

  // Check Subscriptions FAQ explains non-recurring voucher redemption
  const subFaq1 = FAQS_DATA.find((f) => f.id === 'faq_sb_1');
  const subFaq2 = FAQS_DATA.find((f) => f.id === 'faq_sb_2');
  assert.ok(subFaq1 && subFaq2, 'faq_sb_1 and faq_sb_2 must exist');
  assert.ok(
    subFaq1.en.a.toLowerCase().includes('voucher') && subFaq2.en.a.toLowerCase().includes('renew'),
    'Must explain prepaid vouchers without automatic renewal'
  );

  // Check Account Security FAQ explains PIN and bcrypt/AES-256 encryption
  const secFaq3 = FAQS_DATA.find((f) => f.id === 'faq_as_3');
  const secFaq4 = FAQS_DATA.find((f) => f.id === 'faq_as_4');
  assert.ok(secFaq3 && secFaq4, 'faq_as_3 and faq_as_4 must exist');
  assert.ok(secFaq3.en.a.includes('PIN'), 'FAQ 3 must explain Security PIN updates');
  assert.ok(
    secFaq4.en.a.includes('bcrypt') && secFaq4.en.a.includes('AES-256'),
    'FAQ 4 must explain salted bcrypt hashing and AES-256 encryption'
  );
});

// ─── 4. Category Filtering & Search Queries ─────────────────────────────────

test('6. Search & Filter — getFaqsForCategory returns correct localized subsets', () => {
  const odEn = getFaqsForCategory('orders-delivery', 'en');
  assert.equal(odEn.length, 6);
  assert.equal(odEn[0].categoryId, 'orders-delivery');
  assert.ok(odEn[0].q.length > 5);

  const subKu = getFaqsForCategory('subscriptions', 'ku');
  assert.equal(subKu.length, 3);
  assert.equal(subKu[0].categoryId, 'subscriptions');
  assert.ok(subKu[0].q.length > 5);

  const allAr = getFaqsForCategory('all', 'ar');
  assert.equal(allAr.length, 35);
});

test('7. Search & Filter — searchFaqs finds keywords accurately across languages', () => {
  // English query
  const pinResults = searchFaqs('PIN', null, 'en');
  assert.ok(pinResults.length >= 2, 'Searching "PIN" should return multiple relevant FAQs');

  // Kurdish query
  const kuResults = searchFaqs('کلیل', null, 'ku');
  assert.ok(kuResults.length >= 1, 'Searching Kurdish "کلیل" (Key) should return matching FAQs');

  // Arabic query
  const arResults = searchFaqs('استرجاع', null, 'ar');
  assert.ok(arResults.length >= 1, 'Searching Arabic "استرجاع" (Refund) should return matching FAQs');

  // Category-scoped search
  const catScoped = searchFaqs('delivery', 'orders-delivery', 'en');
  assert.ok(catScoped.length >= 1, 'Scoped search in orders-delivery should return matches');
  catScoped.forEach((item) => {
    assert.equal(item.categoryId, 'orders-delivery');
  });

  // Non-existent search returns empty array
  const emptyResults = searchFaqs('xyznonexistentquery9999', null, 'en');
  assert.equal(emptyResults.length, 0, 'Nonexistent query must return 0 results');
});

// ─── 5. Support Ticket Store & Customer Isolation ───────────────────────────

test('8. Support Tickets — Create ticket with orderId and verify persistence', async () => {
  const testEmail = `tester_${Date.now()}@vortexgaming.test`;
  const testOrderId = `ord_test_${Date.now()}`;

  const ticket = await createTicket({
    userId: 'user_test_100',
    userEmail: testEmail,
    userName: 'Test Gamer',
    subject: 'Cannot reveal key for Elden Ring',
    category: 'ORDER_INQUIRY',
    message: 'My order is marked PAID but PIN reveal times out.',
    orderId: testOrderId,
  });

  assert.ok(ticket.id, 'Ticket must have generated ID');
  assert.equal(ticket.userEmail, testEmail);
  assert.equal(ticket.orderId, testOrderId, 'Ticket must store associated orderId');
  assert.equal(ticket.status, 'OPEN', 'Initial status must be OPEN');
  assert.equal(ticket.messages.length, 2, 'Must include initial customer message + system confirmation');
  assert.equal(ticket.messages[0].sender, 'CUSTOMER');
  assert.equal(ticket.messages[1].sender, 'SUPPORT_AGENT');

  // Customer isolation check
  const customerTickets = await getTicketsForUser({
    userId: 'user_test_100',
    userEmail: testEmail,
  });
  assert.ok(customerTickets.some((t) => t.id === ticket.id), 'Customer must see their own ticket');

  // Another customer cannot see this ticket
  const otherCustomerTickets = await getTicketsForUser({
    userId: 'other_user_200',
    userEmail: 'stranger@example.com',
  });
  assert.ok(!otherCustomerTickets.some((t) => t.id === ticket.id), 'Other customer must NOT see this ticket');

  // Reply message with verified customer authorization
  const newMsg = await addMessageToTicket({
    ticketId: ticket.id,
    sender: 'CUSTOMER',
    senderName: 'Test Gamer',
    message: 'I have updated my PIN and will retry.',
    requestingUserId: 'user_test_100',
    requestingEmail: testEmail,
  });
  assert.ok(newMsg.id, 'Message must be generated');
  assert.equal(newMsg.message, 'I have updated my PIN and will retry.');

  // Verify ticket contains the appended message
  const refreshedTickets = await getTicketsForUser({
    userId: 'user_test_100',
    userEmail: testEmail,
  });
  const refreshedTicket = refreshedTickets.find((t) => t.id === ticket.id);
  assert.equal(refreshedTicket.messages.length, 3, 'Ticket must contain 3 messages after customer reply');

  // Status update by customer
  const resolvedTicket = await updateTicketStatus({
    ticketId: ticket.id,
    status: 'RESOLVED',
    requestingUserId: 'user_test_100',
    requestingEmail: testEmail,
  });
  assert.equal(resolvedTicket.status, 'RESOLVED', 'Customer should be able to resolve their own ticket');

  // Unauthorized status update rejected
  await assert.rejects(
    async () => {
      await updateTicketStatus({
        ticketId: ticket.id,
        status: 'CLOSED',
        requestingUserId: 'intruder_999',
        requestingEmail: 'intruder@hack.test',
      });
    },
    /Unauthorized/,
    'Intruder must be rejected from modifying ticket status'
  );
});

// ─── 6. UI & Page Implementation Integrity ─────────────────────────────────

test('9. Architecture — Verified files and navigation items exist', () => {
  const supportPage = fs.readFileSync(path.join(process.cwd(), 'src/app/support/page.tsx'), 'utf8');
  assert.ok(supportPage.includes('FAQAccordion'), 'Support page must embed FAQAccordion');
  assert.ok(supportPage.includes('SupportTicketDesk'), 'Support page must embed SupportTicketDesk');
  assert.ok(supportPage.includes('Breadcrumb') || supportPage.includes('breadcrumb'), 'Support page must include breadcrumb');

  const faqPage = fs.readFileSync(path.join(process.cwd(), 'src/app/faq/page.tsx'), 'utf8');
  assert.ok(faqPage.includes('FAQAccordion'), 'FAQ page must render FAQAccordion');
  assert.ok(faqPage.includes('PLATFORM_GUIDES'), 'FAQ page must include platform activation guides');

  const accountPage = fs.readFileSync(path.join(process.cwd(), 'src/app/account/page.tsx'), 'utf8');
  const requiredNavs = ['overview', 'orders', 'wallet', 'profile', 'addresses', 'wishlist', 'support', 'notifications', 'settings'];
  for (const nav of requiredNavs) {
    assert.ok(accountPage.includes(`id: '${nav}'`), `Account sidebar must include ${nav}`);
  }
  assert.ok(accountPage.includes('SupportTicketDesk'), 'Account page must embed SupportTicketDesk');

  const widget = fs.readFileSync(path.join(process.cwd(), 'src/components/support/SupportWidget.tsx'), 'utf8');
  assert.ok(widget.includes('order-help'), 'Support widget must include order help shortcut');
  assert.ok(widget.includes('vtx_open_support_widget'), 'Support widget must handle order association custom events');
});
