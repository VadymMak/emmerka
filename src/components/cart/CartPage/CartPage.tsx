'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/useCartStore';
import { useVerticalConfig } from '@/lib/vertical-context';
import CartItem from '@/components/cart/CartItem/CartItem';
import OrderSummary from '@/components/cart/OrderSummary/OrderSummary';
import styles from './CartPage.module.css';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function CheckMini() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2.5 0-.7 13a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5.5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function BigCartIcon() {
  return (
    <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
    </svg>
  );
}

export default function CartPage() {
  const t = useTranslations('cart');
  const vConfig = useVerticalConfig();
  const isRestaurant = vConfig.vertical === 'RESTAURANT';

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  // Local selection state (the store has no per-item "checked" flag). New items
  // default to checked; removed ids fall out naturally.
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());

  // Hydrate the persisted cart after mount (store uses skipHydration).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const isChecked = (id: string) => !unchecked.has(id);
  const toggleCheck = (id: string) =>
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedCount = items.filter((it) => isChecked(it.id)).length;
  const allChecked = items.length > 0 && selectedCount === items.length;
  const toggleAll = () =>
    setUnchecked(allChecked ? new Set(items.map((it) => it.id)) : new Set());
  const deleteSelected = () => items.filter((it) => isChecked(it.id)).forEach((it) => removeItem(it.id));

  const checkedItems = items.filter((it) => isChecked(it.id));

  // Before hydration the store is empty; render nothing to avoid flashing the
  // empty state for a user who actually has items.
  if (!hydrated) {
    return (
      <div className={`${styles.cart} ${isRestaurant ? styles.cartDark : ''}`}>
        <h1 className={styles.h1}>{t('title')}</h1>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`${styles.cart} ${isRestaurant ? styles.cartDark : ''}`}>
        <h1 className={styles.h1}>{t('title')}</h1>
        <div className={styles.empty}>
          <div className={styles.emptyIco}>
            <BigCartIcon />
          </div>
          <h2 className={styles.emptyTitle}>{t('empty')}</h2>
          <Link href="/catalog" className={styles.emptyBtn}>
            {t('goToCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.cart} ${isRestaurant ? styles.cartDark : ''}`}>
      <h1 className={styles.h1}>
        {t('title')}
        <span className={styles.count}>{t('itemsCount', { count: items.length })}</span>
      </h1>

      <div className={styles.body}>
        <div>
          <div className={styles.items}>
            <div className={styles.head}>
              <label className={styles.selectAll}>
                <span className={styles.chk}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                  <span className={styles.chkBox}>
                    <CheckMini />
                  </span>
                </span>
                {t('selected')} ({selectedCount})
              </label>
              <button
                type="button"
                className={styles.clear}
                onClick={deleteSelected}
                disabled={selectedCount === 0}
              >
                <TrashIcon />
                {t('deleteSelected')}
              </button>
            </div>

            {items.map((it) => (
              <CartItem
                key={it.id}
                item={{ ...it, checked: isChecked(it.id) }}
                onQuantityChange={updateQuantity}
                onDelete={removeItem}
                onCheck={toggleCheck}
              />
            ))}
          </div>

          <div className={styles.foot}>
            <Link href="/catalog" className={styles.back}>
              {t('continueShopping')}
            </Link>
          </div>
        </div>

        <OrderSummary items={checkedItems} currency={checkedItems[0]?.currency ?? 'грн'} />
      </div>
    </div>
  );
}
