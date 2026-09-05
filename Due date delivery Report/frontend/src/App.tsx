import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import ReportPage from './pages/ReportPage';
import SimpleListPage from './pages/SimpleListPage';
import UpcomingPage from './pages/UpcomingPage';
import CompletionReportPage from './pages/CompletionReportPage';
import EmployeePerformancePage from './pages/EmployeePerformancePage';
import ManagerPerformancePage from './pages/ManagerPerformancePage';
import DepartmentPerformancePage from './pages/DepartmentPerformancePage';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <div className="empty-state">You don't have access to this report.</div>;
  return <>{children}</>;
}

function Routed() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="due-today" element={<SimpleListPage title="Due Today Report" endpoint="/reports/due-today" scope="due_today" />} />
        <Route path="due-tomorrow" element={<SimpleListPage title="Due Tomorrow Report" endpoint="/reports/due-tomorrow" scope="due_tomorrow" />} />
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="overdue" element={<SimpleListPage title="Overdue Report" endpoint="/reports/overdue" scope="overdue" />} />
        <Route
          path="completion"
          element={
            <RoleRoute roles={['Admin', 'Manager', 'HR']}>
              <CompletionReportPage />
            </RoleRoute>
          }
        />
        <Route
          path="reports/employee"
          element={
            <RoleRoute roles={['Admin', 'Manager', 'HR']}>
              <EmployeePerformancePage />
            </RoleRoute>
          }
        />
        <Route
          path="reports/manager"
          element={
            <RoleRoute roles={['Admin', 'HR']}>
              <ManagerPerformancePage />
            </RoleRoute>
          }
        />
        <Route
          path="reports/department"
          element={
            <RoleRoute roles={['Admin', 'HR']}>
              <DepartmentPerformancePage />
            </RoleRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <RoleRoute roles={['Admin', 'Manager', 'HR']}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routed />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
