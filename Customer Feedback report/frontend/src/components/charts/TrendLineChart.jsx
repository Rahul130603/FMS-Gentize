import React from 'react';

export default function TrendLineChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400">
        No trend history available
      </div>
    );
  }

  const width = 600;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const ratings = data.map(d => parseFloat(d.average_rating) || 0);
  const minRating = 1;
  const maxRating = 5;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * graphWidth;
    const rating = parseFloat(d.average_rating) || 0;
    const y = padding + graphHeight - ((rating - minRating) / (maxRating - minRating)) * graphHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[5, 4, 3, 2, 1].map((r) => {
          const y = padding + graphHeight - ((r - minRating) / (maxRating - minRating)) * graphHeight;
          return (
            <g key={r}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {r}★
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              className="fill-white dark:fill-slate-900 stroke-blue-600 stroke-[2.5] hover:r-6 transition-all"
            />
            {/* Label */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-mono"
            >
              {p.period}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

