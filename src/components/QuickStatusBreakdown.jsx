import React from 'react';
import { Activity } from 'lucide-react';

export default function QuickStatusBreakdown({ breakdown }) {
  const statusItems = [
    { key: 'On Track', label: 'On Track', count: breakdown['On Track'] || 0, color: 'var(--status-ontrack-dot)' },
    { key: 'In Progress', label: 'In Progress', count: breakdown['In Progress'] || 0, color: 'var(--status-wip-dot)' },
    { key: 'Delayed', label: 'Delayed', count: breakdown['Delayed'] || 0, color: 'var(--status-delayed-dot)' },
    { key: 'No Activity', label: 'No Activity', count: breakdown['No Activity'] || 0, color: 'var(--status-noactivity-dot)' },
    { key: 'Overdue', label: 'Overdue', count: breakdown['Overdue'] || 0, color: 'var(--status-overdue-dot)' },
    { key: 'Rework', label: 'Rework', count: breakdown['Rework'] || 0, color: 'var(--status-rework-dot)' },
    { key: 'Completed', label: 'Completed', count: breakdown['Completed'] || 0, color: 'var(--status-completed-dot)' }
  ];

  return (
    <div className="status-breakdown-bar">
      <div className="breakdown-label-title">
        <Activity size={15} className="text-blue-600" />
        <span>Employee Status Pulse:</span>
      </div>

      <div className="status-breakdown-items">
        {statusItems.map((item) => (
          <div key={item.key} className="breakdown-pill">
            <span 
              className="breakdown-dot" 
              style={{ backgroundColor: item.color }} 
              aria-hidden="true" 
            />
            <span>{item.label}</span>
            <span className="breakdown-count">{item.count} {item.count === 1 ? 'Emp' : 'Emps'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
