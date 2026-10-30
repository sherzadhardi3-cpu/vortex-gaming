// VORTEX GAMING — Discord OAuth2 Service Layer
// Implements official Discord Authorization Code Flow with PKCE & CSRF state validation
// Scopes strictly limited to: "identify" and "email"

import crypto from 'crypto';

export interface DiscordUser {
  id: string; // Stable snowflake ID
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  verified: boolean;
  locale?: string;
  mfa_enabled?: boolean;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Base64URL encoding helper for PKCE (RFC 7636)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate cryptographically secure PKCE code verifier and code challenge (S256)
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Verifier: 43-128 characters of unreserved URL-safe characters
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  
  // Challenge: BASE64URL(SHA256(codeVerifier))
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64UrlEncode(hash);

  return { codeVerifier, codeChallenge };
}

/**
 * Generate cryptographically random state parameter to prevent CSRF attacks
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Safely retrieve and sanitize Discord Client ID from environment variables
 * Trims extraneous quotes or whitespace
 */
export function getDiscordClientId(): string | null {
  const raw = process.env.DISCORD_CLIENT_ID;
  if (!raw) return null;
  const clean = raw.trim().replace(/^["']|["']$/g, '');
  return clean.length > 0 ? clean : null;
}

/**
 * Safely retrieve and sanitize Discord Client Secret from environment variables
 * Kept strictly confidential on the server side
 */
export function getDiscordClientSecret(): string | null {
  const raw = process.env.DISCORD_CLIENT_SECRET;
  if (!raw) return null;
  const clean = raw.trim().replace(/^["']|["']$/g, '');
  return clean.length > 0 ? clean : null;
}

/**
 * Get the authoritative configured Discord OAuth redirect URI
 */
export function getDiscordRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';
  return `${appUrl.replace(/\/+$/, '')}/api/auth/discord/callback`;
}

/**
 * Build the Discord OAuth2 authorization URL
 */
export function buildDiscordAuthorizationUrl({
  state,
  codeChallenge,
  prompt = 'consent',
}: {
  state: string;
  codeChallenge?: string;
  prompt?: 'consent' | 'none';
}): string {
  const clientId = getDiscordClientId();
  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID is not configured in environment variables.');
  }

  const redirectUri = getDiscordRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state,
    prompt,
  });

  if (codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/**
 * Server-to-server exchange of authorization code for Discord access and refresh tokens
 */
export async function exchangeDiscordCode({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier?: string;
}): Promise<DiscordTokenResponse> {
  const clientId = getDiscordClientId();
  const clientSecret = getDiscordClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Discord OAuth credentials (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET) not configured.');
  }

  const redirectUri = getDiscordRedirectUri();
  const bodyParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  if (codeVerifier) {
    bodyParams.set('code_verifier', codeVerifier);
  }

  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Discord token exchange failed (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Fetch authenticated Discord user profile using access token
 * Requests strictly identify and email scopes
 */
export async function fetchDiscordUserProfile(accessToken: string): Promise<DiscordUser> {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Discord user profile (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Resolve CDN URL for Discord user avatar
 */
export function getDiscordAvatarUrl(user: DiscordUser): string {
  if (user.avatar) {
    const isAnimated = user.avatar.startsWith('a_');
    const ext = isAnimated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }
  
  // Default Discord avatar formula
  const defaultIndex = user.discriminator && user.discriminator !== '0'
    ? parseInt(user.discriminator, 10) % 5
    : Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
    
  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}
