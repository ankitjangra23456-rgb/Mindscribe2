import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, Bell, Save, Edit2, Camera, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, activeRole } = useAuth();

  const [tab,      setTab]      = useState('profile');
  const [saved,    setSaved]    = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState({
    full_name:   user?.full_name     || '',
    email:       user?.email         || '',
    department:  user?.department    || 'Computer Science',
    university:  user?.university    || 'Chandigarh University',
    phone:       user?.phone         || '+91 98765 43210',
    bio:         'Passionate about AI, algorithms and competitive programming. Currently pursuing my final year at Chandigarh University.',
  });
  const [pwdForm, setPwdForm]   = useState({ current: '', newPwd: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    emailExamReminder: true,
    emailResults: true,
    emailAI: false,
    pushAll: true,
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPwd = (k) => (e) => setPwdForm(f => ({ ...f, [k]: e.target.value }));
  const toggleNotif = (k) => setNotifications(n => ({ ...n, [k]: !n[k] }));

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const ROLE_COLOR = {
    Student:   'bg-blue-100 text-blue-700 border-blue-200',
    Faculty:   'bg-purple-100 text-purple-700 border-purple-200',
    Admin:     'bg-rose-100 text-rose-700 border-rose-200',
    Recruiter: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const TABS = [
    { id: 'profile',       label: 'My Profile',      icon: User },
    { id: 'security',      label: 'Security',         icon: Lock },
    { id: 'notifications', label: 'Notifications',    icon: Bell },
  ];

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile and preferences</p>
        </div>

        {/* Success toast */}
        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Changes saved successfully!
          </div>
        )}

        {/* Profile hero card */}
        <div className="card p-6 shadow-card">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ROLE_COLOR[activeRole]}`}>
                  {activeRole}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Active
                </span>
              </div>
            </div>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn-primary py-2 px-4 text-xs">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div className="card p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={set('full_name')}
                  disabled={!editMode} className={`input-base ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input type="email" value={form.email} onChange={set('email')}
                  disabled={!editMode} className={`input-base ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <input type="text" value={form.department} onChange={set('department')}
                  disabled={!editMode} className={`input-base ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">University</label>
                <input type="text" value={form.university} onChange={set('university')}
                  disabled={!editMode} className={`input-base ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={set('phone')}
                  disabled={!editMode} className={`input-base ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={set('bio')}
                  disabled={!editMode}
                  className={`input-base resize-none ${!editMode ? 'bg-slate-50 cursor-default' : ''}`} />
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button onClick={() => setEditMode(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <div className="card p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
                <input type="password" value={pwdForm.current} onChange={setPwd('current')}
                  placeholder="••••••••" className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <input type="password" value={pwdForm.newPwd} onChange={setPwd('newPwd')}
                  placeholder="Min. 8 characters" className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <input type="password" value={pwdForm.confirm} onChange={setPwd('confirm')}
                  placeholder="Repeat new password" className="input-base" />
              </div>
              <button onClick={() => { setSaved(true); setPwdForm({ current: '', newPwd: '', confirm: '' }); setTimeout(() => setSaved(false), 2500); }}
                className="btn-primary">
                <Shield className="w-4 h-4" /> Update Password
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Active Sessions</h3>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', ip: '192.168.1.100', time: 'Now — Active', current: true },
                  { device: 'Mobile Safari',     ip: '45.22.11.4',   time: 'Yesterday, 9:30 AM', current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.device}</p>
                      <p className="text-xs text-slate-400">{s.ip} · {s.time}</p>
                    </div>
                    {s.current
                      ? <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Current</span>
                      : <button className="text-xs font-semibold text-rose-600 hover:text-rose-700">Revoke</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {tab === 'notifications' && (
          <div className="card p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
            <div className="space-y-3">
              {[
                { key: 'emailExamReminder', label: 'Exam Reminders',        desc: 'Get notified 1 hour before exam starts' },
                { key: 'emailResults',      label: 'Result Notifications',   desc: 'Receive results when available' },
                { key: 'emailAI',           label: 'AI Feedback Summaries',  desc: 'Weekly AI performance digest' },
                { key: 'pushAll',           label: 'Push Notifications',     desc: 'Enable all push alerts' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{n.label}</p>
                    <p className="text-xs text-slate-400">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(n.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications[n.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[n.key] ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
