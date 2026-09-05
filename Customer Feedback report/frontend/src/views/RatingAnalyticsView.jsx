import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Star,
  Calendar,
  Layers,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';
import DonutChart from '../components/charts/DonutChart';
import RatingDistributionChart from '../components/charts/RatingDistributionChart';
import BarChart from '../components/charts/BarChart';
import TrendLineChart from '../components/charts/TrendLineChart';

export default function RatingAnalyticsView({ onOpenExportModal }) {
  const [interval, setInterval] = useState('monthly');
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedInterval = interval) => {
    setLoading(true);
    try {
      const [ratingRes, trendRes, sumRes] = await Promise.all([
        api.getRatingAnalytics(),
        api.getTrends(selectedInterval, true),
        api.getSummary()
      ]);

      if (ratingRes.success) setAnalytics(ratingRes.data);
      if (trendRes.success) setTrends(trendRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(interval);
  }, [interval]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Rating Analytics &amp; Multi-Period Trend Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare customer satisfaction metrics, period-over-period delta, and defect categories across years.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Interval Selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs">
            {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((intv) => (
              <button
                key={intv}
                onClick={() => setInterval(intv)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                  interval === intv
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {intv}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(interval)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Calculating statistical distribution and period comparisons...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Level Benchmark Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Global Average Rating
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {analytics?.averageRating || '0.0'} <span className="text-lg text-slate-400 font-normal">/ 5.0</span>
                </div>
                <div className="mt-1">
                  <StarRating rating={analytics?.averageRating || 0} size="sm" />
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-500">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Customer Submissions
                </span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {analytics?.totalFeedback || 0}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Preserved in permanent database
                </span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Net Quality Sentiment
                </span>
                <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary?.totalFeedback ? Math.round((summary.positiveFeedback / summary.totalFeedback) * 100) : 0}%
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Positive acceptance ratio
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row: Bar Volume + Rating Trend Area + Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Line / Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Average Rating Trajectory ({interval.toUpperCase()})
                  </h3>
                  <p className="text-xs text-slate-500">Historical quality score movement over time</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                  Target: &ge; 4.50★
                </span>
              </div>
              <TrendLineChart data={trends?.data || []} height={200} />
            </div>

            {/* Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Star Tier Breakdown
              </h3>
              <p className="text-xs text-slate-500 mb-5">Percentage share by 1-5 star ratings</p>
              <RatingDistributionChart
                distribution={analytics?.distribution || []}
                totalCount={analytics?.totalFeedback || 0}
              />
            </div>
          </div>

          {/* Period Over Period Growth & Comparison Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Period-over-Period Performance Matrix
                </h3>
                <p className="text-xs text-slate-500">Compare feedback volume and rating shifts against preceding periods</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                Mode: {interval}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Total Volume</th>
                    <th className="px-4 py-3">Positive Notes</th>
                    <th className="px-4 py-3">Critic Grievances</th>
                    <th className="px-4 py-3">Avg Rating</th>
                    <th className="px-4 py-3">Rating Shift</th>
                    <th className="px-4 py-3">Volume Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trends?.data?.map((row, i) => {
                    const isGrowthPos = row.growthRate >= 0;
                    const isRatingPos = row.ratingDelta >= 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {row.period}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold">{row.total_count}</td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold font-mono">{row.positive_count}</td>
                        <td className="px-4 py-3 text-rose-600 font-semibold font-mono">{row.negative_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono">{row.average_rating}★</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {i === 0 ? (
                            <span className="text-slate-400">&mdash;</span>
                          ) : (
                            <span
                              className={`inline-flex items-center font-bold ${
                                isRatingPos ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isRatingPos ? '+' : ''}{row.ratingDelta}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {i === 0 ? (
                            <span className="text-slate-400">&mdash;</span>
                          ) : (
                            <span
                              className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[11px] ${
                                isGrowthPos ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isGrowthPos ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                              {row.growthRate}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Root-Cause Critic Defect Categories */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Critic Root Cause Defect Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Frequent quality criticism categories flagged across customer deliveries
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics?.criticCategories?.map((c) => (
                <div
                  key={c.category}
                  className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20"
                >
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-1">
                    {c.category}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-xl font-bold font-mono text-rose-900 dark:text-rose-200">
                      {c.count} Issue{c.count > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Avg {c.avg_rating}★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

