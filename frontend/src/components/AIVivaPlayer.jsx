import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Cpu, Sparkles, Send, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';

const AIVivaPlayer = ({ attemptId, onVivaCompleted }) => {
  const [vivaSession, setVivaSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repliesMap, setRepliesMap] = useState({});
  const [scoresMap, setScoresMap] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const initVivaSession = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Trigger generation
      const genRes = await API.post(`/viva/generate/${attemptId}`);
      setVivaSession(genRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Could not initialize AI Viva session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      initVivaSession();
    }
  }, [attemptId]);

  const handleReplySubmit = async (vivaQId) => {
    const text = repliesMap[vivaQId];
    if (!text || !text.trim()) return;

    setSubmittingMap(prev => ({ ...prev, [vivaQId]: true }));
    try {
      const res = await API.post('/viva/reply', {
        viva_question_id: vivaQId,
        student_viva_reply: text
      });
      setScoresMap(prev => ({ ...prev, [vivaQId]: res.data.consistency_score }));
    } catch (err) {
      console.error("Viva reply submission failed:", err);
    } finally {
      setSubmittingMap(prev => ({ ...prev, [vivaQId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-white tracking-wide">LLM Core Generating Targeted AI Viva Questions...</p>
        <p className="text-xs text-slate-400">Analyzing submitted subjective answers for conceptual depth verification</p>
      </div>
    );
  }

  if (errorMsg || !vivaSession || vivaSession.viva_questions?.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center space-y-3 max-w-xl mx-auto">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">No AI Viva Questions Required</h3>
        <p className="text-xs text-slate-400">This attempt session did not contain subjective answers requiring oral follow-up verification.</p>
        {onVivaCompleted && (
          <button onClick={onVivaCompleted} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
            Continue to SCI Calculation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* AI Viva Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 glass-glow flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>AI VIVA ORAL EVALUATION SUITE</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">Conceptual Semantic Verification</h2>
          </div>
        </div>
      </div>

      {/* Viva Questions List */}
      <div className="space-y-4">
        {vivaSession.viva_questions.map((vq, index) => (
          <div key={vq.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Original Submitted Answer:</span> "{vq.subjective_answer_text}"
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-cyan-400 uppercase">AI Viva Follow-up Question #{index + 1}:</p>
              <p className="text-base font-semibold text-white leading-relaxed">{vq.generated_followup_prompt}</p>
            </div>

            {scoresMap[vq.id] !== undefined ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Response Evaluated & Recorded</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Semantic Consistency ($V_p$)</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {(scoresMap[vq.id] * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={repliesMap[vq.id] || ''}
                  onChange={(e) => setRepliesMap({ ...repliesMap, [vq.id]: e.target.value })}
                  placeholder="Type your viva explanation response here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleReplySubmit(vq.id)}
                    disabled={submittingMap[vq.id] || !repliesMap[vq.id]}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingMap[vq.id] ? 'Evaluating Score...' : 'Submit Viva Response'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {onVivaCompleted && (
        <div className="text-center pt-4">
          <button
            onClick={onVivaCompleted}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
          >
            Complete Session & Calculate Final SCI
          </button>
        </div>
      )}
    </div>
  );
};

export default AIVivaPlayer;
