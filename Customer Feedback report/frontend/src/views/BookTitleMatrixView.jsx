import React, { useState, useEffect } from 'react';
import { Search, Layers, BookOpen, Star, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

export default function BookTitleMatrixView({ onSelectIsbn }) {
  const [titles, setTitles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTitles = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.getBookTitleReport(query);
      if (res.success) {
        setTitles(res.data);
      }
    } catch (err) {
      console.error('Failed to load book title report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTitles('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTitles(search);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Book Title &amp; Multi-Edition Intelligence Report</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Group customer feedback across multiple editions, formats, reprints, and ISBNs for every book title.
          </p>
        </div>

        <button
          onClick={() => fetchTitles(search)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
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
              placeholder="Search by book title (e.g. Clean Code, Algorithms, Workflows)..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Search Titles
          </button>
        </form>
      </div>

      {/* Title Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading book title editions...
        </div>
      ) : titles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No matching book titles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {titles.map((book) => (
            <div
              key={book.title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {book.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <StarRating rating={book.averageRating} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {book.totalFeedback} Total Reviews
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {book.editionCount} Edition{book.editionCount > 1 ? 's' : ''}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {book.positiveCount} Positive
                  </span>
                  {book.negativeCount > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                      {book.negativeCount} Critic
                    </span>
                  )}
                </div>

                {/* ISBNs List */}
                <div className="space-y-1 mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Associated ISBNs:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {book.isbns?.map((isbn) => (
                      <button
                        key={isbn}
                        type="button"
                        onClick={() => onSelectIsbn(isbn)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-mono text-xs flex items-center gap-1 transition-colors"
                        title="Click to drill down into ISBN History"
                      >
                        <span>{isbn}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> First: {book.firstFeedback?.substring(0, 10)}
                </span>
                <span>Latest: {book.latestFeedback?.substring(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

