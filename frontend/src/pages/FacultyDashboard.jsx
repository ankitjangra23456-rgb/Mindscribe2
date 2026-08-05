import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Users, Target, BarChart2, Sparkles, PlusCircle,
  Filter, Search, Trash2, Edit2, Eye, ChevronDown, TrendingUp,
  CheckCircle, Clock, ArrowRight, Shield
} from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';

function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const styles = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   val: 'text-blue-700' },
    emerald:{ bg: 'bg-emerald-50',icon: 'bg-emerald-100 text-emerald-600',val:'text-emerald-700' },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  val: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600',val: 'text-purple-700' },
  }[color];

  return (
    <div className={`card p-5 shadow-card space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}

const BADGE_DIFF = {
  Easy:   'badge-easy',
  Medium: 'badge-medium',
  Hard:   'badge-hard',
};
const BADGE_TYPE = {
  MCQ:         'badge-mcq',
  Descriptive: 'badge-desc',
};

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search,    setSearch]    = useState('');
  const [diffFilter,setDiffFilter]= useState('All');
  const { questions, removeQuestion } = useQuestions();

  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [aiTopic, setAiTopic]               = useState('');
  const [aiDiff, setAiDiff]                 = useState('Medium');
  const [aiLoading, setAiLoading]           = useState(false);
  const [generatedQs, setGeneratedQs]       = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('questions')) setActiveTab('questions');
    else if (path.includes('create-exam')) setActiveTab('create-exam');
    else if (path.includes('students')) setActiveTab('students');
    else if (path.includes('analytics')) setActiveTab('analytics');
    else if (path.includes('proctor')) setActiveTab('proctor-monitor');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const tabs = [
    { id: 'dashboard',        label: 'Dashboard',               icon: BarChart2 },
    { id: 'questions',        label: 'Question Bank',           icon: BookOpen },
    { id: 'create-exam',      label: 'Create Exam',             icon: PlusCircle },
    { id: 'proctor-monitor',  label: 'Live Proctoring Monitor', icon: Shield },
    { id: 'students',         label: 'Students',                icon: Users },
    { id: 'analytics',        label: 'Analytics',               icon: TrendingUp },
  ];

  const filteredQuestions = (questions || MOCK_QUESTIONS).filter(q => {
    const textStr = q.text || q.question || '';
    const subjStr = q.subject || '';
    const matchesSearch = textStr.toLowerCase().includes(search.toLowerCase()) || subjStr.toLowerCase().includes(search.toLowerCase());
    const matchesDiff   = diffFilter === 'All' || q.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Dr. Priya Singh — Computer Science Department</p>
        </div>

        {/* Module tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Questions" value="247"  icon={BookOpen} color="blue"    sub="Across 6 subjects" />
              <StatCard label="Active Exams"    value="8"    icon={Target}   color="emerald" sub="2 scheduled today" />
              <StatCard label="Students"        value="318"  icon={Users}    color="amber"   sub="4 Sections" />
              <StatCard label="Avg. Class Score"value="74%"  icon={BarChart2}color="purple"  sub="Last 30 days" />
            </div>

            {/* Recent exams + student performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Exams */}
              <div className="card p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Recent Exams</h2>
                  <button onClick={() => setActiveTab('create-exam')} className="btn-primary py-1.5 text-xs px-3">
                    <PlusCircle className="w-3.5 h-3.5" /> Create
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { subject: 'Data Structures', type: 'Mid Term', date: '20 May', students: 80, avg: '76%', status: 'active' },
                    { subject: 'Database DBMS',   type: 'Quiz',     date: '15 May', students: 72, avg: '82%', status: 'done' },
                    { subject: 'Algorithms',       type: 'Final',    date: '10 May', students: 68, avg: '71%', status: 'done' },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{e.subject}</p>
                        <p className="text-xs text-slate-400">{e.type} • {e.date} • {e.students} students</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-700">{e.avg}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          e.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>{e.status === 'active' ? 'Active' : 'Done'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top students */}
              <div className="card p-6 shadow-card space-y-4">
                <h2 className="text-base font-bold text-slate-900">Top Performers</h2>
                <div className="space-y-3">
                  {MOCK_CANDIDATES.slice(0, 5).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                        {c.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.degree}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700">{c.sci_score}%</p>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.sci_score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Question Bank Tab ── */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
              <div className="flex gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      diffFilter === d
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAiGenModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate with AI
              </button>
              <button className="btn-primary text-xs py-2 px-4">
                <PlusCircle className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {/* AI Generator Modal */}
            {showAiGenModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-lg w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-slate-900 text-base">AI Question Generator</h3>
                    </div>
                    <button onClick={() => setShowAiGenModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Operating Systems - Virtual Memory"
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      className="input-base text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Easy', 'Medium', 'Hard'].map(d => (
                        <button
                          key={d}
                          onClick={() => setAiDiff(d)}
                          className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            aiDiff === d ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={!aiTopic.trim() || aiLoading}
                    onClick={async () => {
                      setAiLoading(true);
                      await new Promise(r => setTimeout(r, 1200));
                      setGeneratedQs({
                        text: `Which page replacement policy suffers from Belady's Anomaly in ${aiTopic || 'OS'}?`,
                        options: { A: "FIFO", B: "LRU", C: "Optimal", D: "MRU" },
                        correct: "A",
                        difficulty: aiDiff
                      });
                      setAiLoading(false);
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? <span className="animate-pulse">Generating Questions with Gemini AI...</span> : <><Sparkles className="w-4 h-4" /> Generate 5 Questions</>}
                  </button>

                  {generatedQs && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-purple-900">Generated Preview:</p>
                      <p className="text-slate-800 font-semibold">{generatedQs.text}</p>
                      <button
                        onClick={() => {
                          setShowAiGenModal(false);
                          setGeneratedQs(null);
                          setAiTopic('');
                        }}
                        className="btn-primary text-xs w-full py-1.5"
                      >
                        Import to Question Bank
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card shadow-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-2">{q.text}</p>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded-lg border text-[11px] font-bold bg-slate-50 text-slate-500 border-slate-200">{q.subject}</span>
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${BADGE_TYPE[q.type] || 'badge-mcq'}`}>{q.type}</span>
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${BADGE_DIFF[q.difficulty]}`}>{q.difficulty}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{q.marks} marks</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye  className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => removeQuestion(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredQuestions.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No questions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Live Proctoring Monitor Tab ── */}
        {activeTab === 'proctor-monitor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Exam Session Monitor</h2>
                <p className="text-xs text-slate-500">Real-time anti-cheat supervision for Data Structures Mid Term</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 animate-pulse">
                ● 148 Students Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Ankit Kumar', id: 'STUD-1001', alerts: 0, status: 'Active (Tab Focused)', time: '38m remaining', clean: true },
                { name: 'Priya Patel', id: 'STUD-1004', alerts: 2, status: 'Tab Switch Detected', time: '41m remaining', clean: false },
                { name: 'Rahul Verma', id: 'STUD-1008', alerts: 0, status: 'Active (Tab Focused)', time: '36m remaining', clean: true },
                { name: 'Neha Sharma', id: 'STUD-1012', alerts: 1, status: 'Copy Attempt Prevention', time: '39m remaining', clean: false },
                { name: 'Aman Gupta',  id: 'STUD-1015', alerts: 0, status: 'Active (Tab Focused)', time: '35m remaining', clean: true },
                { name: 'Sneha Roy',   id: 'STUD-1019', alerts: 0, status: 'Active (Tab Focused)', time: '40m remaining', clean: true },
              ].map(s => (
                <div key={s.id} className={`card p-4 shadow-card space-y-3 border ${s.clean ? 'border-slate-200' : 'border-rose-300 bg-rose-50/40'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{s.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      s.alerts === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {s.alerts === 0 ? '✓ Clean' : `⚠ ${s.alerts} Alert(s)`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Status: <span className="font-semibold">{s.status}</span></p>
                    <p className="text-slate-400">{s.time}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold">
                      View Stream
                    </button>
                    <button className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold">
                      Pause
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Create Exam Tab ── */}
        {activeTab === 'create-exam' && <CreateExamForm />}

        {/* ── Students Tab ── */}
        {activeTab === 'students' && <StudentsTab />}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Exam Completion Rate', value: '94.2%', color: 'emerald' },
                { label: 'Average Score',         value: '74.8%', color: 'blue' },
                { label: 'SCI Improvement',       value: '+8.3%', color: 'purple' },
              ].map(s => (
                <div key={s.label} className="card p-6 shadow-card text-center space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-3xl font-extrabold ${s.color === 'emerald' ? 'text-emerald-600' : s.color === 'purple' ? 'text-purple-600' : 'text-blue-600'}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="card p-6 shadow-card">
              <h3 className="text-base font-bold text-slate-900 mb-4">Subject-wise Performance</h3>
              <div className="space-y-4">
                {[
                  { subject: 'Data Structures', avg: 82 },
                  { subject: 'Database DBMS',   avg: 76 },
                  { subject: 'Algorithms',       avg: 71 },
                  { subject: 'OS',               avg: 68 },
                  { subject: 'Networks',         avg: 79 },
                ].map(s => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{s.subject}</span><span>{s.avg}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${s.avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function CreateExamForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', subject: '', type: 'Mid Term', duration: 60, totalMarks: 100,
    difficulty: 'Mixed', section: 'A', enableViva: false, enableProctoring: false,
    startDate: '', endDate: '', instructions: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  return (
    <div className="card p-6 shadow-card max-w-2xl space-y-6">
      {/* Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>{s}</div>
            {i < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-slate-500">
        <span>Basic Info</span><span>Settings</span><span>Review</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Exam Details</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exam Title</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Data Structures Mid Term 2024" className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={set('subject')} placeholder="Data Structures" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exam Type</label>
              <select value={form.type} onChange={set('type')} className="input-base bg-white">
                {['Mid Term', 'Final Exam', 'Quiz', 'Assignment', 'Practice'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input type="datetime-local" value={form.endDate} onChange={set('endDate')} className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instructions for Students</label>
            <textarea rows={3} value={form.instructions} onChange={set('instructions')}
              placeholder="Enter exam rules and instructions..."
              className="input-base resize-none" />
          </div>
          <button onClick={() => setStep(2)} className="btn-primary">Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Exam Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={set('duration')} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={set('totalMarks')} className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Mixed', 'Hard'].map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                  className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                    form.difficulty === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          {/* Toggles */}
          <div className="space-y-3">
            {[
              { key: 'enableViva',       label: 'Enable AI Viva Follow-ups',      desc: 'AI will generate follow-up questions' },
              { key: 'enableProctoring', label: 'Enable Proctoring',              desc: 'Face detection + tab-switch monitoring' },
            ].map(t => (
              <div key={t.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
                <button onClick={() => toggle(t.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form[t.key] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[t.key] ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary">Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Review & Create</h2>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 text-sm">
            {[
              { label: 'Title',       value: form.title || 'Not set' },
              { label: 'Subject',     value: form.subject || 'Not set' },
              { label: 'Type',        value: form.type },
              { label: 'Duration',    value: `${form.duration} minutes` },
              { label: 'Total Marks', value: form.totalMarks },
              { label: 'Difficulty',  value: form.difficulty },
              { label: 'AI Viva',     value: form.enableViva ? 'Enabled' : 'Disabled' },
              { label: 'Proctoring',  value: form.enableProctoring ? 'Enabled' : 'Disabled' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-slate-500 font-medium">{r.label}</span>
                <span className="font-semibold text-slate-800">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">← Back</button>
            <button className="btn-primary">
              <CheckCircle className="w-4 h-4" /> Create Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentsTab() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_CANDIDATES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search students..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-base pl-9" />
        </div>
      </div>
      <div className="card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Student', 'Degree / University', 'Skills', 'SCI Score', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {c.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.degree} · {c.university}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.sci_score}%` }} />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{c.sci_score}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    c.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>{c.available ? 'Active' : 'Inactive'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
