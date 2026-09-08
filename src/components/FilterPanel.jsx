import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  Calendar,
  ChevronDown,
  Check,
  Layers,
  Printer,
  FileText,
  Scan,
  Bookmark,
  Building2
} from 'lucide-react';

const DATE_OPTIONS = [
  { id: 'today', label: 'Today', badge: 'Daily', sub: '08 Sep 2026', icon: Calendar },
  { id: 'yesterday', label: 'Yesterday', badge: 'Prior Day', sub: '07 Sep 2026', icon: Calendar },
  { id: 'last7', label: 'Last 7 Days', badge: '7 Days', sub: 'Past 7 calendar days', icon: Calendar },
  { id: 'week', label: 'This Week', badge: 'Weekly', sub: 'Current work week (01 - 08 Sep)', icon: Calendar },
  { id: 'month', label: 'This Month', badge: 'Monthly', sub: 'September 2026 full month', icon: Calendar },
  { id: 'custom', label: 'Custom Range', badge: 'Custom', sub: 'Filter custom delivery dates', icon: Calendar }
];

const TYPE_OPTIONS = [
  { id: 'all', label: 'All Production Types', badge: 'All', sub: 'Complete production catalog', color: 'bg-slate-100 text-slate-700', icon: Layers },
  { id: 'POD', label: 'POD (Print-on-Demand)', badge: 'POD', sub: 'Print-on-Demand book production', color: 'bg-blue-100 text-blue-700', icon: Printer },
  { id: 'EPDF', label: 'EPDF (Electronic PDF)', badge: 'EPDF', sub: 'Digital interactive & standard PDF', color: 'bg-emerald-100 text-emerald-700', icon: FileText },
  { id: 'SCANNED FILE', label: 'SCANNED FILE', badge: 'SCAN', sub: 'High-res archival & scanned pages', color: 'bg-amber-100 text-amber-700', icon: Scan },
  { id: 'E-ISBN', label: 'E-ISBN', badge: 'ISBN', sub: 'Metadata & digital ISBN batch files', color: 'bg-purple-100 text-purple-700', icon: Bookmark }
];

const CUSTOMER_OPTIONS = [
  { id: 'all', label: 'All Customers', badge: 'All (6)', sub: 'All registered publishing houses', initials: 'ALL', color: 'bg-slate-100 text-slate-700' },
  { id: 'ABC Publishing', label: 'ABC Publishing', badge: 'Tier 1', sub: 'Leading enterprise publisher', initials: 'AP', color: 'bg-blue-100 text-blue-700' },
  { id: 'XYZ Books', label: 'XYZ Books', badge: 'Tier 1', sub: 'Academic & trade press', initials: 'XB', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Global Publications', label: 'Global Publications', badge: 'Global', sub: 'International fiction & journals', initials: 'GP', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'Prime Publishers', label: 'Prime Publishers', badge: 'Prime', sub: 'Commercial textbooks & digests', initials: 'PP', color: 'bg-amber-100 text-amber-700' },
  { id: 'Sunrise Publications', label: 'Sunrise Publications', badge: 'Partner', sub: 'Regional magazines & paperbacks', initials: 'SP', color: 'bg-rose-100 text-rose-700' },
  { id: 'Knowledge House', label: 'Knowledge House', badge: 'Partner', sub: 'Educational & reference books', initials: 'KH', color: 'bg-teal-100 text-teal-700' }
];

export default function FilterPanel({
  isOpen = true,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset,
  quickDateScope,
  setQuickDateScope
}) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [custDropdownOpen, setCustDropdownOpen] = useState(false);
  const [custSearchQuery, setCustSearchQuery] = useState('');

  const dateRef = useRef(null);
  const typeRef = useRef(null);
  const custRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateDropdownOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
      if (custRef.current && !custRef.current.contains(e.target)) {
        setCustDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDateOption = DATE_OPTIONS.find((o) => o.id === filters.dateRange) || DATE_OPTIONS[3];
  const currentTypeOption = TYPE_OPTIONS.find((o) => o.id === filters.type) || TYPE_OPTIONS[0];
  const currentCustOption = CUSTOMER_OPTIONS.find((o) => o.id === filters.customer) || CUSTOMER_OPTIONS[0];

  const filteredCustomers = CUSTOMER_OPTIONS.filter((c) =>
    c.label.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
    c.sub.toLowerCase().includes(custSearchQuery.toLowerCase())
  );

  const getActiveFilterText = () => {
    const typeLabel = filters.type === 'all' ? 'All Types' : filters.type;
    const custLabel = filters.customer === 'all' ? 'All Customers' : filters.customer;
    return `${typeLabel} • ${custLabel}`;
  };

  const getPeriodHint = () => {
    if (quickDateScope === 'today') return 'Period: Today (08 Sep 2026)';
    if (quickDateScope === 'month') return 'Period: Month of September 2026';
    return 'Period: 01 Sep 2026 - 08 Sep 2026';
  };

  const TypeIcon = currentTypeOption.icon;
  const DateIcon = currentDateOption.icon;

  return (
    <section className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 transition-all ${isOpen ? '' : 'hidden'}`}>
      {/* Top Strip: Scope & Focus */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Delivery Filter Scope:</span>
          </span>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setQuickDateScope('today');
                onFilterChange('dateRange', 'today');
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                quickDateScope === 'today'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickDateScope('week');
                onFilterChange('dateRange', 'week');
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                quickDateScope === 'week'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickDateScope('month');
                onFilterChange('dateRange', 'month');
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                quickDateScope === 'month'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="text-2xs text-slate-400 font-medium flex items-center space-x-2">
          <span>Active Filter:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {getActiveFilterText()}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              title="Close Filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Custom Delivery Date Dropdown */}
        <div className="space-y-1 relative" ref={dateRef}>
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Delivery Date</span>
            <span
              className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => {
                setQuickDateScope('today');
                onFilterChange('dateRange', 'today');
              }}
            >
              Today
            </span>
          </label>

          {/* Trigger Button */}
          <div
            onClick={() => {
              setDateDropdownOpen(!dateDropdownOpen);
              setTypeDropdownOpen(false);
              setCustDropdownOpen(false);
            }}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 flex items-center justify-between bg-white hover:border-slate-300 cursor-pointer shadow-2xs group transition-all"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <DateIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-900 truncate">{currentDateOption.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                dateDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>

          <div className="text-[10px] font-semibold text-blue-600 truncate">
            {getPeriodHint()}
          </div>

          {/* Modern Dropdown Menu */}
          {dateDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <span>Select Delivery Period</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {DATE_OPTIONS.length}
                </span>
              </div>
              <div className="p-1.5 space-y-1">
                {DATE_OPTIONS.map((opt) => {
                  const isSelected = opt.id === filters.dateRange;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onFilterChange('dateRange', opt.id);
                        setQuickDateScope(opt.id);
                        setDateDropdownOpen(false);
                      }}
                      className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border border-blue-200 text-blue-900 font-bold shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold leading-tight text-slate-900">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">{opt.sub}</div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <Check className="w-4 h-4 text-blue-600 font-black" />
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Custom Production Type Dropdown */}
        <div className="space-y-1 relative" ref={typeRef}>
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Production Type</span>
            <span
              className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => onFilterChange('type', 'all')}
            >
              All
            </span>
          </label>

          {/* Trigger Button */}
          <div
            onClick={() => {
              setTypeDropdownOpen(!typeDropdownOpen);
              setDateDropdownOpen(false);
              setCustDropdownOpen(false);
            }}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 flex items-center justify-between bg-white hover:border-slate-300 cursor-pointer shadow-2xs group transition-all"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className={`w-5 h-5 rounded-md ${currentTypeOption.color} flex items-center justify-center shrink-0`}>
                <TypeIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-900 truncate">{currentTypeOption.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                typeDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>

          <div className="text-[10px] text-slate-400 font-medium">POD, EPDF, Scanned, E-ISBN</div>

          {/* Modern Dropdown Menu */}
          {typeDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <span>Select Production Type</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                  4 Types
                </span>
              </div>
              <div className="p-1.5 space-y-1">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = opt.id === filters.type;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onFilterChange('type', opt.id);
                        setTypeDropdownOpen(false);
                      }}
                      className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border border-blue-200 text-blue-900 font-bold shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className={`w-7 h-7 rounded-lg ${opt.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold leading-tight text-slate-900">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">{opt.sub}</div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <Check className="w-4 h-4 text-blue-600 font-black" />
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Custom Customer Dropdown with Search */}
        <div className="space-y-1 relative" ref={custRef}>
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Customer</span>
            <span
              className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline"
              onClick={() => onFilterChange('customer', 'all')}
            >
              All
            </span>
          </label>

          {/* Trigger Button */}
          <div
            onClick={() => {
              setCustDropdownOpen(!custDropdownOpen);
              setDateDropdownOpen(false);
              setTypeDropdownOpen(false);
            }}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 flex items-center justify-between bg-white hover:border-slate-300 cursor-pointer shadow-2xs group transition-all"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className={`w-5 h-5 rounded-full ${currentCustOption.color} text-[10px] font-bold flex items-center justify-center shrink-0`}>
                {currentCustOption.initials}
              </div>
              <span className="font-semibold text-slate-900 truncate">{currentCustOption.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                custDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>

          <div className="text-[10px] text-slate-400 font-medium">6 Registered Publishing Clients</div>

          {/* Modern Dropdown Menu with Search */}
          {custDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              {/* Search input */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                <input
                  type="text"
                  value={custSearchQuery}
                  onChange={(e) => setCustSearchQuery(e.target.value)}
                  placeholder="Search client..."
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                  autoFocus
                />
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <span>Select Publishing Client</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {filteredCustomers.length}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {filteredCustomers.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <Building2 className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                    <span>No publisher found</span>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = cust.id === filters.customer;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          onFilterChange('customer', cust.id);
                          setCustDropdownOpen(false);
                          setCustSearchQuery('');
                        }}
                        className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 border border-blue-200 text-blue-900 font-bold shadow-2xs'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className={`w-7 h-7 rounded-full ${cust.color} text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs`}>
                            {cust.initials}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold leading-tight text-slate-900">{cust.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">{cust.sub}</div>
                          </div>
                        </div>
                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-blue-600 font-black" />
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {cust.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Search with Dedicated Search Button */}
        <div className="space-y-1">
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Search File or Customer</span>
            {filters.search && (
              <span
                onClick={() => onFilterChange('search', '')}
                className="text-[10px] text-rose-600 font-semibold cursor-pointer hover:underline"
              >
                Clear
              </span>
            )}
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onApply) onApply();
                }}
                placeholder="Search title, ISBN, author, client..."
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-7 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium bg-white hover:border-slate-300 transition-all shadow-2xs"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => onFilterChange('search', '')}
                  className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full flex items-center justify-center cursor-pointer text-xs transition-colors"
                  title="Clear Search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onApply}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0 flex items-center space-x-1.5"
              title="Click to Search"
            >
              <Search className="w-3.5 h-3.5 text-white" />
              <span>Search</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Real-time instant live filtering</div>
        </div>
      </div>
    </section>
  );
}
