import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  ThumbsUp,
  ThumbsDown,
  Star,
  Calendar,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Download,
  ArrowRight,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import KpiCard from '../components/KpiCard';
import StarRating from '../components/StarRating';
import DonutChart from '../components/charts/DonutChart';
import RatingDistributionChart from '../components/charts/RatingDistributionChart';
import BarChart from '../components/charts/BarChart';

export default function ExecutiveSummaryView({ onSelectTab, onSelectIsbn, onOpenExportModal }) {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes] = await Promise.all([
        api.getSummary(),
        api.getTrends('monthly', true)
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success) setTrends(trendRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load executive summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dist = summary?.ratingDistribution || {};
  const periods = summary?.periods || {};

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Customer Feedback &amp; Critic Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Permanent multi-year customer satisfaction metrics, appreciation trends, and file defect analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Row 1: High Level Executive Stats (Total, Positive, Negative, Avg Rating) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Lifetime Feedback"
          value={summary?.totalFeedback || 0}
          subtitle="Permanently stored in database"
          icon={MessageSquareQuote}
          colorScheme="blue"
          onClick={() => onSelectTab('grid')}
        />
        <KpiCard
          title="Positive Feedback"
          value={summary?.positiveFeedback || 0}
          badge={`${summary?.totalFeedback ? Math.round((summary.positiveFeedback / summary.totalFeedback) * 100) : 0}% Satisfaction`}
          subtitle="Satisfied book deliveries"
          icon={ThumbsUp}
          colorScheme="emerald"
          onClick={() => onSelectTab('positive')}
        />
        <KpiCard
          title="Negative / Critic Feedback"
          value={summary?.negativeFeedback || 0}
          badge={`${summary?.totalFeedback ? Math.round((summary.negativeFeedback / summary.totalFeedback) * 100) : 0}% Issues`}
          subtitle="Quality review flagged"
          icon={ThumbsDown}
          colorScheme="rose"
          onClick={() => onSelectTab('negative')}
        />
        <KpiCard
          title="Average Rating"
          value={`${summary?.averageRating || '0.0'} / 5.0`}
          subtitle="Overall Quality Score"
          icon={Star}
          colorScheme="amber"
          onClick={() => onSelectTab('analytics')}
        />
      </div>

      {/* Row 2: Star Rating Counts (5★, 4★, 3★, 2★, 1★) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Rating Star Breakdown (1★ - 5★)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <KpiCard
            title="5-Star Feedback"
            value={dist.star5 || 0}
            subtitle="Exceptional Quality"
            icon={Star}
            colorScheme="emerald"
          />
          <KpiCard
            title="4-Star Feedback"
            value={dist.star4 || 0}
            subtitle="Good / Minor Notes"
            icon={Star}
            colorScheme="blue"
          />
          <KpiCard
            title="3-Star Feedback"
            value={dist.star3 || 0}
            subtitle="Average / Neutral"
            icon={Star}
            colorScheme="amber"
          />
          <KpiCard
            title="2-Star Feedback"
            value={dist.star2 || 0}
            subtitle="Quality Discrepancy"
            icon={Star}
            colorScheme="rose"
          />
          <KpiCard
            title="1-Star Feedback"
            value={dist.star1 || 0}
            subtitle="Severe Defect / Reject"
            icon={Star}
            colorScheme="rose"
          />
        </div>
      </div>

      {/* Row 3: Period Activity (This Week, This Month, This Year) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Recent Activity Timeline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Feedback This Week"
            value={periods.thisWeek || 0}
            subtitle="Last 7 days inbound"
            icon={Calendar}
            colorScheme="blue"
          />
          <KpiCard
            title="Feedback This Month"
            value={periods.thisMonth || 0}
            subtitle="Current calendar month"
            icon={Calendar}
            colorScheme="purple"
          />
          <KpiCard
            title="Feedback This Year"
            value={periods.thisYear || 0}
            subtitle="Annual production cycle"
            icon={Calendar}
            colorScheme="emerald"
          />
        </div>
      </div>

      {/* Row 4: Visual Analytics Highlights (Sentiment Donut + Star Distribution + Monthly Trend Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Donut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Customer Sentiment Distribution
          </h4>
          <p className="text-xs text-slate-500 mb-4">Positive appreciation vs constructive critic</p>
          <DonutChart
            positive={summary?.positiveFeedback || 0}
            negative={summary?.negativeFeedback || 0}
            size={160}
          />
        </div>

        {/* Rating Breakdown Bars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Quality Rating Distribution
          </h4>
          <p className="text-xs text-slate-500 mb-4">Proportion across 1 to 5 star scores</p>
          <RatingDistributionChart
            distribution={dist}
            totalCount={summary?.totalFeedback || 0}
          />
        </div>

        {/* Monthly Trend Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Feedback Trend
              </h4>
              <button
                onClick={() => onSelectTab('analytics')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                Full Analytics <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Historical monthly volume &amp; sentiment</p>
          </div>
          <BarChart data={trends?.data?.slice(-6) || []} height={150} />
        </div>
      </div>

      {/* Row 5: Top 10 Most Appreciated & Most Criticized Books Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Appreciated Books */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Most Appreciated Books
                </h4>
                <p className="text-xs text-slate-500">Ranked by positive feedback count &amp; rating</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('positive')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {summary?.topAppreciated?.map((book, idx) => (
              <div
                key={book.isbn}
                onClick={() => onSelectIsbn(book.isbn)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {book.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono">ISBN: {book.isbn}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <StarRating rating={book.average_rating} size="sm" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {book.positive_feedback} Positive Notes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Criticized Books */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Most Criticized Books
                </h4>
                <p className="text-xs text-slate-500">Requires production &amp; QC review</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('negative')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {summary?.topCriticized?.map((book, idx) => (
              <div
                key={book.isbn}
                onClick={() => onSelectIsbn(book.isbn)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-rose-300 dark:hover:border-rose-800 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      {book.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500 font-mono">ISBN: {book.isbn}</span>
                      {book.repeatedComplaints?.length > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                          {book.repeatedComplaints[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <StarRating rating={book.average_rating} size="sm" />
                  </div>
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {book.negativeFeedback} Critic Reports
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

