import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'emmerka';

// GET /api/tables — public (active only) or admin (?admin=true, all tables)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get('admin') === 'true';

  if (isAdminRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    const isAdmin = await verifyAdminToken(token, getAdminSecret());
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
    if (!store || store.vertical !== 'RESTAURANT') {
      return NextResponse.json({ tables: [] });
    }

    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const tables = await db.restaurantTable.findMany({
      where: { storeId: store.id, ...(isAdminRequest ? {} : { active: true }) },
      orderBy: [{ zone: 'asc' }, { number: 'asc' }],
    });

    // For admin requests return raw table data (no status overlay)
    if (isAdminRequest) {
      return NextResponse.json({ tables });
    }

    // Public: overlay availability status
    let reservedTableIds: string[] = [];
    if (date && time) {
      const reservationDate = new Date(date);
      reservationDate.setHours(0, 0, 0, 0);
      const reservations = await db.reservation.findMany({
        where: {
          storeId: store.id,
          date: reservationDate,
          time,
          status: { in: ['PENDING', 'CONFIRMED'] },
          tableId: { not: null },
        },
        select: { tableId: true },
      });
      reservedTableIds = reservations.map((r) => r.tableId!);
    }

    const tablesWithStatus = tables.map((t) => ({
      id: t.id,
      number: t.number,
      seats: t.seats,
      zone: t.zone,
      x: t.x,
      y: t.y,
      type: t.type,
      status: reservedTableIds.includes(t.id) ? 'occupied' : 'available',
    }));

    return NextResponse.json({ tables: tablesWithStatus });
  } catch (error) {
    console.error('[GET /api/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tables — admin only, create table
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as {
      number: string;
      seats: number;
      zone: string;
      x: number;
      y: number;
      type: string;
      active?: boolean;
    };

    if (!body.number?.trim() || !body.zone || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.seats < 1 || body.seats > 20) {
      return NextResponse.json({ error: 'Seats must be 1–20' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const table = await db.restaurantTable.create({
      data: {
        storeId: store.id,
        number: body.number.trim(),
        seats: body.seats,
        zone: body.zone,
        x: body.x,
        y: body.y,
        type: body.type,
        active: body.active ?? true,
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 409 });
    }
    console.error('[POST /api/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tables — admin only, update table
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    if (!body.id) return NextResponse.json({ error: 'Table ID required' }, { status: 400 });

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const existing = await db.restaurantTable.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.number !== undefined) updateData.number = body.number.trim();
    if (body.seats !== undefined) updateData.seats = body.seats;
    if (body.zone !== undefined) updateData.zone = body.zone;
    if (body.x !== undefined) updateData.x = body.x;
    if (body.y !== undefined) updateData.y = body.y;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.active !== undefined) updateData.active = body.active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const table = await db.restaurantTable.update({
      where: { id: body.id },
      data: updateData,
    });

    return NextResponse.json({ table });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 409 });
    }
    console.error('[PATCH /api/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tables — admin only, delete table
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as { id: string };
    if (!body.id) return NextResponse.json({ error: 'Table ID required' }, { status: 400 });

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const existing = await db.restaurantTable.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    await db.restaurantTable.delete({ where: { id: body.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/tables]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
