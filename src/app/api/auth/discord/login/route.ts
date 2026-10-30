// VORTEX GAMING — Discord OAuth2 Login Initiation API
// Generates cryptographic state + PKCE challenge, sets secure HttpOnly cookies, redirects to Discord

import { NextRequest, NextResponse } from 'next/server';
import {
  generatePKCE,
  generateOAuthState,
  buildDiscordAuthorizationUrl,
  getDiscordRedirectUri,
  getDiscordClientId,
} from '@/lib/auth/discord';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'login'; // 'login' | 'register' | 'link'

    const clientId = getDiscordClientId();
    if (!clientId) {
      // Return clear configuration guidance if Discord credentials are not yet entered
      return NextResponse.json(
        {
          success: false,
          error: 'DISCORD_NOT_CONFIGURED',
          message: 'Discord OAuth2 credentials are not configured in environment variables.',
          requiredEnvVars: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'],
          registeredRedirectUri: getDiscordRedirectUri(),
          developerPortalUrl: 'https://discord.com/developers/applications',
        },
        { status: 503 }
      );
    }

    // 1. Generate CSRF state & PKCE pair
    const state = generateOAuthState();
    const { codeVerifier, codeChallenge } = generatePKCE();

    // 2. Build Discord authorization URL
    const authUrl = buildDiscordAuthorizationUrl({
      state,
      codeChallenge,
      prompt: mode === 'link' ? 'consent' : 'none',
    });

    const response = NextResponse.redirect(authUrl);

    // 3. Store state and PKCE verifier in secure HttpOnly cookies (10-minute expiry)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    };

    response.cookies.set('vtx_discord_state', state, cookieOptions);
    response.cookies.set('vtx_discord_verifier', codeVerifier, cookieOptions);
    response.cookies.set('vtx_discord_mode', mode, cookieOptions);

    return response;
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('Discord login initiation error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=discord_init_failed', req.nextUrl.origin)
    );
  }
}
