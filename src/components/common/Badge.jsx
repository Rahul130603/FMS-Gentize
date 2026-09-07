import React from 'react';

/**
 * Status Badge Component with dot indicator and accessible contrast
 */
export function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['completed', 'published', 'delivered', 'done'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (['in progress', 'in production', 'active'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500 animate-pulse';
  } else if (['review', 'under review', 'pending review'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (['ready for assignment', 'awaiting assignment'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/80';
    dotColor = 'bg-purple-500';
  } else if (['assigned'].includes(normalized)) {
    styles = 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
    dotColor = 'bg-cyan-500';
  } else if (['new'].includes(normalized)) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    dotColor = 'bg-indigo-500';
  } else if (['on hold', 'blocked', 'paused'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (['not started'].includes(normalized)) {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles} ${sizeClasses} font-medium tracking-tight shadow-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

/**
 * Priority Badge
 */
export function PriorityBadge({ priority, size = 'md' }) {
  const p = (priority || '').toLowerCase();
  
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (p === 'high' || p === 'urgent') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  } else if (p === 'medium') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
  } else if (p === 'low') {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${styles} ${sizeClasses} uppercase tracking-wider font-semibold`}
    >
      {priority || 'Normal'}
    </span>
  );
}

/**
 * Stage Badge / Chip
 */
export function StageBadge({ stage }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
      {stage}
    </span>
  );
}

/**
 * Project Format / Type Badge
 */
export function FormatBadge({ format }) {
  let color = 'bg-sky-50 text-sky-700 border-sky-200';
  const fmt = (format || '').toUpperCase();
  if (fmt.includes('EPUB')) color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (fmt.includes('PDF')) color = 'bg-rose-50 text-rose-700 border-rose-200';
  if (fmt.includes('XML')) color = 'bg-amber-50 text-amber-700 border-amber-200';
  if (fmt.includes('ACCESSIBILITY') || fmt.includes('A11Y')) color = 'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      {format}
    </span>
  );
}
