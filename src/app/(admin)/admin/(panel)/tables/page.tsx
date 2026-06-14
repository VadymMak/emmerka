'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './tables.module.css';

type TableType = 'round' | 'rect';

interface RestaurantTable {
  id: string;
  number: string;
  seats: number;
  zone: string;
  x: number;
  y: number;
  type: string;
  active: boolean;
}

interface TableForm {
  number: string;
  seats: number;
  zone: string;
  x: number;
  y: number;
  type: TableType;
  active: boolean;
}

const ZONE_COLORS: Record<string, string> = {
  terrace: '#10b981',
  main: '#3b82f6',
  private: '#8b5cf6',
};

const ZONE_LABELS: Record<string, string> = {
  terrace: 'Тераса',
  main: 'Основний зал',
  private: 'Приватна кімната',
};

const ZONE_OPTIONS = ['terrace', 'main', 'private'];
const TYPE_OPTIONS: { value: TableType; label: string }[] = [
  { value: 'round', label: 'Круглий' },
  { value: 'rect', label: 'Прямокутний' },
];

const DEFAULT_FORM: TableForm = {
  number: '',
  seats: 4,
  zone: 'main',
  x: 300,
  y: 150,
  type: 'round',
  active: true,
};

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TableForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tables');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json() as { tables?: RestaurantTable[] };
      setTables(data.tables ?? []);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setForm({
      number: table.number,
      seats: table.seats,
      zone: table.zone,
      x: table.x,
      y: table.y,
      type: table.type as TableType,
      active: table.active,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setError(null); };

  const handleSave = async () => {
    if (!form.number.trim()) { setError('Введіть номер столу'); return; }
    if (form.seats < 1 || form.seats > 20) { setError('Місць: 1–20'); return; }
    setSaving(true);
    setError(null);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/admin/tables', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Save failed');
      }
      setShowModal(false);
      await fetchTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (table: RestaurantTable) => {
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: table.id, active: !table.active }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchTables();
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цей стіл? Всі пов\'язані бронювання збережуться.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tables?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Delete failed');
      }
      await fetchTables();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const set = <K extends keyof TableForm>(field: K, value: TableForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.h1}>Столи</h1>
        <button type="button" className={styles.addBtn} onClick={openAdd}>
          + Додати стіл
        </button>
      </div>

      {/* Floor plan */}
      <div className={styles.floorPlan}>
        <svg viewBox="0 0 640 320" className={styles.floorSvg}>
          <line x1="230" y1="20" x2="230" y2="300" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="490" y1="20" x2="490" y2="300" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
          <text x="115" y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="inherit">Тераса</text>
          <text x="360" y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="inherit">Основний зал</text>
          <text x="565" y="14" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="inherit">Приватна кімната</text>
          {tables.map((table) => {
            const color = ZONE_COLORS[table.zone] ?? '#64748b';
            const r = table.type === 'round' ? (table.seats <= 2 ? 22 : 28) : 0;
            return (
              <g
                key={table.id}
                style={{ cursor: 'pointer', opacity: table.active ? 1 : 0.3 }}
                onClick={() => openEdit(table)}
              >
                {table.type === 'round' ? (
                  <circle cx={table.x} cy={table.y} r={r} stroke={color} strokeWidth="2" fill={`${color}22`} />
                ) : (
                  <rect x={table.x - 36} y={table.y - 20} width="72" height="40" rx="6" stroke={color} strokeWidth="2" fill={`${color}22`} />
                )}
                <text x={table.x} y={table.y + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="inherit">
                  {table.number}
                </text>
                <text x={table.x} y={table.y + 13} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="9" fontFamily="inherit">
                  {table.seats}p
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Table list */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>Завантаження...</div>
        ) : tables.length === 0 ? (
          <div className={styles.empty}>Столів не знайдено</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Зона</th>
                <th>Місць</th>
                <th>Тип</th>
                <th>Позиція (x, y)</th>
                <th>Активний</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id} className={!t.active ? styles.inactive : ''}>
                  <td className={styles.tableNum}>{t.number}</td>
                  <td>
                    <span
                      className={styles.zoneBadge}
                      style={{ '--zone-color': ZONE_COLORS[t.zone] ?? '#64748b' } as React.CSSProperties}
                    >
                      {ZONE_LABELS[t.zone] ?? t.zone}
                    </span>
                  </td>
                  <td>{t.seats}</td>
                  <td>{t.type === 'round' ? 'Круглий' : 'Прямокутний'}</td>
                  <td className={styles.pos}>{t.x}, {t.y}</td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${t.active ? styles.toggleActive : styles.toggleInactive}`}
                      onClick={() => toggleActive(t)}
                    >
                      {t.active ? 'Активний' : 'Неактивний'}
                    </button>
                  </td>
                  <td className={styles.actions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEdit(t)}
                    >
                      Редагувати
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      disabled={deletingId === t.id}
                      onClick={() => handleDelete(t.id)}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Редагувати стіл' : 'Додати стіл'}
            </h2>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGrid}>
              <label className={styles.formLabel}>
                Номер столу
                <input
                  className={styles.input}
                  type="text"
                  placeholder="T13"
                  value={form.number}
                  onChange={(e) => set('number', e.target.value)}
                />
              </label>

              <label className={styles.formLabel}>
                Місць
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  max={20}
                  value={form.seats}
                  onChange={(e) => set('seats', parseInt(e.target.value, 10))}
                />
              </label>

              <label className={styles.formLabel}>
                Зона
                <select
                  className={styles.input}
                  value={form.zone}
                  onChange={(e) => set('zone', e.target.value)}
                >
                  {ZONE_OPTIONS.map((z) => (
                    <option key={z} value={z}>{ZONE_LABELS[z] ?? z}</option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                Тип столу
                <select
                  className={styles.input}
                  value={form.type}
                  onChange={(e) => set('type', e.target.value as TableType)}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                Позиція X (0–640)
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={640}
                  value={form.x}
                  onChange={(e) => set('x', parseInt(e.target.value, 10))}
                />
              </label>

              <label className={styles.formLabel}>
                Позиція Y (0–320)
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={320}
                  value={form.y}
                  onChange={(e) => set('y', parseInt(e.target.value, 10))}
                />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
              />
              Активний (відображається на карті бронювань)
            </label>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelModalBtn} onClick={closeModal}>
                Скасувати
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
