import React from 'react';
import { Project } from '../../lib/delivery/types';
import { PriorityBadge, StatusBadge, HealthBadge, DueBadge } from './Badges';

export default function ProjectTable({
  projects,
  loading,
  onOpen,
  columns = 'full',
}: {
  projects: Project[];
  loading?: boolean;
  onOpen: (p: Project) => void;
  columns?: 'full' | 'compact';
}) {
  if (loading) {
    return (
      <div className="table-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 40, margin: '8px 16px' }} />
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return <div className="empty-state">No projects match the current filters.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project # / Title</th>
            <th>ISBN</th>
            <th>Client</th>
            <th>Type</th>
            <th>Department</th>
            <th>Employee</th>
            <th>Manager</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Completion</th>
            <th>Health</th>
            <th>Risk</th>
            <th>Due Date</th>
            {columns === 'full' && <th>Actual Delivery</th>}
            <th>Delay</th>
            <th>Missed Milestones</th>
            {columns === 'full' && <th>Smart Recommendation</th>}
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{p.book_title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{p.project_number}</div>
              </td>
              <td>{p.isbn || '—'}</td>
              <td>{p.client_name || '—'}</td>
              <td>{p.project_type}</td>
              <td>{p.department || '—'}</td>
              <td>{p.assignedEmployee?.name || '—'}</td>
              <td>{p.managerUser?.name || '—'}</td>
              <td><PriorityBadge value={p.priority} /></td>
              <td><StatusBadge value={p.status} /></td>
              <td>{p.workflow_stage}</td>
              <td style={{ minWidth: 120 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ flex: 1 }}><div style={{ width: `${p.completion_percentage}%` }} /></div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{p.completion_percentage}%</span>
                </div>
              </td>
              <td><HealthBadge category={p.health.category} /> <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.health.score}</span></td>
              <td>{p.health.risk}</td>
              <td>
                <div>{p.due_date || '—'}</div>
                <DueBadge label={p.health.daysRemaining.label} color={p.health.daysRemaining.color} />
              </td>
              {columns === 'full' && <td>{p.actual_delivery || '—'}</td>}
              <td>{p.delay_days > 0 ? `${p.delay_days}d` : '—'}</td>
              <td>{p.health.missedMilestones.count > 0 ? <span style={{ color: '#ef4444', fontWeight: 600 }}>{p.health.missedMilestones.count}</span> : '—'}</td>
              {columns === 'full' && <td style={{ whiteSpace: 'normal', maxWidth: 220 }}>{p.recommendations[0]}</td>}
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-sm" onClick={() => onOpen(p)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
