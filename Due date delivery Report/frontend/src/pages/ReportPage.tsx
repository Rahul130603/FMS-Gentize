import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../lib/hooks';
import FilterBar, { Filters } from '../components/FilterBar';
import ProjectTable from '../components/ProjectTable';
import Pagination from '../components/Pagination';
import ExportButtons from '../components/ExportButtons';
import ProjectDetailModal from '../components/ProjectDetailModal';
import NewProjectModal from '../components/NewProjectModal';
import DeliveryStatusPanel from '../components/DeliveryStatusPanel';

export default function ReportPage() {
  const { user } = useAuth();
  const users = useUsers();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusRefreshKey, setStatusRefreshKey] = useState(0);

  const limit = 20;
  const canCreate = user?.role === 'Admin' || user?.role === 'Manager';

  const load = () => {
    setLoading(true);
    api
      .get('/projects', { params: { ...filters, page, limit } })
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
    setStatusRefreshKey((k) => k + 1);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters, page]);

  return (
    <div>
      <div className="section-title">
        Due Date Delivery Report
        {canCreate && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>}
      </div>

      <DeliveryStatusPanel key={statusRefreshKey} onOpen={setOpenId} />

      <FilterBar filters={filters} onChange={(patch) => { setFilters({ ...filters, ...patch }); setPage(1); }} users={users} />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
          <ExportButtons params={filters as any} />
        </div>
        <ProjectTable projects={items} loading={loading} onOpen={(p) => setOpenId(p.id)} />
        <Pagination page={page} limit={limit} total={total} onChange={setPage} />
      </div>

      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
      {showCreate && <NewProjectModal users={users} onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
