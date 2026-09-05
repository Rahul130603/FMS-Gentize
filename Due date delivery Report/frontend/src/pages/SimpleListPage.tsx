import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import ProjectTable from '../components/ProjectTable';
import ExportButtons from '../components/ExportButtons';
import ProjectDetailModal from '../components/ProjectDetailModal';

export default function SimpleListPage({ title, endpoint, scope, params }: { title: string; endpoint: string; scope: string; params?: Record<string, any> }) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get(endpoint, { params }).then((res) => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [endpoint, JSON.stringify(params)]);

  return (
    <div>
      <div className="section-title">{title}</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
          <ExportButtons params={params || {}} scope={scope} />
        </div>
        <ProjectTable projects={items} loading={loading} onOpen={(p) => setOpenId(p.id)} />
      </div>
      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
    </div>
  );
}
