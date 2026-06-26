import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json([], { status: 404 });

  const zones = await db.deliveryZone.findMany({
    where: { storeId: store.id },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(zones);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json();
  const zone = await db.deliveryZone.create({
    data: {
      storeId: store.id,
      name: body.name,
      fee: body.fee ?? 0,
      minOrder: body.minOrder ?? 0,
      estimatedMin: body.estimatedMin ?? 30,
      estimatedMax: body.estimatedMax ?? 60,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(zone, { status: 201 });
}
