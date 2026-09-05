import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

/**
 * Integration note: in the real FMS, the host application already knows
 * who is logged in. Two ways to wire this module in:
 *
 *  1. (Recommended) Have the host app store its own JWT in the same
 *     localStorage key this context reads (`tqm-token` / `tqm-user`), or
 *     simply replace the body of `login`/bootstrap below with a call
 *     into the host app's existing auth store/context.
 *  2. Keep this context as-is and point VITE_API_BASE_URL's backend at
 *     the same JWT secret as the host FMS, so tokens issued by the host
 *     login flow are accepted here unchanged.
 *
 * The rest of this module only ever reads `user.id / .name / .role /
 * .department` from this context — swapping the source is a one-file change.
 */
const AuthContext_STORAGE_TOKEN_KEY = 'tqm-token';
const STORAGE_USER_KEY = 'tqm-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (employeeCode) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/dev-auth/login', { employeeCode });
      window.localStorage.setItem(AuthContext_STORAGE_TOKEN_KEY, data.data.token);
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AuthContext_STORAGE_TOKEN_KEY);
    window.localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthContext_STORAGE_TOKEN_KEY as TOKEN_KEY };
