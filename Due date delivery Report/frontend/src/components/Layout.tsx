import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

interface NavItem { to: string; label: string; roles: string[] }

const NAV: NavItem[] = [
  { to: '/', label: '📊 Dashboard', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/calendar', label: '📅 Due Date Calendar', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/report', label: '📋 Delivery Report', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/due-today', label: 'Due Today', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/due-tomorrow', label: 'Due Tomorrow', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/upcoming', label: 'Upcoming', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/overdue', label: 'Overdue', roles: ['Admin', 'Manager', 'HR', 'Employee'] },
  { to: '/completion', label: 'Completion Report', roles: ['Admin', 'Manager', 'HR'] },
  { to: '/reports/employee', label: 'Employee Performance', roles: ['Admin', 'Manager', 'HR'] },
  { to: '/reports/manager', label: 'Manager Performance', roles: ['Admin', 'HR'] },
  { to: '/reports/department', label: 'Department Performance', roles: ['Admin', 'HR'] },
  { to: '/analytics', label: '📈 Analytics', roles: ['Admin', 'Manager', 'HR'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const current = NAV.find((n) => n.to === location.pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">🚚 FMS Delivery</div>
        <nav>
          {NAV.filter((n) => user && n.roles.includes(user.role)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', padding: '10px 12px' }}>
          Signed in as <b style={{ color: '#fff' }}>{user?.name}</b> ({user?.role})
        </div>
      </aside>
      <div className="main-col">
        <div className="topbar">
          <div className="breadcrumb">Delivery Control Center {current && <> / <b>{current.label.replace(/^[^\w]+/, '')}</b></>}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <NotificationBell />
            <button className="btn btn-sm" onClick={toggle}>{dark ? '☀️ Light' : '🌙 Dark'}</button>
            <button className="btn btn-sm" onClick={logout}>Log out</button>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
