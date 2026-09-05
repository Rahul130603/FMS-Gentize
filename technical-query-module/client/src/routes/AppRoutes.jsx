import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import LoginDemo from '../pages/LoginDemo';

import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import RaiseQuery from '../pages/employee/RaiseQuery';
import MyQueries from '../pages/employee/MyQueries';
import QueryDetailsEmployee from '../pages/employee/QueryDetailsEmployee';

import AllQueries from '../pages/admin/AllQueries';
import QueryDetailsAdmin from '../pages/admin/QueryDetailsAdmin';

import ReportsDashboard from '../pages/reports/ReportsDashboard';
import ReportTable from '../pages/reports/ReportTable';
import EmployeeReport from '../pages/reports/EmployeeReport';
import IsbnReport from '../pages/reports/IsbnReport';
import CategoryAnalytics from '../pages/reports/CategoryAnalytics';
import ResolutionPerformance from '../pages/reports/ResolutionPerformance';
import TrendReport from '../pages/reports/TrendReport';
import PendingReport from '../pages/reports/PendingReport';
import ReopenedReport from '../pages/reports/ReopenedReport';
import GlobalSearch from '../pages/reports/GlobalSearch';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/technical-query/raise" replace />;
  return children;
}

export default function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginDemo />} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Navigate to={isAdmin ? '/reports/technical-queries' : '/technical-query/dashboard'} replace />} />

        {/* Employee module */}
        <Route path="/technical-query/dashboard" element={<EmployeeDashboard />} />
        <Route path="/technical-query/raise" element={<RaiseQuery />} />
        <Route path="/technical-query/my-queries" element={<MyQueries />} />
        <Route path="/technical-query/my-queries/:id" element={<QueryDetailsEmployee />} />

        {/* Admin module */}
        <Route path="/admin/technical-queries" element={<RequireAdmin><AllQueries /></RequireAdmin>} />
        <Route path="/admin/technical-queries/detail/:id" element={<RequireAdmin><QueryDetailsAdmin /></RequireAdmin>} />
        <Route path="/admin/technical-queries/:status" element={<RequireAdmin><AllQueries /></RequireAdmin>} />

        {/* Reports module */}
        <Route path="/reports/technical-queries" element={<RequireAdmin><ReportsDashboard /></RequireAdmin>} />
        <Route path="/reports/technical-queries/table" element={<RequireAdmin><ReportTable /></RequireAdmin>} />
        <Route path="/reports/technical-queries/employee" element={<RequireAdmin><EmployeeReport /></RequireAdmin>} />
        <Route path="/reports/technical-queries/isbn" element={<RequireAdmin><IsbnReport /></RequireAdmin>} />
        <Route path="/reports/technical-queries/categories" element={<RequireAdmin><CategoryAnalytics /></RequireAdmin>} />
        <Route path="/reports/technical-queries/performance" element={<RequireAdmin><ResolutionPerformance /></RequireAdmin>} />
        <Route path="/reports/technical-queries/trend" element={<RequireAdmin><TrendReport /></RequireAdmin>} />
        <Route path="/reports/technical-queries/pending" element={<RequireAdmin><PendingReport /></RequireAdmin>} />
        <Route path="/reports/technical-queries/reopened" element={<RequireAdmin><ReopenedReport /></RequireAdmin>} />
        <Route path="/reports/technical-queries/search" element={<RequireAdmin><GlobalSearch /></RequireAdmin>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
