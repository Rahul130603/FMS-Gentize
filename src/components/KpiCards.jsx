import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CalendarRange, Package, Clock, CheckCircle, Check, X, ChevronRight } from 'lucide-react';

const MONTHS_LIST = [
  { num: '01', name: 'Jan', full: 'January' },
  { num: '02', name: 'Feb', full: 'February' },
  { num: '03', name: 'Mar', full: 'March' },
  { num: '04', name: 'Apr', full: 'April' },
  { num: '05', name: 'May', full: 'May' },
  { num: '06', name: 'Jun', full: 'June' },
  { num: '07', name: 'Jul', full: 'July' },
  { num: '08', name: 'Aug', full: 'August' },
  { num: '09', name: 'Sep', full: 'September' },
  { num: '10', name: 'Oct', full: 'October' },
  { num: '11', name: 'Nov', full: 'November' },
  { num: '12', name: 'Dec', full: 'December' }
];

const WEEKS_LIST = [
  { id: 'w1', label: 'Week 1', dateRange: '01 Sep - 07 Sep', startDay: 1, endDay: 7, month: 'Sep' },
  { id: 'w2', label: 'Week 2 (Current)', dateRange: '08 Sep - 14 Sep', startDay: 8, endDay: 14, month: 'Sep' },
  { id: 'w3', label: 'Week 3', dateRange: '15 Sep - 21 Sep', startDay: 15, endDay: 21, month: 'Sep' },
  { id: 'w4', label: 'Week 4', dateRange: '22 Sep - 28 Sep', startDay: 22, endDay: 28, month: 'Sep' },
  { id: 'w5', label: 'Week 5', dateRange: '29 Sep - 30 Sep', startDay: 29, endDay: 30, month: 'Sep' }
];

export default function KpiCards({
  kpis,
  prodType = 'all',
  activeDateRange = 'week',
  selectedDate = '',
  selectedWeek = null,
  selectedMonth = '',
  activeStatus = 'all',
  onSelectFilter,
  onSelectCustomDate,
  onSelectWeek,
  onSelectMonth
}) {
  // Popover state: null | 'week' | 'month'
  const [openPopover, setOpenPopover] = useState(null);
  const popoverRef = useRef(null);
  const todayDateInputRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const isTodayActive = !selectedDate && !selectedWeek && !selectedMonth && activeDateRange === 'today';
  const isWeekActive = !selectedDate && !selectedMonth && (activeDateRange === 'week' || !!selectedWeek);
  const isMonthActive = !selectedDate && !selectedWeek && (activeDateRange === 'month' || !!selectedMonth);
  const isTotalActive = !selectedDate && !selectedWeek && !selectedMonth && (activeDateRange === 'all' || !activeDateRange) && activeStatus === 'all';
  const isPendingActive = activeStatus === 'pending';
  const isSuccessActive = activeStatus === 'delivered';

  const handleOpenDayPicker = (e) => {
    e.stopPropagation();
    if (todayDateInputRef.current) {
      if (typeof todayDateInputRef.current.showPicker === 'function') {
        todayDateInputRef.current.showPicker();
      } else {
        todayDateInputRef.current.focus();
      }
    }
  };

  const toggleWeekPopover = (e) => {
    e.stopPropagation();
    setOpenPopover((prev) => (prev === 'week' ? null : 'week'));
  };

  const toggleMonthPopover = (e) => {
    e.stopPropagation();
    setOpenPopover((prev) => (prev === 'month' ? null : 'month'));
  };

  const handlePickWeek = (weekItem) => {
    setOpenPopover(null);
    if (onSelectWeek) {
      onSelectWeek(weekItem);
    }
  };

  const handlePickMonth = (monthItem) => {
    setOpenPopover(null);
    if (onSelectMonth) {
      onSelectMonth(monthItem.name);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 relative" ref={popoverRef}>
      {/* Active Custom Filter Pill if any */}
      {(selectedDate || selectedWeek || selectedMonth) && (
        <div className="flex items-center justify-end mb-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold shadow-2xs">
            <span>
              {selectedDate && `📅 Date: ${selectedDate}`}
              {selectedWeek && `📅 ${selectedWeek.label} (${selectedWeek.dateRange})`}
              {selectedMonth && `📅 Month: ${selectedMonth} 2026`}
            </span>
            <button
              type="button"
              onClick={() => onSelectFilter && onSelectFilter('all', 'all')}
              className="text-blue-500 hover:text-blue-900 ml-1.5 font-bold cursor-pointer"
              title="Clear custom filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

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
              onClick={handleOpenDayPicker}
              title="Touch calendar icon to pick a day"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-2xs text-blue-600 hover:text-blue-700 transition-colors relative cursor-pointer"
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
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectFilter && onSelectFilter('dateRange', 'week')}
            title="Click to view This Week's Deliveries"
            className={`w-full text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
              isWeekActive
                ? 'bg-emerald-100/90 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20 transform scale-[1.02]'
                : 'bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xs'
            }`}
          >
            <div className="text-2xs font-bold text-emerald-800 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span>{selectedWeek ? selectedWeek.label.toUpperCase() : 'THIS WEEK'}</span>
                {isWeekActive && <Check className="w-3 h-3 text-emerald-600 inline" />}
              </span>
              <div
                onClick={toggleWeekPopover}
                title="Touch calendar to show and choose weeks"
                className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-2xs text-emerald-600 hover:text-emerald-700 transition-all cursor-pointer ring-1 ring-emerald-300"
              >
                <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1.5">{week}</div>
            <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5 flex items-center justify-between">
              <span>{selectedWeek ? selectedWeek.dateRange : 'Files Delivered'}</span>
              {isWeekActive && <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
            </div>
          </button>

          {/* Week Calendar Popover */}
          {openPopover === 'week' && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-xl border border-slate-200 shadow-2xl p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <CalendarRange className="w-4 h-4 text-emerald-600" />
                  <span>Choose Week (Sep 2026)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenPopover(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {WEEKS_LIST.map((wItem) => {
                  const isSelected = selectedWeek?.id === wItem.id;
                  return (
                    <button
                      key={wItem.id}
                      type="button"
                      onClick={() => handlePickWeek(wItem)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{wItem.label}</div>
                        <div className="text-[10px] text-slate-400">{wItem.dateRange}</div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Custom Week Input */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Custom Week:</span>
                <input
                  type="week"
                  className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  onChange={(e) => {
                    const val = e.target.value; // e.g. "2026-W36"
                    if (val) {
                      setOpenPopover(null);
                      const weekNum = val.split('-W')[1];
                      handlePickWeek({
                        id: `custom-${val}`,
                        label: `Week ${weekNum}`,
                        dateRange: val,
                        startDay: 1,
                        endDay: 30,
                        month: 'Sep'
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card 3: This Month */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectFilter && onSelectFilter('dateRange', 'month')}
            title="Click to view This Month's Deliveries"
            className={`w-full text-left rounded-xl p-3.5 shadow-2xs transition-all duration-150 cursor-pointer relative overflow-hidden group select-none ${
              isMonthActive
                ? 'bg-purple-100/90 border-2 border-purple-600 shadow-md ring-2 ring-purple-500/20 transform scale-[1.02]'
                : 'bg-purple-50/60 border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50 hover:shadow-xs'
            }`}
          >
            <div className="text-2xs font-bold text-purple-800 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span>{selectedMonth ? `${selectedMonth.toUpperCase()} 2026` : 'THIS MONTH'}</span>
                {isMonthActive && <Check className="w-3 h-3 text-purple-600 inline" />}
              </span>
              <div
                onClick={toggleMonthPopover}
                title="Touch calendar to show and choose months"
                className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-2xs text-purple-600 hover:text-purple-700 transition-all cursor-pointer ring-1 ring-purple-300"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-600 mt-1.5">{month.toLocaleString()}</div>
            <div className="text-[10px] text-purple-700/80 font-medium mt-0.5 flex items-center justify-between">
              <span>{selectedMonth ? `${selectedMonth} Deliveries` : 'Files Delivered'}</span>
              {isMonthActive && <span className="text-[9px] font-bold text-purple-800 bg-purple-200/80 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
            </div>
          </button>

          {/* Month Calendar Popover */}
          {openPopover === 'month' && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-xl border border-slate-200 shadow-2xl p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Choose Month (2026)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenPopover(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {MONTHS_LIST.map((mItem) => {
                  const isSelected = selectedMonth ? selectedMonth.toLowerCase() === mItem.name.toLowerCase() : mItem.name === 'Sep';
                  return (
                    <button
                      key={mItem.num}
                      type="button"
                      onClick={() => handlePickMonth(mItem)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      {mItem.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom Month Picker */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Other Year/Month:</span>
                <input
                  type="month"
                  className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  onChange={(e) => {
                    const val = e.target.value; // e.g. "2026-09"
                    if (val) {
                      setOpenPopover(null);
                      const mNum = val.split('-')[1];
                      const matched = MONTHS_LIST.find((m) => m.num === mNum);
                      if (matched) handlePickMonth(matched);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

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
            <div className="p-1.5 rounded-lg bg-slate-800/80 shadow-2xs text-blue-400">
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
            <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs text-amber-600">
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
            <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs text-emerald-600">
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
