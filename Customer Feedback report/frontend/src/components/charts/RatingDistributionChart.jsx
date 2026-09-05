import React from 'react';
import { Star } from 'lucide-react';

export default function RatingDistributionChart({ distribution = {}, totalCount = 0 }) {
  const stars = [5, 4, 3, 2, 1];
  
  const getCountForStar = (s) => {
    if (distribution[`star${s}`] !== undefined) return distribution[`star${s}`];
    const found = Array.isArray(distribution) ? distribution.find(d => d.rating === s) : null;
    return found ? found.count : 0;
  };

  const getPercent = (count) => {
    if (!totalCount || totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const starColors = {
    5: 'bg-emerald-500',
    4: 'bg-teal-500',
    3: 'bg-amber-500',
    2: 'bg-orange-500',
    1: 'bg-rose-500'
  };

  return (
    <div className="space-y-3">
      {stars.map((s) => {
        const count = getCountForStar(s);
        const percent = getPercent(count);
        return (
          <div key={s} className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 w-12 font-medium text-slate-700 dark:text-slate-300">
              <span>{s}</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>

            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${starColors[s]}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="w-16 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
              {count} <span className="text-slate-400 text-[10px]">({percent}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

