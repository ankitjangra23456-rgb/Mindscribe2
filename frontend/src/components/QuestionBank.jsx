import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Trash2, Edit3, CheckCircle, HelpCircle, Layers, Award } from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState('objective');
  const [difficulty, setDifficulty] = useState('medium');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { option_text: '', is_correct: true },
    { option_text: '', is_correct: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = '/questions';
      const params = new URLSearchParams();
      if (filterType) params.append('question_type', filterType);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterType, filterDifficulty]);

  const handleOpenModal = (q = null) => {
    setErrorMsg('');
    if (q) {
      setEditingId(q.id);
      setText(q.text);
      setQuestionType(q.question_type);
      setDifficulty(q.difficulty);
      setMarks(q.marks);
      setOptions(q.options.length ? q.options.map(o => ({ option_text: o.option_text, is_correct: o.is_correct })) : [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
      ]);
    } else {
      setEditingId(null);
      setText('');
      setQuestionType('objective');
      setDifficulty('medium');
      setMarks(1);
      setOptions([
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
      ]);
    }
    setShowModal(true);
  };

  const handleAddOption = () => {
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    if (field === 'is_correct') {
      // For single correct objective, uncheck others
      updated.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      updated[index][field] = value;
    }
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      text,
      question_type: questionType,
      difficulty,
      marks: parseInt(marks),
      options: questionType === 'objective' ? options : []
    };

    try {
      if (editingId) {
        await API.put(`/questions/${editingId}`, payload);
      } else {
        await API.post('/questions', payload);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to save question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>Question Bank Repository</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Manage objective (MCQ) & subjective questions for adaptive exam papers</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase">Filters:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Question Types</option>
          <option value="objective">Objective (MCQ)</option>
          <option value="subjective">Subjective (AI Viva Trigger)</option>
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs">Fetching Question Bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No questions found</p>
          <p className="text-slate-500 text-xs mt-1">Click 'Add New Question' above to create your first question item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q) => (
            <div key={q.id} className="glass-panel p-5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      q.question_type === 'objective' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {q.question_type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' : q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {q.marks} Mark{q.marks > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-white font-medium text-sm leading-relaxed">{q.text}</p>

                  {q.question_type === 'objective' && q.options?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg text-xs flex items-center space-x-2 ${
                            opt.is_correct ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold' : 'bg-slate-900/40 border border-slate-800 text-slate-400'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${opt.is_correct ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(q)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating / Editing Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Question Item' : 'Create New Question Item'}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the full question text..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="objective">Objective (MCQ)</option>
                    <option value="subjective">Subjective (AI Viva)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Options Section for Objective Questions */}
              {questionType === 'objective' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300 uppercase">MCQ Options & Correct Answer</label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      + Add Choice
                    </button>
                  </div>

                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={opt.is_correct}
                        onChange={() => handleOptionChange(idx, 'is_correct', true)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
