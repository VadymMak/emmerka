'use client';

import { useState, useEffect } from 'react';
import styles from './WorkingHours.module.css';

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

type WeekSchedule = Record<string, DaySchedule>;

const DAYS = [
  { key: 'mon', label: 'Pondelok' },
  { key: 'tue', label: 'Utorok' },
  { key: 'wed', label: 'Streda' },
  { key: 'thu', label: 'Štvrtok' },
  { key: 'fri', label: 'Piatok' },
  { key: 'sat', label: 'Sobota' },
  { key: 'sun', label: 'Nedeľa' },
];

const DEFAULT_SCHEDULE: WeekSchedule = Object.fromEntries(
  DAYS.map((d) => [d.key, { open: '11:00', close: '23:00', closed: false }]),
);

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

export default function WorkingHours() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/hours')
      .then((r) => r.json() as Promise<{ workingHours: WeekSchedule | null }>)
      .then((data) => {
        if (data.workingHours) {
          setSchedule({ ...DEFAULT_SCHEDULE, ...data.workingHours });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours: schedule }),
      });
      if (res.ok) setSaved(true);
    } catch {
      alert('Chyba uloženia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Načítavanie...</div>;

  return (
    <div className={styles.hours}>
      <h3 className={styles.title}>Otváracie hodiny</h3>
      <p className={styles.hint}>Zadajte otváracie hodiny reštaurácie pre každý deň v týždni</p>

      <div className={styles.grid}>
        {DAYS.map((d) => {
          const day = schedule[d.key];
          return (
            <div key={d.key} className={`${styles.row} ${day.closed ? styles.rowClosed : ''}`}>
              <span className={styles.dayLabel}>{d.label}</span>

              <select
                className={styles.timeSelect}
                value={day.open}
                disabled={day.closed}
                onChange={(e) => updateDay(d.key, 'open', e.target.value)}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <span className={styles.dash}>—</span>

              <select
                className={styles.timeSelect}
                value={day.close}
                disabled={day.closed}
                onChange={(e) => updateDay(d.key, 'close', e.target.value)}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <label className={styles.closedToggle}>
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={(e) => updateDay(d.key, 'closed', e.target.checked)}
                />
                Zatvorené
              </label>
            </div>
          );
        })}
      </div>

      <div className={styles.saveRow}>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'Ukladám...' : 'Uložiť rozvrh'}
        </button>
        {saved && <span className={styles.savedMsg}>✓ Uložené</span>}
      </div>
    </div>
  );
}
