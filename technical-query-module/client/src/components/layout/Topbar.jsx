import React from 'react';
import { Moon, Sun, LogOut, UserCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-5">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Technical Query Management</p>
        <p className="text-xs text-gray-400">Raise, track and resolve technical issues</p>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-slate-700">
          <UserCircle2 size={26} className="text-gray-400" />
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.role?.replace('_', ' ')} · {user?.department}</p>
          </div>
          <button onClick={logout} className="ml-1 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
