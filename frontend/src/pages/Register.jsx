import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const ROLES = ['Student', 'Faculty', 'Admin', 'Recruiter'];

export default function Register() {
  const { user, sendRegisterOTP, verifyRegisterOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Registration details, 2 = OTP Verification
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', role: 'Student' });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // If user clicks email verification link and gets authenticated automatically via Supabase
  React.useEffect(() => {
    if (user) {
      const mainRole = user.activeRole || user.roles?.[0] || 'Student';
      if (mainRole === 'Admin') navigate('/admin');
      else if (mainRole === 'Faculty') navigate('/faculty');
      else if (mainRole === 'Recruiter') navigate('/recruiter');
      else navigate('/student');
    }
  }, [user, navigate]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send Registration OTP / Link
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRegisterOTP({ email: form.email });

      setSuccessMsg(`A 6-digit OTP code has been sent to ${form.email}. Please check your inbox.`);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const userObj = await verifyRegisterOTP({
        email: form.email,
        otpCode: otpCode.trim(),
        password: form.password,
        full_name: form.full_name,
        role: form.role
      });

      setSuccessMsg('Email verified & registration complete! Redirecting...');
      
      const mainRole = userObj?.activeRole || userObj?.roles?.[0] || form.role;
      setTimeout(() => {
        if (mainRole === 'Admin') navigate('/admin');
        else if (mainRole === 'Faculty') navigate('/faculty');
        else if (mainRole === 'Recruiter') navigate('/recruiter');
        else navigate('/student');
      }, 1000);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await sendRegisterOTP({ email: form.email });
      setSuccessMsg(`New 6-digit OTP code sent to ${form.email}. Please check your inbox.`);
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-2 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            ExamX <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {step === 1 ? 'New Account Registration' : 'Verify Email with Supabase OTP'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <span>1. Account Details</span>
            {step > 1 && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
          <div className="w-4 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            <span>2. Email OTP</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-5">

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={set('full_name')}
                    placeholder="Ankit Sharma"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <select value={form.role} onChange={set('role')} className="input-base bg-white">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 6 characters"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="Repeat password"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Sending OTP...</>
                ) : (
                  <>Send OTP Verification Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit OTP code sent to <strong className="text-slate-800">{form.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="input-base text-center tracking-[0.5em] text-xl font-mono font-bold"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Verifying OTP...</>
                ) : (
                  <>Verify OTP &amp; Complete Registration</>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-600 hover:text-slate-900 underline font-medium"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Alternative login route */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">Already have an account?</p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
            >
              Login to existing account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
