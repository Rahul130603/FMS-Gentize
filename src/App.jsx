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
  createBulkDeliveries,
  updateDelivery
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

// Realistic Monthly & Weekly Baseline Data Profiles
const MONTH_PROFILES = {
  'Sep': {
    name: 'September',
    month: 1248,
    week: 286,
    pending: 37,
    successRate: '98.4%',
    breakdown: { POD: 420, EPDF: 356, 'SCANNED FILE': 298, 'E-ISBN': 174 },
    weeks: { w1: 286, w2: 0, w3: 336, w4: 359, w5: 180 },
    chart: {
      pod: [18, 21, 16, 24, 19, 22, 20, 24],
      epdf: [12, 15, 13, 18, 14, 16, 17, 19],
      scanned: [8, 9, 11, 12, 10, 8, 11, 12],
      eisbn: [5, 6, 4, 7, 5, 6, 5, 6],
      labels: ['Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8']
    }
  },
  'Aug': {
    name: 'August',
    month: 1296,
    week: 324,
    pending: 24,
    successRate: '98.9%',
    breakdown: { POD: 452, EPDF: 361, 'SCANNED FILE': 304, 'E-ISBN': 179 },
    weeks: { w1: 312, w2: 326, w3: 334, w4: 324, w5: 0 },
    chart: {
      pod: [24, 28, 22, 26, 24, 29, 27],
      epdf: [16, 19, 17, 21, 18, 20, 22],
      scanned: [12, 14, 11, 13, 15, 12, 14],
      eisbn: [8, 7, 9, 8, 6, 9, 8],
      labels: ['Aug 1', 'Aug 5', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25', 'Aug 31']
    }
  },
  'Jul': {
    name: 'July',
    month: 1182,
    week: 295,
    pending: 29,
    successRate: '98.1%',
    breakdown: { POD: 398, EPDF: 337, 'SCANNED FILE': 286, 'E-ISBN': 161 },
    weeks: { w1: 290, w2: 298, w3: 304, w4: 290, w5: 0 },
    chart: {
      pod: [20, 22, 19, 25, 21, 23, 22],
      epdf: [14, 16, 15, 18, 15, 17, 16],
      scanned: [10, 11, 9, 12, 11, 10, 11],
      eisbn: [6, 5, 7, 6, 5, 7, 6],
      labels: ['Jul 1', 'Jul 5', 'Jul 10', 'Jul 15', 'Jul 20', 'Jul 25', 'Jul 31']
    }
  },
  'Jun': {
    name: 'June',
    month: 1162,
    week: 290,
    pending: 31,
    successRate: '97.8%',
    breakdown: { POD: 421, EPDF: 318, 'SCANNED FILE': 271, 'E-ISBN': 152 },
    weeks: { w1: 282, w2: 289, w3: 295, w4: 296, w5: 0 },
    chart: {
      pod: [19, 23, 18, 24, 20, 22, 21],
      epdf: [13, 15, 14, 17, 14, 16, 15],
      scanned: [9, 10, 11, 12, 10, 9, 10],
      eisbn: [5, 6, 5, 7, 5, 6, 5],
      labels: ['Jun 1', 'Jun 5', 'Jun 10', 'Jun 15', 'Jun 20', 'Jun 25', 'Jun 30']
    }
  },
  'May': {
    name: 'May',
    month: 1059,
    week: 265,
    pending: 35,
    successRate: '98.2%',
    breakdown: { POD: 384, EPDF: 291, 'SCANNED FILE': 246, 'E-ISBN': 138 },
    weeks: { w1: 260, w2: 265, w3: 270, w4: 264, w5: 0 },
    chart: {
      pod: [17, 20, 16, 21, 18, 20, 19],
      epdf: [11, 14, 12, 16, 13, 15, 14],
      scanned: [8, 9, 10, 11, 9, 8, 9],
      eisbn: [4, 5, 4, 6, 4, 5, 5],
      labels: ['May 1', 'May 5', 'May 10', 'May 15', 'May 20', 'May 25', 'May 31']
    }
  },
  'Apr': {
    name: 'April',
    month: 1140,
    week: 285,
    pending: 28,
    successRate: '98.5%',
    breakdown: { POD: 405, EPDF: 310, 'SCANNED FILE': 265, 'E-ISBN': 160 },
    weeks: { w1: 275, w2: 285, w3: 290, w4: 290, w5: 0 }
  },
  'Mar': {
    name: 'March',
    month: 1110,
    week: 278,
    pending: 33,
    successRate: '97.9%',
    breakdown: { POD: 390, EPDF: 305, 'SCANNED FILE': 260, 'E-ISBN': 155 },
    weeks: { w1: 270, w2: 275, w3: 280, w4: 285, w5: 0 }
  },
  'Feb': {
    name: 'February',
    month: 1020,
    week: 255,
    pending: 22,
    successRate: '99.0%',
    breakdown: { POD: 360, EPDF: 280, 'SCANNED FILE': 240, 'E-ISBN': 140 },
    weeks: { w1: 250, w2: 255, w3: 255, w4: 260, w5: 0 }
  },
  'Jan': {
    name: 'January',
    month: 980,
    week: 245,
    pending: 26,
    successRate: '98.3%',
    breakdown: { POD: 345, EPDF: 270, 'SCANNED FILE': 230, 'E-ISBN': 135 },
    weeks: { w1: 240, w2: 245, w3: 245, w4: 250, w5: 0 }
  },
  'Oct': {
    name: 'October',
    month: 1320,
    week: 330,
    pending: 30,
    successRate: '98.7%',
    breakdown: { POD: 460, EPDF: 370, 'SCANNED FILE': 310, 'E-ISBN': 180 },
    weeks: { w1: 320, w2: 330, w3: 335, w4: 335, w5: 0 }
  },
  'Nov': {
    name: 'November',
    month: 1280,
    week: 320,
    pending: 32,
    successRate: '98.4%',
    breakdown: { POD: 445, EPDF: 360, 'SCANNED FILE': 300, 'E-ISBN': 175 },
    weeks: { w1: 310, w2: 320, w3: 325, w4: 325, w5: 0 }
  },
  'Dec': {
    name: 'December',
    month: 1350,
    week: 338,
    pending: 34,
    successRate: '98.8%',
    breakdown: { POD: 470, EPDF: 380, 'SCANNED FILE': 320, 'E-ISBN': 180 },
    weeks: { w1: 330, w2: 335, w3: 340, w4: 345, w5: 0 }
  }
};

// Dedicated browser storage key for persistent delivery records
const LOCAL_STORAGE_KEY = 'delivery_production_records_v2';

const getLocalDeliveries = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read localStorage:', e);
    return [];
  }
};

const saveLocalDeliveries = (list) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Robust helper to check if a delivery record is from today ('08 Sep 2026' or current date)
const isTodayDate = (dateStr) => {
  if (!dateStr) return false;
  const s = String(dateStr).trim().toLowerCase();
  if (s === '08 sep 2026' || s === '8 sep 2026') return true;
  if (s === '2026-09-08' || s === '08-09-2026' || s === '08/09/2026') return true;
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const y = now.getFullYear();
  if (s === `${d} ${m} ${y}`.toLowerCase() || s === `${now.getDate()} ${m} ${y}`.toLowerCase()) return true;
  return false;
};

export default function App() {
  // Data States - Immediately initialize from localStorage so deliveries are never 0 on refresh!
  const [deliveries, setDeliveries] = useState(() => getLocalDeliveries());
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
    selectedDate: '',
    selectedWeek: null,
    selectedMonth: '',
    type: 'all',
    customer: 'all',
    status: 'all',
    search: '',
    sort: 'latest'
  });

  // Floating toast captions disabled per user request ("entha capiton la vena ahh")
  const showToast = useCallback(() => {}, []);

  // Fetch all initial data from backend API with localStorage backup & smart merging
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const cached = getLocalDeliveries();

      const [delivRes, kpiRes, analRes, perfRes, custRes] = await Promise.all([
        fetchDeliveries().catch(() => ({ deliveries: [] })),
        fetchKpis().catch(() => null),
        fetchAnalytics(analyticsPeriod).catch(() => null),
        fetchPerformance(performancePeriod).catch(() => null),
        fetchTopCustomers().catch(() => [])
      ]);

      const backendDeliveries = delivRes.deliveries || [];

      // Smart merge: combine both without duplicates, keeping all recorded items intact
      const deliveryMap = new Map();

      // Seed with cached items first (contains all previous manual & imported deliveries)
      cached.forEach((item) => {
        if (item && item.id) deliveryMap.set(item.id, item);
      });

      // Merge backend items
      backendDeliveries.forEach((item) => {
        if (item && item.id) {
          const existing = deliveryMap.get(item.id);
          deliveryMap.set(item.id, { ...item, ...(existing || {}) });
        }
      });

      let mergedDeliveries = Array.from(deliveryMap.values());
      if (mergedDeliveries.length === 0 && backendDeliveries.length > 0) {
        mergedDeliveries = backendDeliveries;
      }

      // Sort latest first
      mergedDeliveries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      saveLocalDeliveries(mergedDeliveries);
      setDeliveries(mergedDeliveries);

      setRawKpis(kpiRes);
      setRawAnalyticsData(analRes);
      setRawPerformanceData(perfRes);
      setTopCustomers(custRes);
    } catch (err) {
      console.error('Error fetching API data, falling back to local storage:', err);
      const cached = getLocalDeliveries();
      if (cached && cached.length > 0) {
        setDeliveries(cached);
      }
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
      selectedDate: '',
      selectedWeek: null,
      selectedMonth: '',
      type: 'all',
      customer: 'all',
      status: 'all',
      search: '',
      sort: 'latest'
    });
    setQuickDateScope('week');
  };

  // =========================================================================
  // DYNAMIC COMPUTED ENGINE: Reacts to Date, Customer, Type, Search, Status
  // =========================================================================

  // Helper to normalize 'YYYY-MM-DD' or custom date string to 'DD Mon YYYY'
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
      // 1. Custom Chosen Date Filter (Single Day)
      if (filters.selectedDate) {
        const targetDate = formatDateToMon(filters.selectedDate);
        if (item.date !== targetDate) return false;
      }
      // 2. Specific Chosen Week Filter
      else if (filters.selectedWeek) {
        const { startDay, endDay, month } = filters.selectedWeek;
        const dayMatch = (item.date || '').match(/^(\d{1,2})\s+([A-Za-z]{3})/);
        if (!dayMatch) return false;
        const dayNum = parseInt(dayMatch[1], 10);
        const itemMonth = dayMatch[2];
        if (month && itemMonth.toLowerCase() !== month.toLowerCase()) return false;
        if (dayNum < startDay || dayNum > endDay) return false;
      }
      // 3. Specific Chosen Month Filter
      else if (filters.selectedMonth) {
        if (!item.date || !item.date.toLowerCase().includes(filters.selectedMonth.toLowerCase())) return false;
      }
      // 4. Preset Date Range filter
      else {
        if (filters.dateRange === 'today') {
          if (!isTodayDate(item.date)) return false;
        } else if (filters.dateRange === 'yesterday') {
          if (item.date !== '07 Sep 2026') return false;
        } else if (filters.dateRange === 'month') {
          if (!item.date || !item.date.includes('Sep')) return false;
        }
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

  // Dynamic calculation of items added today ('08 Sep 2026' or current date)
  const todayImportedQty = useMemo(() => {
    return deliveries
      .filter((item) => {
        // Customer filter
        if (filters.customer !== 'all' && item.customer !== filters.customer) return false;
        // Type filter
        if (filters.type !== 'all' && item.type !== filters.type) return false;
        // Check date for today
        return isTodayDate(item.date);
      })
      .reduce((sum, item) => sum + (Number(item.qty) || Number(item.filesCount) || 1), 0);
  }, [deliveries, filters.customer, filters.type]);

  // Dynamic calculation of items on chosen date (if chosen)
  const selectedDateQty = useMemo(() => {
    if (!filters.selectedDate) return null;
    const targetDate = formatDateToMon(filters.selectedDate);
    return deliveries
      .filter((item) => {
        if (filters.customer !== 'all' && item.customer !== filters.customer) return false;
        if (filters.type !== 'all' && item.type !== filters.type) return false;
        return item.date === targetDate;
      })
      .reduce((sum, item) => sum + (Number(item.qty) || Number(item.filesCount) || 1), 0);
  }, [deliveries, filters.selectedDate, filters.customer, filters.type]);

  // 2. Dynamic KPI Cards - Adapts to chosen Month & Week, and increments with user imports
  const activeKpis = useMemo(() => {
    const custProfile = CUSTOMER_PROFILES[filters.customer];
    const monthProfile = MONTH_PROFILES[filters.selectedMonth] || MONTH_PROFILES['Sep'];
    const isCurrentMonth = !filters.selectedMonth || filters.selectedMonth.toLowerCase() === 'sep';

    // Today count: only non-zero if viewing current month / today view
    let baseToday = isCurrentMonth ? todayImportedQty : 0;

    // Week count: reflects selected week or default week for that month
    let baseWeek = monthProfile.week;
    if (filters.selectedWeek) {
      const wId = filters.selectedWeek.id;
      if (wId === 'w2' && isCurrentMonth) {
        baseWeek = todayImportedQty;
      } else if (monthProfile.weeks && monthProfile.weeks[wId] !== undefined) {
        baseWeek = monthProfile.weeks[wId];
      }
    } else if (isCurrentMonth) {
      baseWeek = (custProfile ? custProfile.week : 286) + todayImportedQty;
    }

    // Month count: reflects chosen month total + user imported deliveries if September
    let baseMonth = monthProfile.month + (isCurrentMonth ? todayImportedQty : 0);
    if (custProfile && isCurrentMonth) {
      baseMonth = custProfile.month + todayImportedQty;
    }

    // Total production
    let baseTotal = (custProfile ? custProfile.total : (rawKpis?.total ?? 1864)) + (isCurrentMonth ? todayImportedQty : 0);
    let basePending = custProfile ? custProfile.pending : monthProfile.pending;
    let baseSuccess = custProfile ? custProfile.successRate : monthProfile.successRate;

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
  }, [filters.customer, filters.type, filters.selectedMonth, filters.selectedWeek, rawKpis, todayImportedQty]);

  // 3. Dynamic Donut Breakdown - Adapts to chosen Month
  const activeTypeBreakdown = useMemo(() => {
    const custProfile = CUSTOMER_PROFILES[filters.customer];
    const monthProfile = MONTH_PROFILES[filters.selectedMonth] || MONTH_PROFILES['Sep'];
    let breakdown = custProfile ? { ...custProfile.breakdown } : { ...monthProfile.breakdown };

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

  // 4. Dynamic Combo Chart - Adapts labels & data to chosen Month/Week
  const activeAnalyticsData = useMemo(() => {
    if (!rawAnalyticsData) return null;

    const custProfile = CUSTOMER_PROFILES[filters.customer];
    const monthProfile = MONTH_PROFILES[filters.selectedMonth] || MONTH_PROFILES['Sep'];
    const factor = custProfile ? custProfile.factor : 1.0;
    const scaleArr = (arr) => (arr || []).map((v) => Math.max(0, Math.round(v * factor)));

    let sourceChart = monthProfile.chart || rawAnalyticsData;
    let pod = scaleArr(sourceChart.pod || rawAnalyticsData.pod);
    let epdf = scaleArr(sourceChart.epdf || rawAnalyticsData.epdf);
    let scanned = scaleArr(sourceChart.scanned || rawAnalyticsData.scanned);
    let eisbn = scaleArr(sourceChart.eisbn || rawAnalyticsData.eisbn);
    let labels = sourceChart.labels || rawAnalyticsData.labels || [];

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
      labels,
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
  const handleUpdateDeliveredBy = async (id, newRole) => {
    setDeliveries((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, deliveredBy: newRole } : d));
      saveLocalDeliveries(updated);
      return updated;
    });
    showToast(`Delivered By updated to ${newRole} for ${id}`);

    try {
      await updateDelivery(id, { deliveredBy: newRole });
    } catch (err) {
      console.warn('Delivered By updated locally (server sync deferred):', err.message);
    }
  };

  // Create Single Delivery Handler
  const handleCreateDelivery = async (newDeliveryData) => {
    const record = {
      ...newDeliveryData,
      id: newDeliveryData.id || `DEL-${String(Date.now()).slice(-5)}`,
      timestamp: Date.now()
    };

    // 1. Immediately store to localStorage and update state
    setDeliveries((prev) => {
      const combined = [record, ...prev];
      saveLocalDeliveries(combined);
      return combined;
    });
    showToast(`Recorded delivery: ${record.title || record.id}`);

    try {
      const saved = await createDelivery(newDeliveryData);
      await loadData();
      return saved;
    } catch (err) {
      console.warn('Created delivery stored in persistent storage (server sync deferred):', err);
      return record;
    }
  };

  // Create Bulk Deliveries Handler (Excel / CSV Sheet)
  // Ensures all batches (morning 50 + afternoon 50 = 100) accumulate and never revert on refresh!
  const handleCreateBulkDeliveries = async (deliveriesList) => {
    if (!deliveriesList || deliveriesList.length === 0) return;

    // 1. Immediately store all items to localStorage and update React state
    setDeliveries((prev) => {
      const combined = [...deliveriesList, ...prev];
      saveLocalDeliveries(combined);
      return combined;
    });
    showToast(`Imported ${deliveriesList.length} deliveries to production log.`);

    try {
      // 2. Persist to Backend API
      const res = await createBulkDeliveries(deliveriesList);
      // 3. Re-sync with backend to ensure ID synchronization
      await loadData();
      return res;
    } catch (err) {
      console.warn('Bulk import stored safely in local storage (server sync deferred):', err);
    }
  };

  // Quick KPI Card Interactive Filter Handler
  const handleKpiCardClick = (type, value) => {
    if (type === 'dateRange') {
      if (filters.dateRange === value && !filters.selectedDate && !filters.selectedWeek && !filters.selectedMonth) {
        setFilters((prev) => ({ ...prev, dateRange: 'all', selectedDate: '', selectedWeek: null, selectedMonth: '' }));
      } else {
        setFilters((prev) => ({ ...prev, dateRange: value, selectedDate: '', selectedWeek: null, selectedMonth: '' }));
      }
    } else if (type === 'status') {
      if (filters.status === value) {
        setFilters((prev) => ({ ...prev, status: 'all' }));
      } else {
        setFilters((prev) => ({ ...prev, status: value }));
      }
    } else if (type === 'all') {
      setFilters((prev) => ({
        ...prev,
        dateRange: 'all',
        selectedDate: '',
        selectedWeek: null,
        selectedMonth: '',
        status: 'all',
        type: 'all',
        customer: 'all'
      }));
    }
  };

  const handleKpiCustomDate = (dateVal) => {
    if (!dateVal) return;
    setFilters((prev) => ({ ...prev, selectedDate: dateVal, selectedWeek: null, selectedMonth: '', dateRange: 'custom' }));
  };

  const handleSelectWeek = (weekItem) => {
    if (!weekItem) return;
    setFilters((prev) => ({ ...prev, selectedWeek: weekItem, selectedDate: '', selectedMonth: '', dateRange: 'custom' }));
  };

  const handleSelectMonth = (monthName) => {
    if (!monthName) return;
    setFilters((prev) => ({ ...prev, selectedMonth: monthName, selectedDate: '', selectedWeek: null, dateRange: 'custom' }));
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

        {/* 3. SUMMARY KPI CARDS (6 CARDS) - Fully Reactive Interactive Filter Buttons */}
        <KpiCards
          kpis={activeKpis}
          activeDateRange={filters.dateRange}
          selectedDate={filters.selectedDate}
          selectedWeek={filters.selectedWeek}
          selectedMonth={filters.selectedMonth}
          activeStatus={filters.status}
          onSelectFilter={handleKpiCardClick}
          onSelectCustomDate={handleKpiCustomDate}
          onSelectWeek={handleSelectWeek}
          onSelectMonth={handleSelectMonth}
        />

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
          <div className="lg:col-span-8" id="recent-activity-section">
            <RecentActivityTable
              activities={filteredDeliveries}
              onViewDetails={(item) => setSelectedDelivery(item)}
              onViewAll={handleViewAllActivity}
              onUpdateDeliveredBy={handleUpdateDeliveredBy}
            />
          </div>
        </section>

        {/* 6. ROW 3: FULL DELIVERY FILE LIST - Independent Local Table Filters */}
        <FileListTable
          deliveries={deliveries}
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
    </div>
  );
}
