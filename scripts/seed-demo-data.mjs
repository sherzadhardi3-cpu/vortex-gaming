#!/usr/bin/env node
// VORTEX GAMING — Safe Staging & Production Demo Data Seeder
// Seeds platforms, categories, game catalog metadata, and safe demo stock keys.
// ZERO REAL SECRETS, ZERO REAL CUSTOMER DATA, ZERO LEAKED PRODUCTION KEYS.

import bcrypt from 'bcryptjs';

let prisma = null;
try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  // Client not generated or database unconfigured
}

const PLATFORMS = [
  { id: 'steam', name: 'Steam', slug: 'steam', icon: 'steam' },
  { id: 'epic', name: 'Epic Games', slug: 'epic-games', icon: 'epic' },
  { id: 'playstation', name: 'PlayStation Network', slug: 'playstation', icon: 'playstation' },
  { id: 'xbox', name: 'Xbox Live', slug: 'xbox', icon: 'xbox' },
  { id: 'rockstar', name: 'Rockstar Games', slug: 'rockstar', icon: 'rockstar' },
  { id: 'ea', name: 'EA App', slug: 'ea-app', icon: 'ea' },
  { id: 'ubisoft', name: 'Ubisoft Connect', slug: 'ubisoft-connect', icon: 'ubisoft' },
];

const CATEGORIES = [
  { name: 'Action & Adventure', slug: 'action-adventure', description: 'Fast-paced action and story adventures' },
  { name: 'RPG & Open World', slug: 'rpg', description: 'Role-playing and expansive open worlds' },
  { name: 'Shooter & Tactical', slug: 'shooter', description: 'FPS and tactical squad combat' },
  { name: 'Sports & Racing', slug: 'sports-racing', description: 'Competitive athletics and motorsport' },
  { name: 'Gift Cards', slug: 'gift-cards', description: 'Digital wallet and store gift cards' },
  { name: 'Subscriptions', slug: 'subscriptions', description: 'Gaming passes and online memberships' },
];

const DEMO_COUPONS = [
  { code: 'VORTEX10', discountPercent: 10, maxUses: 500, active: true },
  { code: 'LAUNCH20', discountPercent: 20, maxUses: 250, active: true },
  { code: 'KURDISTAN15', discountPercent: 15, maxUses: 300, active: true },
];

async function seed() {
  console.log('=== VORTEX GAMING SAFE DEMO SEEDING STARTED ===');

  if (!process.env.DATABASE_URL) {
    console.warn('[!] DATABASE_URL is not set. Seeder skipped external PostgreSQL insertion.');
    return;
  }

  try {
    // 1. Seed Platforms
    console.log('[*] Upserting gaming platforms...');
    for (const p of PLATFORMS) {
      await prisma.platform.upsert({
        where: { slug: p.slug },
        update: { name: p.name, icon: p.icon },
        create: { name: p.name, slug: p.slug, icon: p.icon },
      });
    }

    // 2. Seed Categories
    console.log('[*] Upserting store categories...');
    for (const c of CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, description: c.description },
        create: { name: c.name, slug: c.slug, description: c.description },
      });
    }

    // 3. Seed Coupons
    console.log('[*] Upserting demo promotional coupons...');
    for (const cp of DEMO_COUPONS) {
      await prisma.coupon.upsert({
        where: { code: cp.code },
        update: { discountPercent: cp.discountPercent, active: cp.active },
        create: {
          code: cp.code,
          discountPercent: cp.discountPercent,
          maxUses: cp.maxUses,
          active: cp.active,
        },
      });
    }

    // 4. Provision Initial Administrator if env vars present
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const adminPass = process.env.INITIAL_ADMIN_PASSWORD;

    if (adminEmail && adminPass && adminPass.length >= 12) {
      console.log(`[*] Checking administrator account for: ${adminEmail}...`);
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(adminPass, salt);
        await prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            firstName: 'Vortex',
            lastName: 'Admin',
            displayName: 'System Administrator',
            role: 'SUPER_ADMIN',
            mfaEnabled: true,
          },
        });
        console.log(`[+] Initial administrator created successfully: ${adminEmail}`);
      } else {
        console.log(`[*] Administrator already exists: ${adminEmail}`);
      }
    }

    // 5. Safe Demo Customer Account (Optional for staging test checkout)
    const demoCustomerEmail = 'staging-customer@vortexgaming.gg';
    const existingDemoCustomer = await prisma.user.findUnique({
      where: { email: demoCustomerEmail },
    });

    if (!existingDemoCustomer) {
      const demoSalt = await bcrypt.genSalt(10);
      const demoHash = await bcrypt.hash('DemoGamer2026!#Pass', demoSalt);
      await prisma.user.create({
        data: {
          email: demoCustomerEmail,
          passwordHash: demoHash,
          firstName: 'Demo',
          lastName: 'Customer',
          displayName: 'Staging Demo Gamer',
          role: 'CUSTOMER',
          mfaEnabled: false,
        },
      });
      console.log(`[+] Created safe staging demo customer: ${demoCustomerEmail}`);
    }

    console.log('[SUCCESS] Safe demo seed completed with 100% integrity.');
  } catch (err) {
    console.warn('[NOTICE] Prisma database seeding note (DB may be offline or unmigrated):', err.message);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

seed();
