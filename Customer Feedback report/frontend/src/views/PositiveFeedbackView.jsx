import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Download, ThumbsUp, Star, Calendar, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

export default function PositiveFeedbackView({ onSelectIsbn, onOpenExportModal }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPositive = async () => {
    setLoading(true);
    try {
      const res = await api.getPositiveFeedback({ search, limit: 50 });
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to load positive feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositive();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPositive();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            <span>Positive Feedback &amp; Appreciation Showcase</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore customer commendations, typography compliments, binder praises, and high-quality deliveries.
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export Positive Report
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search positive appreciations, ISBN, book title, customer..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Search Appreciations
          </button>
        </form>
      </div>

      {/* Grid of Appreciation Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading appreciation records...
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No positive feedback records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 rounded-2xl p-5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    {item.feedback_number}
                  </span>
                  <StarRating rating={item.rating} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => onSelectIsbn(item.isbn)}
                  className="text-xs font-mono text-slate-400 hover:text-emerald-600 hover:underline block mt-0.5"
                >
                  ISBN: {item.isbn}
                </button>

                <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  "{item.comment}"
                </p>

                {item.appreciation_message && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
                    <strong>Highlight:</strong> {item.appreciation_message}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {item.customer_name || 'Anonymous'}{item.customer_company ? ` (${item.customer_company})` : ''}</span>
                <span>{item.submitted_at?.substring(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

