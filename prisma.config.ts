import { defineConfig, env } from 'prisma/config';

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

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vortex_gaming?schema=public',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node scripts/seed-demo-data.mjs',
  },
});
