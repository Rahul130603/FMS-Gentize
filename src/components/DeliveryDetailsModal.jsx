import React from 'react';
import { Info, X, BookOpen } from 'lucide-react';

export default function DeliveryDetailsModal({ delivery, onClose, onUpdateDeliveredBy }) {
  if (!delivery) return null;

  const fileName =
    delivery.file || (delivery.files && delivery.files[0]?.name) || `${delivery.id}_doc.pdf`;
  const qty = delivery.qty || delivery.filesCount || 1;
  const deliveredBy = delivery.deliveredBy || 'QC';

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              DELIVERY & BOOK DETAILS
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Delivery ID:</span>
            <span className="font-bold text-slate-900">{delivery.id}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Customer:</span>
            <span className="font-bold text-slate-900">{delivery.customer}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">ISBN:</span>
            <span className="font-mono text-blue-700 font-bold">{delivery.isbn || '978-0-13-235088-4'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Book Title:</span>
            <span className="font-semibold text-slate-900 text-right max-w-[240px] truncate" title={delivery.title || fileName}>
              {delivery.title || fileName}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Author:</span>
            <span className="font-medium text-slate-800">{delivery.author || 'Production Staff'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">File Name:</span>
            <span className="font-mono text-slate-700 text-[11px] truncate max-w-[220px]">{fileName}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Production Type:</span>
            <span className="font-bold text-blue-700">{delivery.type}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Quantity / Copies:</span>
            <span className="font-black text-slate-900">{qty}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Delivery Date & Time:</span>
            <span className="font-semibold text-slate-800">{delivery.date} {delivery.time}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Delivered By:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                deliveredBy === 'QC'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : deliveredBy === 'QAG'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : deliveredBy === 'TL'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {deliveredBy}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 font-medium">Status:</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
                delivery.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {delivery.status}
            </span>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
