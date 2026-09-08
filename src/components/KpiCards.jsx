import React, { useRef } from 'react';
import { Calendar, CalendarRange, Package, Clock, CheckCircle, Check } from 'lucide-react';

export default function KpiCards({
  kpis,
  prodType = 'all',
  activeDateRange = 'week',
  selectedDate = '',
  activeStatus = 'all',
  onSelectFilter,
  onSelectCustomDate
}) {
  // Compute scaling factor if a specific production type is filtered
  let factor = 1.0;
  if (prodType === 'POD') factor = 0.337;
  else if (prodType === 'EPDF') factor = 0.286;
  else if (prodType === 'SCANNED FILE') factor = 0.239;
  else if (prodType === 'E-ISBN') factor = 0.139;

  const today = Math.round((kpis?.today ?? 0) * factor);
  const week = Math.round((kpis?.week ?? 286) * factor);
  const month = Math.round((kpis?.month ?? 1248) * factor);
  const total = Math.round((kpis?.total ?? 1864) * factor);
  const pending = kpis?.pending ?? 37;
  const successRate = kpis?.successRate ?? '98.4%';

  // Date input refs for opening calendar picker
  const todayDateInputRef = useRef(null);
  const weekDateInputRef = useRef(null);
  const monthDateInputRef = useRef(null);

  const isTodayActive = !selectedDate && activeDateRange === 'today';
  const isWeekActive = !selectedDate && activeDateRange === 'week';
  const isMonthActive = !selectedDate && activeDateRange === 'month';
  const isTotalActive = !selectedDate && (activeDateRange === 'all' || !activeDateRange) && activeStatus === 'all';
  const isPendingActive = activeStatus === 'pending';
  const isSuccessActive = activeStatus === 'delivered';

  const handleOpenDatePicker = (e, inputRef) => {
    e.stopPropagation();
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500">
            QUICK KPI FILTERS
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            (Click any card to filter list & metrics)
          </span>
        </div>
        {selectedDate && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-2xs font-semibold">
            <span>📅 Custom Date: {selectedDate}</span>
            <button
              type="button"
              onClick={() => onSelectFilter && onSelectFilter('all', 'all')}
              className="text-blue-500 hover:text-blue-800 ml-1 font-bold cursor-pointer"
              title="Clear date filter"
            >
              ✕
            </button>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Today's Delivery */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('dateRange', 'today')}
          title="Click to view Today's Deliveries"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isTodayActive
              ? 'bg-blue-100/90 border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20 transform scale-[1.02]'
              : 'bg-blue-50/60 border border-blue-200/80 hover:border-blue-400 hover:bg-blue-50 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-bold text-blue-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>TODAY'S DELIVERY</span>
              {isTodayActive && <Check className="w-3 h-3 text-blue-600 inline" />}
            </span>
            <div
              onClick={(e) => handleOpenDatePicker(e, todayDateInputRef)}
              title="Click calendar icon to pick a date"
              className="p-1 rounded-md bg-white/80 hover:bg-white shadow-2xs text-blue-600 hover:text-blue-700 transition-colors relative cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <input
                ref={todayDateInputRef}
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => onSelectCustomDate && onSelectCustomDate(e.target.value)}
              />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1.5">{today}</div>
          <div className="text-[10px] text-blue-700/80 font-medium mt-0.5 flex items-center justify-between">
            <span>Files Delivered Today</span>
            {isTodayActive && <span className="text-[9px] font-bold text-blue-800 bg-blue-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>

        {/* Card 2: This Week */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('dateRange', 'week')}
          title="Click to view This Week's Deliveries"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isWeekActive
              ? 'bg-emerald-100/90 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20 transform scale-[1.02]'
              : 'bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-bold text-emerald-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>THIS WEEK</span>
              {isWeekActive && <Check className="w-3 h-3 text-emerald-600 inline" />}
            </span>
            <div
              onClick={(e) => handleOpenDatePicker(e, weekDateInputRef)}
              title="Click calendar icon to pick a date"
              className="p-1 rounded-md bg-white/80 hover:bg-white shadow-2xs text-emerald-600 hover:text-emerald-700 transition-colors relative cursor-pointer"
            >
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              <input
                ref={weekDateInputRef}
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => onSelectCustomDate && onSelectCustomDate(e.target.value)}
              />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1.5">{week}</div>
          <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5 flex items-center justify-between">
            <span>Files Delivered</span>
            {isWeekActive && <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>

        {/* Card 3: This Month */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('dateRange', 'month')}
          title="Click to view This Month's Deliveries"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isMonthActive
              ? 'bg-purple-100/90 border-2 border-purple-600 shadow-md ring-2 ring-purple-500/20 transform scale-[1.02]'
              : 'bg-purple-50/60 border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-bold text-purple-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>THIS MONTH</span>
              {isMonthActive && <Check className="w-3 h-3 text-purple-600 inline" />}
            </span>
            <div
              onClick={(e) => handleOpenDatePicker(e, monthDateInputRef)}
              title="Click calendar icon to pick a date"
              className="p-1 rounded-md bg-white/80 hover:bg-white shadow-2xs text-purple-600 hover:text-purple-700 transition-colors relative cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <input
                ref={monthDateInputRef}
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => onSelectCustomDate && onSelectCustomDate(e.target.value)}
              />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1.5">{month.toLocaleString()}</div>
          <div className="text-[10px] text-purple-700/80 font-medium mt-0.5 flex items-center justify-between">
            <span>Files Delivered</span>
            {isMonthActive && <span className="text-[9px] font-bold text-purple-800 bg-purple-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>

        {/* Card 4: Total Production */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('all', 'all')}
          title="Click to view all production deliveries"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isTotalActive
              ? 'bg-slate-800 border-2 border-blue-400 shadow-md ring-2 ring-blue-400/20 transform scale-[1.02]'
              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>TOTAL PRODUCTION</span>
              {isTotalActive && <Check className="w-3 h-3 text-blue-400 inline" />}
            </span>
            <div className="p-1 rounded-md bg-slate-800/80 shadow-2xs text-blue-400">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{total.toLocaleString()}</div>
          <div className="text-[10px] text-slate-300 font-medium mt-0.5 flex items-center justify-between">
            <span>Production Items</span>
            {isTotalActive && <span className="text-[9px] font-bold text-blue-300 bg-slate-700 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>

        {/* Card 5: Pending Delivery */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('status', 'pending')}
          title="Click to filter Pending deliveries"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isPendingActive
              ? 'bg-amber-100/90 border-2 border-amber-600 shadow-md ring-2 ring-amber-500/20 transform scale-[1.02]'
              : 'bg-amber-50/60 border border-amber-200/80 hover:border-amber-400 hover:bg-amber-50 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-bold text-amber-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>PENDING DELIVERY</span>
              {isPendingActive && <Check className="w-3 h-3 text-amber-600 inline" />}
            </span>
            <div className="p-1 rounded-md bg-white/80 shadow-2xs text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1.5">{pending}</div>
          <div className="text-[10px] text-amber-700/80 font-medium mt-0.5 flex items-center justify-between">
            <span>Awaiting Delivery</span>
            {isPendingActive && <span className="text-[9px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>

        {/* Card 6: Delivery Success */}
        <button
          type="button"
          onClick={() => onSelectFilter && onSelectFilter('status', 'delivered')}
          title="Click to filter Completed/Delivered files"
          className={`text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
            isSuccessActive
              ? 'bg-emerald-100/90 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20 transform scale-[1.02]'
              : 'bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xs'
          }`}
        >
          <div className="text-2xs font-bold text-emerald-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>DELIVERY SUCCESS</span>
              {isSuccessActive && <Check className="w-3 h-3 text-emerald-600 inline" />}
            </span>
            <div className="p-1 rounded-md bg-white/80 shadow-2xs text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5">{successRate}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center justify-between">
            <span>Successful Deliveries</span>
            {isSuccessActive && <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
          </div>
        </button>
      </div>
    </section>
  );
}
