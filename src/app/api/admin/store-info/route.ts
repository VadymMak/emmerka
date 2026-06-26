import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { revalidateStorefront } from '@/lib/revalidate';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: {
      name: true,
      vertical: true,
      description: true,
      primaryMode: true,
      address: true,
      city: true,
      openingHours: true,
      phone: true,
      email: true,
      mapLat: true,
      mapLng: true,
    },
  });

  return NextResponse.json({ store });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;

  const allowed = ['name', 'description', 'primaryMode', 'address', 'city',
                   'openingHours', 'phone', 'email', 'mapLat', 'mapLng'] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    if (key === 'primaryMode') {
      const mode = body[key];
      if (mode !== 'PHYSICAL' && mode !== 'ONLINE' && mode !== 'HYBRID') continue;
    }
    if ((key === 'mapLat' || key === 'mapLng') && body[key] != null) {
      data[key] = parseFloat(String(body[key]));
      continue;
    }
    data[key] = body[key] ?? null;
  }

  const store = await db.store.update({
    where: { slug: STORE_SLUG },
    data,
    select: { name: true, primaryMode: true },
  });

  revalidateStorefront();

  return NextResponse.json({ ok: true, store });
}
