import React, { useState, useEffect, useRef } from 'react';
import { Truck, ChevronDown, RefreshCw, Download, FileSpreadsheet, FileText, File, Filter, Plus } from 'lucide-react';

export default function Header({
  onRefresh,
  isRefreshing,
  onExport,
  showToast,
  isFilterOpen = false,
  onToggleFilterPanel,
  onOpenNewDeliveryModal
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
      {/* Left: Title & Subtitle with Icon Badge */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black text-slate-900 leading-tight tracking-tight">
              DELIVERY PRODUCTION COUNT
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
              Production Desk
            </span>
          </div>
          <p className="text-2xs text-slate-400">
            Monitor customer deliveries, production counts and delivery history • Day / Week / Month
          </p>
        </div>
      </div>

      {/* Right: Header Controls */}
      <div className="flex items-center space-x-3">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center space-x-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={onToggleFilterPanel}
          className={`flex items-center space-x-1.5 border rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shadow-2xs cursor-pointer ${
            isFilterOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Toggle Filter Panel"
        >
          <Filter className={`w-3.5 h-3.5 ${isFilterOpen ? 'text-blue-600' : 'text-slate-500'}`} />
          <span>Filters</span>
          {isFilterOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>

        {/* Add Delivery Button */}
        <button
          type="button"
          onClick={onOpenNewDeliveryModal}
          className="flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-sm cursor-pointer hover:shadow-blue-500/25 shrink-0"
          title="Add New Delivery (Single or Sheet)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Delivery</span>
        </button>

        {/* Export Button with Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            type="button"
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center space-x-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              <button
                onClick={() => {
                  setExportOpen(false);
                  onExport('csv');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => {
                  setExportOpen(false);
                  onExport('excel');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => {
                  setExportOpen(false);
                  onExport('pdf');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer"
              >
                <File className="w-3.5 h-3.5 text-rose-600" />
                <span>Export PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
