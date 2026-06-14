import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
    const tables = await db.restaurantTable.findMany({
      where: { storeId: store.id },
      orderBy: [{ zone: 'asc' }, { number: 'asc' }],
    });
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('[GET /api/admin/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      number: string;
      seats: number;
      zone: string;
      x: number;
      y: number;
      type: string;
    };

    if (!body.number || !body.seats || !body.zone || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const existing = await db.restaurantTable.findUnique({
      where: { storeId_number: { storeId: store.id, number: body.number } },
    });
    if (existing) {
      return NextResponse.json({ error: `Table #${body.number} already exists` }, { status: 409 });
    }

    const table = await db.restaurantTable.create({
      data: {
        storeId: store.id,
        number: body.number,
        seats: body.seats,
        zone: body.zone,
        x: body.x ?? 50,
        y: body.y ?? 50,
        type: body.type,
        active: true,
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      id: string;
      number?: string;
      seats?: number;
      zone?: string;
      x?: number;
      y?: number;
      type?: string;
      active?: boolean;
    };

    if (!body.id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const existing = await db.restaurantTable.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const { id, ...updates } = body;
    const data = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );

    const table = await db.restaurantTable.update({ where: { id }, data });
    return NextResponse.json({ table });
  } catch (error) {
    console.error('[PATCH /api/admin/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const table = await db.restaurantTable.findFirst({
      where: { id, storeId: store.id },
    });
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const futureReservations = await db.reservation.count({
      where: {
        tableId: id,
        date: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (futureReservations > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${futureReservations} future reservation(s) assigned to this table. Cancel them first or reassign to another table.` },
        { status: 409 },
      );
    }

    await db.restaurantTable.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
