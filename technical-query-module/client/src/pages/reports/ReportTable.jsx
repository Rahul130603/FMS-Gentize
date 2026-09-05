import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useTechnicalQueries } from '../../hooks/useTechnicalQueries';
import { metaApi, reportApi } from '../../api/reportApi';
import { CATEGORIES, PRIORITIES, STATUSES, CATEGORY_LABELS } from '../../constants';
import { formatDateShort } from '../../utils/formatters';

const YEARS = Array.from({ length: 6 }).map((_, i) => new Date().getFullYear() - i);

export default function ReportTable() {
  const navigate = useNavigate();
  const [lookups, setLookups] = useState({ departments: [], admins: [] });
  const [employees, setEmployees] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); // 'filtered' | 'complete'

  const { filters, updateFilters, setPage, setSort, data, meta, loading, error } = useTechnicalQueries();

  useEffect(() => {
    metaApi.lookups().then((res) => setLookups(res.data)).catch(() => {});
    metaApi.employees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const columns = [
    { key: 'query_number', header: 'Query Number', sortable: true, className: 'font-medium text-brand-700 dark:text-brand-400' },
    { key: 'raised_by_name', header: 'Employee' },
    { key: 'department', header: 'Department' },
    { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
    { key: 'category', header: 'Category', render: (r) => CATEGORY_LABELS[r.category] || r.category },
    { key: 'priority', header: 'Priority', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'assigned_to_name', header: 'Admin', render: (r) => r.assigned_to_name || '—' },
    { key: 'created_at', header: 'Created', sortable: true, render: (r) => formatDateShort(r.created_at) },
    { key: 'resolved_at', header: 'Resolved', render: (r) => formatDateShort(r.resolved_at) },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Full Report' }]} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Technical Query Report</h1>
        <div className="flex gap-2">
          <ExportMenu label="Export Filtered Results" open={menuOpen === 'filtered'} onToggle={() => setMenuOpen(menuOpen === 'filtered' ? null : 'filtered')}
            onPick={(fmt) => reportApi.exportFiltered(fmt, filters)} />
          <ExportMenu label="Export Complete Report" open={menuOpen === 'complete'} onToggle={() => setMenuOpen(menuOpen === 'complete' ? null : 'complete')}
            onPick={(fmt) => reportApi.exportComplete(fmt)} />
        </div>
      </div>

      <div className="card mb-0">
        <div className="p-3 border-b border-gray-200 dark:border-slate-800">
          <SearchBox value={filters.search} onChange={(v) => updateFilters({ search: v })} placeholder="Search everything…" className="max-w-md" />
        </div>
        <FilterBar
          fields={[
            { key: 'employeeId', label: 'Employee', type: 'select', options: employees.map((e) => ({ value: e.id, label: e.name })) },
            { key: 'department', label: 'Department', type: 'select', options: lookups.departments.map((d) => ({ value: d.name, label: d.name })) },
            { key: 'isbn', label: 'ISBN', type: 'text' },
            { key: 'category', label: 'Category', type: 'select', options: CATEGORIES.map((c) => ({ value: c.code, label: c.label })) },
            { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((p) => ({ value: p.code, label: p.label })) },
            { key: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s.code, label: s.label })) },
            { key: 'adminId', label: 'Admin', type: 'select', options: lookups.admins.map((a) => ({ value: a.id, label: a.name })) },
            { key: 'year', label: 'Year', type: 'select', options: YEARS.map((y) => ({ value: y, label: y })) },
          ]}
          values={filters}
          onChange={updateFilters}
          onClear={() => updateFilters({ employeeId: '', department: '', isbn: '', category: '', priority: '', status: '', adminId: '', year: '', search: '' })}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          emptyTitle="No records match these filters"
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

function ExportMenu({ label, open, onToggle, onPick }) {
  return (
    <div className="relative">
      <button className="btn-outline" onClick={onToggle}>
        <Download size={15} /> {label} <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 card p-1 z-10" onMouseLeave={onToggle}>
          {['excel', 'csv', 'pdf'].map((fmt) => (
            <button key={fmt} className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 uppercase" onClick={() => { onPick(fmt); onToggle(); }}>
              {fmt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
