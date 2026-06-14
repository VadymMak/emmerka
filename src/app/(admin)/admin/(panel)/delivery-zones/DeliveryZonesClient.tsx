'use client';

import { useState } from 'react';
import type { DeliveryZone } from '@prisma/client';
import styles from './delivery-zones.module.css';

interface Props {
  zones: DeliveryZone[];
}

export default function DeliveryZonesClient({ zones: initial }: Props) {
  const [zones, setZones] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fee: '',
    minOrder: '',
    estimatedMin: '',
    estimatedMax: '',
    active: true,
  });

  const buildBody = () => ({
    name: formData.name,
    fee: parseFloat(formData.fee) || 0,
    minOrder: parseFloat(formData.minOrder) || 0,
    estimatedMin: parseInt(formData.estimatedMin) || 30,
    estimatedMax: parseInt(formData.estimatedMax) || 60,
    active: formData.active,
  });

  const resetForm = () =>
    setFormData({ name: '', fee: '', minOrder: '', estimatedMin: '', estimatedMax: '', active: true });

  const handleCreate = async () => {
    const res = await fetch('/api/admin/delivery-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    });
    if (res.ok) {
      const zone = await res.json();
      setZones([...zones, zone]);
      resetForm();
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/admin/delivery-zones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    });
    if (res.ok) {
      const updated = await res.json();
      setZones(zones.map((z) => (z.id === id ? updated : z)));
      setEditing(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/delivery-zones/${id}`, { method: 'DELETE' });
    if (res.ok) setZones(zones.filter((z) => z.id !== id));
  };

  const startEdit = (zone: DeliveryZone) => {
    setEditing(zone.id);
    setFormData({
      name: zone.name,
      fee: String(zone.fee),
      minOrder: String(zone.minOrder),
      estimatedMin: String(zone.estimatedMin),
      estimatedMax: String(zone.estimatedMax),
      active: zone.active,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Зони доставки</h1>
        <p className={styles.subtitle}>Управління зонами, тарифами та часом доставки</p>
      </div>

      <div className={styles.form}>
        <h2 className={styles.formTitle}>{editing ? 'Редагувати зону' : 'Нова зона'}</h2>
        <div className={styles.fields}>
          <input
            className={styles.input}
            placeholder="Назва зони"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Вартість (€)"
            type="number"
            step="0.01"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Мін. замовлення (€)"
            type="number"
            step="0.01"
            value={formData.minOrder}
            onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Мін. час доставки (хв)"
            type="number"
            value={formData.estimatedMin}
            onChange={(e) => setFormData({ ...formData, estimatedMin: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Макс. час доставки (хв)"
            type="number"
            value={formData.estimatedMax}
            onChange={(e) => setFormData({ ...formData, estimatedMax: e.target.value })}
          />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Активна
          </label>
        </div>
        <div className={styles.actions}>
          {editing ? (
            <>
              <button className={styles.btnSave} onClick={() => handleUpdate(editing)}>
                Зберегти
              </button>
              <button className={styles.btnCancel} onClick={() => { setEditing(null); resetForm(); }}>
                Скасувати
              </button>
            </>
          ) : (
            <button className={styles.btnCreate} onClick={handleCreate}>
              Додати зону
            </button>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {zones.length === 0 ? (
          <p className={styles.empty}>Зони ще не створені</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Назва</th>
                <th>Вартість</th>
                <th>Мін. замовлення</th>
                <th>Час доставки</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className={!zone.active ? styles.inactive : ''}>
                  <td>{zone.name}</td>
                  <td>{zone.fee === 0 ? 'Безкоштовно' : `€${zone.fee.toFixed(2)}`}</td>
                  <td>{zone.minOrder ? `€${zone.minOrder.toFixed(2)}` : '—'}</td>
                  <td>{zone.estimatedMin}–{zone.estimatedMax} хв</td>
                  <td>
                    <span className={zone.active ? styles.badgeActive : styles.badgeInactive}>
                      {zone.active ? 'Активна' : 'Вимкнена'}
                    </span>
                  </td>
                  <td className={styles.rowActions}>
                    <button className={styles.btnEdit} onClick={() => startEdit(zone)}>✏️</button>
                    <button className={styles.btnDelete} onClick={() => handleDelete(zone.id)}>🗑️</button>
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
