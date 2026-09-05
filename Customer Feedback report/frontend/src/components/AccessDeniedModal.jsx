import React from 'react';
import { ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDeniedModal() {
  const { switchRole } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-200 dark:border-rose-800">
          <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 mb-3">
          <Lock className="w-3 h-3 mr-1" /> HTTP 403 Forbidden - Role Restricted
        </span>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Administrator Access Required
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          The <strong>Customer Feedback &amp; Critic Report Module</strong> contains confidential management analytics, file quality assessments, and publisher sentiment metrics.
          <br /><br />
          <span className="text-rose-600 dark:text-rose-400 font-medium">
            Employees are strictly restricted from viewing or exporting this module.
          </span>
        </p>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Testing Authorization? Switch to Admin persona:
          </p>
          <button
            onClick={() => switchRole('ADMIN')}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors gap-2"
          >
            <UserCheck className="w-4 h-4" /> Switch Persona to Administrator (ADMIN)
          </button>
        </div>
      </div>
    </div>
  );
}

