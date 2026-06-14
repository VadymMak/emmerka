import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? 'default';

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
