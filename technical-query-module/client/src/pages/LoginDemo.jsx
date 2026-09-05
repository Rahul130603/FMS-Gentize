import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

/**
 * Standalone/demo login screen. In the real FMS this page does not
 * exist — the user is already authenticated by the host app before
 * ever reaching the Technical Query module, and AuthContext should be
 * wired to that existing session (see the comment at the top of
 * context/AuthContext.jsx).
 */
export default function LoginDemo() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/dev-auth/demo-users').then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const handleLogin = async (code) => {
    setError('');
    try {
      const user = await login(code);
      navigate(user.role === 'employee' ? '/technical-query/raise' : '/reports/technical-queries');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center text-white mb-3">
            <Wrench size={22} />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Technical Query Module</h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            Demo sign-in — pick a seeded user to explore the module as an employee or admin.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 mb-3 text-center">{error}</p>}

        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u.employee_code}
              disabled={loading}
              onClick={() => handleLogin(u.employee_code)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors text-left"
            >
              <span>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">{u.full_name}</span>
                <span className="block text-xs text-gray-400 capitalize">{u.role.replace('_', ' ')} · {u.department}</span>
              </span>
              <LogIn size={15} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
