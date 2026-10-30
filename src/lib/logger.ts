// VORTEX GAMING — Secure Structured Logger with Secret & PII Sanitization
// Redacts sensitive fields, credentials, JWTs, card numbers, and encryption keys from logs.

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'auth',
  'authorization',
  'key',
  'encryptionkey',
  'private',
  'cookie',
  'creditcard',
  'cvv',
  'cardnumber',
  'apikey',
  'client_secret',
  'authtag',
];

const JWT_REGEX = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
const CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const HEX_SECRET_REGEX = /\b[0-9a-fA-F]{32,64}\b/g;

export function sanitize(data: any, seen = new WeakSet()): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    let sanitized = data
      .replace(JWT_REGEX, '[REDACTED_JWT]')
      .replace(CARD_REGEX, '[REDACTED_CARD]');
    return sanitized;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (typeof data === 'object') {
    if (seen.has(data)) {
      return '[CIRCULAR]';
    }
    seen.add(data);

    if (Array.isArray(data)) {
      return data.map((item) => sanitize(item, seen));
    }

    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s));

      if (isSensitive) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitize(value, seen);
      }
    }
    return sanitizedObj;
  }

  return String(data);
}

export const logger = {
  info: (message: string, context?: any) => {
    if (context) {
      console.info(`[INFO] ${message}`, sanitize(context));
    } else {
      console.info(`[INFO] ${message}`);
    }
  },
  warn: (message: string, context?: any) => {
    if (context) {
      console.warn(`[WARN] ${message}`, sanitize(context));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  error: (message: string, error?: any, context?: any) => {
    const errorDetails = error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : error;
    
    console.error(
      `[ERROR] ${message}`,
      sanitize({ error: errorDetails, ...(context ? { context } : {}) })
    );
  },
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      if (context) {
        console.debug(`[DEBUG] ${message}`, sanitize(context));
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },
};
