'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/useCartStore';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './CheckoutSummary.module.css';

const FREE_DELIVERY_THRESHOLD = 2000;
const DELIVERY_FEE = 99;

export default function CheckoutSummary() {
  const t = useTranslations('checkout');
  const tc = useTranslations('cart');
  const vConfig = useVerticalConfig();
  const isRestaurant = vConfig.vertical === 'RESTAURANT';

  const items = useCartStore((s) => s.items);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const currency = items[0]?.currency ?? 'грн';

  const { subtotal, discount, deliveryFee, deliveryFree, total } = useMemo(() => {
    const sub = items.reduce((s, it) => s + (it.oldPrice ?? it.price) * it.quantity, 0);
    const disc = items.reduce(
      (s, it) => s + (it.oldPrice != null ? (it.oldPrice - it.price) * it.quantity : 0),
      0,
    );
    const payable = sub - disc;
    const free = isRestaurant || payable === 0 || payable > FREE_DELIVERY_THRESHOLD;
    const fee = free ? 0 : DELIVERY_FEE;
    return { subtotal: sub, discount: disc, deliveryFee: fee, deliveryFree: free, total: payable + fee };
  }, [items, isRestaurant]);

  const formatPrice = (value: number) => new Intl.NumberFormat('uk-UA').format(value);
  const shown = hydrated ? items : [];

  return (
    <aside className={`${styles.sum} ${isRestaurant ? styles.sumDark : ''}`}>
      <h2 className={styles.title}>{tc('orderSummary')}</h2>

      <ul className={styles.items}>
        {shown.map((it) => (
          <li key={it.id} className={styles.item}>
            <span className={styles.itemImg}>
              <Image
                src={it.image}
                alt={it.name}
                width={60}
                height={60}
                className={styles.itemThumb}
                unoptimized={it.image.endsWith('.svg')}
              />
            </span>
            <span className={styles.itemInfo}>
              <span className={styles.itemName}>{it.name}</span>
              <span className={styles.itemQty}>× {it.quantity}</span>
            </span>
            <span className={styles.itemPrice}>
              {formatPrice(it.price * it.quantity)} {currency}
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.div} />

      <div className={styles.row}>
        <span>{tc('subtotal')}</span>
        <span>
          {formatPrice(subtotal)} {currency}
        </span>
      </div>
      <div className={`${styles.row} ${styles.rowGreen}`}>
        <span>{tc('discount')}</span>
        <span>{discount > 0 ? `−${formatPrice(discount)} ${currency}` : '—'}</span>
      </div>
      <div className={`${styles.row} ${deliveryFree ? styles.rowGreen : ''}`}>
        <span>{t('delivery')}</span>
        <span>{deliveryFree ? tc('deliveryFree') : `${formatPrice(deliveryFee)} ${currency}`}</span>
      </div>

      <div className={styles.div} />

      <div className={styles.total}>
        <span className={styles.totalLabel}>{tc('total')}</span>
        <span className={styles.totalVal}>
          {formatPrice(total)} {currency}
        </span>
      </div>
    </aside>
  );
}
