// VORTEX GAMING — Customer Security PIN Status API
// Reports whether customer has configured a delivery security PIN without exposing any secrets

import { NextRequest, NextResponse } from 'next/server';
import { getUserPinStatus, getUserByEmail } from '@/lib/auth/user-store';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = req.headers.get('x-user-id') || searchParams.get('userId');
    const userEmail = req.headers.get('x-user-email') || searchParams.get('email');

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const user = await getUserByEmail(userEmail);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to inspect PIN status.' },
        { status: 401 }
      );
    }

    const status = getUserPinStatus(targetUserId);

    return NextResponse.json({
      success: true,
      hasPin: status.hasPin,
      isLocked: status.isLocked,
      lockedUntil: status.lockedUntil,
      remainingAttempts: status.remainingAttempts,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('[PIN Status API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error checking PIN status.' },
      { status: 500 }
    );
  }
}
