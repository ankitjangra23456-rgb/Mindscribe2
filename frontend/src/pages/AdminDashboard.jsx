import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Users, BookOpen, Award, BarChart2, Shield, Sparkles, TrendingUp, Target, Search, Eye, Trash2, Edit2, PlusCircle } from 'lucide-react';
import { MOCK_CANDIDATES } from '../services/mockData';

function StatCard({ label, value, icon: Icon, trend, color = 'blue' }) {
  const iconClass = {
    blue:   'bg-blue-100 text-blue-600',
    emerald:'bg-emerald-100 text-emerald-600',
    amber:  'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    rose:   'bg-rose-100 text-rose-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }[color];

  return (
    <div className="card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      {trend && (
        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('All');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('students')) setActiveTab('students');
    else if (path.includes('faculty')) setActiveTab('faculty');
    else if (path.includes('exams')) setActiveTab('exams');
    else if (path.includes('logs')) setActiveTab('audit');
    else setActiveTab('overview');
  }, [location.pathname]);

  const TABS = [
    { id: 'overview',    label: 'Overview' },
    { id: 'students',    label: 'Students' },
    { id: 'faculty',     label: 'Faculty' },
    { id: 'exams',       label: 'Exams' },
    { id: 'audit',       label: 'Audit Logs' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Chandigarh University — System Overview</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Super Admin
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Telemetry Bar */}
            <div className="card p-4 shadow-card bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="text-xs font-bold text-slate-200">System Telemetry & Health</p>
                  <p className="text-[11px] text-slate-400">FastAPI Core API v1.0.0 • SQL Server Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs font-mono">
                <div><span className="text-slate-400">API Latency:</span> <span className="text-emerald-400 font-bold">14ms</span></div>
                <div><span className="text-slate-400">Active WS:</span> <span className="text-blue-400 font-bold">148</span></div>
                <div><span className="text-slate-400">CPU Load:</span> <span className="text-purple-400 font-bold">12.4%</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Students"     value="3,842"  icon={Users}    color="blue"   trend="+12% this month" />
              <StatCard label="Faculty"      value="148"    icon={Award}    color="purple" />
              <StatCard label="Exams"        value="1,276"  icon={Target}   color="amber"  trend="+8%" />
              <StatCard label="Courses"      value="94"     icon={BookOpen} color="emerald"/>
              <StatCard label="Certificates" value="6,204"  icon={Award}    color="indigo" />
              <StatCard label="Recruiters"   value="36"     icon={Shield}   color="rose"   />
            </div>

            {/* System Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-6 shadow-card space-y-4">
                <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
                <div className="space-y-3">
                  {[
                    { msg: 'New student registered: Priya Patel',               time: '2m ago',  color: 'bg-blue-500' },
                    { msg: 'Exam "Database Mid Term" published by Dr. Priya',    time: '15m ago', color: 'bg-emerald-500' },
                    { msg: 'Certificate issued to Rahul Verma (DS Final)',       time: '1h ago',  color: 'bg-purple-500' },
                    { msg: 'Recruiter TechCorp accessed SCI report #4482',       time: '2h ago',  color: 'bg-amber-500' },
                    { msg: 'AI Viva session completed for student #1029',        time: '3h ago',  color: 'bg-indigo-500' },
                    { msg: 'System backup completed successfully',               time: '5h ago',  color: 'bg-slate-400' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${a.color}`}></div>
                      <p className="flex-1 text-sm text-slate-700 font-medium">{a.msg}</p>
                      <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 shadow-card space-y-4">
                <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Add Student',      icon: Users,     color: 'bg-blue-600 text-white hover:bg-blue-700' },
                    { label: 'Add Faculty',       icon: Award,     color: 'bg-purple-600 text-white hover:bg-purple-700' },
                    { label: 'Create Course',     icon: BookOpen,  color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                    { label: 'View Analytics',    icon: BarChart2, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                    { label: 'Issue Certificate', icon: Award,     color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                    { label: 'AI Reports',        icon: Sparkles,  color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                  ].map(a => (
                    <button
                      key={a.label}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl font-semibold text-sm transition-all ${a.color}`}
                    >
                      <a.icon className="w-4 h-4" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject score breakdown */}
            <div className="card p-6 shadow-card space-y-4">
              <h2 className="text-base font-bold text-slate-900">University-wide Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { dept: 'Computer Science', avg: 82, students: 1240 },
                  { dept: 'Electronics',      avg: 74, students: 860 },
                  { dept: 'Mechanical',        avg: 71, students: 780 },
                  { dept: 'Civil',             avg: 69, students: 620 },
                  { dept: 'Chemical',          avg: 73, students: 342 },
                ].map(d => (
                  <div key={d.dept} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-slate-800">{d.dept}</p>
                      <span className="text-xs font-bold text-slate-600">{d.avg}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.avg}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">{d.students} students</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search students..." value={search}
                  onChange={e => setSearch(e.target.value)} className="input-base pl-9" />
              </div>
              <button className="btn-primary text-xs px-4 py-2">
                <PlusCircle className="w-3.5 h-3.5" /> Add Student
              </button>
            </div>
            <div className="card shadow-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Name', 'Email', 'Department', 'Semester', 'SCI Score', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_CANDIDATES.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {c.name.split(' ').map(w=>w[0]).join('')}
                          </div>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{c.name.toLowerCase().replace(' ','.')}@cu.ac.in</td>
                      <td className="px-4 py-3 text-slate-600">Computer Science</td>
                      <td className="px-4 py-3 text-slate-600">6th</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-700">{c.sci_score}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>{c.available ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Audit Logs Tab ── */}
        {activeTab === 'audit' && (
          <div className="card shadow-card overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Audit Log Trail</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { action: 'LOGIN',         user: 'admin@cu.ac.in',      ip: '192.168.1.1',   time: '10:45 AM' },
                { action: 'EXAM_PUBLISH',  user: 'priya@cu.ac.in',      ip: '192.168.1.20',  time: '10:30 AM' },
                { action: 'CERT_ISSUE',    user: 'admin@cu.ac.in',      ip: '192.168.1.1',   time: '10:15 AM' },
                { action: 'STUDENT_ADD',   user: 'admin@cu.ac.in',      ip: '192.168.1.1',   time: '09:55 AM' },
                { action: 'REPORT_ACCESS', user: 'rahul@techcorp.com',   ip: '45.22.11.4',    time: '09:32 AM' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                    log.action === 'LOGIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    log.action === 'REPORT_ACCESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>{log.action}</span>
                  <span className="text-sm text-slate-700 font-medium flex-1">{log.user}</span>
                  <span className="text-xs text-slate-400 font-mono">{log.ip}</span>
                  <span className="text-xs text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Faculty Tab ── */}
        {activeTab === 'faculty' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Faculty Members</h2>
              <button className="btn-primary text-xs px-4 py-2">
                <PlusCircle className="w-3.5 h-3.5" /> Add Faculty Member
              </button>
            </div>
            <div className="card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Name', 'Email', 'Department', 'Exams Created', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Dr. Priya Singh',    email: 'priya.singh@cu.ac.in', dept: 'Computer Science', exams: 14, status: 'Active' },
                    { name: 'Prof. Rajesh Kumar', email: 'rajesh.k@cu.ac.in',    dept: 'Electronics',      exams: 9,  status: 'Active' },
                    { name: 'Dr. Ananya Sharma',  email: 'ananya.s@cu.ac.in',    dept: 'Mechanical',       exams: 11, status: 'Active' },
                  ].map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{f.name}</td>
                      <td className="px-4 py-3 text-slate-500">{f.email}</td>
                      <td className="px-4 py-3 text-slate-600">{f.dept}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{f.exams}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Exams Tab ── */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">University Examination Schedule</h2>
              <button className="btn-primary text-xs px-4 py-2">
                <PlusCircle className="w-3.5 h-3.5" /> Schedule New Exam
              </button>
            </div>
            <div className="card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Exam Title', 'Subject', 'Faculty Incharge', 'Total Candidates', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { title: 'Data Structures Mid Term', subject: 'Computer Science', faculty: 'Dr. Priya Singh', students: 148, status: 'Scheduled' },
                    { title: 'Database Systems Final',   subject: 'Computer Science', faculty: 'Dr. Priya Singh', students: 132, status: 'Completed' },
                    { title: 'Digital Electronics Quiz', subject: 'Electronics',      faculty: 'Prof. Rajesh Kumar', students: 96, status: 'Completed' },
                  ].map((e, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{e.title}</td>
                      <td className="px-4 py-3 text-slate-600">{e.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{e.faculty}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{e.students}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          e.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Audit Logs Tab ── */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">System Audit Trail</h2>
                <p className="text-xs text-slate-500">Tamper-proof log of all system events and actions</p>
              </div>
              <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Export Audit Report
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {['All', 'LOGIN', 'EXAM_PUBLISH', 'CERT_ISSUE', 'REPORT_ACCESS', 'LOGOUT'].map(f => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    auditFilter === f
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="card shadow-card overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{['Timestamp', 'Action', 'User', 'IP Address', 'Detail', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { ts: '2026-08-04 23:01:14', action: 'LOGIN',         user: 'ankit@example.com',     ip: '192.168.1.42', detail: 'Student login success',       status: 'success' },
                    { ts: '2026-08-04 22:58:30', action: 'EXAM_PUBLISH',  user: 'priya.singh@cu.ac.in',  ip: '10.0.0.14',    detail: 'DS Mid Term published',        status: 'success' },
                    { ts: '2026-08-04 22:45:00', action: 'CERT_ISSUE',    user: 'system@examx.ai',       ip: 'Internal',     detail: 'Cert CERT-DS-9942 generated',  status: 'success' },
                    { ts: '2026-08-04 21:30:12', action: 'REPORT_ACCESS', user: 'hr@techcorp.com',       ip: '203.0.113.5',  detail: 'Candidate SCI #4482 accessed',  status: 'success' },
                    { ts: '2026-08-04 21:20:45', action: 'LOGIN',         user: 'unknown@hacker.com',    ip: '45.33.32.156', detail: 'Failed login attempt (403)',    status: 'error'   },
                    { ts: '2026-08-04 21:00:00', action: 'LOGOUT',        user: 'rajesh.k@cu.ac.in',     ip: '10.0.0.16',    detail: 'Session ended',                status: 'success' },
                    { ts: '2026-08-04 20:44:30', action: 'EXAM_PUBLISH',  user: 'ananya.s@cu.ac.in',     ip: '10.0.0.18',    detail: 'Digital Electronics Quiz live',status: 'success' },
                  ]
                    .filter(l => auditFilter === 'All' || l.action === auditFilter)
                    .map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">{l.ts}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            l.action === 'LOGIN'         ? 'bg-blue-100 text-blue-700' :
                            l.action === 'LOGOUT'        ? 'bg-slate-100 text-slate-600' :
                            l.action === 'EXAM_PUBLISH'  ? 'bg-emerald-100 text-emerald-700' :
                            l.action === 'CERT_ISSUE'    ? 'bg-purple-100 text-purple-700' :
                            l.action === 'REPORT_ACCESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>{l.action}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{l.user}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{l.ip}</td>
                        <td className="px-4 py-3 text-slate-600">{l.detail}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            l.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>{l.status === 'success' ? '✓ OK' : '✕ FAILED'}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
