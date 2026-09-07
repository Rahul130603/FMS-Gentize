import React, { useEffect, useState } from 'react';
import api from '../lib/delivery/api';
import { Project } from '../lib/delivery/types';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../lib/delivery/hooks';
import FilterBar, { Filters } from '../components/delivery/FilterBar';
import ProjectTable from '../components/delivery/ProjectTable';
import Pagination from '../components/delivery/Pagination';
import ExportButtons from '../components/delivery/ExportButtons';
import ProjectDetailModal from '../components/delivery/ProjectDetailModal';
import NewProjectModal from '../components/delivery/NewProjectModal';
import DeliveryStatusPanel from '../components/delivery/DeliveryStatusPanel';
import '../styles/delivery.css';

export function DueDateDeliveryPage() {
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
  const canCreate = !user?.role || user?.role === 'Admin' || user?.role === 'Manager' || String(user?.role).includes('Lead');

  const load = () => {
    setLoading(true);
    api
      .get('/projects', { params: { ...filters, page, limit } })
      .then((res: any) => {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
    setStatusRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    load();
  }, [filters, page]);

  return (
    <div className="space-y-6 delivery-report-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Due Date Delivery Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time milestone tracking, delivery predictions, and SLA compliance monitoring.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            onClick={() => setShowCreate(true)}
          >
            + New Project
          </button>
        )}
      </div>

      <DeliveryStatusPanel key={statusRefreshKey} onOpen={setOpenId} />

      <FilterBar
        filters={filters}
        onChange={(patch) => {
          setFilters({ ...filters, ...patch });
          setPage(1);
        }}
        users={users}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex justify-end p-3 border-b border-slate-100">
          <ExportButtons params={filters as any} />
        </div>
        <ProjectTable projects={items} loading={loading} onOpen={(p) => setOpenId(p.id)} />
        <Pagination page={page} limit={limit} total={total} onChange={setPage} />
      </div>

      {openId && (
        <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />
      )}
      {showCreate && (
        <NewProjectModal users={users} onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </div>
  );
}

export default DueDateDeliveryPage;
