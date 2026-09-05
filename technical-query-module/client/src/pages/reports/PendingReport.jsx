import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import BarChartCard from '../../components/charts/BarChartCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCards } from '../../components/common/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import { formatDateShort } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';

const BUCKET_LABELS = { '0-2': '0–2 Days', '3-7': '3–7 Days', '8-15': '8–15 Days', '15+': '15+ Days' };

export default function PendingReport() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => reportApi.pending().then((r) => r.data), []);

  const chartData = data ? Object.entries(data.buckets).map(([bucket, count]) => ({ name: BUCKET_LABELS[bucket], count })) : [];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Pending Report' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Pending / Aging Report</h1>

      {loading && <SkeletonCards count={2} />}
      {error && <div className="card p-6 text-sm text-red-600">{error}</div>}

      {data && (
        <>
          <div className="mb-5">
            <BarChartCard title="Pending Queries by Age" data={chartData} bars={[{ key: 'count', label: 'Queries', color: '#d97706' }]} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-red-500" /> Overdue Urgent &amp; High Priority Queries
            </h3>
            {data.overdueUrgent.length === 0 ? (
              <EmptyState title="No overdue urgent/high priority queries — great job!" />
            ) : (
              <div className="space-y-2">
                {data.overdueUrgent.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => navigate(`/admin/technical-queries/detail/${q.id}`)}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{q.query_number} — {q.subject}</p>
                      <p className="text-xs text-gray-400">
                        {q.raised_by_name} · Assigned to {q.assigned_to_name || 'Unassigned'} · Raised {formatDateShort(q.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-red-700 dark:text-red-400">{Math.floor(q.pending_days)} days pending</span>
                      <PriorityBadge priority={q.priority} />
                      <StatusBadge status={q.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
