import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ListChecks, FolderKanban, Inbox, Eye, Loader, CheckCircle2,
  Archive, RotateCcw, XCircle, BarChart3, Users, BookOpenText, PieChart, Gauge, TrendingUp,
  Clock, RotateCw, Search, ChevronDown, Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-700 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
      >
        {title}
        <ChevronDown size={13} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="space-y-0.5 mb-2">{children}</div>}
    </div>
  );
}

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-64 shrink-0 h-full border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white">
          <Wrench size={16} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">FMS</p>
          <p className="text-[11px] text-gray-400">Technical Query Module</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!isAdmin && (
          <Section title="Technical Query">
            <NavItem to="/technical-query/dashboard" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/technical-query/raise" icon={PlusCircle} label="Raise Technical Query" />
            <NavItem to="/technical-query/my-queries" icon={ListChecks} label="My Technical Queries" />
          </Section>
        )}

        {isAdmin && (
          <>
            <Section title="Technical Queries">
              <NavItem to="/admin/technical-queries" icon={FolderKanban} label="All Queries" end />
              <NavItem to="/admin/technical-queries/open" icon={Inbox} label="Open" />
              <NavItem to="/admin/technical-queries/in_review" icon={Eye} label="In Review" />
              <NavItem to="/admin/technical-queries/in_progress" icon={Loader} label="In Progress" />
              <NavItem to="/admin/technical-queries/resolved" icon={CheckCircle2} label="Resolved" />
              <NavItem to="/admin/technical-queries/closed" icon={XCircle} label="Closed" />
              <NavItem to="/admin/technical-queries/reopened" icon={RotateCcw} label="Reopened" />
              <NavItem to="/admin/technical-queries/archived" icon={Archive} label="Archived" />
            </Section>

            <Section title="Technical Query Reports">
              <NavItem to="/reports/technical-queries" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/reports/technical-queries/table" icon={BarChart3} label="Full Report" />
              <NavItem to="/reports/technical-queries/employee" icon={Users} label="Employee Report" />
              <NavItem to="/reports/technical-queries/isbn" icon={BookOpenText} label="ISBN Report" />
              <NavItem to="/reports/technical-queries/categories" icon={PieChart} label="Category Analytics" />
              <NavItem to="/reports/technical-queries/performance" icon={Gauge} label="Resolution Performance" />
              <NavItem to="/reports/technical-queries/trend" icon={TrendingUp} label="Trend Report" />
              <NavItem to="/reports/technical-queries/pending" icon={Clock} label="Pending Report" />
              <NavItem to="/reports/technical-queries/reopened" icon={RotateCw} label="Reopened Report" />
              <NavItem to="/reports/technical-queries/search" icon={Search} label="Global Search" />
            </Section>
          </>
        )}
      </nav>
    </aside>
  );
}
