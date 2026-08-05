import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, ArrowLeft, ArrowRight, RotateCcw, Send, ChevronLeft, ShieldAlert } from 'lucide-react';
import { getQuestions } from '../services/questionService';
import { useProctoring } from '../hooks/useProctoring';

const TOTAL_TIME = 45 * 60; // 45 minutes

export default function ExamRunner() {
  const navigate = useNavigate();
  const [questions, setQuestions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState({});   // { questionId: optionKey }
  const [marked, setMarked]           = useState({});   // { questionId: true }
  const [timeLeft, setTimeLeft]       = useState(TOTAL_TIME);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [proctorWarning, setProctorWarning]  = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const dbQs = await getQuestions();
        if (Array.isArray(dbQs) && dbQs.length > 0) {
          const mapped = dbQs.map(q => ({
            id: q.id,
            stem: q.question_text || q.stem || "Question stem",
            bloom_level: q.bloom_level || "Apply",
            options: Array.isArray(q.options) ? q.options.map((opt, i) => ({
              key: String.fromCharCode(65 + i),
              text: typeof opt === 'string' ? opt : opt.option_text || opt.text
            })) : [
              { key: 'A', text: 'Option A' },
              { key: 'B', text: 'Option B' }
            ]
          }));
          setQuestions(mapped);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.warn("Failed to load exam questions from database:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const { warningsCount } = useProctoring({
    enabled: !submitted,
    onViolation: (v) => {
      setProctorWarning(v.message);
      setTimeout(() => setProctorWarning(null), 4000);
    }
  });

  const current = questions[currentIdx];

  // Countdown timer
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectAnswer = (optKey) => {
    setAnswers(prev => ({ ...prev, [current.id]: optKey }));
  };

  const toggleMark = () => {
    setMarked(prev => ({ ...prev, [current.id]: !prev[current.id] }));
  };

  const clearAnswer = () => {
    setAnswers(prev => { const copy = { ...prev }; delete copy[current.id]; return copy; });
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setShowSubmitModal(false);
    navigate('/student/results', { state: { answers, questions } });
  }, [answers, questions, navigate]);

  const getQuestionStatus = (idx) => {
    const q = questions[idx];
    if (idx === currentIdx)       return 'current';
    if (marked[q.id])             return 'marked';
    if (answers[q.id] !== undefined) return 'answered';
    return 'not-answered';
  };

  const statusStyle = (status) => ({
    current:      'bg-blue-600 text-white ring-2 ring-blue-400/40',
    answered:     'bg-emerald-500 text-white',
    marked:       'bg-amber-400 text-white',
    'not-answered': 'bg-slate-100 text-slate-500 border border-slate-200 hover:border-blue-300',
  }[status]);

  const answeredCount = Object.keys(answers).length;
  const markedCount   = Object.keys(marked).filter(k => marked[k]).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Loading Exam Questions from Database...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-card">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">No Questions Found</h2>
            <p className="text-xs text-slate-500">
              There are currently no active questions published for this exam in the database. Please check back after your faculty publishes the exam paper.
            </p>
            <button onClick={() => navigate('/student')} className="btn-primary w-full text-xs py-2">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Exam Header ── */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student')} className="text-slate-400 hover:text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Data Structures – Mid Term Exam</h1>
            <p className="text-xs text-slate-400">Section 1 • MCQ (20 Questions • 40 Marks)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {warningsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Proctor Alerts: {warningsCount}</span>
            </div>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border ${
            timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary px-5 py-2"
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Question Navigation Panel ── */}
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-4 gap-4 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{answeredCount}</p>
              <p>Answered</p>
            </div>
            <div className="bg-slate-100 text-slate-600 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{questions.length - answeredCount}</p>
              <p>Remaining</p>
            </div>
          </div>

          {/* Section */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Section 1 — MCQ</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${statusStyle(getQuestionStatus(idx))}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
            {[
              { color: 'bg-emerald-500', label: 'Answered' },
              { color: 'bg-blue-600',    label: 'Current' },
              { color: 'bg-amber-400',   label: 'Marked for Review' },
              { color: 'bg-slate-200',   label: 'Not Attempted' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${l.color}`}></span>
                {l.label}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right: Question Area ── */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
          {proctorWarning && (
            <div className="mb-4 p-3 bg-rose-600 text-white rounded-xl flex items-center gap-3 text-xs font-bold shadow-lg animate-bounce">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{proctorWarning}</span>
            </div>
          )}

          {/* Question header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700">Question {currentIdx + 1} / {questions.length}</span>
              <span className="badge-mcq px-2.5 py-0.5 rounded-lg text-xs font-bold border">{current.type}</span>
              <span className="text-xs text-slate-400">{current.marks} Marks</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                current.difficulty === 'Easy'   ? 'badge-easy' :
                current.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
              }`}>{current.difficulty}</span>
            </div>

            <button
              onClick={toggleMark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                marked[current.id]
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${marked[current.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
              {marked[current.id] ? 'Marked' : 'Mark for Review'}
            </button>
          </div>

          {/* Question text */}
          <div className="card p-6 mb-6 shadow-card space-y-4">
            <p className="text-base font-semibold text-slate-900 leading-relaxed">
              {current.text}
            </p>
            {current.codeSnippet && (
              <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                <div className="flex justify-between text-slate-400 text-[10px] pb-2 mb-2 border-b border-slate-800 font-bold uppercase">
                  <span>Language: Python 3</span>
                  <span>Code Snippet</span>
                </div>
                <pre>{current.codeSnippet}</pre>
              </div>
            )}
          </div>

          {/* Options / Answer Space */}
          <div className="space-y-3 flex-1">
            {current.options ? (
              Object.entries(current.options).map(([key, text]) => {
                const selected = answers[current.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectAnswer(key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {key}
                    </div>
                    <span className={`text-sm font-medium ${selected ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>
                      {text}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  placeholder="Write your answer or code solution here..."
                  value={answers[current.id] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [current.id]: e.target.value }))}
                  className="input-base font-mono text-xs resize-none"
                />
              </div>
            )}
          </div>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-200">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(i => i - 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={clearAnswer}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>

            <button
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(i => i + 1)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-sm w-full space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Submit Exam?</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-emerald-700">{answeredCount}</p>
                <p className="text-emerald-600 font-medium text-xs">Answered</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-slate-700">{questions.length - answeredCount}</p>
                <p className="text-slate-500 font-medium text-xs">Unanswered</p>
              </div>
            </div>
            {markedCount > 0 && (
              <p className="text-sm text-amber-600 font-medium">
                ⚠ You have {markedCount} question(s) marked for review.
              </p>
            )}
            <p className="text-sm text-slate-500">Are you sure you want to submit? You cannot change answers after submission.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 btn-primary py-2.5"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
