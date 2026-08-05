import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAPI, registerAPI, getMeAPI, logoutAPI } from '../services/authService';
import { mockLogin, sleep } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]             = useState(null);
  const [activeRole, setActiveRole] = useState('Student');
  const [loading, setLoading]       = useState(true);

  // Sync activeRole whenever user changes
  useEffect(() => {
    if (user?.activeRole) {
      setActiveRole(user.activeRole);
    } else if (user?.roles?.[0]) {
      setActiveRole(user.roles[0]);
    }
  }, [user]);

  // Restore session from API or localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await getMeAPI();
          setUser(userData);
          setLoading(false);
          return;
        } catch {
          // Token invalid or API server offline
        }
      }
      
      try {
        const saved = localStorage.getItem('examx_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setActiveRole(parsed.activeRole || parsed.roles?.[0] || 'Student');
        }
      } catch { /* ignore */ }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginAPI(email, password);
      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token);
        if (res.refresh_token) {
          localStorage.setItem('refresh_token', res.refresh_token);
        }
        const me = await getMeAPI();
        const mainRole = me.roles?.[0] || 'Student';
        const userObj = { ...me, activeRole: mainRole };
        setUser(userObj);
        setActiveRole(mainRole);
        localStorage.setItem('examx_user', JSON.stringify(userObj));
        return userObj;
      }
    } catch {
      // Fallback to mock authentication if real backend API is not responding or demo user login used
      const userData = await mockLogin(email, password);
      const mainRole = userData.roles?.[0] || 'Student';
      const userObj = { ...userData, activeRole: mainRole };
      setUser(userObj);
      setActiveRole(mainRole);
      localStorage.setItem('examx_user', JSON.stringify(userObj));
      return userObj;
    }
  };

  const register = async (data) => {
    try {
      const res = await registerAPI({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role
      });
      return res;
    } catch {
      await sleep(600);
      const newUser = {
        id: Date.now(),
        full_name: data.full_name,
        email: data.email,
        roles: [data.role],
        activeRole: data.role,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      return newUser;
    }
  };

  const logout = () => {
    logoutAPI();
    setUser(null);
    setActiveRole('Student');
    localStorage.removeItem('examx_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const switchRole = (newRole) => {
    if (!user) return;
    
    // Security check: Only allow switching if user's granted roles include target role, OR if user is Admin
    const isGranted = user.roles?.includes(newRole);
    const isAdmin   = user.roles?.includes('Admin');

    if (isGranted || isAdmin) {
      setActiveRole(newRole);
      const updatedUser = { ...user, activeRole: newRole };
      setUser(updatedUser);
      localStorage.setItem('examx_user', JSON.stringify(updatedUser));
    } else {
      console.warn(`Unauthorized role switch attempt to ${newRole}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole, activeRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
