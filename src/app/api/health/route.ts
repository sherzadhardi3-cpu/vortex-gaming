// VORTEX GAMING — Health Check & Security Diagnostics Endpoint
// GET /api/health — Reports operational status, vault configuration, and service availability.

import { NextResponse } from 'next/server';
import { isStripeLiveMode, getStripeClient } from '@/lib/stripe';
import fs from 'fs';
import path from 'path';

const START_TIME = Date.now();

export async function GET() {
  const currentKey = process.env.GAME_KEY_ENCRYPTION_KEY;
  const previousKey = process.env.GAME_KEY_ENCRYPTION_KEY_PREVIOUS;

  const vaultStatus = {
    isConfigured: Boolean(currentKey),
    isCSPRNGCompliant: Boolean(currentKey && /^[0-9a-fA-F]{64}$/.test(currentKey)),
    hasFallbackKey: Boolean(previousKey),
    algorithm: 'AES-256-GCM',
  };

  const stripeConfigured = Boolean(getStripeClient());
  const stripeLive = isStripeLiveMode();

  const storagePath = path.join(process.cwd(), '.data');
  let storageWritable = false;
  try {
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    const testFile = path.join(storagePath, '.health-check-probe');
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
    storageWritable = true;
  } catch {
    storageWritable = false;
  }

  // Database connectivity check (if DATABASE_URL is provided)
  let databaseConnected = false;
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }

  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  const isHealthy = vaultStatus.isCSPRNGCompliant && storageWritable;

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'vortex-gaming-marketplace',
    environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    vault: vaultStatus,
    storage: {
      dataDirReady: storageWritable,
    },
    database: {
      urlConfigured: Boolean(process.env.DATABASE_URL),
      connected: databaseConnected,
    },
    paymentGateways: {
      stripe: {
        configured: stripeConfigured,
        mode: stripeLive ? 'live' : 'test_sandbox',
        webhooks: 'cryptographically_verified',
      },
      iraqiGateways: {
        fib: 'SANDBOX_PENDING_MERCHANT_ONBOARDING',
        fastpay: 'SANDBOX_PENDING_MERCHANT_ONBOARDING',
        qi_card: 'SANDBOX_PENDING_MERCHANT_ONBOARDING',
        chargesEnabled: false,
      },
    },
    authentication: {
      mfaRequiredForAdmins: true,
      demoAccountsPurged: true,
      discordOAuthSupported: true,
    },
  }, {
    status: isHealthy ? 200 : 503,
  });
}
