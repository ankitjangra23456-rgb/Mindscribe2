import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart2, Eye, Award, Layers, HelpCircle, Activity, User, Sliders } from 'lucide-react';

const FacultySCIDashboard = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [sciRecords, setSciRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await API.get('/exams');
      setExams(res.data);
      if (res.data.length > 0) {
        setSelectedExamId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load exams for SCI Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSciRecords = async (examId) => {
    if (!examId) return;
    try {
      const res = await API.get(`/sci/exam/${examId}`);
      setSciRecords(res.data);
    } catch (err) {
      console.error("Failed to load SCI records:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchSciRecords(selectedExamId);
    }
  }, [selectedExamId]);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <span>Skill Confidence Index (SCI) Analytics</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Itemized evaluation breakdown: Written ($E_p$), AI Viva ($V_p$), Divergence ($\Delta$), and Final SCI</p>
        </div>

        {/* Select Exam Dropdown */}
        <select
          value={selectedExamId || ''}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {/* SCI Attempts Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Loading Student SCI Records...</p>
        </div>
      ) : sciRecords.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No evaluated student attempts found for this exam</p>
          <p className="text-slate-500 text-xs mt-1">Student attempts will automatically populate here once exam and AI Viva scoring are computed.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Attempt #</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Written Score ($E_p$)</th>
                  <th className="py-4 px-6">AI Viva Score ($V_p$)</th>
                  <th className="py-4 px-6">Divergence Gap ($\Delta$)</th>
                  <th className="py-4 px-6">Final SCI Index</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {sciRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-indigo-400">#{rec.attempt_id}</td>
                    <td className="py-4 px-6 font-semibold flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>User #{rec.student_id}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-cyan-400">
                      {(rec.ep_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 font-semibold text-purple-400">
                      {(rec.vp_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 font-semibold text-amber-400">
                      {(rec.delta_gap * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-400 text-sm">
                      {(rec.sci_score * 100).toFixed(1)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-all"
                        title="View Detailed Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Modal Breakdown */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Attempt #{selectedRecord.attempt_id} SCI Breakdown</span>
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Written Score ($E_p$)</span>
                <span className="text-xl font-black text-cyan-400">{(selectedRecord.ep_score * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">AI Viva Score ($V_p$)</span>
                <span className="text-xl font-black text-purple-400">{(selectedRecord.vp_score * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Divergence Gap ($\Delta$)</span>
                <span className="text-xl font-black text-amber-400">{(selectedRecord.delta_gap * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-300 block mb-1 font-semibold">Final SCI Index</span>
                <span className="text-2xl font-black text-emerald-400">{(selectedRecord.sci_score * 100).toFixed(1)}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
              <p className="font-bold text-indigo-400">Formula Decomposition:</p>
              <p>SCI = (α × Ep) + (β × Vp) - (γ × Δ)</p>
              <p>SCI = ({selectedRecord.alpha} × {selectedRecord.ep_score}) + ({selectedRecord.beta} × {selectedRecord.vp_score}) - ({selectedRecord.gamma} × {selectedRecord.delta_gap})</p>
              <p className="text-emerald-400 font-bold">Total = {selectedRecord.sci_score}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySCIDashboard;
