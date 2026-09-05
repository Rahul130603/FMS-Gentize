import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Star,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Download,
  ArrowLeft,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';
import DonutChart from '../components/charts/DonutChart';
import RatingDistributionChart from '../components/charts/RatingDistributionChart';

export default function IsbnDeepDiveView({ initialIsbn = '', onOpenExportModal }) {
  const [isbnInput, setIsbnInput] = useState(initialIsbn || '9781234567890');
  const [activeIsbn, setActiveIsbn] = useState(initialIsbn || '9781234567890');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick suggestion chips
  const suggestedIsbns = [
    { isbn: '9781234567890', title: 'Advanced File Processing Workflows' },
    { isbn: '9780132350884', title: 'Clean Code' },
    { isbn: '9780596517748', title: 'JavaScript: The Good Parts' },
    { isbn: '9780201616224', title: 'The Pragmatic Programmer' },
    { isbn: '9781449331818', title: 'Learning JavaScript Design Patterns' }
  ];

  const fetchIsbnReport = async (isbnToFetch) => {
    if (!isbnToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIsbnReport(isbnToFetch);
      if (res.success) {
        setReport(res.data);
        setActiveIsbn(isbnToFetch);
      }
    } catch (err) {
      setError(err.message || `No feedback history found for ISBN: ${isbnToFetch}`);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialIsbn) {
      setIsbnInput(initialIsbn);
      fetchIsbnReport(initialIsbn);
    } else {
      fetchIsbnReport(activeIsbn);
    }
  }, [initialIsbn]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIsbnReport(isbnInput);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>ISBN Lifetime Quality &amp; Feedback History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit complete multi-year customer feedback, reviews, appreciations, and criticism timeline for any book.
          </p>
        </div>

        {report && (
          <button
            onClick={() => onOpenExportModal(activeIsbn)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export ISBN Report
          </button>
        )}
      </div>

      {/* ISBN Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="Enter exact 13-digit ISBN (e.g. 9781234567890)..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
          >
            Search ISBN History
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold">Quick ISBNs:</span>
          {suggestedIsbns.map((item) => (
            <button
              key={item.isbn}
              type="button"
              onClick={() => {
                setIsbnInput(item.isbn);
                fetchIsbnReport(item.isbn);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                activeIsbn === item.isbn
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {item.isbn} ({item.title.substring(0, 15)}...)
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading ISBN deep-dive history and sentiment timeline...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <h4 className="font-bold text-base mb-1">ISBN Not Found</h4>
          <p className="text-xs">{error}</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Main Book Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  ISBN: {report.isbn}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {report.totalFeedback} Historical Feedbacks
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">{report.bookTitle}</h3>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>First Feedback: <strong>{report.firstFeedbackDate?.substring(0, 10)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Latest Feedback: <strong>{report.latestFeedbackDate?.substring(0, 10)}</strong></span>
                </div>
              </div>
            </div>

            {/* Overall Rating Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center shrink-0 min-w-[160px]">
              <div className="text-3xl font-black text-amber-400 font-mono">
                {report.averageRating}
              </div>
              <div className="flex justify-center my-1">
                <StarRating rating={report.averageRating} size="md" showValue={false} />
              </div>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                Average Score
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Feedback</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{report.totalFeedback}</p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Positive Count</span>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-1">{report.positiveCount}</p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">Critic / Negative</span>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 font-mono mt-1">{report.negativeCount}</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Satisfaction Rate</span>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono mt-1">
                {report.totalFeedback > 0 ? Math.round((report.positiveCount / report.totalFeedback) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Feedback Timeline & Sentiment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sentiment & Star Distribution */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sentiment Split</h4>
                <p className="text-xs text-slate-500 mb-4">Positive vs Critic proportion</p>
                <DonutChart positive={report.positiveCount} negative={report.negativeCount} size={150} />
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Rating Breakdown</h4>
                <p className="text-xs text-slate-500 mb-4">Ratings by star tier</p>
                <RatingDistributionChart
                  distribution={report.ratingDistribution}
                  totalCount={report.totalFeedback}
                />
              </div>
            </div>

            {/* Vertical Multi-Year Chronological Timeline */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Multi-Year Customer Quality Timeline
                  </h4>
                  <p className="text-xs text-slate-500">Chronological history from first delivery to present</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg">
                  {report.timeline?.length} Timeline Events
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {report.timeline?.map((event, idx) => {
                  const isPos = event.feedback_type === 'POSITIVE';
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          isPos ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'
                        }`}
                      />

                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                              {event.year}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {event.submitted_at?.substring(0, 10)}
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                              {event.feedback_number}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <StarRating rating={event.rating} size="sm" />
                          </div>
                        </div>

                        <p className="text-xs font-medium text-slate-900 dark:text-white mb-2">
                          "{event.comment}"
                        </p>

                        {event.appreciation_message && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300">
                            <strong>Appreciation:</strong> {event.appreciation_message}
                          </div>
                        )}

                        {event.critic_message && (
                          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-300">
                            <strong>Critic ({event.critic_category || 'Defect'}):</strong> {event.critic_message}
                          </div>
                        )}

                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>By: {event.customer_name || 'Anonymous'}{event.customer_company ? ` (${event.customer_company})` : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Comments List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              All Customer Comments on this ISBN
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.customerComments?.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <StarRating rating={c.rating} size="sm" />
                    <span className="text-[10px] text-slate-400 font-mono">{c.submittedAt?.substring(0, 10)}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {c.comment}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    &mdash; {c.customerName || 'Anonymous Customer'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

