import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const zone = await db.deliveryZone.update({
    where: { id },
    data: {
      name: body.name,
      fee: body.fee,
      minOrder: body.minOrder,
      estimatedMin: body.estimatedMin,
      estimatedMax: body.estimatedMax,
      active: body.active,
    },
  });
  return NextResponse.json(zone);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.deliveryZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
