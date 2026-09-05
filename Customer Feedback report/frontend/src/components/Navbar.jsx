import React from 'react';
import { Shield, User, Sun, Moon, Sparkles, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenSubmitModal }) {
  const { user, role, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6">
      {/* Brand & Module Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20">
            FMS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                File Allocation Management
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                Enterprise 2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin Reports / <span className="font-semibold text-blue-600 dark:text-blue-400">Customer Feedback &amp; Critic Intelligence</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Dark Mode, Submit Feedback Simulator */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Customer Feedback Simulator Button */}
        <button
          onClick={onOpenSubmitModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          title="Simulate a customer submitting new feedback"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Customer Feedback</span>
        </button>

        {/* Persona Switcher for Testing RBAC */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => switchRole('ADMIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => switchRole('EMPLOYEE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              role === 'EMPLOYEE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Employee</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Info Avatar */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-200 leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

