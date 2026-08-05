import React, { useState, useEffect } from 'react';
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
import { getMyAttempts } from '../services/examService';

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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { exams: upcomingExams } = useUpcomingExams();
  const { sciScore } = useSCI();

  const [myAttempts, setMyAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    async function loadAttempts() {
      try {
        const res = await getMyAttempts();
        setMyAttempts(Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn("Failed to load student attempts:", err);
        setMyAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    }
    loadAttempts();
  }, []);

  const isCertificates = location.pathname.includes('certificates');
  const isCoding       = location.pathname.includes('coding');

  const [selectedCert, setSelectedCert] = useState(null);

  const firstName = user?.full_name?.split(' ')[0] || 'Student';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const completedCount = myAttempts.filter(a => a.is_submitted).length;
  const totalObjScore = myAttempts.reduce((acc, cur) => acc + (cur.objective_score || 0), 0);
  const totalPossible = myAttempts.reduce((acc, cur) => acc + (cur.total_objective_marks || 0), 0);
  const avgScore = totalPossible > 0 ? ((totalObjScore / totalPossible) * 100).toFixed(1) : '0.0';

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

          {completedCount === 0 ? (
            <div className="card p-12 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Certificates Earned Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete an assessment exam to generate your ledger-verified certificate of achievement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAttempts.filter(a => a.is_submitted).map(att => (
                <div key={att.id} className="card p-6 shadow-card space-y-4 border border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Verified</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Attempt #{att.id} Certificate</h3>
                    <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(att.submit_time || att.start_time).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCert({ title: `Exam Attempt #${att.id}`, date: new Date(att.submit_time || att.start_time).toLocaleDateString(), score: `${att.objective_score}/${att.total_objective_marks}`, id: `CERT-${att.id}` })}
                    className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" /> View Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
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
          <StatCard label="Total Exams"    value={upcomingExams.length + completedCount} trendLabel="active DB total" />
          <StatCard label="Completed"      value={completedCount} trendLabel="submitted attempts" />
          <StatCard label="Average Score"  value={avgScore} suffix="%" trendLabel="objective average" />
          <StatCard label="Skill Score"    value={sciScore} suffix="/100" extra={sciScore > 0 ? "Active" : "New User"} color="emerald" />
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
                { label: 'DSA',     value: sciScore || 50 },
                { label: 'DBMS',    value: sciScore || 50 },
                { label: 'OS',      value: sciScore || 50 },
                { label: 'Networks',value: sciScore || 50 },
                { label: 'Algo',    value: sciScore || 50 },
                { label: 'Hashing', value: sciScore || 50 },
              ]}
            />
            <p className="text-xs text-slate-400 text-center">Live calculated score</p>
          </div>

          {/* Upcoming Exams */}
          <div className="lg:col-span-8 card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Available Exams</h2>
              <button onClick={() => navigate('/student/exams')} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No scheduled exams available in database</p>
                <p className="text-[11px] text-slate-400 mt-1">Exams created by faculty will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map(exam => (
                  <div key={exam.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{exam.title}</p>
                        <p className="text-xs text-slate-400">{exam.duration_minutes} Mins • Window: {new Date(exam.start_time).toLocaleDateString()}</p>
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
            )}
          </div>
        </div>

        {/* Recent Exam History */}
        <div className="card shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Exam Attempts</h2>
          </div>
          {myAttempts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No exam attempts recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Start an active exam above to generate your assessment record.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAttempts.map(att => (
                <div key={att.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">Attempt #{att.id} - Exam #{att.exam_id}</p>
                    <p className="text-xs text-slate-400">Status: {att.status} • {new Date(att.start_time).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{att.objective_score}/{att.total_objective_marks}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
