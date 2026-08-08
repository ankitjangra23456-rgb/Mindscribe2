import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAPI, registerAPI, getMeAPI, logoutAPI, sendOTPAPI, verifyOTPAPI } from '../services/authService';
import { supabase } from '../services/supabaseClient';

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

  // Restore session from API or Supabase / localStorage
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

    // Listen to Supabase Auth state changes (e.g. Email Link Verification click)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const supaUser = session.user;
        const meta = supaUser.user_metadata || {};
        const email = supaUser.email;
        const full_name = meta.full_name || email.split('@')[0];
        const role = meta.role || 'Student';

        // Save user details to Supabase profiles table
        try {
          await supabase.from('profiles').upsert({
            id: supaUser.id,
            email,
            full_name,
            role,
            created_at: new Date().toISOString()
          });
        } catch { /* ignore */ }

        // Sync with local backend
        try {
          await registerAPI({ email, password: 'Password@123', full_name, role }).catch(() => null);
        } catch { /* ignore */ }

        try {
          const me = await getMeAPI();
          if (me) {
            const mainRole = me.roles?.[0] || role;
            const userObj = { ...me, activeRole: mainRole };
            setUser(userObj);
            setActiveRole(mainRole);
            localStorage.setItem('examx_user', JSON.stringify(userObj));
          }
        } catch {
          const userObj = {
            id: supaUser.id,
            email,
            full_name,
            roles: [role],
            activeRole: role
          };
          setUser(userObj);
          setActiveRole(role);
          localStorage.setItem('examx_user', JSON.stringify(userObj));
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Authenticate with Supabase if configured
    try {
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data: supaLogin, error: supaErr } = await supabase.auth.signInWithPassword({ email, password });
        if (supaErr && !supaErr.message.includes('Invalid API key')) {
          console.warn("Supabase Auth signin note:", supaErr.message);
        }
      }
    } catch { /* ignore */ }

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
    throw new Error('Authentication failed: No access token returned');
  };

  const register = async (data) => {
    // 1. Register in backend database
    try {
      await registerAPI({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role
      });
    } catch (backendErr) {
      // If user exists in backend, proceed or rethrow if real error
      if (!backendErr.message?.includes("already registered")) {
        throw backendErr;
      }
    }

    // 2. Trigger Supabase Auth sign up with Email Verification
    let requiresEmailVerification = false;
    if (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: data.full_name, role: data.role }
        }
      });

      if (supaErr) {
        throw new Error(`Supabase Auth Error: ${supaErr.message}`);
      }

      // If Supabase requires email verification (no active session immediately)
      if (supaAuth.user && !supaAuth.session) {
        requiresEmailVerification = true;
      }
    }

    if (requiresEmailVerification) {
      return { requiresEmailVerification: true, email: data.email };
    }

    // Automatically authenticate & log in user if email confirmation is disabled or instant
    const userObj = await login(data.email, data.password);
    return { userObj, requiresEmailVerification: false };
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

  const sendRegisterOTP = async ({ email }) => {
    let backendSuccess = false;
    let backendErr = '';

    try {
      const res = await sendOTPAPI(email);
      if (res) backendSuccess = true;
    } catch (err) {
      backendErr = err.response?.data?.detail || err.message || 'Failed to connect to backend server';
    }

    if (!backendSuccess) {
      throw new Error(`OTP Delivery Failed: ${backendErr}`);
    }

    return { success: true, email };
  };

  const verifyRegisterOTP = async ({ email, otpCode, password, full_name, role }) => {
    // 1. Verify 6-digit OTP code against backend service
    let verified = false;
    try {
      const verifyRes = await verifyOTPAPI(email, otpCode);
      if (verifyRes?.valid) {
        verified = true;
      }
    } catch {
      // If backend check throws, attempt Supabase verifyOtp
    }

    // 2. Try Supabase verifyOtp if configured
    let supaUser = null;
    if (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
      let supaRes = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      }).catch(() => ({ error: true }));

      if (supaRes?.error) {
        supaRes = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'signup'
        }).catch(() => ({ error: true }));
      }

      if (!supaRes?.error && supaRes?.data?.user) {
        supaUser = supaRes.data.user;
        verified = true;
      }
    }

    if (!verified) {
      throw new Error("Invalid 6-digit OTP code. The code you entered does not match or has expired. Please check your email and try again.");
    }

    // 3. Feed User Details into Supabase profiles & auth metadata
    if (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
      try {
        await supabase.auth.updateUser({
          password: password,
          data: { full_name, role }
        });
      } catch { /* ignore */ }

      try {
        await supabase.from('profiles').upsert({
          id: supaUser?.id || `user_${Date.now()}`,
          email,
          full_name,
          role,
          created_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Supabase profiles table insert note:", dbErr);
      }
    }

    // 4. Register in local database backend
    try {
      await registerAPI({ email, password, full_name, role });
    } catch (backendErr) {
      if (!backendErr.message?.includes("already registered")) {
        console.warn("Backend register note:", backendErr);
      }
    }

    // 5. Authenticate user & set state
    try {
      const userObj = await login(email, password);
      return userObj;
    } catch {
      const me = await getMeAPI().catch(() => null);
      const mainRole = me?.roles?.[0] || role || 'Student';
      const userObj = {
        id: supaUser?.id || Date.now(),
        email,
        full_name,
        roles: [mainRole],
        activeRole: mainRole
      };
      setUser(userObj);
      setActiveRole(mainRole);
      localStorage.setItem('examx_user', JSON.stringify(userObj));
      return userObj;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, sendRegisterOTP, verifyRegisterOTP, logout, switchRole, activeRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
