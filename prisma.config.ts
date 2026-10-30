// VORTEX GAMING — Prisma 7 Configuration
// Manages migration datasource URLs and seeding configuration.
// Requires DATABASE_URL explicitly — no unsafe localhost fallbacks in staging/production.

import { defineConfig } from 'prisma/config';

// Load environment variables if available
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // ignore
  }
  try {
    process.loadEnvFile('.env');
  } catch {
    // ignore
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl || undefined,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node scripts/seed-demo-data.mjs',
  },
});
