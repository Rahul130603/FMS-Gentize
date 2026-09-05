import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import BarChartCard from '../../components/charts/BarChartCard';
import { SkeletonCards } from '../../components/common/Skeleton';
import { metaApi, reportApi } from '../../api/reportApi';
import { formatHours } from '../../utils/formatters';
import { CATEGORY_LABELS } from '../../constants';
import { Users, CheckCircle2, Hourglass, Clock } from 'lucide-react';

export default function EmployeeReport() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { metaApi.employees().then((res) => setEmployees(res.data)); }, []);

  useEffect(() => {
    if (!employeeId) { setReport(null); return; }
    setLoading(true);
    reportApi.employeeReport(employeeId).then((res) => setReport(res.data)).finally(() => setLoading(false));
  }, [employeeId]);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Employee Report' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Employee Report</h1>

      <div className="card p-4 mb-5 max-w-md">
        <label className="label">Select Employee</label>
        <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">Choose an employee…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
          ))}
        </select>
      </div>

      {!employeeId && <EmptyState icon={Users} title="Select an employee to view their report" />}
      {loading && <SkeletonCards count={4} />}

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <StatCard label="Total Queries" value={report.summary.total_queries} icon={Users} />
            <StatCard label="Resolved" value={report.summary.resolved_count} icon={CheckCircle2} tone="green" />
            <StatCard label="Pending" value={report.summary.pending_count} icon={Hourglass} tone="amber" />
            <StatCard label="Avg. Resolution Time" value={formatHours(report.summary.avg_resolution_hours)} icon={Clock} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Repeated Categories</h3>
              {report.repeatedCategories.length === 0 ? <EmptyState title="No categories yet" /> : (
                <ul className="space-y-2">
                  {report.repeatedCategories.map((c) => (
                    <li key={c.category} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{CATEGORY_LABELS[c.category] || c.category}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Most Affected ISBN</h3>
              {report.mostAffectedIsbns.length === 0 ? <EmptyState title="No ISBN data yet" /> : (
                <ul className="space-y-2">
                  {report.mostAffectedIsbns.map((i) => (
                    <li key={i.isbn} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 font-mono">{i.isbn}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{i.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <BarChartCard
              title="Monthly Activity (last 12 months)"
              data={report.monthlyActivity.map((m) => ({ name: m.month, count: m.count }))}
              bars={[{ key: 'count', label: 'Queries' }]}
            />
            <BarChartCard
              title="Yearly Activity"
              data={report.yearlyActivity.map((y) => ({ name: String(y.year), count: y.count }))}
              bars={[{ key: 'count', label: 'Queries' }]}
            />
          </div>
        </>
      )}
    </div>
  );
}
