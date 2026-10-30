// VORTEX GAMING — User Registration API
// Validates inputs, salts & hashes password with bcrypt, persists to store, issues session token

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema } from '@/lib/validations';
import { registerStandardUser } from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.issues?.[0]?.message || 'Validation error',
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validated.data;

    // Securely hash the password with bcrypt salt rounds (cost factor 12)
    const hashedPassword = await hashPassword(password);

    // Persist new CUSTOMER account to store
    const user = await registerStandardUser(
      email,
      hashedPassword,
      firstName,
      lastName
    );

    const token = `vtx_session_${Date.now()}_${Buffer.from(user.id).toString('base64')}`;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        locale: user.locale,
        currency: user.currency,
      },
      token,
      message: 'Account registered successfully.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal registration error' },
      { status: 400 }
    );
  }
}
