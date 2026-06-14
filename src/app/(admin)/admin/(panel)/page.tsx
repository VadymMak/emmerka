import { db } from '@/lib/db';
import DashboardClient from './DashboardClient';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function AdminDashboardPage() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, vertical: true },
  });

  if (!store) {
    return <div style={{ padding: 32 }}>Store not found</div>;
  }

  const isRestaurant = store.vertical === 'RESTAURANT';

  // Shared queries
  const [productCount, orderCount] = await Promise.all([
    db.product.count({ where: { storeId: store.id } }),
    db.order.count({ where: { storeId: store.id } }),
  ]);

  // Restaurant-specific queries
  let todayReservations = 0;
  let pendingReservations = 0;
  let weekReservations = 0;
  let recentReservations: Array<{
    id: string;
    name: string;
    guests: number;
    time: string;
    status: string;
    date: Date;
  }> = [];

  if (isRestaurant) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    [todayReservations, pendingReservations, weekReservations, recentReservations] =
      await Promise.all([
        db.reservation.count({
          where: { storeId: store.id, date: { gte: today, lt: tomorrow } },
        }),
        db.reservation.count({
          where: { storeId: store.id, status: 'PENDING' },
        }),
        db.reservation.count({
          where: { storeId: store.id, date: { gte: weekAgo } },
        }),
        db.reservation.findMany({
          where: { storeId: store.id, date: { gte: today } },
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          take: 5,
          select: { id: true, name: true, guests: true, time: true, status: true, date: true },
        }),
      ]);
  }

  // Ecommerce-specific: recent orders
  const recentOrders = !isRestaurant
    ? await db.order.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          guestName: true,
          guestEmail: true,
          total: true,
          status: true,
          createdAt: true,
        },
      })
    : [];

  // Top products (both verticals)
  const topProducts = await db.product.findMany({
    where: { storeId: store.id, isHit: true },
    orderBy: { reviewCount: 'desc' },
    take: 5,
    select: { id: true, nameKey: true, image: true, reviewCount: true },
  });

  return (
    <DashboardClient
      vertical={store.vertical}
      stats={{
        products: productCount,
        orders: orderCount,
        reviews: 0,
        todayReservations,
        pendingReservations,
        weekReservations,
      }}
      recentOrders={recentOrders.map((o) => ({
        id: o.id,
        customer: o.guestName ?? o.guestEmail ?? '—',
        total: `${o.total} €`,
        status: o.status,
        date: o.createdAt.toLocaleDateString('uk-UA'),
      }))}
      recentReservations={recentReservations.map((r) => ({
        id: r.id,
        name: r.name,
        guests: r.guests,
        time: r.time,
        status: r.status,
        date: r.date.toLocaleDateString('uk-UA'),
      }))}
      topProducts={topProducts.map((p) => ({
        name: p.nameKey,
        sales: p.reviewCount,
        image: p.image ?? '/placeholder-product.svg',
      }))}
    />
  );
}
