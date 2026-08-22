import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Student',   email: 'ankit@example.com',      role: 'Student' },
  { label: 'Faculty',   email: 'priya.singh@cu.ac.in',   role: 'Faculty' },
  { label: 'Admin',     email: 'admin@cu.ac.in',          role: 'Admin' },
];

export default function Login() {
  const { login, loginWithOTP, sendRegisterOTP } = useAuth();
  const navigate  = useNavigate();

  const [mode,     setMode]     = useState('password'); // 'password' | 'otp'
  const [email,    setEmail]    = useState('ankit@example.com');
  const [password, setPassword] = useState('password');
  const [otpCode,  setOtpCode]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [otpSent,  setOtpSent]  = useState(false);
  const [infoMsg,  setInfoMsg]  = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      let user;
      if (mode === 'otp') {
        user = await loginWithOTP(email, otpCode);
      } else {
        user = await login(email, password);
      }
      const role = user?.roles?.[0] || user?.activeRole;
      if (role === 'Admin')     navigate('/admin');
      else if (role === 'Faculty')   navigate('/faculty');
      else                           navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await sendRegisterOTP({ email });
      setOtpSent(true);
      if (res?.otp_code) {
        setOtpCode(res.otp_code);
        setInfoMsg(`6-Digit OTP Code (${res.otp_code}) sent to ${email}!`);
      } else {
        setInfoMsg(`6-Digit OTP Code sent to ${email}! Check your inbox.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP email');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword('password');
    setError('');
    setInfoMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left — Illustration Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full"></div>

        <div className="relative z-10 text-center text-white space-y-6 max-w-md">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <span className="text-3xl font-extrabold">ExamX</span>
              <span className="text-3xl font-extrabold text-blue-200">AI</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Intelligent Assessment &amp;</h2>
            <h2 className="text-2xl font-bold text-blue-200">Skill Verification Platform</h2>
          </div>

          <p className="text-blue-100 text-sm leading-relaxed">
            Adaptive exams, AI Viva follow-ups, semantic scoring, and real-time Skill Confidence Index (SCI) — all in one unified platform.
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Adaptive Difficulty', 'AI Viva Engine', 'SCI Analytics', 'PWA Offline', 'Tamper-Proof Ledger'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-100 border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-extrabold text-blue-600">ExamX</span>
            <span className="text-2xl font-extrabold text-slate-800">AI</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome Back!</h1>
              <p className="text-slate-500 text-sm mt-1">Sign in to continue to your account</p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('password'); setError(''); setInfoMsg(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'password' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('otp'); setError(''); setInfoMsg(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🔑 6-Digit OTP Login
              </button>
            </div>

            {/* Demo accounts */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Quick login as:</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      email === acc.email
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info / Error */}
            {infoMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                ✓ {infoMsg}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-base flex-1"
                  />
                  {mode === 'otp' && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading || !email}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all disabled:opacity-50"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {mode === 'password' ? (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <a href="#forgot" className="text-xs text-blue-600 hover:underline font-semibold">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className="input-base font-mono text-lg text-center tracking-widest"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Processing...</>
                  : (mode === 'otp' ? 'Verify OTP & Sign In' : 'Sign In')
                }
              </button>
            </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">New user?</p>
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
            >
              Register new account
            </Link>
          </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2024 ExamX AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
