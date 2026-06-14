// Customer auth token helpers.
// Uses Web Crypto API (crypto.subtle) — works in Edge + Node.
// Token format: base64url(customerId:storeId:timestamp) + "." + HMAC-SHA256

export const CUSTOMER_COOKIE = 'customer_token';
export const CUSTOMER_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

export function getCustomerSecret(): string {
  return process.env.CUSTOMER_SECRET ?? process.env.ADMIN_SECRET ?? 'dev-insecure-secret-change-me';
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

export async function createCustomerToken(customerId: string, storeId: string): Promise<string> {
  const payload = `${customerId}:${storeId}:${Date.now()}`;
  const sig = await hmacHex(payload, getCustomerSecret());
  return `${b64url(payload)}.${sig}`;
}

export async function verifyCustomerToken(
  token: string | undefined,
): Promise<{ customerId: string; storeId: string } | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const encodedPayload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let payload: string;
  try {
    payload = b64urlDecode(encodedPayload);
  } catch {
    return null;
  }

  const expected = await hmacHex(payload, getCustomerSecret());
  if (!timingSafeEqual(sig, expected)) return null;

  const parts = payload.split(':');
  if (parts.length < 3) return null;

  return { customerId: parts[0], storeId: parts[1] };
}

export async function getCurrentCustomer(request: Request): Promise<{ customerId: string; storeId: string } | null> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`${CUSTOMER_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifyCustomerToken(match[1]);
}
