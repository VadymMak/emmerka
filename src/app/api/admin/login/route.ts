import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  createAdminToken,
  getAdminSecret,
} from '@/lib/adminAuth';

export async function POST(request: Request) {
  let email = '';
  let password = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email : '';
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@electromarket.ua';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = await createAdminToken(email, getAdminSecret());
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_TOKEN_MAX_AGE,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
}
