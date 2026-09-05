import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox, CheckCircle2, XCircle, AlertTriangle, Flame, Clock, Hourglass, RotateCcw, ListChecks,
} from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatCard from '../../components/common/StatCard';
import { SkeletonCards } from '../../components/common/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import { formatHours } from '../../utils/formatters';

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => reportApi.dashboard().then((r) => r.data), []);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports' }, { label: 'Dashboard' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Technical Query Reports</h1>

      {loading && <SkeletonCards count={9} />}
      {error && <div className="card p-6 text-sm text-red-600">{error}</div>}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard label="Total Queries" value={data.total_queries} icon={ListChecks} onClick={() => navigate('/admin/technical-queries')} />
          <StatCard label="Open" value={data.open_count} icon={Inbox} tone="blue" onClick={() => navigate('/admin/technical-queries/open')} />
          <StatCard label="Resolved" value={data.resolved_count} icon={CheckCircle2} tone="green" onClick={() => navigate('/admin/technical-queries/resolved')} />
          <StatCard label="Closed" value={data.closed_count} icon={XCircle} tone="slate" onClick={() => navigate('/admin/technical-queries/closed')} />
          <StatCard label="Urgent" value={data.urgent_count} icon={Flame} tone="red" />
          <StatCard label="High Priority" value={data.high_count} icon={AlertTriangle} tone="amber" />
          <StatCard label="Pending" value={data.pending_count} icon={Hourglass} tone="amber" />
          <StatCard label="Reopened" value={data.reopened_count} icon={RotateCcw} tone="red" onClick={() => navigate('/admin/technical-queries/reopened')} />
          <StatCard label="Avg. Resolution Time" value={formatHours(data.avg_resolution_hours)} icon={Clock} />
        </div>
      )}
    </div>
  );
}
