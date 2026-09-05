import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import ProjectTable from '../components/ProjectTable';
import ExportButtons from '../components/ExportButtons';
import ProjectDetailModal from '../components/ProjectDetailModal';

const OPTIONS = [3, 7, 15, 30];

export default function UpcomingPage() {
  const [days, setDays] = useState(7);
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/reports/upcoming', { params: { days } }).then((res) => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  return (
    <div>
      <div className="section-title">Upcoming Due Report</div>
      <div className="tabs">
        {OPTIONS.map((d) => (
          <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>Next {d} Days</button>
        ))}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
          <ExportButtons params={{ days }} scope="upcoming" />
        </div>
        <ProjectTable projects={items} loading={loading} onOpen={(p) => setOpenId(p.id)} />
      </div>
      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
    </div>
  );
}
