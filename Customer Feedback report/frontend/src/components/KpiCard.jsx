import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // e.g. { value: '+12%', isPositive: true }
  badge = null,
  colorScheme = 'blue', // 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'slate'
  onClick = null
}) {
  const schemeStyles = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-900/20 dark:to-indigo-900/10',
      border: 'border-blue-200/70 dark:border-blue-800/40',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10',
      border: 'border-emerald-200/70 dark:border-emerald-800/40',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-500/10 to-red-500/5 dark:from-rose-900/20 dark:to-red-900/10',
      border: 'border-rose-200/70 dark:border-rose-800/40',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/20 dark:to-orange-900/10',
      border: 'border-amber-200/70 dark:border-amber-800/40',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500/10 to-violet-500/5 dark:from-purple-900/20 dark:to-violet-900/10',
      border: 'border-purple-200/70 dark:border-purple-800/40',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    },
    slate: {
      bg: 'bg-slate-50/70 dark:bg-slate-900/50',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  };

  const style = schemeStyles[colorScheme] || schemeStyles.slate;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border ${style.border} ${style.bg} p-4 sm:p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {value}
            </span>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`rounded-lg p-2.5 shadow-sm ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`inline-flex items-center font-semibold ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

