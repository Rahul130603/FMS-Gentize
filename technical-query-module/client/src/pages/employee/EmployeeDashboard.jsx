import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, CheckCircle2, XCircle, Flame, Clock, Hourglass, RotateCcw, ListChecks, Bell, PlusCircle } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCards } from '../../components/common/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useNotifications } from '../../hooks/useNotifications';
import { technicalQueryApi } from '../../api/technicalQueryApi';
import { formatHours, formatRelative } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = useAsync(() => technicalQueryApi.myDashboard().then((r) => r.data), []);
  const { items: notifications, markRead } = useNotifications();

  const openNotification = async (n) => {
    if (!n.is_read) await markRead(n.id);
    navigate(`/technical-query/my-queries/${n.query_id}`);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query' }, { label: 'Dashboard' }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Welcome, {user?.name?.split(' ')[0]}</h1>
        <button className="btn-primary" onClick={() => navigate('/technical-query/raise')}>
          <PlusCircle size={15} /> Raise New Query
        </button>
      </div>

      {loading && <SkeletonCards count={7} />}
      {error && <div className="card p-6 text-sm text-red-600">{error}</div>}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Raised" value={data.total_queries} icon={ListChecks} onClick={() => navigate('/technical-query/my-queries')} />
          <StatCard label="Open" value={data.open_count} icon={Inbox} tone="blue" onClick={() => navigate('/technical-query/my-queries')} />
          <StatCard label="Resolved" value={data.resolved_count} icon={CheckCircle2} tone="green" onClick={() => navigate('/technical-query/my-queries')} />
          <StatCard label="Closed" value={data.closed_count} icon={XCircle} tone="slate" onClick={() => navigate('/technical-query/my-queries')} />
          <StatCard label="Pending" value={data.pending_count} icon={Hourglass} tone="amber" />
          <StatCard label="Urgent" value={data.urgent_count} icon={Flame} tone="red" />
          <StatCard label="Reopened" value={data.reopened_count} icon={RotateCcw} tone="red" />
          <StatCard label="Avg. Resolution Time" value={formatHours(data.avg_resolution_hours)} icon={Clock} />
        </div>
      )}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-1.5">
          <Bell size={15} /> Recent Notifications
        </h3>
        {notifications.length === 0 ? (
          <EmptyState title="Nothing yet" description="You'll see updates here when an admin acts on one of your queries." />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => openNotification(n)}
                className={`w-full text-left flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  n.is_read
                    ? 'border-gray-200 dark:border-slate-800'
                    : 'border-blue-200 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/5'
                }`}
              >
                {!n.is_read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                <div className={n.is_read ? 'pl-3.5' : ''}>
                  <p className="text-gray-700 dark:text-gray-200">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
