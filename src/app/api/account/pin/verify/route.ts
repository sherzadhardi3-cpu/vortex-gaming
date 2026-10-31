// VORTEX GAMING — Customer Security PIN Verification API
// Enforces attempt rate limiting, 15-minute lockouts, and generates short-lived order-scoped HMAC tokens

import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSecurityPin, getUserByEmail } from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { pin, orderId } = body;

    const userId = body.userId || req.headers.get('x-user-id');
    const userEmail = body.userEmail || req.headers.get('x-user-email');

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const user = await getUserByEmail(userEmail);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to verify security PIN.' },
        { status: 401 }
      );
    }

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Security PIN is required.' },
        { status: 400 }
      );
    }

    const result = await verifyUserSecurityPin(targetUserId, pin, orderId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          locked: result.locked,
          lockedUntil: result.lockedUntil,
          remainingAttempts: result.remainingAttempts,
          noPinConfigured: result.noPinConfigured,
        },
        { status: result.locked ? 429 : 401 }
      );
    }

    return NextResponse.json({
      success: true,
      pinAuthToken: result.pinAuthToken,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('[PIN Verify API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying security PIN.' },
      { status: 500 }
    );
  }
}
