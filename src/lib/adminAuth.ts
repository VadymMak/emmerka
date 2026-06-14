// Admin auth token helpers. Uses the Web Crypto API (crypto.subtle) so the same
// code runs in both the Edge middleware and the Node route handler.

export const ADMIN_COOKIE = 'admin_token';
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

/** Dev fallback — production MUST set ADMIN_SECRET in the environment. */
export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? 'dev-insecure-secret-change-me';
}

async function hmacHex(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlDecode = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

/** Token = base64url(`email:timestamp`) + "." + HMAC-SHA256 of that payload. */
export async function createAdminToken(email: string, secret: string): Promise<string> {
  const payload = `${email}:${Date.now()}`;
  const sig = await hmacHex(payload, secret);
  return `${b64url(payload)}.${sig}`;
}

/** Recomputes the HMAC over the token's payload and compares it constant-time. */
export async function verifyAdminToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const encodedPayload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = b64urlDecode(encodedPayload);
  } catch {
    return false;
  }
  const expected = await hmacHex(payload, secret);
  return timingSafeEqual(sig, expected);
}
