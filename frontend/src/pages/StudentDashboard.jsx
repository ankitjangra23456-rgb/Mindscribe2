import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SCIRadarChart from '../components/SCIRadarChart';
import { SkeletonStatCard } from '../components/Skeleton';
import {
  TrendingUp, BookOpen, Target, Award, Sparkles, ArrowRight,
  PlayCircle, BarChart2, Clock, CheckCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUpcomingExams } from '../hooks/useExams';
import { useSCI } from '../hooks/useSCI';
import { MOCK_PAST_EXAMS, MOCK_PERFORMANCE_DATA } from '../services/mockData';

// Reusable stat card
function StatCard({ label, value, suffix, trend, trendLabel, color = 'blue', extra }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    purple:  'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className="card p-5 space-y-3 shadow-card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        {suffix && <span className="text-sm text-slate-400 font-medium">{suffix}</span>}
      </div>
      <div className="flex items-center justify-between">
        {trend && (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> {trend}
          </span>
        )}
        {extra && <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${colors[color]}`}>{extra}</span>}
      </div>
      {trendLabel && <p className="text-xs text-slate-400">{trendLabel}</p>}
    </div>
  );
}

// Mini line chart using SVG
function LineChart({ data }) {
  const max = Math.max(...data.map(d => d.score));
  const min = Math.min(...data.map(d => d.score));
  const range = max - min || 1;
  const w = 500, h = 120;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - ((d.score - min) / range) * (h - 20) - 10;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
        {/* Fill area */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`}
          fill="url(#chartFill)"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Line */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="white" strokeWidth="2" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1 px-1">
        {data.map(d => <span key={d.month}>{d.month}</span>)}
      </div>
    </div>
  );
}



export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { exams: upcomingExams } = useUpcomingExams();
  const { sciScore } = useSCI();

  const isCertificates = location.pathname.includes('certificates');
  const isCoding       = location.pathname.includes('coding');

  const [selectedCert, setSelectedCert] = useState(null);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (isCertificates) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Verified Certificates</h1>
              <p className="text-xs text-slate-500 mt-1">Tamper-proof academic skill credentials verified on ledger</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Data Structures & Algorithms Mastery', date: 'Issued 15 May 2024', grade: 'Grade A+', id: 'CERT-DS-9942', score: '94%' },
              { title: 'Database Systems & SQL Advanced', date: 'Issued 10 Apr 2024', grade: 'Grade A', id: 'CERT-DB-4410', score: '89%' },
            ].map(c => (
              <div key={c.id} className="card p-6 shadow-card space-y-4 border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{c.grade}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{c.date} • Verification ID: {c.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCert(c)}
                  className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" /> View & Print Verified Certificate
                </button>
              </div>
            ))}
          </div>

          {/* ── Certificate Modal ── */}
          {selectedCert && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-xl w-full space-y-6 animate-in fade-in duration-200">
                {/* Certificate Frame */}
                <div className="border-4 border-double border-amber-400 p-6 rounded-xl bg-gradient-to-b from-amber-50/30 via-white to-slate-50 text-center space-y-4 relative">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-amber-200 pb-3">
                    <span>CHANDIGARH UNIVERSITY</span>
                    <span>EXAMX AI VERIFIED</span>
                  </div>
                  <div className="py-2">
                    <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                    <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">Certificate of Achievement</h2>
                    <p className="text-xs text-slate-500 mt-1">This is to certify that</p>
                    <p className="text-2xl font-black text-blue-700 my-2">{user?.full_name || 'Ankit Kumar'}</p>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      has successfully passed the comprehensive assessment in <strong>{selectedCert.title}</strong> with an outstanding score of <strong>{selectedCert.score}</strong>.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-amber-200 text-left text-[11px]">
                    <div>
                      <p className="font-bold text-slate-700">Verification ID:</p>
                      <p className="font-mono text-slate-500">{selectedCert.id}</p>
                      <p className="text-slate-400 mt-1">{selectedCert.date}</p>
                    </div>
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-lg p-1.5 flex flex-col items-center justify-center text-[9px] font-mono text-center">
                      <span>QR VERIFIED</span>
                      <span className="text-[7px] text-amber-300">LEDGER OK</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" /> Print / Save PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (isCoding) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Coding Arena</h1>
          <div className="card p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900">Active Coding Challenges</h2>
            <div className="space-y-3">
              {[
                { title: 'Two Sum Problem', diff: 'Easy', lang: 'Python / Java / C++', points: '+50 SCI' },
                { title: 'Binary Tree Level Order Traversal', diff: 'Medium', lang: 'Python / Java / C++', points: '+100 SCI' },
                { title: 'Longest Palindromic Substring', diff: 'Hard', lang: 'Python / Java / C++', points: '+200 SCI' },
              ].map(c => (
                <div key={c.title} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{c.lang} • Difficulty: {c.diff}</p>
                  </div>
                  <button onClick={() => navigate('/student/practice')} className="btn-primary text-xs px-4 py-2">
                    Solve Challenge ({c.points})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greeting}, {firstName}! {hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Ready to learn and assess yourself today?</p>
          </div>
          <button onClick={() => navigate('/student/exams')} className="btn-primary hidden sm:flex">
            <PlayCircle className="w-4 h-4" />
            Start Exam
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Exams"    value="24"     trend="+12%"  trendLabel="from last month" />
          <StatCard label="Completed"      value="18"     trend="+8%"   trendLabel="from last month" />
          <StatCard label="Average Score"  value="82.4"   suffix="%"    trend="+5.6%" trendLabel="from last month" />
          <StatCard label="Skill Score"    value={sciScore} suffix="/100" extra="Excellent" color="emerald" />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SCI Radar Chart */}
          <div className="lg:col-span-4 card p-6 shadow-card space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Skill Confidence Index</h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                SCI: {sciScore}/100
              </span>
            </div>
            <SCIRadarChart
              size={220}
              skills={[
                { label: 'DSA',     value: 92 },
                { label: 'DBMS',    value: 89 },
                { label: 'OS',      value: 55 },
                { label: 'Networks',value: 70 },
                { label: 'Algo',    value: 85 },
                { label: 'Hashing', value: 40 },
              ]}
            />
            <p className="text-xs text-slate-400 text-center">Based on your last 5 assessments</p>
          </div>

          {/* Upcoming Exams */}
          <div className="lg:col-span-8 card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upcoming Exams</h2>
              <button onClick={() => navigate('/student/exams')} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{exam.subject}</p>
                      <p className="text-xs text-slate-400">{exam.type} • {exam.date}, {exam.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/exam-runner')}
                    className="shrink-0 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Start Exam
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="lg:col-span-6 card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Performance Overview</h2>
              <select className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 6 Months</option>
              </select>
            </div>

            {/* Y-axis labels & chart */}
            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-[10px] text-slate-300 py-1 shrink-0">
                <span>100</span>
                <span>75</span>
                <span>50</span>
              </div>
              <div className="flex-1">
                <LineChart data={MOCK_PERFORMANCE_DATA} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Quick Actions */}
          <div className="lg:col-span-7 card p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Start Exam',    icon: PlayCircle,  color: 'bg-blue-600 text-white hover:bg-blue-700',    path: '/exam-runner' },
                { label: 'Practice Zone', icon: Target,      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', path: '/student/practice' },
                { label: 'View Results',  icon: BarChart2,   color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', path: '/student/results' },
                { label: 'Certificates', icon: Award,        color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', path: '/student/certificates' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold text-xs transition-all border border-transparent ${a.color}`}
                >
                  <a.icon className="w-5 h-5" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="lg:col-span-5 card p-6 shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">AI Recommendation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Based on your performance, focus more on <strong>Data Structures – Trees and Graphs</strong> to improve your score.
                </p>
                <button
                  onClick={() => navigate('/student/practice')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exam History */}
        <div className="card shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Exams</h2>
            <button onClick={() => navigate('/student/results')} className="text-xs font-semibold text-blue-600 hover:underline">
              View All Results →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_PAST_EXAMS.map(exam => (
              <div key={exam.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{exam.subject}</p>
                  <p className="text-xs text-slate-400">{exam.type} • {exam.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{exam.score}/{exam.total}</p>
                  <p className="text-xs text-slate-400">Rank #{exam.rank}</p>
                </div>
                <span className={`hidden sm:block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  exam.score >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {exam.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
