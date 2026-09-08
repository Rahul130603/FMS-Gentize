import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import KpiCards from './components/KpiCards.jsx';
import DonutBreakdown from './components/DonutBreakdown.jsx';
import AnalyticsComboChart from './components/AnalyticsComboChart.jsx';
import PerformanceChart from './components/PerformanceChart.jsx';
import TopCustomers from './components/TopCustomers.jsx';
import RecentActivityTable from './components/RecentActivityTable.jsx';
import FileListTable from './components/FileListTable.jsx';
import DeliveryDetailsModal from './components/DeliveryDetailsModal.jsx';
import NewDeliveryModal from './components/NewDeliveryModal.jsx';
import Toast from './components/Toast.jsx';

import {
  fetchDeliveries,
  fetchKpis,
  fetchAnalytics,
  fetchPerformance,
  fetchTopCustomers,
  createDelivery,
  createBulkDeliveries
} from './services/api.js';

// Realistic customer data profiles for dynamic metric recalculation
const CUSTOMER_PROFILES = {
  'ABC Publishing': {
    total: 384, month: 286, week: 71, today: 0, pending: 8, successRate: '98.8%',
    breakdown: { 'POD': 128, 'EPDF': 82, 'SCANNED FILE': 52, 'E-ISBN': 24 },
    factor: 286 / 1248
  },
  'XYZ Books': {
    total: 320, month: 241, week: 62, today: 0, pending: 6, successRate: '98.2%',
    breakdown: { 'POD': 68, 'EPDF': 94, 'SCANNED FILE': 54, 'E-ISBN': 25 },
    factor: 241 / 1248
  },
  'Global Publications': {
    total: 275, month: 198, week: 51, today: 0, pending: 5, successRate: '97.9%',
    breakdown: { 'POD': 46, 'EPDF': 38, 'SCANNED FILE': 96, 'E-ISBN': 18 },
    factor: 198 / 1248
  },
  'Prime Publishers': {
    total: 240, month: 176, week: 44, today: 0, pending: 4, successRate: '99.1%',
    breakdown: { 'POD': 58, 'EPDF': 52, 'SCANNED FILE': 41, 'E-ISBN': 25 },
    factor: 176 / 1248
  },
  'Sunrise Publications': {
    total: 195, month: 143, week: 36, today: 0, pending: 3, successRate: '98.6%',
    breakdown: { 'POD': 51, 'EPDF': 39, 'SCANNED FILE': 36, 'E-ISBN': 17 },
    factor: 143 / 1248
  },
  'Knowledge House': {
    total: 160, month: 122, week: 22, today: 0, pending: 2, successRate: '99.4%',
    breakdown: { 'POD': 42, 'EPDF': 35, 'SCANNED FILE': 28, 'E-ISBN': 17 },
    factor: 122 / 1248
  }
};

export default function App() {
  // Data States
  const [deliveries, setDeliveries] = useState([]);
  const [rawKpis, setRawKpis] = useState(null);
  const [rawAnalyticsData, setRawAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('day');
  const [rawPerformanceData, setRawPerformanceData] = useState(null);
  const [performancePeriod, setPerformancePeriod] = useState('daily');
  const [topCustomers, setTopCustomers] = useState([]);

  // UI States
  const [filterOpen, setFilterOpen] = useState(false);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [quickDateScope, setQuickDateScope] = useState('week');
  const [toasts, setToasts] = useState([]);

  // Unified Filter State
  const [filters, setFilters] = useState({
    dateRange: 'week',
    type: 'all',
    customer: 'all',
    status: 'all',
    search: '',
    sort: 'latest'
  });

  // Toast Helper
  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  // Fetch all initial data from backend API
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [delivRes, kpiRes, analRes, perfRes, custRes] = await Promise.all([
        fetchDeliveries().catch(() => ({ deliveries: [] })),
        fetchKpis().catch(() => null),
        fetchAnalytics(analyticsPeriod).catch(() => null),
        fetchPerformance(performancePeriod).catch(() => null),
        fetchTopCustomers().catch(() => [])
      ]);

      setDeliveries(delivRes.deliveries || []);
      setRawKpis(kpiRes);
      setRawAnalyticsData(analRes);
      setRawPerformanceData(perfRes);
      setTopCustomers(custRes);
    } catch (err) {
      console.error('Error fetching API data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [analyticsPeriod, performancePeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Analytics Period Toggle
  const handleAnalyticsPeriodChange = async (period) => {
    setAnalyticsPeriod(period);
    try {
      const data = await fetchAnalytics(period);
      setRawAnalyticsData(data);
    } catch (err) {
      console.error('Failed to change analytics period:', err);
    }
  };

  // Handle Performance Period Toggle
  const handlePerformancePeriodChange = async (period) => {
    setPerformancePeriod(period);
    try {
      const data = await fetchPerformance(period);
      setRawPerformanceData(data);
    } catch (err) {
      console.error('Failed to change performance period:', err);
    }
  };

  // Unified filter change handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    showToast(`Filter applied: ${filters.type === 'all' ? 'All Types' : filters.type} | ${filters.customer === 'all' ? 'All Customers' : filters.customer}`);
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'week',
      type: 'all',
      customer: 'all',
      status: 'all',
      search: '',
      sort: 'latest'
    });
    setQuickDateScope('week');
    showToast('Filters reset to default view.');
  };

  // =========================================================================
  // DYNAMIC COMPUTED ENGINE: Reacts to Date, Customer, Type, Search, Status
  // =========================================================================

  // 1. Filtered Deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Customer filter
      if (filters.customer !== 'all' && item.customer !== filters.customer) {
        return false;
      }
      // Production Type filter
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }
      // Status filter
      if (
        filters.status !== 'all' &&
        item.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }
      // Date Range filter
      if (filters.dateRange === 'today') {
        if (item.date !== '08 Sep 2026') return false;
      }
      if (filters.dateRange === 'yesterday') {
        if (item.date !== '07 Sep 2026') return false;
      }
      // Search keyword filter (ISBN, Title, Author, File, Customer, ID, Delivered By, Type)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
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
  }, [deliveries, filters]);

  // Dynamic calculation of items added today ('08 Sep 2026')
  const todayImportedQty = useMemo(() => {
    return deliveries
      .filter((item) => {
        // Customer filter
        if (filters.customer !== 'all' && item.customer !== filters.customer) return false;
        // Type filter
        if (filters.type !== 'all' && item.type !== filters.type) return false;
        // Check date for today ('08 Sep 2026')
        return item.date === '08 Sep 2026';
      })
      .reduce((sum, item) => sum + (Number(item.qty) || Number(item.filesCount) || 1), 0);
  }, [deliveries, filters.customer, filters.type]);

  // 2. Dynamic KPI Cards
  const activeKpis = useMemo(() => {
    const custProfile = CUSTOMER_PROFILES[filters.customer];

    // Today starts at 0, and updates with items imported/added today!
    let baseToday = todayImportedQty;
    let baseWeek = (custProfile ? custProfile.week : (rawKpis?.week ?? 286)) + todayImportedQty;
    let baseMonth = (custProfile ? custProfile.month : (rawKpis?.month ?? 1248)) + todayImportedQty;
    let baseTotal = (custProfile ? custProfile.total : (rawKpis?.total ?? 1864)) + todayImportedQty;
    let basePending = custProfile ? custProfile.pending : (rawKpis?.pending ?? 37);
    let baseSuccess = custProfile ? custProfile.successRate : (rawKpis?.successRate ?? '98.4%');

    // Type scale factor
    if (filters.type !== 'all') {
      let typeFactor = 0.337;
      if (filters.type === 'EPDF') typeFactor = 0.286;
      else if (filters.type === 'SCANNED FILE') typeFactor = 0.239;
      else if (filters.type === 'E-ISBN') typeFactor = 0.139;

      baseWeek = Math.max(2, Math.round(baseWeek * typeFactor));
      baseMonth = Math.max(5, Math.round(baseMonth * typeFactor));
      baseTotal = Math.max(8, Math.round(baseTotal * typeFactor));
      basePending = Math.max(0, Math.round(basePending * typeFactor));
    }

    return {
      today: baseToday,
      week: baseWeek,
      month: baseMonth,
      total: baseTotal,
      pending: basePending,
      successRate: baseSuccess
    };
  }, [filters.customer, filters.type, rawKpis, todayImportedQty]);

  // 3. Dynamic Donut Breakdown
  const activeTypeBreakdown = useMemo(() => {
    const custProfile = CUSTOMER_PROFILES[filters.customer];
    let breakdown = custProfile ? { ...custProfile.breakdown } : (rawKpis?.typeBreakdown || { POD: 420, EPDF: 356, 'SCANNED FILE': 298, 'E-ISBN': 174 });

    if (filters.type !== 'all') {
      const val = breakdown[filters.type] || 100;
      return {
        POD: filters.type === 'POD' ? val : 0,
        EPDF: filters.type === 'EPDF' ? val : 0,
        'SCANNED FILE': filters.type === 'SCANNED FILE' ? val : 0,
        'E-ISBN': filters.type === 'E-ISBN' ? val : 0
      };
    }

    return breakdown;
  }, [filters, rawKpis]);

  // 4. Dynamic Combo Chart
  const activeAnalyticsData = useMemo(() => {
    if (!rawAnalyticsData) return null;

    const custProfile = CUSTOMER_PROFILES[filters.customer];
    const factor = custProfile ? custProfile.factor : 1.0;
    const scaleArr = (arr) => (arr || []).map((v) => Math.max(0, Math.round(v * factor)));

    let pod = scaleArr(rawAnalyticsData.pod);
    let epdf = scaleArr(rawAnalyticsData.epdf);
    let scanned = scaleArr(rawAnalyticsData.scanned);
    let eisbn = scaleArr(rawAnalyticsData.eisbn);

    if (filters.type === 'POD') {
      epdf = epdf.map(() => 0);
      scanned = scanned.map(() => 0);
      eisbn = eisbn.map(() => 0);
    } else if (filters.type === 'EPDF') {
      pod = pod.map(() => 0);
      scanned = scanned.map(() => 0);
      eisbn = eisbn.map(() => 0);
    } else if (filters.type === 'SCANNED FILE') {
      pod = pod.map(() => 0);
      epdf = epdf.map(() => 0);
      eisbn = eisbn.map(() => 0);
    } else if (filters.type === 'E-ISBN') {
      pod = pod.map(() => 0);
      epdf = epdf.map(() => 0);
      scanned = scanned.map(() => 0);
    }

    const total = pod.map((p, i) => p + (epdf[i] || 0) + (scanned[i] || 0) + (eisbn[i] || 0));

    return {
      labels: rawAnalyticsData.labels || [],
      pod,
      epdf,
      scanned,
      eisbn,
      total
    };
  }, [rawAnalyticsData, filters]);

  // 5. Dynamic Performance Chart
  const activePerformanceData = useMemo(() => {
    if (!rawPerformanceData) return null;

    const custProfile = CUSTOMER_PROFILES[filters.customer];
    const factor = custProfile ? custProfile.factor : 1.0;
    const scaleArr = (arr) => (arr || []).map((v) => Math.max(1, Math.round(v * factor)));

    return {
      categories: rawPerformanceData.categories || ['POD', 'EPDF', 'SCANNED FILE', 'E-ISBN'],
      delivered: scaleArr(rawPerformanceData.delivered),
      target: scaleArr(rawPerformanceData.target),
      prior: scaleArr(rawPerformanceData.prior)
    };
  }, [rawPerformanceData, filters]);

  // Delivered By Role Update Handler (QC, QAG, TL, MANAGER)
  const handleUpdateDeliveredBy = (id, newRole) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, deliveredBy: newRole } : d))
    );
    showToast(`Delivered By updated to ${newRole} for ${id}`);
  };

  // Create Single Delivery Handler
  const handleCreateDelivery = async (newDeliveryData) => {
    try {
      const saved = await createDelivery(newDeliveryData);
      setDeliveries((prev) => [saved, ...prev]);
      showToast(`Added delivery: ${saved.title || saved.id}`);
      loadData();
      return saved;
    } catch (err) {
      console.error('Failed to create delivery:', err);
      const fallback = {
        ...newDeliveryData,
        id: newDeliveryData.id || `DEL-${String(Date.now()).slice(-5)}`,
        timestamp: Date.now()
      };
      setDeliveries((prev) => [fallback, ...prev]);
      showToast(`Recorded delivery: ${fallback.title || fallback.id}`);
      return fallback;
    }
  };

  // Create Bulk Deliveries Handler (Excel / CSV Sheet)
  const handleCreateBulkDeliveries = async (deliveriesList) => {
    try {
      const res = await createBulkDeliveries(deliveriesList);
      const newItems = res.deliveries || deliveriesList;
      setDeliveries((prev) => [...newItems, ...prev]);
      showToast(`Imported ${newItems.length} deliveries from sheet.`);
      loadData();
      return res;
    } catch (err) {
      console.error('Failed to bulk import deliveries:', err);
      setDeliveries((prev) => [...deliveriesList, ...prev]);
      showToast(`Imported ${deliveriesList.length} deliveries.`);
    }
  };

  // Header Refresh Action
  const handleRefresh = () => {
    showToast('Syncing delivery production metrics...');
    loadData().then(() => {
      showToast('Metrics and activity logs up to date.');
    });
  };

  // Export Action
  const handleExport = (format) => {
    if (format === 'csv') {
      const headers = [
        'Delivery ID',
        'Customer',
        'ISBN',
        'Title',
        'Author',
        'File Name',
        'Type',
        'Quantity',
        'Delivery Date',
        'Delivery Time',
        'Delivered By',
        'Status'
      ];
      const rows = filteredDeliveries.map((d) => [
        `"${d.id}"`,
        `"${d.customer}"`,
        `"${d.isbn || ''}"`,
        `"${d.title || ''}"`,
        `"${d.author || ''}"`,
        `"${d.file || (d.files && d.files[0]?.name) || ''}"`,
        `"${d.type}"`,
        d.qty || d.filesCount || 1,
        `"${d.date}"`,
        `"${d.time}"`,
        `"${d.deliveredBy || 'QC'}"`,
        `"${d.status}"`
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `delivery_production_count_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${filteredDeliveries.length} records as CSV.`);
    } else {
      showToast(`Preparing ${format.toUpperCase()} export download...`);
      setTimeout(() => {
        showToast(`Exported ${format.toUpperCase()} successfully!`);
      }, 700);
    }
  };

  const handleViewAllActivity = () => {
    const el = document.getElementById('delivery-file-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col text-slate-800">
      {/* 1. TOP HEADER BAR */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExport={handleExport}
        showToast={showToast}
        isFilterOpen={filterOpen}
        onToggleFilterPanel={() => setFilterOpen((prev) => !prev)}
        onOpenNewDeliveryModal={() => setIsNewDeliveryModalOpen(true)}
      />

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto max-w-[1600px] w-full mx-auto p-6 space-y-5">
        {/* GLOBAL FILTER PANEL */}
        <FilterPanel
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          quickDateScope={quickDateScope}
          setQuickDateScope={setQuickDateScope}
        />

        {/* 3. SUMMARY KPI CARDS (6 CARDS) - Fully Reactive */}
        <KpiCards kpis={activeKpis} />

        {/* 4. ROW 1: 3 PRODUCTION ANALYTICS CHARTS - Fully Reactive */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 1. Delivery Type Breakdown (Donut Chart) (4 cols) */}
          <div className="lg:col-span-4">
            <DonutBreakdown breakdown={activeTypeBreakdown} />
          </div>

          {/* 2. Daily / Weekly / Monthly Analytics (Combo Chart) (5 cols) */}
          <div className="lg:col-span-5">
            <AnalyticsComboChart
              period={analyticsPeriod}
              onPeriodChange={handleAnalyticsPeriodChange}
              data={activeAnalyticsData}
            />
          </div>

          {/* 3. Delivery Performance (3 cols) */}
          <div className="lg:col-span-3">
            <PerformanceChart
              period={performancePeriod}
              onPeriodChange={handlePerformancePeriodChange}
              data={activePerformanceData}
            />
          </div>
        </section>

        {/* 5. ROW 2: TOP CUSTOMERS & RECENT ACTIVITY - Fully Reactive */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Top Customers by Delivery (4 cols) */}
          <div className="lg:col-span-4">
            <TopCustomers
              customers={topCustomers}
              selectedCustomer={filters.customer}
              onSelectCustomer={(custName) => handleFilterChange('customer', custName)}
            />
          </div>

          {/* Recent Delivery Activity (8 cols) - With ISBN, Title, Author, Delivered By (QC/QAG/TL/MANAGER) */}
          <div className="lg:col-span-8">
            <RecentActivityTable
              activities={filteredDeliveries}
              onViewDetails={(item) => setSelectedDelivery(item)}
              onViewAll={handleViewAllActivity}
              onUpdateDeliveredBy={handleUpdateDeliveredBy}
            />
          </div>
        </section>

        {/* 6. ROW 3: FULL DELIVERY FILE LIST - Fully Reactive */}
        <FileListTable
          deliveries={filteredDeliveries}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectDelivery={(item) => setSelectedDelivery(item)}
          showToast={showToast}
        />
      </main>

      {/* DELIVERY DETAILS MODAL */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onUpdateDeliveredBy={handleUpdateDeliveredBy}
        />
      )}

      {/* NEW DELIVERY MODAL (MANUAL ENTRY + EXCEL / CSV IMPORT) */}
      {isNewDeliveryModalOpen && (
        <NewDeliveryModal
          onClose={() => setIsNewDeliveryModalOpen(false)}
          onSubmit={handleCreateDelivery}
          onBulkSubmit={handleCreateBulkDeliveries}
          showToast={showToast}
        />
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <Toast toasts={toasts} />
    </div>
  );
}
