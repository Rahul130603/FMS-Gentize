import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import LineChartCard from '../../components/charts/LineChartCard';
import { SkeletonCards } from '../../components/common/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { reportApi } from '../../api/reportApi';
import dayjs from 'dayjs';

const PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function TrendReport() {
  const [period, setPeriod] = useState('monthly');
  const { data, loading, error } = useAsync(() => reportApi.trend({ period }).then((r) => r.data), [period]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.current.map((row, idx) => ({
      name: dayjs(row.bucket_start).format(period === 'daily' || period === 'weekly' ? 'DD MMM' : period === 'yearly' ? 'YYYY' : 'MMM YY'),
      Current: row.total,
      Previous: data.previous[idx]?.total ?? 0,
      Resolved: row.resolved,
    }));
  }, [data, period]);

  const trend = data?.comparison?.percentChange;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-400';

  return (
    <div>
      <Breadcrumb items={[{ label: 'Technical Query Reports', to: '/reports/technical-queries' }, { label: 'Trend Report' }]} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Trend Report</h1>
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                period === p.value ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <SkeletonCards count={1} />}
      {error && <div className="card p-6 text-sm text-red-600">{error}</div>}

      {data && (
        <>
          <div className="card p-5 mb-5 flex flex-wrap items-center gap-8">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Period</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{data.comparison.currentTotal}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Previous Period</p>
              <p className="text-2xl font-semibold text-gray-500 dark:text-gray-400">{data.comparison.previousTotal}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
              <p className={`text-2xl font-semibold flex items-center gap-1 ${trendColor}`}>
                <TrendIcon size={20} /> {trend === null ? 'N/A' : `${Math.abs(trend)}%`}
              </p>
            </div>
          </div>

          <LineChartCard
            title={`Query Volume — ${PERIODS.find((p) => p.value === period)?.label} (Current vs Previous Period)`}
            data={chartData}
            lines={[
              { key: 'Current', label: 'Current Period', color: '#2563eb' },
              { key: 'Previous', label: 'Previous Period', color: '#94a3b8' },
              { key: 'Resolved', label: 'Resolved', color: '#059669' },
            ]}
          />
        </>
      )}
    </div>
  );
}
