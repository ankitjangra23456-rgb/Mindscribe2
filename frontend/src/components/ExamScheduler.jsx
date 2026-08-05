import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, Clock, Plus, Trash2, Edit, CheckSquare, Layers, Sliders } from 'lucide-react';

const ExamScheduler = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [alpha, setAlpha] = useState(0.4);
  const [beta, setBeta] = useState(0.4);
  const [gamma, setGamma] = useState(0.2);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, qRes] = await Promise.all([
        API.get('/exams'),
        API.get('/questions')
      ]);
      setExams(examsRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      console.error("Failed to load exam scheduler data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (exam = null) => {
    setErrorMsg('');
    if (exam) {
      setEditingId(exam.id);
      setTitle(exam.title);
      setDescription(exam.description || '');
      setStartTime(new Date(exam.start_time).toISOString().slice(0, 16));
      setEndTime(new Date(exam.end_time).toISOString().slice(0, 16));
      setDurationMinutes(exam.duration_minutes);
      setSelectedQuestions(exam.questions ? exam.questions.map(q => q.id) : []);
      setAlpha(exam.alpha);
      setBeta(exam.beta);
      setGamma(exam.gamma);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      setStartTime(nextHour.toISOString().slice(0, 16));
      setEndTime(twoHoursLater.toISOString().slice(0, 16));
      setDurationMinutes(60);
      setSelectedQuestions([]);
      setAlpha(0.4);
      setBeta(0.4);
      setGamma(0.2);
    }
    setShowModal(true);
  };

  const toggleQuestionSelection = (id) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      title,
      description,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration_minutes: parseInt(durationMinutes),
      question_ids: selectedQuestions,
      alpha: parseFloat(alpha),
      beta: parseFloat(beta),
      gamma: parseFloat(gamma)
    };

    try {
      if (editingId) {
        await API.put(`/exams/${editingId}`, payload);
      } else {
        await API.post('/exams', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to schedule exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and delete this scheduled exam?")) return;
    try {
      await API.delete(`/exams/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete exam failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Exam Scheduling Console</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Configure time windows, select bank questions, and tune SCI parameters</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* Scheduled Exams List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Loading Scheduled Exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No scheduled exams found</p>
          <p className="text-slate-500 text-xs mt-1">Click 'Schedule New Exam' above to pick questions and publish an exam window.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-white font-bold text-base">{exam.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(exam)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {exam.description && (
                  <p className="text-slate-400 text-xs">{exam.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Duration: <strong>{exam.duration_minutes} mins</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Questions: <strong>{exam.questions?.length || 0} items</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <p><strong>Starts:</strong> {new Date(exam.start_time).toLocaleString()}</p>
                  <p><strong>Ends:</strong> {new Date(exam.end_time).toLocaleString()}</p>
                </div>

                <div className="pt-2 flex items-center space-x-2 text-[10px] text-slate-400 border-t border-white/5">
                  <Sliders className="w-3 h-3 text-purple-400" />
                  <span>SCI Weights: α={exam.alpha}, β={exam.beta}, γ={exam.gamma}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Scheduling / Editing Exam */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Scheduled Exam' : 'Schedule New Exam'}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Science End-Semester Exam 2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter exam guidelines for students..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* SCI Weight Configuration */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-purple-400 uppercase">Skill Confidence Index (SCI) Weights</label>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">α (Written Ep):</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={alpha}
                      onChange={(e) => setAlpha(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">β (Viva Vp):</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={beta}
                      onChange={(e) => setBeta(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">γ (Divergence Δ):</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={gamma}
                      onChange={(e) => setGamma(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Question Selection Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Select Questions from Bank ({selectedQuestions.length} selected)
                </label>
                {questions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No questions available in the Question Bank. Create questions first.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {questions.map((q) => (
                      <label
                        key={q.id}
                        className={`flex items-start space-x-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedQuestions.includes(q.id) ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(q.id)}
                          onChange={() => toggleQuestionSelection(q.id)}
                          className="mt-0.5 rounded text-cyan-600 bg-slate-800 border-slate-700"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-200">{q.text}</p>
                          <span className="text-[10px] text-slate-500 uppercase">{q.question_type} • {q.difficulty} • {q.marks} mark(s)</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30"
                >
                  {submitting ? 'Saving...' : 'Save & Publish Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduler;
