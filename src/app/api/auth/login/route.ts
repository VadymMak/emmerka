import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import {
  CUSTOMER_COOKIE,
  CUSTOMER_TOKEN_MAX_AGE,
  createCustomerToken,
} from '@/lib/customerAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (typeof body?.email === 'string' ? body.email : '').trim().toLowerCase();
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const customer = await db.customer.findUnique({
      where: { storeId_email: { storeId: store.id, email } },
    });

    if (!customer?.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createCustomerToken(customer.id, store.id);
    const res = NextResponse.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CUSTOMER_TOKEN_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
