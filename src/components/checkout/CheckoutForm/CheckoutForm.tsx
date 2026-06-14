'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/useCartStore';
import { useVerticalConfig } from '@/lib/vertical-context';
import { useStorePresence } from '@/lib/presence-context';
import styles from './CheckoutForm.module.css';

type DeliveryMethod = 'SHIPPING' | 'COURIER' | 'PICKUP' | 'DINE_IN';
type PaymentMethod = 'wayforpay' | 'liqpay' | 'cod' | 'installments' | 'card' | 'at_table';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryMethod;
  city: string;
  branch: string;
  paymentMethod: PaymentMethod;
  comment: string;
  // Vertical-specific optional fields
  companyName?: string;
  taxId?: string;
  tableNumber?: string;
  timeSlot?: string;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17.5" cy="17.5" r="1.6" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M4 9.5V20h16V9.5" />
      <path d="M3 4h18l1 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0L3 4Z" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 9.5h19M6 14.5h4" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="3" y="5" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="11" height="5" rx="1.5" />
    </svg>
  );
}

function DineInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function ScooterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      <path d="M7.5 18h5l1-6h4l2 6" />
      <path d="M12 18V9l-4-2" />
    </svg>
  );
}

function TakeawayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function TablePayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3h-8v4h8z" />
      <path d="M12 11v6M9 14h6" />
    </svg>
  );
}

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const vConfig = useVerticalConfig();

  const isRestaurant = vConfig.vertical === 'RESTAURANT';
  const presence = useStorePresence();

  const [data, setData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    deliveryMethod: (vConfig.delivery.modes.find(m => m.enabled)?.mode ?? 'SHIPPING') as DeliveryMethod,
    city: '',
    branch: '',
    paymentMethod: isRestaurant ? 'card' : 'wayforpay',
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const DELIVERY_ICON_MAP: Record<string, ReactNode> = {
    SHIPPING: <BoxIcon />,
    COURIER: <ScooterIcon />,
    PICKUP: isRestaurant ? <TakeawayIcon /> : <StoreIcon />,
    DINE_IN: <DineInIcon />,
  };

  const deliveryCards: { value: DeliveryMethod; label: string; icon: ReactNode }[] =
    vConfig.delivery.modes
      .filter(m => m.enabled)
      .map(m => ({
        value: m.mode as DeliveryMethod,
        label: m.label,
        icon: DELIVERY_ICON_MAP[m.mode] ?? <BoxIcon />,
      }));

  const paymentCards: { value: PaymentMethod; label: string; icon: ReactNode }[] = isRestaurant
    ? [
        { value: 'card', label: t('payByCard'), icon: <CardIcon /> },
        { value: 'at_table', label: t('payAtTable'), icon: <TablePayIcon /> },
      ]
    : [
        { value: 'wayforpay', label: t('payOnline'), icon: <CardIcon /> },
        { value: 'liqpay', label: t('liqpay'), icon: <CardIcon /> },
        { value: 'cod', label: t('cashOnDelivery'), icon: <CashIcon /> },
        { value: 'installments', label: t('installments'), icon: <SplitIcon /> },
      ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: Record<string, boolean> = {
      firstName: !data.firstName.trim(),
      lastName: !data.lastName.trim(),
      phone: !data.phone.trim(),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const cartItems = useCartStore.getState().items;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items: cartItems }),
      });
      if (!res.ok) throw new Error(`Order failed: ${res.status}`);
      useCartStore.getState().clearCart();
      router.push('/checkout/success');
    } catch (err) {
      console.error('[checkout]', err);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    key: 'firstName' | 'lastName' | 'phone' | 'email',
    type = 'text',
  ) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={key}>
        {t(key)}
      </label>
      <input
        id={key}
        type={type}
        className={`${styles.input} ${errors[key] ? styles.inputError : ''}`}
        value={data[key]}
        onChange={(e) => {
          set(key, e.target.value);
          if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
        }}
      />
      {errors[key] && <span className={styles.errorMsg}>{t('required')}</span>}
    </div>
  );

  return (
    <form className={`${styles.form} ${isRestaurant ? styles.formDark : ''}`} onSubmit={handleSubmit} noValidate>
      {/* Contact info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('contactInfo')}</h2>
        <div className={styles.grid2}>
          {field('firstName')}
          {field('lastName')}
          {field('phone', 'tel')}
          {field('email', 'email')}
        </div>
      </section>

      {/* Company info — B2B only */}
      {vConfig.checkout.showCompanyFields && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Company info</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                type="text"
                className={styles.input}
                value={data.companyName ?? ''}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="taxId">Tax ID</label>
              <input
                id="taxId"
                type="text"
                className={styles.input}
                value={data.taxId ?? ''}
                onChange={(e) => set('taxId', e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Delivery */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('delivery')}</h2>
        <div className={styles.cards}>
          {deliveryCards.map((card) => (
            <label
              key={card.value}
              className={`${styles.card} ${data.deliveryMethod === card.value ? styles.cardActive : ''}`}
            >
              <input
                type="radio"
                name="delivery"
                checked={data.deliveryMethod === card.value}
                onChange={() => set('deliveryMethod', card.value)}
              />
              <span className={styles.cardIcon}>{card.icon}</span>
              <span className={styles.cardLabel}>
                {card.label}
                {card.value === 'PICKUP' && presence.address && (
                  <span className={styles.pickupAddress}>
                    📍 {presence.address}{presence.city ? `, ${presence.city}` : ''}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        {data.deliveryMethod !== 'PICKUP' && data.deliveryMethod !== 'DINE_IN' && (
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="city">
                {t('city')}
              </label>
              <input
                id="city"
                type="text"
                className={styles.input}
                value={data.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="branch">
                {t('branch')}
              </label>
              <input
                id="branch"
                type="text"
                className={styles.input}
                value={data.branch}
                onChange={(e) => set('branch', e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Time slot — Food Market / Restaurant */}
      {vConfig.checkout.showTimeSlots && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferred delivery time</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="timeSlot">Time slot</label>
            <select
              id="timeSlot"
              className={styles.input}
              value={data.timeSlot ?? ''}
              onChange={(e) => set('timeSlot', e.target.value)}
            >
              <option value="">Select time...</option>
              <option value="asap">As soon as possible</option>
              <option value="10-12">10:00 — 12:00</option>
              <option value="12-14">12:00 — 14:00</option>
              <option value="14-16">14:00 — 16:00</option>
              <option value="16-18">16:00 — 18:00</option>
              <option value="18-20">18:00 — 20:00</option>
            </select>
          </div>
        </section>
      )}

      {/* Table number — Restaurant dine-in */}
      {vConfig.checkout.showTableNumber && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Table</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tableNumber">Table number</label>
            <input
              id="tableNumber"
              type="number"
              className={styles.input}
              value={data.tableNumber ?? ''}
              onChange={(e) => set('tableNumber', e.target.value)}
            />
          </div>
        </section>
      )}

      {/* Payment */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('payment')}</h2>
        <div className={styles.cards}>
          {paymentCards.map((card) => (
            <label
              key={card.value}
              className={`${styles.card} ${data.paymentMethod === card.value ? styles.cardActive : ''}`}
            >
              <input
                type="radio"
                name="payment"
                checked={data.paymentMethod === card.value}
                onChange={() => set('paymentMethod', card.value)}
              />
              <span className={styles.cardIcon}>{card.icon}</span>
              <span className={styles.cardLabel}>{card.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Comment */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('comment')}</h2>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder={t('commentPlaceholder')}
          value={data.comment}
          onChange={(e) => set('comment', e.target.value)}
        />
      </section>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? '...' : t('submit')}
      </button>
    </form>
  );
}
