// VORTEX GAMING — Customer Security PIN Setup & Reset API
// Requires authenticated customer identity; enforces strict password verification on reset

import { NextRequest, NextResponse } from 'next/server';
import { setUserSecurityPin, getUserByEmail } from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { pin, accountPassword } = body;

    const userId = body.userId || req.headers.get('x-user-id');
    const userEmail = body.userEmail || req.headers.get('x-user-email');

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const user = await getUserByEmail(userEmail);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to configure security PIN.' },
        { status: 401 }
      );
    }

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN is required and must be 4 to 6 numeric digits.' },
        { status: 400 }
      );
    }

    const result = await setUserSecurityPin(targetUserId, pin, accountPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update security PIN.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Security PIN configured successfully.',
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('[PIN Setup API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error configuring security PIN.' },
      { status: 500 }
    );
  }
}
