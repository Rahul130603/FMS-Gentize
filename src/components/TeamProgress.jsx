import React from 'react';
import { Users2 } from 'lucide-react';
import { calculateTeamPerformance } from '../utils/statusCalculations';

export default function TeamProgress({ records }) {
  const teamMetrics = calculateTeamPerformance(records);

  const getBarColor = (perc) => {
    if (perc >= 80) return '#10b981'; // emerald
    if (perc >= 65) return '#3b82f6'; // blue
    if (perc >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose/red
  };

  return (
    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users2 size={17} className="text-blue-600" />
          Team Performance
        </h3>
        <span className="card-badge-info">Production Squads</span>
      </div>

      <div className="team-progress-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        {teamMetrics.map((team) => (
          <div key={team.teamName} className="role-progress-item">
            <div className="role-progress-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="role-label">{team.teamName}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>({team.employees} Emps)</span>
              </div>

              <div className="role-ratio-perc">
                <span className="role-counts">
                  {team.completed} / {team.allocated} files • {team.rework > 0 ? `${team.rework} rework` : '0 rework'}
                </span>
                <span className="role-percent" style={{ color: getBarColor(team.completionRate) }}>
                  {team.completionRate}%
                </span>
              </div>
            </div>

            <div className="progress-track" title={`${team.teamName}: ${team.completed} of ${team.allocated} files completed (${team.completionRate}%)`}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, team.completionRate)}%`,
                  backgroundColor: getBarColor(team.completionRate)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
