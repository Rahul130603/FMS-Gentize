import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Eye, Download, FileText, ChevronLeft, ChevronRight, ChevronDown, Check, Calendar } from 'lucide-react';

export default function FileListTable({
  deliveries = [],
  onSelectDelivery,
  showToast
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const tableFilterRef = useRef(null);
  const pageSize = 5;

  // Dedicated LOCAL, ISOLATED filter state for this table ONLY
  const [tableFilters, setTableFilters] = useState({
    search: '',
    type: 'all',
    customer: 'all',
    selectedDate: '',
    status: 'all',
    sort: 'latest'
  });

  const handleTableFilterChange = (key, value) => {
    setTableFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (tableFilterRef.current && !tableFilterRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeBadgeClass = (type) => {
    if (type === 'POD') return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (type === 'EPDF') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (type === 'SCANNED FILE') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-purple-50 text-purple-700 border border-purple-200';
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'QC':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'QAG':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDateToMon = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mStr = months[parseInt(m, 10) - 1];
      return `${d} ${mStr} ${y}`;
    }
    return dateStr;
  };

  // Local Table Filter logic - completely independent of global dashboard
  const filteredTableItems = useMemo(() => {
    return deliveries.filter((item) => {
      // Type
      if (tableFilters.type !== 'all' && item.type !== tableFilters.type) return false;
      // Customer
      if (tableFilters.customer !== 'all' && item.customer !== tableFilters.customer) return false;
      // Status
      if (
        tableFilters.status !== 'all' &&
        item.status.toLowerCase() !== tableFilters.status.toLowerCase()
      ) {
        return false;
      }
      // Date Filter
      if (tableFilters.selectedDate) {
        const target = formatDateToMon(tableFilters.selectedDate);
        if (item.date !== target) return false;
      }
      // Search
      if (tableFilters.search) {
        const q = tableFilters.search.toLowerCase().trim();
        const file = (item.file || (item.files && item.files[0]?.name) || '').toLowerCase();
        const cust = (item.customer || '').toLowerCase();
        const id = (item.id || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const isbn = (item.isbn || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const author = (item.author || '').toLowerCase();
        const role = (item.deliveredBy || '').toLowerCase();

        if (
          !file.includes(q) &&
          !cust.includes(q) &&
          !id.includes(q) &&
          !type.includes(q) &&
          !isbn.includes(q) &&
          !title.includes(q) &&
          !author.includes(q) &&
          !role.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [deliveries, tableFilters]);

  // Sort list
  const sorted = useMemo(() => {
    const list = [...filteredTableItems];
    const sortVal = tableFilters.sort || 'latest';
    if (sortVal === 'latest') {
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortVal === 'oldest') {
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else if (sortVal === 'qty-desc') {
      list.sort((a, b) => (b.qty || b.filesCount || 0) - (a.qty || a.filesCount || 0));
    } else if (sortVal === 'qty-asc') {
      list.sort((a, b) => (a.qty || a.filesCount || 0) - (b.qty || b.filesCount || 0));
    }
    return list;
  }, [filteredTableItems, tableFilters.sort]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const pageItems = sorted.slice(startIndex, startIndex + pageSize);

  const handleDownload = (fileName) => {
    if (showToast) {
      showToast(`Download initiated for ${fileName}`);
    }
  };

  return (
    <section
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col space-y-3"
      id="delivery-file-list"
    >
      {/* Table Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800">DELIVERY FILE LIST</h3>
          <p className="text-[10px] text-slate-400">
            Searchable & filterable customer delivery records by ISBN, Title, Author
          </p>
        </div>

        {/* Filter Controls on Table */}
        <div className="flex flex-wrap items-center gap-2" ref={tableFilterRef}>
          {/* Table Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={tableFilters.search}
              onChange={(e) => handleTableFilterChange('search', e.target.value)}
              placeholder="Search ISBN, title, author..."
              className="text-xs rounded-lg border border-slate-200 pl-8 pr-2 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium bg-white hover:border-slate-300 w-52 shadow-2xs"
            />
          </div>

          {/* Type custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-hidden cursor-pointer flex items-center space-x-1.5 shadow-2xs transition-all ${
                tableFilters.type !== 'all' || activeDropdown === 'type'
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tableFilters.type === 'all' ? 'Type: All' : tableFilters.type}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {activeDropdown === 'type' && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                {[
                  { id: 'all', label: 'Type: All' },
                  { id: 'POD', label: 'POD' },
                  { id: 'EPDF', label: 'EPDF' },
                  { id: 'SCANNED FILE', label: 'SCANNED FILE' },
                  { id: 'E-ISBN', label: 'E-ISBN' }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      handleTableFilterChange('type', opt.id);
                      setActiveDropdown(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      tableFilters.type === opt.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {tableFilters.type === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'customer' ? null : 'customer')}
              className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-hidden cursor-pointer flex items-center space-x-1.5 shadow-2xs transition-all ${
                tableFilters.customer !== 'all' || activeDropdown === 'customer'
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="truncate max-w-[130px]">
                {tableFilters.customer === 'all' ? 'Customer: All' : tableFilters.customer}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'customer' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {activeDropdown === 'customer' && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                {[
                  'all',
                  'ABC Publishing',
                  'XYZ Books',
                  'Global Publications',
                  'Prime Publishers',
                  'Sunrise Publications',
                  'Knowledge House'
                ].map((cust) => (
                  <div
                    key={cust}
                    onClick={() => {
                      handleTableFilterChange('customer', cust);
                      setActiveDropdown(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      tableFilters.customer === cust
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cust === 'all' ? 'Customer: All' : cust}</span>
                    {tableFilters.customer === cust && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date custom dropdown & Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-hidden cursor-pointer flex items-center space-x-1.5 shadow-2xs transition-all ${
                tableFilters.selectedDate || activeDropdown === 'date'
                  ? 'border-blue-400 bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
              title="Filter deliveries by choosing any date"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{tableFilters.selectedDate ? tableFilters.selectedDate : 'Date: All'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  activeDropdown === 'date' ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>
            {activeDropdown === 'date' && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-2xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Delivery Date
                  </span>
                  {tableFilters.selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        handleTableFilterChange('selectedDate', '');
                        setActiveDropdown(null);
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear Date
                    </button>
                  )}
                </div>

                {/* Pick any custom date via HTML5 date picker */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">
                    Pick calendar date:
                  </label>
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleTableFilterChange('selectedDate', e.target.value);
                        setActiveDropdown(null);
                      }
                    }}
                    className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-800 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-500 outline-hidden"
                  />
                </div>

                {/* Quick Date List */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">
                    Or select from existing dates:
                  </label>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {[
                      { date: '', label: 'All Dates (Show All)' },
                      { date: '08 Sep 2026', label: '08 Sep 2026 (Today)' },
                      { date: '07 Sep 2026', label: '07 Sep 2026 (176 items)' },
                      { date: '06 Sep 2026', label: '06 Sep 2026 (88 items)' },
                      { date: '05 Sep 2026', label: '05 Sep 2026 (87 items)' },
                      { date: '04 Sep 2026', label: '04 Sep 2026 (63 items)' },
                      { date: '03 Sep 2026', label: '03 Sep 2026 (61 items)' },
                      { date: '02 Sep 2026', label: '02 Sep 2026 (102 items)' },
                      { date: '01 Sep 2026', label: '01 Sep 2026 (85 items)' }
                    ].map((d) => (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => {
                          handleTableFilterChange('selectedDate', d.date);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          tableFilters.selectedDate === d.date
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span>{d.label}</span>
                        {tableFilters.selectedDate === d.date && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-hidden cursor-pointer flex items-center space-x-1.5 shadow-2xs transition-all ${
                tableFilters.status !== 'all' || activeDropdown === 'status'
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tableFilters.status === 'all' ? 'Status: All' : tableFilters.status}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {activeDropdown === 'status' && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                {[
                  { id: 'all', label: 'Status: All' },
                  { id: 'Delivered', label: 'Delivered' },
                  { id: 'Pending', label: 'Pending' },
                  { id: 'In Progress', label: 'In Progress' },
                  { id: 'Failed', label: 'Failed' }
                ].map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      handleTableFilterChange('status', st.id);
                      setActiveDropdown(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      tableFilters.status === st.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st.label}</span>
                    {tableFilters.status === st.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort custom dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className={`text-xs rounded-lg border px-2.5 py-1.5 font-medium outline-hidden cursor-pointer flex items-center space-x-1.5 shadow-2xs transition-all ${
                activeDropdown === 'sort'
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>
                {tableFilters.sort === 'oldest'
                  ? 'Oldest Delivery'
                  : tableFilters.sort === 'qty-desc'
                  ? 'Qty: High to Low'
                  : tableFilters.sort === 'qty-asc'
                  ? 'Qty: Low to High'
                  : 'Latest Delivery'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'sort' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {activeDropdown === 'sort' && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                {[
                  { id: 'latest', label: 'Latest Delivery' },
                  { id: 'oldest', label: 'Oldest Delivery' },
                  { id: 'qty-desc', label: 'Quantity: High to Low' },
                  { id: 'qty-asc', label: 'Quantity: Low to High' }
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      handleTableFilterChange('sort', s.id);
                      setActiveDropdown(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      tableFilters.sort === s.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.label}</span>
                    {tableFilters.sort === s.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chosen Date Filter Banner (for this table only) */}
      {tableFilters.selectedDate && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 font-medium animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Calendar className="w-3 h-3" />
            </div>
            <span>
              Showing deliveries on chosen date: <strong className="font-extrabold text-blue-700">{tableFilters.selectedDate}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
              {totalCount} Deliveries Found
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTableFilterChange('selectedDate', '')}
            className="text-xs font-bold text-blue-700 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
          >
            Show All Dates (Clear)
          </button>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 text-[11px]">
            <tr>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap">ISBN</th>
              <th className="py-2.5 px-3 font-bold">Book Title / Author</th>
              <th className="py-2.5 px-3 font-bold">Customer</th>
              <th className="py-2.5 px-3 font-bold text-center">Type</th>
              <th className="py-2.5 px-3 font-bold text-right">Qty</th>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap">Date & Time</th>
              <th className="py-2.5 px-3 font-bold text-center whitespace-nowrap">Delivered By</th>
              <th className="py-2.5 px-3 font-bold text-center">Status</th>
              <th className="py-2.5 px-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-slate-400">
                  No matching delivery files found for the active filter.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => {
                const fileName =
                  item.file || (item.files && item.files[0]?.name) || `${item.id}_doc.pdf`;
                const isbn = item.isbn || '978-0-13-235088-4';
                const title = item.title || fileName;
                const author = item.author || 'Production Staff';
                const role = item.deliveredBy || 'QC';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700 font-semibold whitespace-nowrap">
                      {isbn}
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="font-semibold text-slate-900 truncate" title={title}>
                        {title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal truncate" title={author}>
                        {author}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {item.customer}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 text-right whitespace-nowrap">
                      {item.qty || item.filesCount || 1}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getRoleBadgeClass(role)}`}>
                        {role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectDelivery(item)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Quick View"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(fileName)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectDelivery(item)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-2xs text-slate-500">
        <div>
          Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} entries
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="px-1 text-slate-400">..</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`px-2 py-0.5 rounded border text-xs font-bold cursor-pointer transition-all ${
                        activePage === p
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
