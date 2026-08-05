import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, ArrowLeft, Download, Share2, Sparkles, BarChart2, Target } from 'lucide-react';
import { getExamFeedback } from '../services/aiService';

// Circular progress ring
function ScoreRing({ pct, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

// Skill bar
function SkillBar({ label, score }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

const AI_FEEDBACK = [
  { type: 'strength',  text: "Strong grasp of core exam concepts — attempted objective questions accurately." },
  { type: 'recommend', text: "Review missed sub-topics and continue practicing adaptive question sets." },
];

export default function AIFeedbackView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dynamicFeedback, setDynamicFeedback] = useState(null);

  // Accept navigation state or use demo
  const { answers = {}, questions = [] } = location.state || {};
  const total     = questions.length || 0;
  const answered  = Object.keys(answers).length;
  const pct       = total > 0 ? Math.round((answered / total) * 100) : 0;

  useEffect(() => {
    async function loadFeedback() {
      try {
        const fb = await getExamFeedback(101);
        if (fb) setDynamicFeedback(fb);
      } catch {
        // Fallback to static AI feedback array
      }
    }
    loadFeedback();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exam Results & AI Feedback</h1>
            <p className="text-slate-500 text-sm mt-1">Data Structures — Mid Term • Submitted just now</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>

        {/* Score header row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Score ring */}
          <div className="card p-6 shadow-card flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <ScoreRing pct={pct} size={140} stroke={10} />
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-slate-900">{pct}%</p>
                <p className="text-xs text-slate-500 font-semibold">Score</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">Data Structures Mid Term</p>
              <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {pct >= 75 ? 'Excellent' : pct >= 50 ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" /> Exam Summary
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Total Questions',  value: `${total}` },
                { label: 'Attempted',        value: `${answered || 18}` },
                { label: 'Correct',          value: `${Math.round((answered || 18) * 0.82)}`, color: 'text-emerald-600' },
                { label: 'Incorrect',        value: `${Math.round((answered || 18) * 0.18)}`, color: 'text-rose-600' },
                { label: 'Class Average',    value: '74%' },
                { label: 'Your Rank',        value: '#3 / 148' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">{r.label}</span>
                  <span className={`font-bold ${r.color || 'text-slate-800'}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SCI / Skill scores */}
          <div className="card p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" /> Skill Confidence Index
            </h2>
            <div className="space-y-3">
              <SkillBar label="BST & Trees"       score={92} />
              <SkillBar label="Graph Algorithms"   score={80} />
              <SkillBar label="Sorting & Searching"score={85} />
              <SkillBar label="Dynamic Programming"score={55} />
              <SkillBar label="Hashing"            score={70} />
              <SkillBar label="Amortized Analysis" score={40} />
            </div>
          </div>
        </div>

        {/* AI Feedback section */}
        <div className="card p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI-Powered Feedback</h2>
              <p className="text-xs text-slate-400">Semantic analysis based on your performance pattern</p>
            </div>
          </div>

          <div className="space-y-3">
            {dynamicFeedback ? (
              <>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm font-medium">
                  🤖 {dynamicFeedback.summary}
                </div>
                {dynamicFeedback.strengths?.map((s, i) => (
                  <div key={`s-${i}`} className="flex items-start gap-3 p-4 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-800 text-sm font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
                {dynamicFeedback.weaknesses?.map((w, i) => (
                  <div key={`w-${i}`} className="flex items-start gap-3 p-4 rounded-xl border bg-rose-50 border-rose-100 text-rose-800 text-sm font-medium">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
                {dynamicFeedback.recommendations?.map((r, i) => (
                  <div key={`r-${i}`} className="flex items-start gap-3 p-4 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-800 text-sm font-medium">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </>
            ) : (
              AI_FEEDBACK.map((fb, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                  fb.type === 'strength'  ? 'bg-emerald-50 border-emerald-100' :
                  fb.type === 'weak'      ? 'bg-rose-50 border-rose-100' :
                                            'bg-blue-50 border-blue-100'
                }`}>
                  {fb.type === 'strength'  ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> :
                   fb.type === 'weak'      ? <XCircle    className="w-5 h-5 text-rose-500   shrink-0 mt-0.5" /> :
                                             <Sparkles   className="w-5 h-5 text-blue-600   shrink-0 mt-0.5" />}
                  <p className={`text-sm font-medium ${
                    fb.type === 'strength' ? 'text-emerald-800' :
                    fb.type === 'weak'     ? 'text-rose-800' : 'text-blue-800'
                  }`}>{fb.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question Review Table */}
        <div className="card shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Question-wise Analysis</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Q.No', 'Question', 'Your Answer', 'Correct Answer', 'Status', 'Marks'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1,2,3,4,5,6].map((n) => {
                  const correct = n % 3 !== 0;
                  return (
                    <tr key={n} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-600">{n}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        {MOCK_EXAM_QUESTIONS[n-1]?.text || '...'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{correct ? 'B' : 'A'}</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">B</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {correct ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">{correct ? '+2' : '0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}


