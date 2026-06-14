'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/useCartStore';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './OrderSuccess.module.css';

// Confetti pieces — fixed positions/colours so render is deterministic; only the
// CSS animation differs. Decorative (aria-hidden).
const CONFETTI = [
  { left: '8%', color: '#f97316', delay: '0s', dur: '2.6s' },
  { left: '20%', color: '#22c55e', delay: '0.3s', dur: '3.1s' },
  { left: '33%', color: '#ef4444', delay: '0.7s', dur: '2.4s' },
  { left: '46%', color: '#3b82f6', delay: '0.1s', dur: '2.9s' },
  { left: '59%', color: '#f97316', delay: '0.5s', dur: '3.3s' },
  { left: '72%', color: '#22c55e', delay: '0.2s', dur: '2.5s' },
  { left: '85%', color: '#eab308', delay: '0.6s', dur: '3.0s' },
  { left: '92%', color: '#ef4444', delay: '0.4s', dur: '2.7s' },
];

export default function OrderSuccess() {
  const t = useTranslations('checkout');
  const vConfig = useVerticalConfig();
  const isRestaurant = vConfig.vertical === 'RESTAURANT';

  // Generated client-side after mount so SSR and client markup match (no
  // hydration mismatch from Math.random()).
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    setOrderNo(String(Math.floor(100000 + Math.random() * 900000)));
    // The order is placed — empty the cart (also clears persisted storage).
    useCartStore.persist.rehydrate();
    clearCart();
  }, [clearCart]);

  return (
    <div className={`${styles.wrap} ${isRestaurant ? styles.wrapDark : ''}`}>
      <div className={styles.confetti} aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={styles.piece}
            style={{ left: c.left, background: c.color, animationDelay: c.delay, animationDuration: c.dur }}
          />
        ))}
      </div>

      <div className={styles.card}>
        <span className={styles.check}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className={styles.title}>
          {isRestaurant ? t('successTitleRestaurant') : t('successTitle')}
        </h1>

        <p className={styles.orderNo}>
          {t('orderNumber')} #{orderNo ?? '······'}
        </p>

        <p className={styles.message}>
          {isRestaurant ? t('successMessageRestaurant') : t('successMessage')}
        </p>

        <div className={styles.actions}>
          <Link href="/catalog" className={styles.btnPrimary}>
            {isRestaurant ? t('viewMenu') : t('continueShopping')}
          </Link>
          <Link href="/" className={styles.btnSecondary}>
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
