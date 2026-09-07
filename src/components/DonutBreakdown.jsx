import React from 'react';
import Chart from 'react-apexcharts';

export default function DonutBreakdown({ breakdown, prodType = 'all' }) {
  let pod = 420;
  let epdf = 356;
  let scanned = 298;
  let eisbn = 174;

  if (breakdown) {
    pod = breakdown['POD'] ?? 420;
    epdf = breakdown['EPDF'] ?? 356;
    scanned = breakdown['SCANNED FILE'] ?? 298;
    eisbn = breakdown['E-ISBN'] ?? 174;
  }

  // Filter adjustment if single type selected
  if (prodType === 'POD') { epdf = 0; scanned = 0; eisbn = 0; }
  else if (prodType === 'EPDF') { pod = 0; scanned = 0; eisbn = 0; }
  else if (prodType === 'SCANNED FILE') { pod = 0; epdf = 0; eisbn = 0; }
  else if (prodType === 'E-ISBN') { pod = 0; epdf = 0; scanned = 0; }

  const dataCounts = [pod, epdf, scanned, eisbn];
  const total = dataCounts.reduce((a, b) => a + b, 0);

  const options = {
    chart: {
      type: 'donut',
      height: 160,
      sparkline: { enabled: true }
    },
    series: total > 0 ? dataCounts : [1],
    labels: ['POD', 'EPDF', 'SCANNED FILE', 'E-ISBN'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    stroke: { width: 2, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '10px',
              fontWeight: 600,
              color: '#64748b',
              formatter: () => total.toLocaleString()
            },
            value: {
              fontSize: '15px',
              fontWeight: 800,
              color: '#0f172a',
              offsetY: -2
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} (${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)`
      }
    }
  };

  const getPercent = (val) => (total > 0 ? ((val / total) * 100).toFixed(1) : '0.0');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800">DELIVERY TYPE BREAKDOWN</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            4 Categories
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="min-h-[160px] w-1/2 flex items-center justify-center">
            <Chart
              options={options}
              series={dataCounts}
              type="donut"
              width="100%"
              height={160}
            />
          </div>

          <div className="w-1/2 space-y-2 text-xs pl-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-600 font-medium">POD</span>
              </span>
              <span className="font-bold text-slate-800">
                {pod} ({getPercent(pod)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">EPDF</span>
              </span>
              <span className="font-bold text-slate-800">
                {epdf} ({getPercent(epdf)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 font-medium">SCANNED</span>
              </span>
              <span className="font-bold text-slate-800">
                {scanned} ({getPercent(scanned)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-600 font-medium">E-ISBN</span>
              </span>
              <span className="font-bold text-slate-800">
                {eisbn} ({getPercent(eisbn)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
