import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Paperclip } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useTechnicalQueries } from '../../hooks/useTechnicalQueries';
import { CATEGORIES, PRIORITIES, STATUSES, CATEGORY_LABELS } from '../../constants';
import { formatDateShort } from '../../utils/formatters';

export default function MyQueries() {
  const navigate = useNavigate();
  const { filters, updateFilters, setPage, setSort, data, meta, loading, error } = useTechnicalQueries();

  const columns = [
    { key: 'query_number', header: 'Query Number', sortable: true, className: 'font-medium text-brand-700 dark:text-brand-400' },
    { key: 'subject', header: 'Subject', className: 'max-w-xs truncate' },
    { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
    { key: 'category', header: 'Category', render: (r) => CATEGORY_LABELS[r.category] || r.category },
    { key: 'priority', header: 'Priority', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'assigned_to_name', header: 'Assigned Admin', render: (r) => r.assigned_to_name || <span className="text-gray-400">Unassigned</span> },
    { key: 'created_at', header: 'Created', sortable: true, render: (r) => formatDateShort(r.created_at) },
    { key: 'updated_at', header: 'Updated', sortable: true, render: (r) => formatDateShort(r.updated_at) },
    {
      key: 'attachment_count', header: '', render: (r) => r.attachment_count > 0 && (
        <span className="flex items-center gap-1 text-xs text-gray-400"><Paperclip size={12} /> {r.attachment_count}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: 'Technical Query' }, { label: 'My Technical Queries' }]} />
        <button className="btn-primary mb-4" onClick={() => navigate('/technical-query/raise')}>
          <PlusCircle size={15} /> Raise New Query
        </button>
      </div>

      <div className="card mb-0">
        <div className="p-3 border-b border-gray-200 dark:border-slate-800">
          <SearchBox value={filters.search} onChange={(v) => updateFilters({ search: v })} placeholder="Search by query number, ISBN, subject…" className="max-w-md" />
        </div>
        <FilterBar
          fields={[
            { key: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s.code, label: s.label })) },
            { key: 'category', label: 'Category', type: 'select', options: CATEGORIES.map((c) => ({ value: c.code, label: c.label })) },
            { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((p) => ({ value: p.code, label: p.label })) },
            { key: 'isbn', label: 'ISBN', type: 'text' },
          ]}
          values={filters}
          onChange={updateFilters}
          onClear={() => updateFilters({ status: '', category: '', priority: '', isbn: '', search: '' })}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          emptyTitle="You haven't raised any technical queries yet"
          emptyDescription="Click 'Raise New Query' to report a technical issue."
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={setSort}
          onRowClick={(row) => navigate(`/technical-query/my-queries/${row.id}`)}
          pagination={{ ...meta, onPageChange: setPage }}
        />
      </div>
    </div>
  );
}
