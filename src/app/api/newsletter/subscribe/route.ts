import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'newsletter-subscribers.json');

// In-memory sliding window rate limiter: max 5 requests per IP per 5 minutes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

interface Subscriber {
  id: string;
  email: string;
  consent: boolean;
  consentTimestamp: string;
  consentStatement: string;
  ipAddress: string;
  userAgent: string;
  subscribedAt: string;
}

function loadSubscribers(): Subscriber[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[Newsletter] Failed to read subscribers:', err);
    return [];
  }
}

function saveSubscribers(list: Subscriber[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Write safely
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Newsletter] Failed to save subscribers:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP & Rate Limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many subscription attempts from this network. Please wait a few minutes before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, consent } = body;

    // 2. Email Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email format (e.g., gamer@domain.com).' },
        { status: 400 }
      );
    }

    // 3. Consent Validation
    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Explicit consent is required to join the gaming alert list.',
        },
        { status: 400 }
      );
    }

    const subscribers = loadSubscribers();
    const existing = subscribers.find((s) => s.email === trimmedEmail);

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          alreadySubscribed: true,
          message: 'You are already registered on the VORTEX VIP alert list. You will receive upcoming publisher deals.',
        },
        { status: 200 }
      );
    }

    // 4. Record Complete Consent & Audit Trail
    const newSubscriber: Subscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      consent: true,
      consentTimestamp: new Date().toISOString(),
      consentStatement: 'I agree to receive gaming deals, product releases, and discounts.',
      ipAddress: ip,
      userAgent: userAgent.substring(0, 200),
      subscribedAt: new Date().toISOString(),
    };

    subscribers.push(newSubscriber);
    saveSubscribers(subscribers);

    // Truthful message without false promises of vouchers
    return NextResponse.json(
      {
        success: true,
        message: 'Subscription confirmed! You will receive future publisher discounts and price-drop notifications.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[Newsletter Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing subscription.' },
      { status: 500 }
    );
  }
}
