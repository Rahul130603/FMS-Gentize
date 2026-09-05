import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  CheckCircle2,
  BarChart3,
  MessageSquareQuote,
  Layers,
  Star,
  Download,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenExportModal }) {
  const { role, isAdmin } = useAuth();

  const reportNavItems = [
    { id: 'summary', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'grid', label: 'Customer Feedback Grid', icon: MessageSquareQuote },
    { id: 'isbn', label: 'ISBN Deep-Dive & Timeline', icon: BookOpen },
    { id: 'titles', label: 'Book Titles & Editions', icon: Layers },
    { id: 'positive', label: 'Appreciation Showcase', icon: Sparkles },
    { id: 'negative', label: 'Critic & Issue Analytics', icon: AlertTriangle },
    { id: 'analytics', label: 'Rating Trends Studio', icon: BarChart3 },
    { id: 'export-hub', label: 'Export Intelligence Hub', icon: Download }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Core FMS Navigation Sections */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            FMS Core Production
          </p>
          <nav className="space-y-1 text-xs">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <span>Project Allocation</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-slate-400" />
              <span>Developer Tasks</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <span>QC &amp; QAG Review</span>
            </button>
          </nav>
        </div>

        {/* Admin Reports Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Admin Reports
            </p>
            {!isAdmin && (
              <span className="flex items-center gap-0.5 text-[10px] text-rose-500 font-semibold">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          {isAdmin ? (
            <nav className="space-y-1 text-xs">
              <div className="px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-blue-600" />
                <span>Customer Feedback Report</span>
              </div>

              {/* Sub-views inside the Feedback Report */}
              <div className="pl-3 space-y-0.5 border-l-2 border-blue-500/30 ml-3.5 mt-1">
                {reportNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          ) : (
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-400">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5" /> Employee View
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customer Feedback &amp; Critic Reports are hidden for Employee roles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info / Quick Export */}
      {isAdmin && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenExportModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Quick Export Center</span>
          </button>
        </div>
      )}
    </aside>
  );
}

