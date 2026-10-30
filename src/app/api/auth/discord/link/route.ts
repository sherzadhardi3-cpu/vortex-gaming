// VORTEX GAMING — Secure Account Linking API
// Verifies existing password before binding Discord identity to prevent account takeover

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyExistingUserPassword,
  linkDiscordToUser,
} from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const pendingLinkCookie = req.cookies.get('vtx_pending_link')?.value;
    if (!pendingLinkCookie) {
      return NextResponse.json(
        { success: false, error: 'No pending Discord connection request found. Please restart login.' },
        { status: 400 }
      );
    }

    const pendingData = JSON.parse(pendingLinkCookie);

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password for your existing VORTEX account is required to link Discord.' },
        { status: 400 }
      );
    }

    // 1. Authenticate user ownership against stored password hash
    const verifiedUser = await verifyExistingUserPassword(pendingData.email, password);
    if (!verifiedUser) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password for existing account.' },
        { status: 401 }
      );
    }

    // 2. Persist account linkage to user record
    const { user: updatedUser } = await linkDiscordToUser(verifiedUser.id, {
      providerAccountId: pendingData.providerAccountId,
      username: pendingData.username,
      displayName: pendingData.displayName,
      avatarUrl: pendingData.avatarUrl,
      email: pendingData.email,
    });

    const userPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role, // Preserves role
      avatarUrl: updatedUser.avatarUrl,
      discordId: pendingData.providerAccountId,
      discordUsername: pendingData.username,
      mfaEnabled: updatedUser.mfaEnabled,
      locale: updatedUser.locale,
      currency: updatedUser.currency,
    };

    const sessionToken = `vtx_session_linked_${Date.now()}_${Buffer.from(updatedUser.id).toString('base64')}`;

    const res = NextResponse.json({
      success: true,
      user: userPayload,
      token: sessionToken,
      message: 'Discord account linked successfully.',
    });

    // Set secure session cookie
    res.cookies.set('vtx_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Clean up pending link cookie
    res.cookies.delete('vtx_pending_link');

    return res;
  } catch (error: any) {
    console.error('Account linking error:', error);
    return NextResponse.json(
      { success: false, error: 'Account linking verification failed.' },
      { status: 500 }
    );
  }
}
