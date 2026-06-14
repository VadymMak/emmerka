import { NextResponse } from 'next/server';
import { CUSTOMER_COOKIE } from '@/lib/customerAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
