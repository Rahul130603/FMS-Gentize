import React from 'react';
import { Calendar, CalendarRange, Package, Clock, CheckCircle } from 'lucide-react';

export default function KpiCards({ kpis, prodType = 'all' }) {
  // Compute scaling factor if a specific production type is filtered
  let factor = 1.0;
  if (prodType === 'POD') factor = 0.337;
  else if (prodType === 'EPDF') factor = 0.286;
  else if (prodType === 'SCANNED FILE') factor = 0.239;
  else if (prodType === 'E-ISBN') factor = 0.139;

  const today = Math.round((kpis?.today ?? 48) * factor);
  const week = Math.round((kpis?.week ?? 286) * factor);
  const month = Math.round((kpis?.month ?? 1248) * factor);
  const total = Math.round((kpis?.total ?? 1864) * factor);
  const pending = kpis?.pending ?? 37;
  const successRate = kpis?.successRate ?? '98.4%';

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Today's Delivery */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 shadow-2xs transition-all hover:border-blue-300">
          <div className="text-2xs font-bold text-blue-800 flex items-center justify-between">
            <span>TODAY'S DELIVERY</span>
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1.5">{today}</div>
          <div className="text-[10px] text-blue-700/80 font-medium mt-0.5">Files Delivered Today</div>
        </div>

        {/* Card 2: This Week */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="text-2xs font-bold text-emerald-800 flex items-center justify-between">
            <span>THIS WEEK</span>
            <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1.5">{week}</div>
          <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5">Files Delivered</div>
        </div>

        {/* Card 3: This Month */}
        <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3.5 shadow-2xs transition-all hover:border-purple-300">
          <div className="text-2xs font-bold text-purple-800 flex items-center justify-between">
            <span>THIS MONTH</span>
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1.5">{month.toLocaleString()}</div>
          <div className="text-[10px] text-purple-700/80 font-medium mt-0.5">Files Delivered</div>
        </div>

        {/* Card 4: Total Production */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-2xs transition-all hover:bg-slate-800">
          <div className="text-2xs font-medium text-slate-300 flex items-center justify-between">
            <span>TOTAL PRODUCTION</span>
            <Package className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{total.toLocaleString()}</div>
          <div className="text-[10px] text-slate-300 font-medium mt-0.5">Production Items</div>
        </div>

        {/* Card 5: Pending Delivery */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="text-2xs font-bold text-amber-800 flex items-center justify-between">
            <span>PENDING DELIVERY</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1.5">{pending}</div>
          <div className="text-[10px] text-amber-700/80 font-medium mt-0.5">Awaiting Delivery</div>
        </div>

        {/* Card 6: Delivery Success */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="text-2xs font-bold text-emerald-800 flex items-center justify-between">
            <span>DELIVERY SUCCESS</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5">{successRate}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Successful Deliveries</div>
        </div>
      </div>
    </section>
  );
}
