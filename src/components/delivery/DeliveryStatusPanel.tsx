import React, { useEffect, useState } from 'react';
import api from '../../lib/delivery/api';

interface DeliveredRow {
  id: number;
  isbn?: string;
  book_title: string;
  project_number: string;
  due_date?: string;
  actual_delivery?: string;
  onTime: boolean;
}

interface NotDeliveredRow {
  id: number;
  isbn?: string;
  book_title: string;
  project_number: string;
  due_date?: string;
  remaining_days: number | null;
  due_label: string;
  due_color: string;
}

export default function DeliveryStatusPanel({ onOpen }: { onOpen: (id: number) => void }) {
  const [delivered, setDelivered] = useState<DeliveredRow[]>([]);
  const [notDelivered, setNotDelivered] = useState<NotDeliveredRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/delivery-status').then((r) => {
      setDelivered(r.data.delivered);
      setNotDelivered(r.data.notDelivered);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 160, marginBottom: 20 }} />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#16a34a' }}>✅ Delivered (by ISBN)</span>
          <span className="badge" style={{ background: '#16a34a18', color: '#16a34a' }}>{delivered.length}</span>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {delivered.length === 0 ? (
            <div className="empty-state">No projects delivered yet.</div>
          ) : (
            <table>
              <thead><tr><th>ISBN</th><th>Book Title</th><th>Delivered On</th></tr></thead>
              <tbody>
                {delivered.map((d) => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(d.id)}>
                    <td>{d.isbn || '—'}</td>
                    <td>{d.book_title} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{d.project_number}</span></td>
                    <td style={{ color: d.onTime ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>{d.actual_delivery || '—'}{!d.onTime && ' (late)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#ef4444' }}>⏳ Not Delivered (by ISBN)</span>
          <span className="badge" style={{ background: '#ef444418', color: '#ef4444' }}>{notDelivered.length}</span>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {notDelivered.length === 0 ? (
            <div className="empty-state">Everything has been delivered.</div>
          ) : (
            <table>
              <thead><tr><th>ISBN</th><th>Book Title</th><th>Due Date</th><th>Time Remaining</th></tr></thead>
              <tbody>
                {notDelivered.map((d) => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(d.id)}>
                    <td>{d.isbn || '—'}</td>
                    <td>{d.book_title} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{d.project_number}</span></td>
                    <td>{d.due_date || '—'}</td>
                    <td style={{ color: d.due_color, fontWeight: 600 }}>{d.due_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
