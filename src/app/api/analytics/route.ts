import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';
import { OrderStatus } from '@prisma/client';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

// GET /api/analytics — dashboard metrics (admin only)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
    const storeId = store.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalOrders,
      totalRevenue,
      ordersThisMonth,
      ordersLastMonth,
      totalCustomers,
      newCustomersThisMonth,
      ordersByStatus,
      topProducts,
    ] = await Promise.all([
      db.order.count({ where: { storeId } }),
      db.order.aggregate({
        where: { storeId, status: { not: OrderStatus.CANCELLED } },
        _sum: { total: true },
      }),
      db.order.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
      db.order.count({
        where: { storeId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      db.customer.count({ where: { storeId } }),
      db.customer.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
      db.order.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { _all: true },
      }),
      db.orderItem.groupBy({
        by: ['productId'],
        where: { order: { storeId } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Fetch product names for top products
    const topProductIds = topProducts.map((p) => p.productId);
    const topProductRecords = await db.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, nameKey: true, brand: true, price: true },
    });

    const topProductsWithNames = topProducts.map((tp) => {
      const product = topProductRecords.find((p) => p.id === tp.productId);
      return { ...tp, product };
    });

    // Repeat customer rate
    const repeatCustomers = await db.customer.count({
      where: {
        storeId,
        orders: { some: { storeId } },
      },
    });
    const customersWithOrders = await db.customer.count({
      where: { storeId, orders: { some: {} } },
    });
    const repeatRate =
      customersWithOrders > 0
        ? Math.round((repeatCustomers / customersWithOrders) * 100)
        : 0;

    const growthRate =
      ordersLastMonth > 0
        ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
        : 0;

    return NextResponse.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      ordersThisMonth,
      growthRate,
      totalCustomers,
      newCustomersThisMonth,
      repeatRate,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count._all })),
      topProducts: topProductsWithNames,
    });
  } catch (error) {
    console.error('[GET /api/analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
