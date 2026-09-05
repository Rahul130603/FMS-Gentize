import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import KpiCard from '../components/KpiCard';
import ProjectTable from '../components/ProjectTable';
import ProjectDetailModal from '../components/ProjectDetailModal';

interface CompletionData {
  completedProjects: number;
  deliveredBeforeDueDate: number;
  deliveredOnTime: number;
  deliveredLate: number;
  averageDeliveryDays: number;
  averageDelayDays: number;
  averageCompletionPercentage: number;
  items: Project[];
}

export default function CompletionReportPage() {
  const [data, setData] = useState<CompletionData | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => api.get('/reports/completion').then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  if (!data) return <div className="skeleton" style={{ height: 200 }} />;

  return (
    <div>
      <div className="section-title">Completion Report</div>
      <div className="kpi-grid">
        <KpiCard label="Completed Projects" value={data.completedProjects} />
        <KpiCard label="Delivered Before Due" value={data.deliveredBeforeDueDate} color="#16a34a" />
        <KpiCard label="Delivered On Time" value={data.deliveredOnTime} color="#2563eb" />
        <KpiCard label="Delivered Late" value={data.deliveredLate} color="#ef4444" />
        <KpiCard label="Avg Delivery Time (days)" value={data.averageDeliveryDays} />
        <KpiCard label="Avg Delay (days)" value={data.averageDelayDays} />
        <KpiCard label="Avg Completion %" value={`${data.averageCompletionPercentage}%`} />
      </div>
      <div className="card">
        <ProjectTable projects={data.items} onOpen={(p) => setOpenId(p.id)} columns="compact" />
      </div>
      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
    </div>
  );
}
