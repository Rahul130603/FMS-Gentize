import React from 'react';

export default function BarChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400">
        No trend data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total_count || 0), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-3 w-full" style={{ height }}>
        {data.map((item, idx) => {
          const total = item.total_count || 0;
          const pos = item.positive_count || 0;
          const neg = item.negative_count || 0;
          const heightPct = Math.max(12, Math.round((total / maxVal) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                <span className="font-bold">{item.period}</span>: {total} total ({pos} pos, {neg} critic) | Avg: {item.average_rating}★
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all flex flex-col justify-end overflow-hidden shadow-sm"
                style={{ height: `${heightPct}%` }}
              >
                {neg > 0 && (
                  <div
                    className="w-full bg-rose-500"
                    style={{ height: `${(neg / total) * 100}%` }}
                    title={`${neg} criticisms`}
                  />
                )}
              </div>

              {/* Label */}
              <span className="mt-2 text-[10px] sm:text-xs font-mono font-medium text-slate-500 dark:text-slate-400 truncate max-w-full">
                {item.period}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-blue-600" />
          <span>Positive Feedback</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-rose-500" />
          <span>Critic Feedback</span>
        </div>
      </div>
    </div>
  );
}

