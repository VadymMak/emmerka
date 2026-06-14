import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import {
  CUSTOMER_COOKIE,
  CUSTOMER_TOKEN_MAX_AGE,
  createCustomerToken,
} from '@/lib/customerAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (typeof body?.email === 'string' ? body.email : '').trim().toLowerCase();
    const name = (typeof body?.name === 'string' ? body.name : '').trim();
    const phone = (typeof body?.phone === 'string' ? body.phone : '').trim();
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const existing = await db.customer.findUnique({
      where: { storeId_email: { storeId: store.id, email } },
    });

    if (existing?.passwordHash) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let customer;
    if (existing) {
      customer = await db.customer.update({
        where: { id: existing.id },
        data: { name, phone: phone || undefined, passwordHash },
      });
    } else {
      customer = await db.customer.create({
        data: {
          email,
          name,
          phone: phone || null,
          passwordHash,
          storeId: store.id,
        },
      });
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
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
