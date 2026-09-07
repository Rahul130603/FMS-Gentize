import React from 'react';
import { Info } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
