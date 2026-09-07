import React from 'react';
import Chart from 'react-apexcharts';

export default function AnalyticsComboChart({ period, onPeriodChange, data }) {
  const defaultData = {
    labels: ['Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7'],
    pod: [18, 21, 16, 24, 19, 22, 20],
    epdf: [12, 15, 13, 18, 14, 16, 17],
    scanned: [8, 9, 11, 12, 10, 8, 11],
    eisbn: [5, 6, 4, 7, 5, 6, 5],
    total: [43, 51, 44, 61, 48, 52, 53]
  };

  const dataset = data || defaultData;

  const headingText =
    period === 'day'
      ? 'Daily Delivery Count'
      : period === 'week'
      ? 'Weekly Delivery Count'
      : 'Monthly Delivery Count';

  const series = [
    { name: 'POD', type: 'column', data: dataset.pod || [] },
    { name: 'EPDF', type: 'column', data: dataset.epdf || [] },
    { name: 'Scanned', type: 'column', data: dataset.scanned || [] },
    { name: 'E-ISBN', type: 'column', data: dataset.eisbn || [] },
    { name: 'Total', type: 'line', data: dataset.total || [] }
  ];

  const options = {
    chart: {
      height: 180,
      type: 'line',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    stroke: {
      width: [0, 0, 0, 0, 2.5],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 2
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#1e293b'],
    xaxis: {
      categories: dataset.labels || [],
      labels: { style: { fontSize: '11px', colors: '#64748b' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { fontSize: '10px', colors: '#94a3b8' } }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '10.5px',
      markers: { radius: 12 }
    },
    tooltip: {
      shared: true,
      intersect: false
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">{headingText}</span>
          </div>
          {/* Day / Week / Month Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onPeriodChange('day')}
              className={`px-2.5 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                period === 'day'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              DAY
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('week')}
              className={`px-2.5 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                period === 'week'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              WEEK
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('month')}
              className={`px-2.5 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                period === 'month'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              MONTH
            </button>
          </div>
        </div>

        <div className="min-h-[175px] mt-2">
          <Chart
            options={options}
            series={series}
            type="line"
            height={180}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
