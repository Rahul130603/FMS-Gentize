import React, { useEffect, useState } from 'react';
import api from '../lib/api';

interface Row {
  managerId: number;
  managerName: string;
  projectsManaged: number;
  completed: number;
  pending: number;
  delayed: number;
  overdue: number;
  averageTeamPerformance: number;
  averageDeliveryDays: number;
  averageHealthScore: number;
}

export default function ManagerPerformancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { api.get('/reports/manager-performance').then((r) => setRows(r.data)); }, []);

  return (
    <div>
      <div className="section-title">Manager Performance Report</div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Manager</th><th>Managed</th><th>Completed</th><th>Pending</th><th>Delayed</th><th>Overdue</th>
              <th>Avg Team Perf.</th><th>Avg Delivery (d)</th><th>Avg Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.managerId}>
                <td style={{ fontWeight: 600 }}>{r.managerName}</td>
                <td>{r.projectsManaged}</td>
                <td>{r.completed}</td>
                <td>{r.pending}</td>
                <td>{r.delayed}</td>
                <td style={{ color: r.overdue > 0 ? '#ef4444' : undefined, fontWeight: r.overdue > 0 ? 600 : undefined }}>{r.overdue}</td>
                <td>{r.averageTeamPerformance}%</td>
                <td>{r.averageDeliveryDays}</td>
                <td>{r.averageHealthScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">No manager data available.</div>}
      </div>
    </div>
  );
}
