import React, { useMemo } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import PieChartCard from '../../components/charts/PieChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import LineChartCard from '../../components/charts/LineChartCard';
import { SkeletonCards } from '../../components/common/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import { CATEGORY_LABELS } from '../../constants';

export default function CategoryAnalytics() {
  const { data, loading, error } = useAsync(() => reportApi.categoryAnalytics().then((r) => r.data), []);

  const pieData = useMemo(() => (data?.totals || []).map((t) => ({ name: CATEGORY_LABELS[t.category] || t.category, value: t.total })), [data]);
  const barData = useMemo(() => (data?.totals || []).map((t) => ({ name: CATEGORY_LABELS[t.category] || t.category, resolved: t.resolved, pending: t.pending })), [data]);

  const lineData = useMemo(() => {
    if (!data?.monthlyTrend) return [];
    const months = [...new Set(data.monthlyTrend.map((r) => r.month))].sort();
    const categories = [...new Set(data.monthlyTrend.map((r) => r.category))];
    return months.map((month) => {
      const row = { name: month };
      categories.forEach((cat) => {
        const match = data.monthlyTrend.find((r) => r.month === month && r.category === cat);
        row[CATEGORY_LABELS[cat] || cat] = match ? match.count : 0;
      });
      return row;
    });
  }, [data]);

  const topCategories = useMemo(() => {
    if (!data?.totals) return [];
    return [...data.totals].sort((a, b) => b.total - a.total).slice(0, 5).map((t) => CATEGORY_LABELS[t.category] || t.category);
  }, [data]);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Category Analytics' }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Category Analytics</h1>

      {loading && <SkeletonCards count={2} />}
      {error && <div className="card p-6 text-sm text-red-600">{error}</div>}

      {data && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PieChartCard title="Query Distribution by Category" data={pieData} />
            <BarChartCard
              title="Resolved vs Pending by Category"
              data={barData}
              bars={[{ key: 'resolved', label: 'Resolved', color: '#059669' }, { key: 'pending', label: 'Pending', color: '#d97706' }]}
            />
          </div>
          <LineChartCard
            title="12-Month Trend — Top Categories"
            data={lineData}
            lines={topCategories.map((c) => ({ key: c, label: c }))}
          />
        </div>
      )}
    </div>
  );
}
