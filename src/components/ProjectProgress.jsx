import React from 'react';
import { BookMarked } from 'lucide-react';
import { calculateProjectProgress } from '../utils/statusCalculations';

export default function ProjectProgress({ records }) {
  const projectMetrics = calculateProjectProgress(records);

  const getBarColor = (perc) => {
    if (perc >= 80) return '#10b981';
    if (perc >= 65) return '#3b82f6';
    if (perc >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookMarked size={17} className="text-blue-600" />
          Project Progress
        </h3>
        <span className="card-badge-info">Publisher Distribution</span>
      </div>

      <div className="project-progress-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '14px' }}>
        {projectMetrics.map((proj) => (
          <div key={proj.projectName} className="role-progress-item">
            <div className="role-progress-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="role-label">{proj.projectName}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>({proj.employeeCount} Emps)</span>
              </div>

              <div className="role-ratio-perc">
                <span className="role-counts">
                  {proj.completed}/{proj.allocated} done • {proj.pending} pend
                </span>
                <span className="role-percent" style={{ color: getBarColor(proj.completionRate) }}>
                  {proj.completionRate}%
                </span>
              </div>
            </div>

            <div className="progress-track" title={`${proj.projectName}: ${proj.completed} of ${proj.allocated} completed (${proj.completionRate}%)`}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, proj.completionRate)}%`,
                  backgroundColor: getBarColor(proj.completionRate)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
