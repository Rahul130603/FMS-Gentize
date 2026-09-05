import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'usr_admin_1',
    name: 'System Administrator',
    email: 'admin@fms.com',
    role: 'ADMIN'
  });
  const [role, setRole] = useState(localStorage.getItem('fms_user_role') || 'ADMIN');
  const [token, setToken] = useState(localStorage.getItem('fms_auth_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('fms_user_role', role);
  }, [role]);

  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const res = await api.login({ role: targetRole });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        setRole(res.user.role);
        localStorage.setItem('fms_auth_token', res.token);
        localStorage.setItem('fms_user_role', res.user.role);
      }
    } catch (e) {
      // Offline fallback
      setRole(targetRole);
      setUser({
        id: targetRole === 'ADMIN' ? 'usr_admin_1' : 'usr_emp_1',
        name: targetRole === 'ADMIN' ? 'System Administrator' : 'John Developer (POD)',
        email: targetRole === 'ADMIN' ? 'admin@fms.com' : 'developer@fms.com',
        role: targetRole
      });
      localStorage.setItem('fms_user_role', targetRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, isAdmin: role === 'ADMIN', loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

