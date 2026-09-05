import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SearchBox from '../../components/common/SearchBox';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import HighlightSnippet from '../../components/common/HighlightSnippet';
import { searchApi } from '../../api/reportApi';
import { CATEGORY_LABELS } from '../../constants';
import { formatDateShort } from '../../utils/formatters';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const runSearch = async (value, pageNum = 1) => {
    setTerm(value);
    setPage(pageNum);
    if (!value || value.trim().length < 2) { setResult(null); return; }
    setLoading(true);
    try {
      const res = await searchApi.search({ q: value, page: pageNum, pageSize: 15 });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'query_number', header: 'Query Number', className: 'font-medium text-brand-700 dark:text-brand-400' },
    { key: 'subject', header: 'Subject' },
    { key: 'snippet', header: 'Matched Snippet', className: 'text-gray-500 max-w-sm truncate italic', render: (r) => <HighlightSnippet text={r.snippet} /> },
    { key: 'category', header: 'Category', render: (r) => CATEGORY_LABELS[r.category] || r.category },
    { key: 'priority', header: 'Priority', render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'raised_by_name', header: 'Employee' },
    { key: 'assigned_to_name', header: 'Admin', render: (r) => r.assigned_to_name || '—' },
    { key: 'created_at', header: 'Created', render: (r) => formatDateShort(r.created_at) },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Global Search' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-1">Global Search</h1>
      <p className="text-sm text-gray-500 mb-4">
        Search across query numbers, ISBNs, employees, subjects, descriptions, categories, admins, comments and resolution notes — the entire technical knowledge base, going back years.
      </p>

      <div className="card p-4 mb-5">
        <SearchBox value={term} onChange={(v) => runSearch(v, 1)} placeholder="Search anything…" />
      </div>

      {!term && <EmptyState icon={Search} title="Start typing to search the entire technical query history" />}

      {term && (
        <DataTable
          columns={columns}
          rows={result?.data}
          loading={loading}
          emptyTitle={`No results found for "${term}"`}
          onRowClick={(row) => navigate(`/admin/technical-queries/detail/${row.id}`)}
          pagination={result?.meta ? { ...result.meta, onPageChange: (p) => runSearch(term, p) } : undefined}
        />
      )}
    </div>
  );
}
