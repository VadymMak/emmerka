import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

interface ReservationBody {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  specialRequests?: string;
  tableId?: string;
}

// GET /api/reservations — admin only
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10));

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { storeId: store.id };
    if (status) where.status = status;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.date = { gte: dayStart, lte: dayEnd };
    }

    const [total, reservations] = await Promise.all([
      db.reservation.count({ where }),
      db.reservation.findMany({
        where,
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { table: true },
      }),
    ]);

    return NextResponse.json({ reservations, total, page, pageSize });
  } catch (error) {
    console.error('[GET /api/reservations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/reservations — admin only, update status
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as {
      id: string;
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
      tableId?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: 'Reservation ID required' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const existing = await db.reservation.findFirst({
      where: { id: body.id, storeId: store.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.tableId !== undefined) {
      updateData.tableId = body.tableId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await db.reservation.update({
      where: { id: body.id },
      data: updateData,
      include: { table: true },
    });

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error('[PATCH /api/reservations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reservations — public
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReservationBody;

    if (!body.date || !body.time || !body.guests || !body.name || !body.phone || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.guests < 1 || body.guests > 20) {
      return NextResponse.json({ error: 'Guests must be 1-20' }, { status: 400 });
    }
    if (!body.email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    if (body.tableId) {
      const table = await db.restaurantTable.findFirst({
        where: { id: body.tableId, storeId: store.id, active: true },
      });
      if (!table) {
        return NextResponse.json({ error: 'Table not found' }, { status: 400 });
      }

      const reservationDate = new Date(body.date);
      reservationDate.setHours(0, 0, 0, 0);
      const conflict = await db.reservation.findFirst({
        where: {
          storeId: store.id,
          tableId: body.tableId,
          date: reservationDate,
          time: body.time,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (conflict) {
        return NextResponse.json({ error: 'Table already reserved for this time' }, { status: 409 });
      }
    }

    const reservationDate = new Date(body.date);
    reservationDate.setHours(0, 0, 0, 0);

    const reservation = await db.reservation.create({
      data: {
        storeId: store.id,
        date: reservationDate,
        time: body.time,
        guests: body.guests,
        tableId: body.tableId ?? null,
        name: body.name,
        phone: body.phone,
        email: body.email,
        specialRequests: body.specialRequests ?? null,
      },
    });

    return NextResponse.json({ id: reservation.id, status: reservation.status }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reservations]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
