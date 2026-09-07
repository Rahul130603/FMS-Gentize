import React from 'react';
import Chart from 'react-apexcharts';

export default function PerformanceChart({ period, onPeriodChange, data }) {
  const defaultData = {
    categories: ['POD', 'EPDF', 'SCANNED FILE', 'E-ISBN'],
    delivered: [142, 118, 98, 76],
    target: [96, 88, 82, 58],
    prior: [78, 84, 58, 46]
  };

  const dataset = data || defaultData;

  const series = [
    { name: 'Delivered', data: dataset.delivered || [] },
    { name: 'Target', data: dataset.target || [] },
    { name: 'Prior', data: dataset.prior || [] }
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 180,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 3
      }
    },
    colors: ['#2563eb', '#0ea5e9', '#f59e0b'],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    xaxis: {
      categories: dataset.categories || ['POD', 'EPDF', 'SCANNED FILE', 'E-ISBN'],
      labels: { style: { fontSize: '10px', colors: '#64748b' } }
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
      fontSize: '10px'
    },
    tooltip: {
      y: { formatter: (val) => `${val.toLocaleString()} files` }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800">DELIVERY PERFORMANCE</h3>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => onPeriodChange('daily')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                period === 'daily'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('weekly')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              Wk
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('monthly')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'font-bold bg-white text-blue-700 shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              Mo
            </button>
          </div>
        </div>

        <div className="min-h-[175px] mt-2">
          <Chart
            options={options}
            series={series}
            type="bar"
            height={180}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
