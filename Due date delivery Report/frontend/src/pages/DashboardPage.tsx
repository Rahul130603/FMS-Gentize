import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Project } from '../lib/types';
import KpiCard from '../components/KpiCard';
import ProjectTable from '../components/ProjectTable';
import ProjectDetailModal from '../components/ProjectDetailModal';

interface Dashboard {
  totalProjects: number;
  completedProjects: number;
  inProgress: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  dueThisMonth: number;
  overdueProjects: number;
  criticalProjects: number;
  avgCompletionPercentage: number;
  avgDelayDays: number;
  avgHealthScore: number;
  healthyProjects: number;
  atRiskProjects: number;
  criticalHealthProjects: number;
  missedMilestoneProjects: number;
}

interface Alerts {
  dueToday: Project[];
  dueTomorrow: Project[];
  overdue: Project[];
  criticalPriority: Project[];
  missedMilestones: Project[];
  lowHealth: Project[];
}

const ALERT_TABS: { key: keyof Alerts; label: string }[] = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'dueToday', label: 'Due Today' },
  { key: 'dueTomorrow', label: 'Due Tomorrow' },
  { key: 'criticalPriority', label: 'Critical Priority' },
  { key: 'missedMilestones', label: 'Missed Milestones' },
  { key: 'lowHealth', label: 'Low Health' },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<Dashboard | null>(null);
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [tab, setTab] = useState<keyof Alerts>('overdue');
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    api.get('/reports/dashboard').then((r) => setKpis(r.data));
    api.get('/reports/alerts').then((r) => setAlerts(r.data));
  };
  useEffect(() => { load(); }, []);

  if (!kpis || !alerts) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      <div className="section-title">Project Delivery Control Center</div>
      <div className="kpi-grid">
        <KpiCard label="Total Projects" value={kpis.totalProjects} />
        <KpiCard label="In Progress" value={kpis.inProgress} color="#2563eb" />
        <KpiCard label="Completed" value={kpis.completedProjects} color="#16a34a" />
        <KpiCard label="Due Today" value={kpis.dueToday} color="#ea580c" />
        <KpiCard label="Due Tomorrow" value={kpis.dueTomorrow} color="#f59e0b" />
        <KpiCard label="Due This Week" value={kpis.dueThisWeek} />
        <KpiCard label="Due This Month" value={kpis.dueThisMonth} />
        <KpiCard label="Overdue" value={kpis.overdueProjects} color="#ef4444" />
        <KpiCard label="Critical Priority" value={kpis.criticalProjects} color="#dc2626" />
        <KpiCard label="Avg Completion %" value={`${kpis.avgCompletionPercentage}%`} />
        <KpiCard label="Avg Delay (days)" value={kpis.avgDelayDays} />
        <KpiCard label="Avg Health Score" value={kpis.avgHealthScore} />
        <KpiCard label="Healthy Projects" value={kpis.healthyProjects} color="#16a34a" />
        <KpiCard label="At Risk" value={kpis.atRiskProjects} color="#f97316" />
        <KpiCard label="Critical Health" value={kpis.criticalHealthProjects} color="#ef4444" />
        <KpiCard label="Missed Milestones" value={kpis.missedMilestoneProjects} color="#ef4444" />
      </div>

      <div className="section-title">Delivery Alerts</div>
      <div className="tabs">
        {ALERT_TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label} ({alerts[t.key].length})
          </button>
        ))}
      </div>
      <div className="card">
        <ProjectTable projects={alerts[tab]} onOpen={(p) => setOpenId(p.id)} columns="compact" />
      </div>

      {openId && <ProjectDetailModal projectId={openId} onClose={() => setOpenId(null)} onUpdated={load} />}
    </div>
  );
}
