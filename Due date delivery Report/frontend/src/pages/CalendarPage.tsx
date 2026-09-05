import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import ProjectTable from '../components/ProjectTable';
import ProjectDetailModal from '../components/ProjectDetailModal';

interface CalendarData {
  today: Project[];
  tomorrow: Project[];
  next3Days: Project[];
  next7Days: Project[];
  next15Days: Project[];
  next30Days: Project[];
  byDay: Record<string, Project[]>;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth());

  const load = () => api.get('/reports/calendar').then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  if (!data) return <div className="skeleton" style={{ height: 300 }} />;

  const cells = buildMonthGrid(year, month);
  const todayStr = now.toISOString().slice(0, 10);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="section-title">Due Date Calendar</div>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[
          ['Today', data.today.length],
          ['Tomorrow', data.tomorrow.length],
          ['Next 3 Days', data.next3Days.length],
          ['Next 7 Days', data.next7Days.length],
          ['Next 15 Days', data.next15Days.length],
          ['Next 30 Days', data.next30Days.length],
        ].map(([label, val]) => (
          <div key={label as string} className="card kpi-card">
            <div className="label">{label}</div>
            <div className="value">{val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{monthLabel(year, month)}</div>
        <div className="calendar-grid">
          {weekdays.map((w) => <div key={w} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="calendar-cell" style={{ visibility: 'hidden' }} />;
            const key = d.toISOString().slice(0, 10);
            const dayProjects = data.byDay[key] || [];
            return (
              <div key={i} className={`calendar-cell${key === todayStr ? ' today' : ''}`}>
                <div className="day-num">{d.getDate()}</div>
                {dayProjects.slice(0, 3).map((p) => (
                  <span key={p.id} className="calendar-chip" onClick={() => setOpenId(p.id)} title={p.book_title}>{p.book_title}</span>
                ))}
                {dayProjects.length > 3 && (
                  <span className="calendar-chip" style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => setSelectedDay(key)}>
                    +{dayProjects.length - 3} more
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div>
          <div className="section-title">Projects due {selectedDay}</div>
          <div className="card">
            <ProjectTable projects={data.byDay[selectedDay] || []} onOpen={(p) => setOpenId(p.id)} columns="compact" />
          </div>
        </div>
      )}

      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
    </div>
  );
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
}
