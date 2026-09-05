import React from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, FileText } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { SkeletonTable } from '../../components/common/Skeleton';
import QueryTimeline from '../../components/technicalQuery/QueryTimeline';
import CommentSection from '../../components/technicalQuery/CommentSection';
import AttachmentList from '../../components/technicalQuery/AttachmentList';
import IsbnHistoryPanel from '../../components/technicalQuery/IsbnHistoryPanel';
import { useQueryDetail } from '../../hooks/useQueryDetail';
import { CATEGORY_LABELS } from '../../constants';
import { formatDate, formatHours } from '../../utils/formatters';

export default function QueryDetailsEmployee() {
  const { id } = useParams();
  const { data, loading, error, refresh } = useQueryDetail(id);

  if (loading) return <SkeletonTable rows={8} cols={2} />;
  if (error) return <div className="card p-6 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Technical Query', to: '/technical-query/raise' },
        { label: 'My Technical Queries', to: '/technical-query/my-queries' },
        { label: data.query_number },
      ]} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{data.subject}</h1>
          <p className="text-sm text-gray-400">{data.query_number} · Raised {formatDate(data.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={data.priority} />
          <StatusBadge status={data.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-1.5">
              <FileText size={15} /> Description
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.description}</p>

            {data.info_requested_note && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-400">Admin requested more information</p>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">{data.info_requested_note}</p>
              </div>
            )}

            {data.resolution_notes && (
              <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-400">Resolution Notes</p>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 whitespace-pre-wrap">{data.resolution_notes}</p>
              </div>
            )}

            {data.admin_notes && (
              <div className="mt-4 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 p-3 text-sm">
                <p className="font-medium text-purple-800 dark:text-purple-400">Admin Notes</p>
                <p className="text-purple-700 dark:text-purple-300 mt-0.5 whitespace-pre-wrap">{data.admin_notes}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-1.5">
              <Paperclip size={15} /> Attachments
            </h3>
            <AttachmentList queryId={data.id} queryNumber={data.query_number} attachments={data.attachments} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Comments</h3>
            <CommentSection queryId={data.id} comments={data.comments} onCommentAdded={refresh} />
          </div>

          {data.isbn && <IsbnHistoryPanel isbn={data.isbn} excludeId={data.id} />}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Query Information</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="Category" value={CATEGORY_LABELS[data.category] || data.category} />
              <Row label="ISBN" value={data.isbn || '—'} />
              <Row label="Assigned Admin" value={data.assigned_to_name || 'Not yet assigned'} />
              <Row label="Created" value={formatDate(data.created_at)} />
              <Row label="Last Updated" value={formatDate(data.updated_at)} />
              {data.resolved_at && <Row label="Resolved" value={formatDate(data.resolved_at)} />}
              {data.resolutionHours !== null && data.resolutionHours !== undefined && (
                <Row label="Resolution Time" value={formatHours(data.resolutionHours)} />
              )}
              {data.reopen_count > 0 && <Row label="Reopened" value={`${data.reopen_count} time(s)`} />}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Status Timeline &amp; Activity Log</h3>
            <QueryTimeline events={data.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-gray-800 dark:text-gray-100 font-medium text-right">{value}</dd>
    </div>
  );
}
