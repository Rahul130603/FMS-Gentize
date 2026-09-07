import React from 'react';

export default function RecentActivityTable({
  activities = [],
  onViewDetails,
  onViewAll
}) {
  const items = activities.slice(0, 6);

  const getTypeBadgeClass = (type) => {
    if (type === 'POD') return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (type === 'EPDF') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (type === 'SCANNED FILE') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-purple-50 text-purple-700 border border-purple-200';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'QC':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            QC
          </span>
        );
      case 'QAG':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            QAG
          </span>
        );
      case 'TL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            TL
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            MANAGER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-700 border border-slate-200">
            {role || 'QC'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col space-y-2.5 h-full">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800">RECENT DELIVERY ACTIVITY</h3>
          <p className="text-[10px] text-slate-400">
            Real-time dispatch log with ISBN, book titles, and approval roles
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 text-[11px]">
            <tr>
              <th className="py-2 px-2.5 font-bold whitespace-nowrap">Delivery ID</th>
              <th className="py-2 px-2.5 font-bold whitespace-nowrap">Customer</th>
              <th className="py-2 px-2.5 font-bold whitespace-nowrap">ISBN</th>
              <th className="py-2 px-2.5 font-bold">Title</th>
              <th className="py-2 px-2.5 font-bold">Author</th>
              <th className="py-2 px-2.5 font-bold text-center">Type</th>
              <th className="py-2 px-2.5 font-bold whitespace-nowrap">Date & Time</th>
              <th className="py-2 px-2.5 font-bold text-center whitespace-nowrap">Delivered By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400 text-xs">
                  No matching deliveries found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onViewDetails(item)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Delivery ID */}
                  <td className="py-2.5 px-2.5 font-bold text-slate-900 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                    {item.id}
                  </td>

                  {/* Customer */}
                  <td className="py-2.5 px-2.5 font-medium text-slate-700 whitespace-nowrap">
                    {item.customer}
                  </td>

                  {/* ISBN */}
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-blue-700 font-semibold whitespace-nowrap">
                    {item.isbn || '978-0-13-235088-4'}
                  </td>

                  {/* Title */}
                  <td
                    className="py-2.5 px-2.5 font-semibold text-slate-800 max-w-[160px] truncate"
                    title={item.title}
                  >
                    {item.title || item.file}
                  </td>

                  {/* Author */}
                  <td className="py-2.5 px-2.5 text-slate-600 whitespace-nowrap text-[11px]">
                    {item.author || 'Production Staff'}
                  </td>

                  {/* Type */}
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeBadgeClass(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-2.5 px-2.5 text-slate-600 whitespace-nowrap text-[11px]">
                    {item.date} <span className="text-slate-400 font-normal ml-1">{item.time}</span>
                  </td>

                  {/* Delivered By Badge */}
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                    {getRoleBadge(item.deliveredBy)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
