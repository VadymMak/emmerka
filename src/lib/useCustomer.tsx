'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface CustomerData {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
}

interface CustomerContextValue {
  customer: CustomerData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { email: string; name: string; phone?: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCustomer(data.customer ?? null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? 'Login failed' };
      setCustomer(data.customer);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const register = useCallback(async (input: { email: string; name: string; phone?: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? 'Registration failed' };
      setCustomer(data.customer);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCustomer(null);
  }, []);

  return (
    <CustomerContext.Provider value={{ customer, loading, login, register, logout, refresh }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be inside CustomerProvider');
  return ctx;
}
