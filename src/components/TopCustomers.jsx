import React from 'react';
import { Check } from 'lucide-react';

export default function TopCustomers({ customers, selectedCustomer = 'all', onSelectCustomer }) {
  const defaultList = [
    { name: 'ABC Publishing', count: 286, max: 350, color: 'bg-blue-500', text: 'text-blue-700' },
    { name: 'XYZ Books', count: 241, max: 350, color: 'bg-sky-500', text: 'text-sky-700' },
    { name: 'Global Publications', count: 198, max: 350, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { name: 'Prime Publishers', count: 176, max: 350, color: 'bg-purple-500', text: 'text-purple-700' },
    { name: 'Sunrise Publications', count: 143, max: 350, color: 'bg-amber-500', text: 'text-amber-700' },
    { name: 'Knowledge House', count: 122, max: 350, color: 'bg-indigo-500', text: 'text-indigo-700' }
  ];

  const list = customers && customers.length > 0 ? customers : defaultList;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800">TOP CUSTOMERS BY DELIVERY</h3>
          <div className="flex items-center gap-1.5">
            {selectedCustomer !== 'all' && (
              <button
                onClick={() => onSelectCustomer && onSelectCustomer('all')}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            )}
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Volume
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {list.map((cust, idx) => {
            const maxVal = cust.max || 350;
            const pct = Math.round((cust.count / maxVal) * 100);
            const isSelected = selectedCustomer === cust.name;

            return (
              <div
                key={cust.name}
                onClick={() =>
                  onSelectCustomer &&
                  onSelectCustomer(isSelected ? 'all' : cust.name)
                }
                className={`p-1.5 -mx-1.5 rounded-lg transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/90 border border-blue-200 shadow-2xs'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    <span className="text-slate-400 font-bold text-[11px]">{idx + 1}.</span>
                    <span>{cust.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-600 text-white">
                        <Check className="w-2.5 h-2.5" /> Filtered
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${cust.text || 'text-blue-700'}`}>{cust.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className={`${cust.color || 'bg-blue-500'} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
