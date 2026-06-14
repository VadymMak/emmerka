'use client';

import { useState } from 'react';
import {
  type PromoFormData,
  type PromoType,
  PROMO_TYPES,
  PROMO_TYPE_LABEL,
} from '@/components/admin/promoTypes';
import styles from './PromoModal.module.css';

export interface PromoModalProps {
  mode: 'add' | 'edit';
  initial: PromoFormData;
  brands: string[];
  categories: { slug: string; label: string }[];
  onSave: (data: PromoFormData) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function PromoModal({ mode, initial, brands, categories, onSave, onClose }: PromoModalProps) {
  const [data, setData] = useState<PromoFormData>(initial);

  const set = <K extends keyof PromoFormData>(key: K, value: PromoFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const onTypeChange = (type: PromoType) =>
    // Reset target when switching type so a stale brand/category doesn't linger.
    setData((d) => ({ ...d, type, target: '' }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(data);
  };

  const showDiscount = data.type !== 'freeDelivery';

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>{mode === 'add' ? 'Vytvoriť akciu' : 'Upraviť akciu'}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Zatvoriť">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Názov akcie</span>
            <input className={styles.input} type="text" value={data.title} onChange={(e) => set('title', e.target.value)} required />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Typ</span>
            <select className={styles.input} value={data.type} onChange={(e) => onTypeChange(e.target.value as PromoType)}>
              {PROMO_TYPES.map((t) => (
                <option key={t} value={t}>{PROMO_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>

          {showDiscount && (
            <label className={styles.field}>
              <span className={styles.label}>Výška zľavy, %</span>
              <input className={styles.input} type="number" min={0} max={100} value={data.discount} onChange={(e) => set('discount', e.target.value)} />
            </label>
          )}

          {data.type === 'brand' && (
            <label className={styles.field}>
              <span className={styles.label}>Aplikovať na značku</span>
              <select className={styles.input} value={data.target} onChange={(e) => set('target', e.target.value)}>
                <option value="">Vyberte značku</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
          )}

          {data.type === 'category' && (
            <label className={styles.field}>
              <span className={styles.label}>Aplikovať na kategóriu</span>
              <select className={styles.input} value={data.target} onChange={(e) => set('target', e.target.value)}>
                <option value="">Vyberte kategóriu</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.label}>{c.label}</option>
                ))}
              </select>
            </label>
          )}

          {data.type === 'promocode' && (
            <label className={styles.field}>
              <span className={styles.label}>Promokód</span>
              <input className={styles.input} type="text" value={data.target} onChange={(e) => set('target', e.target.value)} placeholder="SUMMER10" />
            </label>
          )}

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Dátum začiatku</span>
              <input className={styles.input} type="date" value={data.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Dátum konca</span>
              <input className={styles.input} type="date" value={data.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Text pre oznamovací pruh</span>
            <textarea className={styles.textarea} rows={2} value={data.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="Text oznámenia..." />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Zrušiť</button>
            <button type="submit" className={styles.save}>Uložiť</button>
          </div>
        </form>
      </div>
    </div>
  );
}
