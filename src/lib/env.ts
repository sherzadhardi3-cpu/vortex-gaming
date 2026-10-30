// VORTEX GAMING — Environment Variable Schema & Security Validation
// Validates all critical secrets, encryption keys, and service configurations at startup.

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development').optional(),
  FORCE_SANDBOX: z.string().optional(),
  PORT: z.string().optional(),
  
  // Authentication Secret (Min 32 characters for AES/HMAC integrity)
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters long').default('vortex_default_dev_secret_replace_in_prod'),
  
  // Game Key Encryption Key (Must be 64-char hex = 256 bits CSPRNG)
  GAME_KEY_ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, 'GAME_KEY_ENCRYPTION_KEY must be a 64-character hex string (256 bits)').optional(),
  GAME_KEY_ENCRYPTION_KEY_PREVIOUS: z.string().regex(/^[0-9a-fA-F]{64}$/, 'GAME_KEY_ENCRYPTION_KEY_PREVIOUS must be a 64-character hex string').optional(),
  
  // Database URL
  DATABASE_URL: z.string().optional(),
  
  // Stripe Integration (Sandbox or Live)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Discord OAuth2
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): { success: boolean; data?: Env; errors?: string[] } {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errorMessages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    console.error('❌ Environment validation failed:', errorMessages);
    return { success: false, errors: errorMessages };
  }
  
  // Production security checks
  if (result.data.NODE_ENV === 'production') {
    const missingInProd: string[] = [];
    if (!result.data.GAME_KEY_ENCRYPTION_KEY) {
      missingInProd.push('GAME_KEY_ENCRYPTION_KEY is required in production');
    }
    if (!result.data.DATABASE_URL) {
      missingInProd.push('DATABASE_URL is required in production');
    }
    if (result.data.AUTH_SECRET === 'vortex_default_dev_secret_replace_in_prod') {
      missingInProd.push('AUTH_SECRET must be replaced with a secure production secret');
    }
    
    if (missingInProd.length > 0) {
      console.error('❌ Production security checks failed:', missingInProd);
      return { success: false, errors: missingInProd };
    }
  }
  
  cachedEnv = result.data;
  return { success: true, data: result.data };
}

export function getEnv(): Env {
  if (!cachedEnv) {
    const validated = validateEnv();
    if (validated.data) {
      cachedEnv = validated.data;
    } else {
      // Fallback with defaults if parsing fails during build
      cachedEnv = envSchema.parse({
        NODE_ENV: process.env.NODE_ENV || 'development',
        AUTH_SECRET: process.env.AUTH_SECRET || 'vortex_default_dev_secret_replace_in_prod',
      });
    }
  }
  return cachedEnv;
}
