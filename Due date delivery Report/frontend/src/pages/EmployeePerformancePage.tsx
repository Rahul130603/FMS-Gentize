import React, { useEffect, useState } from 'react';
import api from '../lib/api';

interface Row {
  employeeId: number;
  employeeName: string;
  assignedProjects: number;
  completedProjects: number;
  pendingProjects: number;
  overdueProjects: number;
  averageCompletionTime: number;
  averageDelay: number;
  completionRate: number;
  avgHealthScore: number;
}

export default function EmployeePerformancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { api.get('/reports/employee-performance').then((r) => setRows(r.data)); }, []);

  return (
    <div>
      <div className="section-title">Employee Performance Report</div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Assigned</th><th>Completed</th><th>Pending</th><th>Overdue</th>
              <th>Avg Completion Time (d)</th><th>Avg Delay (d)</th><th>Completion Rate</th><th>Avg Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.employeeId}>
                <td style={{ fontWeight: 600 }}>{r.employeeName}</td>
                <td>{r.assignedProjects}</td>
                <td>{r.completedProjects}</td>
                <td>{r.pendingProjects}</td>
                <td style={{ color: r.overdueProjects > 0 ? '#ef4444' : undefined, fontWeight: r.overdueProjects > 0 ? 600 : undefined }}>{r.overdueProjects}</td>
                <td>{r.averageCompletionTime}</td>
                <td>{r.averageDelay}</td>
                <td>{r.completionRate}%</td>
                <td>{r.avgHealthScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">No employee data available.</div>}
      </div>
    </div>
  );
}
