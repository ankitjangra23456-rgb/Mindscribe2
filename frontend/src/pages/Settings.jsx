import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Monitor, Globe, Sun, Save, LogOut, Trash2, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [saved,    setSaved] = useState(false);
  const [settings, setSettings] = useState({
    theme:      'light',
    language:   'English',
    dateFormat: 'DD/MM/YYYY',
    timezone:   'Asia/Kolkata (IST)',
    compact:    false,
  });

  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Customize your ExamX AI experience</p>
        </div>

        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" /> Settings saved!
          </div>
        )}

        {/* Theme */}
        <div className="card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Sun className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Appearance</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['light', 'dark'].map(t => (
              <button
                key={t}
                onClick={() => set('theme')(t)}
                className={`p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                  settings.theme === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                }`}
              >
                {t === 'light' ? '☀️' : '🌙'} {t} Mode
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Compact Layout</p>
              <p className="text-xs text-slate-400">Reduce spacing for denser information</p>
            </div>
            <button
              onClick={() => toggle('compact')}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.compact ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.compact ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        {/* Region & Language */}
        <div className="card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Region & Language</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Language</label>
              <select value={settings.language} onChange={e => set('language')(e.target.value)} className="input-base bg-white">
                {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date Format</label>
              <select value={settings.dateFormat} onChange={e => set('dateFormat')(e.target.value)} className="input-base bg-white">
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Timezone</label>
              <select value={settings.timezone} onChange={e => set('timezone')(e.target.value)} className="input-base bg-white">
                {['Asia/Kolkata (IST)', 'UTC', 'Asia/Dubai (GST)', 'America/New_York (EST)'].map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" /> Save Settings
        </button>

        {/* Danger Zone */}
        <div className="card p-6 shadow-card border-rose-200 space-y-4">
          <h2 className="text-base font-bold text-rose-700">Danger Zone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Sign Out</p>
                <p className="text-xs text-slate-400">End your current session</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 bg-white text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Delete Account</p>
                <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
