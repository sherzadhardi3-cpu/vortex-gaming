#!/usr/bin/env node
// VORTEX GAMING — Staging Database Connectivity & Health Probe
// Safely tests PostgreSQL connectivity without logging or exposing credentials.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ Error: DATABASE_URL environment variable is not set in this session.');
  console.error('   Usage (PowerShell): $env:DATABASE_URL="<EXTERNAL_DATABASE_URL>"; node scripts/verify-db-connection.mjs');
  process.exit(1);
}

// Mask password to prevent credential exposure in logs
const maskedUrl = url.replace(/:([^:@]+)@/, ':********@');
console.log(`[*] Probing PostgreSQL connection: ${maskedUrl}`);

try {
  const pool = new pg.Pool({
    connectionString: url,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.$queryRaw`SELECT NOW() as current_time, current_database() as db_name, current_user as db_user`;
  
  console.log('✅ PostgreSQL connection verified successfully:');
  console.log(`   - Connected Database: ${result[0].db_name}`);
  console.log(`   - Connected User:     ${result[0].db_user}`);
  console.log(`   - Server Timestamp:   ${result[0].current_time}`);

  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Connection verification failed:', error.message);
  process.exit(1);
}
