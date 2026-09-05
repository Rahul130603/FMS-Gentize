import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Download, ThumbsDown, Star, Calendar, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

export default function NegativeFeedbackView({ onSelectIsbn, onOpenExportModal }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [criticCategory, setCriticCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNegative = async () => {
    setLoading(true);
    try {
      const res = await api.getNegativeFeedback({ search, criticCategory, limit: 50 });
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to load negative feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegative();
  }, [criticCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNegative();
  };

  const categories = [
    'Binding Quality',
    'Cover Alignment',
    'Spine Alignment',
    'Trim Margin',
    'Color Shift',
    'Page Bleed',
    'Delayed Delivery'
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <span>Critic &amp; File Defect Intelligence Analysis</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze customer grievances, spine shifts, trim margin errors, binding failures, and color shifts.
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export Critic Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search criticism text, ISBN, book title, customer..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={criticCategory}
              onChange={(e) => setCriticCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Defect Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            Filter Issues
          </button>
        </form>
      </div>

      {/* Grid of Critic Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading criticism records...
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No negative / critic feedback records found for this criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 rounded-2xl p-5 shadow-sm hover:border-rose-300 dark:hover:border-rose-800/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                    {item.feedback_number}
                  </span>
                  <StarRating rating={item.rating} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => onSelectIsbn(item.isbn)}
                  className="text-xs font-mono text-slate-400 hover:text-rose-600 hover:underline block mt-0.5"
                >
                  ISBN: {item.isbn}
                </button>

                {item.critic_category && (
                  <span className="mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                    Defect Type: {item.critic_category}
                  </span>
                )}

                <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  "{item.comment}"
                </p>

                {item.critic_message && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-300">
                    <strong>Root Cause Note:</strong> {item.critic_message}
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

