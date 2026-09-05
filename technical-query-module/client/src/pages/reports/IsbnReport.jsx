import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatCard from '../../components/common/StatCard';
import SearchBox from '../../components/common/SearchBox';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { SkeletonCards } from '../../components/common/Skeleton';
import { reportApi } from '../../api/reportApi';
import { formatDateShort } from '../../utils/formatters';
import { CATEGORY_LABELS } from '../../constants';
import { BookOpenText, Layers, RotateCcw, Calendar } from 'lucide-react';

export default function IsbnReport() {
  const [isbn, setIsbn] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (value) => {
    if (!value) { setReport(null); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportApi.isbnReport(value);
      setReport(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'ISBN Report' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">ISBN Report</h1>

      <div className="card p-4 mb-5 max-w-md">
        <label className="label">Search ISBN</label>
        <SearchBox value={isbn} onChange={(v) => { setIsbn(v); runSearch(v); }} placeholder="e.g. 978-93-5234-101-2" />
      </div>

      {!searched && <EmptyState icon={BookOpenText} title="Search for an ISBN to view its complete technical history" />}
      {loading && <SkeletonCards count={3} />}

      {report && !loading && (
        report.summary.total_queries === '0' || report.summary.total_queries === 0 ? (
          <EmptyState title={`No technical queries found for ISBN "${isbn}"`} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
              <StatCard label="Total Queries" value={report.summary.total_queries} icon={BookOpenText} />
              <StatCard label="Distinct Categories" value={report.summary.distinct_categories} icon={Layers} />
              <StatCard label="Reopened" value={report.summary.reopened_count} icon={RotateCcw} tone="red" />
            </div>

            <div className="card p-5 mb-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Repeated Issues by Category</h3>
              <ul className="space-y-2">
                {report.repeatedIssues.map((i) => (
                  <li key={i.category} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{CATEGORY_LABELS[i.category] || i.category}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{i.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1.5">
                <Calendar size={15} /> Complete History &amp; Resolution Timeline
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Every query raised for this ISBN across all employees — who raised it, who it was
                assigned to, who resolved it, and when.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-200 dark:border-slate-800">
                      <th className="py-2 pr-4 font-medium">Query</th>
                      <th className="py-2 pr-4 font-medium">Category</th>
                      <th className="py-2 pr-4 font-medium">Raised By</th>
                      <th className="py-2 pr-4 font-medium">Department</th>
                      <th className="py-2 pr-4 font-medium">Assigned Developer</th>
                      <th className="py-2 pr-4 font-medium">Resolved By</th>
                      <th className="py-2 pr-4 font-medium">Created At</th>
                      <th className="py-2 pr-4 font-medium">Resolved At</th>
                      <th className="py-2 pr-4 font-medium">Priority</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.history.map((h) => (
                      <tr key={h.id} className="border-b border-gray-100 dark:border-slate-800/60">
                        <td className="py-2 pr-4">
                          <p className="font-medium text-gray-800 dark:text-gray-100">{h.query_number}</p>
                          <p className="text-xs text-gray-400 max-w-[220px] truncate">{h.subject}</p>
                        </td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{CATEGORY_LABELS[h.category] || h.category}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{h.raised_by_name}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{h.department || '—'}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{h.assigned_to_name || 'Unassigned'}</td>
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{h.resolved_by_name || '—'}</td>
                        <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{formatDateShort(h.created_at)}</td>
                        <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{h.resolved_at ? formatDateShort(h.resolved_at) : '—'}</td>
                        <td className="py-2 pr-4"><PriorityBadge priority={h.priority} /></td>
                        <td className="py-2 pr-4"><StatusBadge status={h.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
