import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import ProfileHero from './components/ProfileHero';
import KpiGrid from './components/KpiGrid';
import DonutChart from './components/DonutChart';
import StageBarChart from './components/StageBarChart';
import TrendChart from './components/TrendChart';
import WorkbenchTable from './components/WorkbenchTable';
import ReviewersTable from './components/ReviewersTable';
import ComparisonTable from './components/ComparisonTable';
import ReasonDonuts from './components/ReasonDonuts';
import CorrectionModal from './components/CorrectionModal';
import Toast from './components/Toast';

import { 
  fetchHealth, 
  fetchEmployees, 
  fetchDashboard, 
  resolveFile, 
  resetResolutions 
} from './services/api';

export default function App() {
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState('05-09-2026');
  const [dateIso, setDateIso] = useState('2026-09-05');
  const [employee, setEmployee] = useState('SUDHIN');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  const [employees, setEmployees] = useState([]);
  const [data, setData] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = useCallback((msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  }, []);

  // Check health and load employees on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const health = await fetchHealth();
        setBackendOnline(health?.status === 'ok');

        const emps = await fetchEmployees();
        setEmployees(emps);
      } catch (err) {
        console.warn('Backend server not yet ready, will retry:', err);
        setBackendOnline(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch Dashboard Data whenever filters change
  const refreshDashboard = useCallback(async () => {
    try {
      const result = await fetchDashboard(employee, date, period, { role, status });
      setData(result);
      setBackendOnline(true);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setBackendOnline(false);
    }
  }, [employee, date, period, role, status]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Date Change Handlers
  const handleDateChange = (isoVal) => {
    if (!isoVal) return;
    setDateIso(isoVal);
    const parts = isoVal.split('-');
    if (parts.length === 3) {
      const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      setDate(formatted);
      showToast(`Date changed to ${formatted}`);
    }
  };

  const navigateDate = (step) => {
    let dt = new Date();
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts[0].length === 4) {
        dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        dt = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }

    if (period === 'month') {
      dt.setMonth(dt.getMonth() + step);
    } else if (period === 'week') {
      dt.setDate(dt.getDate() + (step * 7));
    } else {
      dt.setDate(dt.getDate() + step);
    }

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    handleDateChange(`${y}-${m}-${d}`);
  };

  const setTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    handleDateChange(`${y}-${m}-${d}`);
  };

  // 1-Click File Resolution
  const handleQuickResolve = async (fileId) => {
    try {
      showToast(`Saving resolution for file ${fileId}...`);
      await resolveFile(employee, fileId);
      showToast(`File ${fileId} marked as Corrected (Saved to Server)`);
      await refreshDashboard();
    } catch (err) {
      showToast('Resolution error: ' + err.message);
    }
  };

  const handleResetFilters = async () => {
    setPeriod('day');
    setDate('05-09-2026');
    setDateIso('2026-09-05');
    setEmployee('SUDHIN');
    setRole('All');
    setStatus('All');
    showToast('Filters reset to default');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      
      {/* 1. Header */}
      <Header
        period={period}
        setPeriod={setPeriod}
        date={date}
        dateIso={dateIso}
        onDateChange={handleDateChange}
        navigateDate={navigateDate}
        employee={employee}
        setEmployee={setEmployee}
        employees={employees}
        displayInfo={data?.displayInfo}
        backendOnline={backendOnline}
      />

      {/* 2. Filter Operations Desk */}
      <FilterPanel
        dateIso={dateIso}
        onDateChange={handleDateChange}
        navigateDate={navigateDate}
        setTodayDate={setTodayDate}
        displayInfo={data?.displayInfo}
        employee={employee}
        setEmployee={setEmployee}
        employees={employees}
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 space-y-4 pb-12">
        
        {/* 3. Employee Profile Hero Card */}
        <ProfileHero
          employee={employee}
          employees={employees}
          kpis={data?.kpis}
          status={status}
          setStatus={setStatus}
          displayInfo={data?.displayInfo}
        />

        {/* 4. Operational Defect KPI Cards */}
        <KpiGrid kpis={data?.kpis} />

        {/* 5. Charts Row (Donut, Grouped Bars, Trend) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
          <DonutChart distribution={data?.distribution} />
          <StageBarChart stageWise={data?.stage_wise} />
          <TrendChart dailyTrend={data?.daily_trend} displayInfo={data?.displayInfo} />
        </div>

        {/* 6. Candidate File Workbench Table */}
        <WorkbenchTable
          files={data?.files}
          onSelectFile={setModalFile}
          onQuickResolve={handleQuickResolve}
          kpis={data?.kpis}
          period={period}
        />

        {/* 7. Reviewers & Employee Comparisons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 items-start">
          <div className="lg:col-span-4">
            <ReviewersTable reviewers={data?.reviewers} employees={employees} />
          </div>
          <div className="lg:col-span-8">
            <ComparisonTable 
              comparison={data?.comparison} 
              currentEmployee={employee} 
              displayInfo={data?.displayInfo} 
            />
          </div>
        </div>

        {/* 8. Rework & Reject Reason Breakdown Donuts */}
        <ReasonDonuts 
          reworkReasons={data?.rework_reasons} 
          rejectReasons={data?.reject_reasons} 
        />

      </main>

      {/* File Inspector Modal */}
      {modalFile && (
        <CorrectionModal
          file={modalFile}
          onClose={() => setModalFile(null)}
          onResolve={async (fId) => {
            await handleQuickResolve(fId);
            setModalFile(null);
          }}
        />
      )}

      {/* Toast Alert */}
      <Toast message={toast.message} visible={toast.visible} />

    </div>
  );
}
