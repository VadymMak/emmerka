'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import styles from './Header.module.css';

// Reads the live cart count from the Zustand store. Hydrated after mount
// (store uses skipHydration) so SSR and first client render match.
export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setCount(useCartStore.getState().getTotalItems());
    const unsubscribe = useCartStore.subscribe((state) =>
      setCount(state.getTotalItems()),
    );
    return unsubscribe;
  }, []);

  if (count === 0) return null;
  return <span className={`${styles.badge} ${styles.badgeRed}`}>{count}</span>;
}
