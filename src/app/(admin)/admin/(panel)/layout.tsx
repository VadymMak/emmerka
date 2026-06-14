import { db } from '@/lib/db';
import AdminSidebar from '@/components/admin/AdminSidebar/AdminSidebar';
import styles from './admin.module.css';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { name: true, vertical: true },
  });

  return (
    <div className={styles.shell}>
      <AdminSidebar
        storeName={store?.name ?? 'Store'}
        vertical={store?.vertical ?? 'RESTAURANT'}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
