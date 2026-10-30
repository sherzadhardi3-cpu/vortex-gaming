// VORTEX GAMING — Production Prisma Database Client Singleton
// Connects to external PostgreSQL (e.g. Render PostgreSQL, Supabase, Neon) via DATABASE_URL.
// Gracefully handles build-time static generation and hot-reloads.

let prismaInstance: any = null;

export function getPrismaClient() {
  if (prismaInstance) return prismaInstance;

  try {
    // Dynamically load @prisma/client when generated
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prismaModule = require('@prisma/client');
    const PrismaClient = prismaModule.PrismaClient;
    if (!PrismaClient) return null;

    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    return prismaInstance;
  } catch {
    return null;
  }
}

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client) {
      if (prop === '$queryRaw' || prop === '$connect' || prop === '$disconnect') {
        return async () => null;
      }
      throw new Error(
        'Prisma client is not initialized or database is unavailable. Run `npx prisma generate` and verify DATABASE_URL.'
      );
    }
    return client[prop];
  },
});

export default prisma;
