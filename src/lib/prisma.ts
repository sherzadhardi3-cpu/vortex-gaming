// VORTEX GAMING — Production Prisma Database Client Singleton
// Connects to external PostgreSQL (e.g. Render PostgreSQL, Supabase, Neon) via DATABASE_URL.
// Configured with Prisma 7 PostgreSQL driver adapter (@prisma/adapter-pg).
// Gracefully handles build-time static generation and hot-reloads.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prismaInstance?: PrismaClient | null;
  pgPool?: pg.Pool | null;
};

export function getPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prismaInstance) {
    return globalForPrisma.prismaInstance;
  }

  const connectionString =
    process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  try {
    const isSslRequired =
      connectionString.includes('sslmode=require') ||
      connectionString.includes('render.com') ||
      connectionString.includes('ssl=true');

    const pool =
      globalForPrisma.pgPool ||
      new pg.Pool({
        connectionString,
        max: process.env.NODE_ENV === 'production' ? 10 : 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
      });

    pool.on('error', (err) => {
      console.error('[Prisma/pgPool Error] Unexpected error on idle client:', err);
    });

    globalForPrisma.pgPool = pool;

    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : process.env.NODE_ENV === 'test' ? [] : ['error'],
    });

    globalForPrisma.prismaInstance = client;

    return client;
  } catch (error) {
    console.error('[Prisma Initialization Error]:', error);
    return null;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client) {
      if (
        prop === '$connect' ||
        prop === '$disconnect'
      ) {
        return async () => null;
      }
      throw new Error(
        'Prisma client is not initialized or database is unavailable. Verify DATABASE_URL.'
      );
    }
    return (client as any)[prop];
  },
});

export default prisma;
