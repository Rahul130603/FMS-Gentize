import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, FileText, Download, ChevronDown } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { SkeletonTable } from '../../components/common/Skeleton';
import QueryTimeline from '../../components/technicalQuery/QueryTimeline';
import CommentSection from '../../components/technicalQuery/CommentSection';
import AttachmentList from '../../components/technicalQuery/AttachmentList';
import AdminActionsPanel from '../../components/technicalQuery/AdminActionsPanel';
import IsbnHistoryPanel from '../../components/technicalQuery/IsbnHistoryPanel';
import { useQueryDetail } from '../../hooks/useQueryDetail';
import { reportApi } from '../../api/reportApi';
import { CATEGORY_LABELS } from '../../constants';
import { formatDate, formatHours } from '../../utils/formatters';

export default function QueryDetailsAdmin() {
  const { id } = useParams();
  const { data, loading, error, refresh } = useQueryDetail(id);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  if (loading) return <SkeletonTable rows={10} cols={2} />;
  if (error) return <div className="card p-6 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Technical Queries', to: '/admin/technical-queries' },
        { label: data.query_number },
      ]} />

      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{data.subject}</h1>
          <p className="text-sm text-gray-400">{data.query_number} · Raised {formatDate(data.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={data.priority} />
          <StatusBadge status={data.status} />
          <div className="relative">
            <button className="btn-outline" onClick={() => setExportMenuOpen((o) => !o)}>
              <Download size={15} /> Export <ChevronDown size={13} />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 card p-1 z-10" onMouseLeave={() => setExportMenuOpen(false)}>
                {['pdf', 'excel', 'csv'].map((fmt) => (
                  <button
                    key={fmt}
                    className="w-full text-left px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 uppercase"
                    onClick={() => { reportApi.exportQuery(data.id, fmt, data.query_number); setExportMenuOpen(false); }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: employee info, description, attachments */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Employee Information</h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <Row label="Employee" value={data.raised_by_name} />
              <Row label="Role" value={<span className="capitalize">{data.raised_by_role?.replace('_', ' ')}</span>} />
              <Row label="Department" value={data.department} />
              <Row label="ISBN" value={data.isbn || '—'} />
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-1.5">
              <FileText size={15} /> Subject &amp; Description
            </h3>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{data.subject}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.description}</p>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-1.5">
              <Paperclip size={15} /> Attachments
            </h3>
            <AttachmentList queryId={data.id} queryNumber={data.query_number} attachments={data.attachments} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Timeline</h3>
            <QueryTimeline events={data.timeline} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Comments</h3>
            <CommentSection queryId={data.id} comments={data.comments} onCommentAdded={refresh} />
          </div>

          {data.isbn && <IsbnHistoryPanel isbn={data.isbn} excludeId={data.id} />}
        </div>

        {/* RIGHT: status/priority/assignment summary + admin actions */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Summary</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="Status" value={<StatusBadge status={data.status} />} />
              <Row label="Priority" value={<PriorityBadge priority={data.priority} />} />
              <Row label="Category" value={CATEGORY_LABELS[data.category] || data.category} />
              <Row label="Assigned Admin" value={data.assigned_to_name || 'Not yet assigned'} />
              <Row label="Created" value={formatDate(data.created_at)} />
              <Row label="Updated" value={formatDate(data.updated_at)} />
              {data.resolved_at && <Row label="Resolved" value={formatDate(data.resolved_at)} />}
              {data.closed_at && <Row label="Closed" value={formatDate(data.closed_at)} />}
              <Row label="Resolution Time" value={formatHours(data.resolutionHours)} />
              {data.reopen_count > 0 && <Row label="Reopened" value={`${data.reopen_count} time(s)`} />}
            </dl>
          </div>

          <AdminActionsPanel query={data} onChanged={refresh} />

          {data.admin_notes && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Admin Notes (internal)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{data.admin_notes}</p>
            </div>
          )}

          {data.resolution_notes && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Resolution Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{data.resolution_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 items-center">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-gray-800 dark:text-gray-100 font-medium text-right">{value}</dd>
    </div>
  );
}
