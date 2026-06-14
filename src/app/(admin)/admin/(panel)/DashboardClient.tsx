'use client';

import type { Vertical } from '@prisma/client';
import styles from './dashboard.module.css';

interface DashboardProps {
  vertical: Vertical;
  stats: {
    products: number;
    orders: number;
    reviews: number;
    todayReservations: number;
    pendingReservations: number;
    weekReservations: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: string;
    status: string;
    date: string;
  }>;
  recentReservations: Array<{
    id: string;
    name: string;
    guests: number;
    time: string;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    image: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Очікує',
  CONFIRMED: 'Підтверджено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
  NO_SHOW: 'Не прийшов',
  PROCESSING: 'Обробляється',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Доставлено',
};

export default function DashboardClient({
  vertical,
  stats,
  recentOrders,
  recentReservations,
  topProducts,
}: DashboardProps) {
  const isRestaurant = vertical === 'RESTAURANT';

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Дашборд</h1>

      {/* Stat cards */}
      <div className={styles.stats}>
        {isRestaurant ? (
          <>
            <StatCard label="Страв у меню" value={stats.products} />
            <StatCard label="Бронювань сьогодні" value={stats.todayReservations} />
            <StatCard label="Очікують підтвердження" value={stats.pendingReservations} />
            <StatCard label="За тиждень" value={stats.weekReservations} />
          </>
        ) : (
          <>
            <StatCard label="Товарів" value={stats.products} />
            <StatCard label="Замовлень" value={stats.orders} />
            <StatCard label="Відгуків" value={stats.reviews} />
            <StatCard label="Виручка" value={0} />
          </>
        )}
      </div>

      <div className={styles.row}>
        {/* Recent reservations / orders */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isRestaurant ? 'Найближчі бронювання' : 'Останні замовлення'}
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {isRestaurant ? (
                    <>
                      <th>Дата</th>
                      <th>Час</th>
                      <th>Гість</th>
                      <th>Осіб</th>
                      <th>Статус</th>
                    </>
                  ) : (
                    <>
                      <th>№</th>
                      <th>Покупець</th>
                      <th>Сума</th>
                      <th>Статус</th>
                      <th>Дата</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isRestaurant
                  ? recentReservations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td className={styles.time}>{r.time}</td>
                        <td>{r.name}</td>
                        <td>{r.guests}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[`badge${r.status}` as keyof typeof styles]}`}>
                            {STATUS_LABELS[r.status] ?? r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  : recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className={styles.orderId}>#{o.id.slice(-4)}</td>
                        <td>{o.customer}</td>
                        <td className={styles.sum}>{o.total}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[o.status as keyof typeof styles]}`}>
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className={styles.date}>{o.date}</td>
                      </tr>
                    ))}
                {(isRestaurant ? recentReservations : recentOrders).length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      {isRestaurant ? 'Немає бронювань' : 'Немає замовлень'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top products */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isRestaurant ? 'Топ страви' : 'Топ товари'}
          </h2>
          <ul className={styles.top}>
            {topProducts.map((p, i) => (
              <li key={p.name} className={styles.topItem}>
                <span className={styles.topRank}>{i + 1}</span>
                <span className={styles.topImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" />
                </span>
                <span className={styles.topName}>{p.name}</span>
                <span className={styles.topSales}>
                  {p.sales} {isRestaurant ? 'відгуків' : 'продажів'}
                </span>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className={styles.emptyCell}>Немає даних</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}
