'use client';

import { useTranslations } from 'next-intl';
import { useVerticalConfig } from '@/lib/vertical-context';
import CheckoutForm from '@/components/checkout/CheckoutForm/CheckoutForm';
import CheckoutSummary from '@/components/checkout/CheckoutSummary/CheckoutSummary';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const vConfig = useVerticalConfig();
  const isRestaurant = vConfig.vertical === 'RESTAURANT';

  return (
    <div className={`${styles.checkout} ${isRestaurant ? styles.pageDark : ''}`}>
      <h1 className={styles.h1}>{t('title')}</h1>
      <div className={styles.body}>
        <div className={styles.formCol}>
          <CheckoutForm />
        </div>
        <CheckoutSummary />
      </div>
    </div>
  );
}
