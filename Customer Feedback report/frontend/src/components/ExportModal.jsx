import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, CheckCircle2, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function ExportModal({ isOpen, onClose, defaultIsbn = '' }) {
  const [format, setFormat] = useState('excel');
  const [filterType, setFilterType] = useState(defaultIsbn ? 'isbn' : 'all');
  const [isbn, setIsbn] = useState(defaultIsbn);
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('9');
  const [feedbackType, setFeedbackType] = useState('');

  if (!isOpen) return null;

  const handleDownload = () => {
    const filters = {
      filterType,
      isbn: filterType === 'isbn' ? isbn : '',
      year: filterType === 'annual' || filterType === 'monthly' ? year : '',
      month: filterType === 'monthly' ? month : '',
      feedbackType
    };

    const url = api.getExportUrl(format, filters);
    
    if (format === 'pdf') {
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FMS_Feedback_Export_${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Intelligence Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate executive quality datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  format === 'excel'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Excel (XLSX/XML)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span>CSV Raw Data</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  format === 'pdf'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-5 h-5 text-rose-600" />
                <span>Printable PDF</span>
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Report Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'Entire Database History' },
                { id: 'isbn', label: 'Single ISBN Report' },
                { id: 'annual', label: 'Annual Report' },
                { id: 'monthly', label: 'Monthly Report' }
              ].map((scope) => (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => setFilterType(scope.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between ${
                    filterType === scope.id
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <span>{scope.label}</span>
                  {filterType === scope.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Inputs based on scope */}
          {filterType === 'isbn' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target ISBN (13-Digits)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9781234567890"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(filterType === 'annual' || filterType === 'monthly') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Report Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="2026">2026 (Current)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              {filterType === 'monthly' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {[
                      { v: '1', l: 'January' },
                      { v: '2', l: 'February' },
                      { v: '3', l: 'March' },
                      { v: '4', l: 'April' },
                      { v: '5', l: 'May' },
                      { v: '6', l: 'June' },
                      { v: '7', l: 'July' },
                      { v: '8', l: 'August' },
                      { v: '9', l: 'September' },
                      { v: '10', l: 'October' },
                      { v: '11', l: 'November' },
                      { v: '12', l: 'December' }
                    ].map(m => (
                      <option key={m.v} value={m.v}>{m.l}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Feedback Type Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Feedback Filter
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Feedback (Positive &amp; Negative)</option>
              <option value="POSITIVE">Positive Feedback Only (Appreciations)</option>
              <option value="NEGATIVE">Negative Feedback Only (Criticisms)</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

