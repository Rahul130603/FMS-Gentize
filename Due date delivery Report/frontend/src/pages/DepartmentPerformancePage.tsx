import React, { useEffect, useState } from 'react';
import api from '../lib/api';

interface Row {
  department: string;
  totalProjects: number;
  completed: number;
  pending: number;
  overdue: number;
  averageCompletion: number;
  averageDelay: number;
  averageHealthScore: number;
}

export default function DepartmentPerformancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { api.get('/reports/department-performance').then((r) => setRows(r.data)); }, []);

  return (
    <div>
      <div className="section-title">Department Performance Report</div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Department</th><th>Total</th><th>Completed</th><th>Pending</th><th>Overdue</th>
              <th>Avg Completion</th><th>Avg Delay (d)</th><th>Avg Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.department}>
                <td style={{ fontWeight: 600 }}>{r.department}</td>
                <td>{r.totalProjects}</td>
                <td>{r.completed}</td>
                <td>{r.pending}</td>
                <td style={{ color: r.overdue > 0 ? '#ef4444' : undefined, fontWeight: r.overdue > 0 ? 600 : undefined }}>{r.overdue}</td>
                <td>{r.averageCompletion}%</td>
                <td>{r.averageDelay}</td>
                <td>{r.averageHealthScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">No department data available.</div>}
      </div>
    </div>
  );
}
