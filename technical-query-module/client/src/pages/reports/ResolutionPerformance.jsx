import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import DataTable from '../../components/common/DataTable';
import BarChartCard from '../../components/charts/BarChartCard';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import { formatHours } from '../../utils/formatters';

export default function ResolutionPerformance() {
  const { data, loading, error } = useAsync(() => reportApi.resolutionPerformance().then((r) => r.data), []);

  const columns = [
    { key: 'assigned_to_name', header: 'Admin' },
    { key: 'assigned_count', header: 'Assigned Queries' },
    { key: 'resolved_count', header: 'Resolved Queries' },
    { key: 'pending_count', header: 'Pending Queries' },
    { key: 'avg_resolution_hours', header: 'Avg. Resolution Time', render: (r) => formatHours(r.avg_resolution_hours) },
    { key: 'fastest_resolution_hours', header: 'Fastest Resolution', render: (r) => formatHours(r.fastest_resolution_hours) },
    { key: 'slowest_resolution_hours', header: 'Slowest Resolution', render: (r) => formatHours(r.slowest_resolution_hours) },
  ];

  const chartData = (data || []).map((d) => ({ name: d.assigned_to_name, resolved: Number(d.resolved_count), pending: Number(d.pending_count) }));

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Resolution Performance' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Resolution Performance</h1>

      <div className="mb-5">
        <BarChartCard
          title="Resolved vs Pending by Admin"
          data={chartData}
          bars={[{ key: 'resolved', label: 'Resolved', color: '#059669' }, { key: 'pending', label: 'Pending', color: '#d97706' }]}
        />
      </div>

      <DataTable columns={columns} rows={data} loading={loading} error={error} emptyTitle="No assigned queries yet" />
    </div>
  );
}
