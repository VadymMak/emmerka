'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './reservations.module.css';

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

interface TableInfo {
  id: string;
  number: string;
  seats: number;
  zone: string;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  specialRequests: string | null;
  status: ReservationStatus;
  tableId: string | null;
  table: TableInfo | null;
  createdAt: string;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Čaká',
  CONFIRMED: 'Potvrdené',
  CANCELLED: 'Zrušené',
  COMPLETED: 'Dokončené',
  NO_SHOW: 'Neprišiel',
};

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Všetky', value: '' },
  { label: 'Čakajú', value: 'PENDING' },
  { label: 'Potvrdené', value: 'CONFIRMED' },
  { label: 'Dokončené', value: 'COMPLETED' },
  { label: 'Zrušené', value: 'CANCELLED' },
  { label: 'Neprišiel', value: 'NO_SHOW' },
];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function ReservationsPage() {
  const [date, setDate] = useState(toDateStr(new Date()));
  const [statusFilter, setStatusFilter] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (statusFilter) params.set('status', statusFilter);
      params.set('pageSize', '50');

      const res = await fetch(`/api/reservations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json() as { reservations?: Reservation[]; total?: number };
      setReservations(data.reservations ?? []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [date, statusFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = async (id: string, status: ReservationStatus) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchReservations();
    } catch (err) {
      console.error('Failed to update reservation:', err);
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'PENDING').length,
    confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
    completed: reservations.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.h1}>Rezervácie</h1>
        <input
          type="date"
          className={styles.datePicker}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Celkom</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Čakajú</span>
        </div>
        <div className={`${styles.statCard} ${styles.statConfirmed}`}>
          <span className={styles.statValue}>{stats.confirmed}</span>
          <span className={styles.statLabel}>Potvrdené</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCompleted}`}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Dokončené</span>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`${styles.filterBtn} ${statusFilter === f.value ? styles.filterActive : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reservations table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>Načítavanie...</div>
        ) : reservations.length === 0 ? (
          <div className={styles.empty}>Žiadne rezervácie na {date}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Čas</th>
                <th>Hosť</th>
                <th>Telefón</th>
                <th>Hostia</th>
                <th>Stôl</th>
                <th>Požiadavky</th>
                <th>Stav</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className={styles[`row${r.status}` as keyof typeof styles]}>
                  <td className={styles.time}>{r.time}</td>
                  <td>
                    <div className={styles.guest}>
                      <span className={styles.guestName}>{r.name}</span>
                      <span className={styles.guestEmail}>{r.email}</span>
                    </div>
                  </td>
                  <td className={styles.phone}>{r.phone}</td>
                  <td className={styles.guestCount}>{r.guests}</td>
                  <td>
                    {r.table ? `${r.table.zone} #${r.table.number}` : '—'}
                  </td>
                  <td className={styles.requests}>
                    {r.specialRequests || '—'}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge${r.status}` as keyof typeof styles]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.confirmBtn}`}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, 'CONFIRMED')}
                        >
                          Potvrdiť
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, 'CANCELLED')}
                        >
                          Zrušiť
                        </button>
                      </>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.completeBtn}`}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, 'COMPLETED')}
                        >
                          Dokončiť
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.noshowBtn}`}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, 'NO_SHOW')}
                        >
                          Neprišiel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
