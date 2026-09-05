import React from 'react';

export default function DonutChart({
  positive = 0,
  negative = 0,
  size = 140,
  strokeWidth = 18
}) {
  const total = positive + negative;
  const positivePct = total > 0 ? (positive / total) * 100 : 0;
  const negativePct = total > 0 ? (negative / total) * 100 : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const positiveDash = (positivePct / 100) * circumference;
  const negativeDash = (negativePct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Positive stroke (green) */}
          {positive > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${positiveDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
          {/* Negative stroke (rose) */}
          {negative > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${negativeDash} ${circumference}`}
              strokeDashoffset={`-${positiveDash}`}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Positive ({Math.round(positivePct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-400">Critic ({Math.round(negativePct)}%)</span>
        </div>
      </div>
    </div>
  );
}

