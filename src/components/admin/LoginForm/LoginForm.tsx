'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StoreLogo from '@/components/ui/StoreLogo';
import styles from './LoginForm.module.css';

function EyeIcon({ off }: { off?: boolean }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" {...p} aria-hidden="true"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.2 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.2-1.5" /><path d="M3 3l18 18" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" {...p} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}

interface LoginFormProps {
  storeName: string;
  vertical: string;
}

export default function LoginForm({ storeName, vertical }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>
            <StoreLogo vertical={vertical} size={22} fill={true} />
          </span>
          <span className={styles.logoText}>{storeName}</span>
        </div>
        <h1 className={styles.title}>Administrácia</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Heslo</span>
            <div className={styles.masked}>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                autoComplete="current-password"
                required
              />
              <button type="button" className={styles.eye} onClick={() => setShowPw((s) => !s)} aria-label="Zobraziť alebo skryť heslo">
                <EyeIcon off={showPw} />
              </button>
            </div>
          </label>

          {error && <p className={styles.error}>Nesprávny email alebo heslo</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Prihlasovanie…' : 'Prihlásiť sa'}
          </button>
        </form>
      </div>
    </div>
  );
}
