import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

// GET /api/customers — admin only list
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10));

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const [total, customers] = await Promise.all([
      db.customer.count({ where: { storeId: store.id } }),
      db.customer.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { orders: true } } },
      }),
    ]);

    return NextResponse.json({ customers, total, page, pageSize });
  } catch (error) {
    console.error('[GET /api/customers]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
