import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import { formatDate } from '../../utils/formatters';

export default function ReopenedReport() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => reportApi.reopened().then((r) => r.data), []);

  const columns = [
    { key: 'query_number', header: 'Query Number', className: 'font-medium text-brand-700 dark:text-brand-400' },
    { key: 'subject', header: 'Subject', className: 'max-w-xs truncate' },
    { key: 'raised_by_name', header: 'Employee' },
    { key: 'assigned_to_name', header: 'Admin', render: (r) => r.assigned_to_name || '—' },
    { key: 'original_resolution_date', header: 'Original Resolution Date', render: (r) => formatDate(r.original_resolution_date) },
    { key: 'reopened_date', header: 'Reopened Date', render: (r) => formatDate(r.reopened_date) },
    { key: 'reopen_reason', header: 'Reason', className: 'max-w-xs truncate' },
    { key: 'current_status', header: 'Current Status', render: (r) => <StatusBadge status={r.current_status} /> },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Reopened Report' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Reopened Queries</h1>

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        emptyTitle="No queries have been reopened"
        onRowClick={(row) => navigate(`/admin/technical-queries/detail/${row.id}`)}
      />
    </div>
  );
}
