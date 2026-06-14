'use client';

import { useEffect, useRef, useState } from 'react';
import WorkingHours from '@/components/admin/WorkingHours';
import styles from './settings.module.css';

type Tab = 'store' | 'delivery' | 'payment' | 'notifications' | 'security' | 'schedule';

const BASE_TABS: { key: Tab; label: string }[] = [
  { key: 'store', label: 'Магазин' },
  { key: 'delivery', label: 'Доставка' },
  { key: 'payment', label: 'Оплата' },
  { key: 'notifications', label: 'Сповіщення' },
  { key: 'security', label: 'Безпека' },
];

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.2 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.2-1.5" /><path d="M3 3l18 18" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}
function UploadIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 9l5-5 5 5M12 4v12" /></svg>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <span className={`${styles.toggle} ${disabled ? styles.toggleDisabled : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.track} />
    </span>
  );
}

function MaskedInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.masked}>
      <input className={styles.input} type={show ? 'text' : 'password'} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className={styles.eye} onClick={() => setShow((s) => !s)} aria-label="Показати або приховати">
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('store');
  const [vertical, setVertical] = useState('');

  useEffect(() => {
    fetch('/api/admin/store-info')
      .then((r) => r.json() as Promise<{ store?: Record<string, unknown> }>)
      .then((data) => {
        if (data.store) {
          const s = data.store;
          if (s.vertical) setVertical(s.vertical as string);
          setStore((prev) => ({
            ...prev,
            name: (s.name as string) ?? '',
            description: (s.description as string) ?? '',
            phone: (s.phone as string) ?? '',
            email: (s.email as string) ?? '',
            address: (s.address as string) ?? '',
            city: (s.city as string) ?? '',
            openingHours: (s.openingHours as string) ?? '',
            primaryMode: (s.primaryMode as 'PHYSICAL' | 'ONLINE' | 'HYBRID') ?? 'ONLINE',
            mapLat: s.mapLat != null ? String(s.mapLat) : '',
            mapLng: s.mapLng != null ? String(s.mapLng) : '',
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabs = [
    ...BASE_TABS,
    ...(vertical === 'RESTAURANT' ? [{ key: 'schedule' as Tab, label: 'Розклад' }] : []),
  ];

  // Toast
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const saveStore = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/store-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: store.name,
          description: store.description,
          phone: store.phone || null,
          email: store.email || null,
          address: store.address || null,
          city: store.city || null,
          openingHours: store.openingHours || null,
          primaryMode: store.primaryMode,
          mapLat: store.mapLat ? parseFloat(store.mapLat) : null,
          mapLng: store.mapLng ? parseFloat(store.mapLng) : null,
        }),
      });
      if (res.ok) {
        setToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const save = (section: string, data: unknown) => {
    console.log('[admin settings save]', section, data);
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  // Store
  const [store, setStore] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    openingHours: '',
    primaryMode: 'ONLINE' as 'PHYSICAL' | 'ONLINE' | 'HYBRID',
    mapLat: '',
    mapLng: '',
    facebook: '',
    instagram: '',
    youtube: '',
  });
  // Delivery
  const [delivery, setDelivery] = useState({ novaPoshtaOn: true, novaPoshtaKey: '', pickupOn: true, pickupAddress: 'м. Київ, вул. Хрещатик, 1', freeFrom: '2000' });
  // Payment
  const [payment, setPayment] = useState({ wayforpayOn: true, wfpMerchant: '', wfpSecret: '', wfpTest: false, liqpayOn: true, liqPublic: '', liqPrivate: '', codOn: true, codFee: '0' });
  // Notifications
  const [notif, setNotif] = useState({ emailOn: true, email: 'orders@electromarket.ua', reviewsOn: true, lowStockOn: true, telegramOn: false, botToken: '', chatId: '' });
  // Security
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '', twoFactor: false });

  const sStore = <K extends keyof typeof store>(k: K, v: (typeof store)[K]) => setStore((p) => ({ ...p, [k]: v }));
  const sDel = <K extends keyof typeof delivery>(k: K, v: (typeof delivery)[K]) => setDelivery((p) => ({ ...p, [k]: v }));
  const sPay = <K extends keyof typeof payment>(k: K, v: (typeof payment)[K]) => setPayment((p) => ({ ...p, [k]: v }));
  const sNotif = <K extends keyof typeof notif>(k: K, v: (typeof notif)[K]) => setNotif((p) => ({ ...p, [k]: v }));
  const sSec = <K extends keyof typeof security>(k: K, v: (typeof security)[K]) => setSecurity((p) => ({ ...p, [k]: v }));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Налаштування</h1>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button key={t.key} type="button" className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1 — Store */}
      {tab === 'store' && (
        <div className={styles.card}>
          {loading ? (
            <p style={{ color: '#6b7280', fontSize: 14 }}>Завантаження...</p>
          ) : (
            <>
              <div className={styles.logoUpload} onClick={() => console.log('[admin logo upload]')}>
                <UploadIcon />
                <span>Завантажити логотип</span>
              </div>

              {/* Store Mode selector */}
              <div className={styles.block}>
                <span className={styles.blockTitle}>Тип магазину</span>
                <p className={styles.modeHint}>Визначає які поля доступні та як сайт відображає магазин</p>
                <div className={styles.modeCards}>
                  {([
                    { mode: 'PHYSICAL' as const, icon: '🏪', title: 'Фізичний магазин', desc: 'Офлайн точка з адресою. Клієнти приходять в магазин.' },
                    { mode: 'ONLINE' as const,   icon: '🛒', title: 'Онлайн магазин',   desc: 'Тільки онлайн. Доставка поштою або кур\'єром.' },
                    { mode: 'HYBRID' as const,   icon: '🔄', title: 'Гібридний',        desc: 'Фізична точка + онлайн доставка.' },
                  ]).map((opt) => (
                    <button
                      key={opt.mode}
                      type="button"
                      className={`${styles.modeCard} ${store.primaryMode === opt.mode ? styles.modeCardActive : ''}`}
                      onClick={() => sStore('primaryMode', opt.mode)}
                    >
                      <span className={styles.modeIcon}>{opt.icon}</span>
                      <span className={styles.modeTitle}>{opt.title}</span>
                      <span className={styles.modeDesc}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Назва магазину">
                <input className={styles.input} value={store.name} onChange={(e) => sStore('name', e.target.value)} />
              </Field>
              <Field label="Опис">
                <textarea className={styles.textarea} rows={3} value={store.description} onChange={(e) => sStore('description', e.target.value)} />
              </Field>
              <div className={styles.grid2}>
                <Field label="Телефон"><input className={styles.input} value={store.phone} onChange={(e) => sStore('phone', e.target.value)} /></Field>
                <Field label="Email"><input className={styles.input} type="email" value={store.email} onChange={(e) => sStore('email', e.target.value)} /></Field>
              </div>

              {/* Address fields — only for PHYSICAL / HYBRID */}
              {store.primaryMode !== 'ONLINE' && (
                <>
                  <Field label="Адреса магазину">
                    <input className={styles.input} value={store.address} onChange={(e) => sStore('address', e.target.value)} placeholder="Marktstraße 15" />
                  </Field>
                  <div className={styles.grid2}>
                    <Field label="Місто">
                      <input className={styles.input} value={store.city} onChange={(e) => sStore('city', e.target.value)} placeholder="Berlin" />
                    </Field>
                    <Field label="Графік роботи">
                      <input className={styles.input} value={store.openingHours} onChange={(e) => sStore('openingHours', e.target.value)} placeholder="Mon-Sat: 9:00-20:00" />
                    </Field>
                  </div>
                  <div className={styles.grid2}>
                    <Field label="Широта (lat)">
                      <input className={styles.input} type="number" step="any" value={store.mapLat} onChange={(e) => sStore('mapLat', e.target.value)} placeholder="52.5200" />
                    </Field>
                    <Field label="Довгота (lng)">
                      <input className={styles.input} type="number" step="any" value={store.mapLng} onChange={(e) => sStore('mapLng', e.target.value)} placeholder="13.4050" />
                    </Field>
                  </div>
                </>
              )}

              <div className={styles.grid2}>
                <Field label="Facebook"><input className={styles.input} value={store.facebook} placeholder="https://facebook.com/..." onChange={(e) => sStore('facebook', e.target.value)} /></Field>
                <Field label="Instagram"><input className={styles.input} value={store.instagram} placeholder="https://instagram.com/..." onChange={(e) => sStore('instagram', e.target.value)} /></Field>
              </div>
              <Field label="YouTube"><input className={styles.input} value={store.youtube} placeholder="https://youtube.com/..." onChange={(e) => sStore('youtube', e.target.value)} /></Field>

              <button type="button" className={styles.saveBtn} onClick={saveStore} disabled={saving}>
                {saving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </>
          )}
        </div>
      )}

      {/* TAB 2 — Delivery */}
      {tab === 'delivery' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Нова Пошта</span>
              <Toggle checked={delivery.novaPoshtaOn} onChange={(v) => sDel('novaPoshtaOn', v)} />
            </div>
            <Field label="API ключ">
              <MaskedInput value={delivery.novaPoshtaKey} onChange={(v) => sDel('novaPoshtaKey', v)} placeholder="••••••••••••" />
            </Field>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test novaposhta]')}>Перевірити підключення</button>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Самовивіз</span>
              <Toggle checked={delivery.pickupOn} onChange={(v) => sDel('pickupOn', v)} />
            </div>
            <Field label="Адреса магазину"><input className={styles.input} value={delivery.pickupAddress} onChange={(e) => sDel('pickupAddress', e.target.value)} /></Field>
          </div>

          <Field label="Безкоштовна доставка від, грн">
            <input className={styles.input} type="number" value={delivery.freeFrom} onChange={(e) => sDel('freeFrom', e.target.value)} />
          </Field>

          <button type="button" className={styles.saveBtn} onClick={() => save('delivery', delivery)}>Зберегти</button>
        </div>
      )}

      {/* TAB 3 — Payment */}
      {tab === 'payment' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>WayForPay</span>
              <Toggle checked={payment.wayforpayOn} onChange={(v) => sPay('wayforpayOn', v)} />
            </div>
            <Field label="Merchant Account"><input className={styles.input} value={payment.wfpMerchant} onChange={(e) => sPay('wfpMerchant', e.target.value)} /></Field>
            <Field label="Secret Key"><MaskedInput value={payment.wfpSecret} onChange={(v) => sPay('wfpSecret', v)} placeholder="••••••••••••" /></Field>
            <div className={styles.settingRow}>
              <span>Тестовий режим</span>
              <Toggle checked={payment.wfpTest} onChange={(v) => sPay('wfpTest', v)} />
            </div>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test wayforpay]')}>Перевірити підключення</button>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>LiqPay</span>
              <Toggle checked={payment.liqpayOn} onChange={(v) => sPay('liqpayOn', v)} />
            </div>
            <Field label="Public Key"><input className={styles.input} value={payment.liqPublic} onChange={(e) => sPay('liqPublic', e.target.value)} /></Field>
            <Field label="Private Key"><MaskedInput value={payment.liqPrivate} onChange={(v) => sPay('liqPrivate', v)} placeholder="••••••••••••" /></Field>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Наложений платіж</span>
              <Toggle checked={payment.codOn} onChange={(v) => sPay('codOn', v)} />
            </div>
            <Field label="Комісія, %"><input className={styles.input} type="number" value={payment.codFee} onChange={(e) => sPay('codFee', e.target.value)} /></Field>
          </div>

          <button type="button" className={styles.saveBtn} onClick={() => save('payment', payment)}>Зберегти</button>
        </div>
      )}

      {/* TAB 4 — Notifications */}
      {tab === 'notifications' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Email</span>
              <Toggle checked={notif.emailOn} onChange={(v) => sNotif('emailOn', v)} />
            </div>
            <Field label="Email для сповіщень"><input className={styles.input} type="email" value={notif.email} onChange={(e) => sNotif('email', e.target.value)} /></Field>
            <div className={styles.settingRow}>
              <span>Сповіщення про нові відгуки</span>
              <Toggle checked={notif.reviewsOn} onChange={(v) => sNotif('reviewsOn', v)} />
            </div>
            <div className={styles.settingRow}>
              <span>Сповіщення про низькі залишки</span>
              <Toggle checked={notif.lowStockOn} onChange={(v) => sNotif('lowStockOn', v)} />
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Telegram</span>
              <Toggle checked={notif.telegramOn} onChange={(v) => sNotif('telegramOn', v)} />
            </div>
            <Field label="Bot Token"><MaskedInput value={notif.botToken} onChange={(v) => sNotif('botToken', v)} placeholder="••••••••••••" /></Field>
            <Field label="Chat ID"><input className={styles.input} value={notif.chatId} onChange={(e) => sNotif('chatId', e.target.value)} /></Field>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test telegram]')}>Тест</button>
          </div>

          <button type="button" className={styles.saveBtn} onClick={() => save('notifications', notif)}>Зберегти</button>
        </div>
      )}

      {/* TAB 5 — Security */}
      {tab === 'security' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <span className={styles.blockTitle}>Зміна паролю</span>
            <Field label="Поточний пароль"><MaskedInput value={security.currentPw} onChange={(v) => sSec('currentPw', v)} /></Field>
            <Field label="Новий пароль"><MaskedInput value={security.newPw} onChange={(v) => sSec('newPw', v)} /></Field>
            <Field label="Підтвердіть пароль"><MaskedInput value={security.confirmPw} onChange={(v) => sSec('confirmPw', v)} /></Field>
            <button type="button" className={styles.saveBtn} onClick={() => save('security', { changed: true })}>Змінити пароль</button>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span>Активних сесій: <b>2</b></span>
              <button type="button" className={styles.dangerBtn} onClick={() => console.log('[terminate all sessions]')}>Завершити всі сесії</button>
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span className={styles.twoFa}>
                Двофакторна автентифікація
                <span className={styles.soon}>Незабаром</span>
              </span>
              <Toggle checked={security.twoFactor} onChange={(v) => sSec('twoFactor', v)} disabled />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6 — Schedule (restaurant only) */}
      {tab === 'schedule' && (
        <div className={styles.card}>
          <WorkingHours />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={styles.toast} role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Налаштування збережено
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
