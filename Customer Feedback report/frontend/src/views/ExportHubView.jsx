import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function ExportHubView() {
  const [isbn, setIsbn] = useState('9781234567890');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('9');

  const triggerExport = (format, filters = {}) => {
    const url = api.getExportUrl(format, filters);
    if (format === 'pdf') {
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FMS_Report_${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-600" />
          <span>Customer Feedback &amp; Critic Export Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export full database archives, annual reviews, monthly quality summaries, or single ISBN dossiers in Excel, CSV, or formatted PDF.
        </p>
      </div>

      {/* Preset Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Full Database Archive */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Entire Database History
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Export every customer review, appreciation note, and defect critique recorded permanently from 2022 to 2026+.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => triggerExport('excel', { filterType: 'all' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Excel (.XLSX)
            </button>
            <button
              onClick={() => triggerExport('csv', { filterType: 'all' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              <FileText className="w-4 h-4 text-blue-500" /> Export Raw CSV
            </button>
            <button
              onClick={() => triggerExport('pdf', { filterType: 'all' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              <Printer className="w-4 h-4 text-rose-500" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Single ISBN Dossier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Single ISBN Quality Dossier
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Export full historical evaluations, customer sentiments, and criticism timeline for a specific book.
            </p>

            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Enter Target ISBN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9781234567890"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => triggerExport('excel', { filterType: 'isbn', isbn })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download ISBN Excel
            </button>
            <button
              onClick={() => triggerExport('pdf', { filterType: 'isbn', isbn })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              <Printer className="w-4 h-4 text-rose-500" /> Printable PDF Dossier
            </button>
          </div>
        </div>

        {/* Period-Based Report (Annual / Monthly) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Annual &amp; Monthly Reports
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Generate official management audit files filtered by calendar year or month.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="9">September</option>
                  <option value="8">August</option>
                  <option value="7">July</option>
                  <option value="6">June</option>
                  <option value="5">May</option>
                  <option value="4">April</option>
                  <option value="3">March</option>
                  <option value="2">February</option>
                  <option value="1">January</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => triggerExport('excel', { filterType: 'annual', year })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Annual {year} Excel
            </button>
            <button
              onClick={() => triggerExport('excel', { filterType: 'monthly', year, month })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Monthly Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

