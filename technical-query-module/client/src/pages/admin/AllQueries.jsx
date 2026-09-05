import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Paperclip } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useTechnicalQueries } from '../../hooks/useTechnicalQueries';
import { metaApi } from '../../api/reportApi';
import { reportApi } from '../../api/reportApi';
import { CATEGORIES, PRIORITIES, STATUSES, CATEGORY_LABELS, STATUS_LABELS } from '../../constants';
import { formatDateShort } from '../../utils/formatters';

const YEARS = Array.from({ length: 6 }).map((_, i) => new Date().getFullYear() - i);
const MONTHS = [
  '01 - Jan', '02 - Feb', '03 - Mar', '04 - Apr', '05 - May', '06 - Jun',
  '07 - Jul', '08 - Aug', '09 - Sep', '10 - Oct', '11 - Nov', '12 - Dec',
].map((label, i) => ({ value: String(i + 1), label }));

export default function AllQueries() {
  const { status: statusParam } = useParams();
  const navigate = useNavigate();
  const [lookups, setLookups] = useState({ departments: [], admins: [] });
  const [employees, setEmployees] = useState([]);

  const { filters, updateFilters, setPage, setSort, data, meta, loading, error } = useTechnicalQueries(
    statusParam ? { status: statusParam } : {}
  );

  useEffect(() => {
    updateFilters({ status: statusParam || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam]);

  useEffect(() => {
    metaApi.lookups().then((res) => setLookups(res.data)).catch(() => {});
    metaApi.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const columns = [
    { key: 'query_number', header: 'Query Number', sortable: true, className: 'font-medium text-brand-700 dark:text-brand-400' },
    { key: 'raised_by_name', header: 'Employee' },
    { key: 'raised_by_role', header: 'Role', render: (r) => <span className="capitalize">{r.raised_by_role?.replace('_', ' ')}</span> },
    { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
    { key: 'subject', header: 'Subject', className: 'max-w-xs truncate' },
    { key: 'category', header: 'Category', render: (r) => CATEGORY_LABELS[r.category] || r.category },
    { key: 'priority', header: 'Priority', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'assigned_to_name', header: 'Assigned To', render: (r) => r.assigned_to_name || <span className="text-gray-400">Unassigned</span> },
    { key: 'created_at', header: 'Created', sortable: true, render: (r) => formatDateShort(r.created_at) },
    { key: 'updated_at', header: 'Updated', sortable: true, render: (r) => formatDateShort(r.updated_at) },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-2">
          {r.attachment_count > 0 && <span className="flex items-center gap-1 text-xs text-gray-400"><Paperclip size={12} />{r.attachment_count}</span>}
          <button className="text-xs text-brand-700 dark:text-brand-400 hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/admin/technical-queries/detail/${r.id}`); }}>
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Queries', to: '/admin/technical-queries' }, { label: statusParam ? STATUS_LABELS[statusParam] : 'All Queries' }]} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          {statusParam ? `${STATUS_LABELS[statusParam]} Queries` : 'All Technical Queries'}
        </h1>
        <button className="btn-outline" onClick={() => reportApi.exportFiltered('excel', filters)}>
          <Download size={15} /> Export Excel
        </button>
      </div>

      <div className="card mb-0">
        <div className="p-3 border-b border-gray-200 dark:border-slate-800">
          <SearchBox value={filters.search} onChange={(v) => updateFilters({ search: v })} placeholder="Search by query number, ISBN, employee, subject…" className="max-w-md" />
        </div>
        <FilterBar
          fields={[
            { key: 'employeeId', label: 'Employee', type: 'select', options: employees.map((e) => ({ value: e.id, label: e.name })) },
            { key: 'department', label: 'Department', type: 'select', options: lookups.departments.map((d) => ({ value: d.name, label: d.name })) },
            { key: 'category', label: 'Category', type: 'select', options: CATEGORIES.map((c) => ({ value: c.code, label: c.label })) },
            { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((p) => ({ value: p.code, label: p.label })) },
            ...(statusParam ? [] : [{ key: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s.code, label: s.label })) }]),
            { key: 'adminId', label: 'Assigned Admin', type: 'select', options: lookups.admins.map((a) => ({ value: a.id, label: a.name })) },
            { key: 'isbn', label: 'ISBN', type: 'text' },
            { key: 'year', label: 'Year', type: 'select', options: YEARS.map((y) => ({ value: y, label: y })) },
            { key: 'month', label: 'Month', type: 'select', options: MONTHS },
          ]}
          values={filters}
          onChange={updateFilters}
          onClear={() => updateFilters({
            employeeId: '', department: '', category: '', priority: '', adminId: '', isbn: '', year: '', month: '', search: '',
            ...(statusParam ? {} : { status: '' }),
          })}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          emptyTitle="No technical queries match these filters"
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={setSort}
          onRowClick={(row) => navigate(`/admin/technical-queries/detail/${row.id}`)}
          pagination={{ ...meta, onPageChange: setPage }}
        />
      </div>
    </div>
  );
}
