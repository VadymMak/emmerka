'use client';

import { useState } from 'react';
import styles from './TtnModal.module.css';

export interface TtnModalProps {
  orderId: string;
  initialTtn?: string;
  onSave: (id: string, ttn: string) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function TtnModal({ orderId, initialTtn = '', onSave, onClose }: TtnModalProps) {
  const [ttn, setTtn] = useState(initialTtn);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(orderId, ttn);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>ТТН — замовлення #{orderId}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
            <CloseIcon />
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            value={ttn}
            placeholder="Введіть номер ТТН"
            onChange={(e) => setTtn(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.save}>
            Зберегти
          </button>
        </form>
      </div>
    </div>
  );
}
