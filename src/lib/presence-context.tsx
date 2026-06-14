'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { StorePresence } from '@/lib/store-config';

const PresenceContext = createContext<StorePresence | null>(null);

export function PresenceProvider({
  presence,
  children,
}: {
  presence: StorePresence;
  children: ReactNode;
}) {
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
}

export function useStorePresence(): StorePresence {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('useStorePresence must be used within PresenceProvider');
  return ctx;
}
