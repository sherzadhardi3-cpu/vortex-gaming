// VORTEX GAMING — Discord OAuth2 Callback Handler
// Validates state parameter (CSRF protection), exchanges PKCE authorization code,
// checks existing linkage, prevents account takeover, and creates CUSTOMER accounts

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeDiscordCode,
  fetchDiscordUserProfile,
  getDiscordAvatarUrl,
} from '@/lib/auth/discord';
import {
  getAccountByProvider,
  getUserByEmail,
  createDiscordCustomer,
} from '@/lib/auth/user-store';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const searchParams = req.nextUrl.searchParams;

  // 1. Check if user denied authorization on Discord consent screen
  const error = searchParams.get('error');
  if (error) {
    console.warn(`[Discord OAuth] Authorization denied: ${error}`);
    return NextResponse.redirect(new URL('/auth/login?error=discord_access_denied', origin));
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // 2. Validate OAuth state cookie to defeat Cross-Site Request Forgery (CSRF)
  const storedState = req.cookies.get('vtx_discord_state')?.value;
  const codeVerifier = req.cookies.get('vtx_discord_verifier')?.value;
  const mode = req.cookies.get('vtx_discord_mode')?.value || 'login';

  if (!state || !storedState || state !== storedState) {
    console.error('[Discord OAuth CSRF Attempt] State parameter mismatch or expired');
    const res = NextResponse.redirect(new URL('/auth/login?error=invalid_oauth_state', origin));
    // Clear cookies
    res.cookies.delete('vtx_discord_state');
    res.cookies.delete('vtx_discord_verifier');
    return res;
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_auth_code', origin));
  }

  try {
    // 3. Exchange authorization code + PKCE code verifier for Discord tokens
    const tokens = await exchangeDiscordCode({
      code,
      codeVerifier,
    });

    // 4. Fetch verified Discord user profile (strictly identify + email scopes)
    const discordProfile = await fetchDiscordUserProfile(tokens.access_token);
    const avatarUrl = getDiscordAvatarUrl(discordProfile);

    // 5. Account matching and anti-takeover security rules:
    const discordUserId = discordProfile.id;
    const discordEmail = discordProfile.email?.toLowerCase().trim() || null;
    const displayName = discordProfile.global_name || discordProfile.username;

    // Check if Discord ID is already linked to an existing account
    const existingLink = await getAccountByProvider('discord', discordUserId);
    if (existingLink) {
      // Returning user - Log straight into existing linked account
      const userPayload = {
        id: existingLink.user.id,
        email: existingLink.user.email,
        firstName: existingLink.user.firstName,
        lastName: existingLink.user.lastName,
        role: existingLink.user.role,
        avatarUrl: existingLink.user.avatarUrl || avatarUrl,
        discordId: discordUserId,
        discordUsername: discordProfile.username,
        mfaEnabled: existingLink.user.mfaEnabled,
        locale: existingLink.user.locale,
        currency: existingLink.user.currency,
      };

      const sessionToken = `vtx_discord_jwt_${Date.now()}_${Buffer.from(discordUserId).toString('base64')}`;
      const redirectUrl = new URL('/account?discord_connected=true', origin);
      const response = NextResponse.redirect(redirectUrl);

      response.cookies.set('vtx_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('vtx_client_auth', JSON.stringify({ user: userPayload, token: sessionToken }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.delete('vtx_discord_state');
      response.cookies.delete('vtx_discord_verifier');
      response.cookies.delete('vtx_discord_mode');

      return response;
    }

    // ANTI-TAKEOVER SECURITY CHECK:
    // If user is unlinked but their Discord email matches an existing account,
    // do NOT auto-link! Demand password ownership verification first.
    if (discordEmail) {
      const existingUserWithEmail = await getUserByEmail(discordEmail);
      if (existingUserWithEmail) {
        const redirectUrl = new URL('/auth/link-account', origin);
        redirectUrl.searchParams.set('provider', 'discord');
        redirectUrl.searchParams.set('email', discordEmail);
        redirectUrl.searchParams.set('discordId', discordUserId);
        redirectUrl.searchParams.set('username', discordProfile.username);

        const res = NextResponse.redirect(redirectUrl);
        
        // Store temporary pending link payload in HttpOnly cookie (15 minutes expiry)
        res.cookies.set(
          'vtx_pending_link',
          JSON.stringify({
            userId: existingUserWithEmail.id,
            provider: 'discord',
            providerAccountId: discordUserId,
            username: discordProfile.username,
            displayName,
            avatarUrl,
            email: discordEmail,
          }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
          }
        );

        res.cookies.delete('vtx_discord_state');
        res.cookies.delete('vtx_discord_verifier');
        return res;
      }
    }

    // 6. Automatic Registration as CUSTOMER
    // Creates persistent User and Account record in database
    const { user: newUser } = await createDiscordCustomer(discordProfile, tokens);

    const userPayload = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: 'CUSTOMER' as const, // Strict customer role
      avatarUrl: newUser.avatarUrl || avatarUrl,
      discordId: discordUserId,
      discordUsername: discordProfile.username,
      mfaEnabled: false,
      locale: newUser.locale,
      currency: newUser.currency,
    };

    const sessionToken = `vtx_discord_jwt_${Date.now()}_${Buffer.from(discordUserId).toString('base64')}`;
    const redirectUrl = new URL('/account?discord_connected=true', origin);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('vtx_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('vtx_client_auth', JSON.stringify({ user: userPayload, token: sessionToken }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.delete('vtx_discord_state');
    response.cookies.delete('vtx_discord_verifier');
    response.cookies.delete('vtx_discord_mode');

    return response;
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_')) {
      throw err;
    }
    console.error('[Discord OAuth Callback Error]:', err);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(err.message || 'discord_callback_failed')}`, origin)
    );
  }
}
