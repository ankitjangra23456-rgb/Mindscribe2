import { useState, useEffect, useCallback } from 'react';
import { getQuestions, createQuestion, deleteQuestion } from '../services/questionService';

export function useQuestions(filters = {}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestions(filters);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch questions from database:", err);
      setQuestions([]);
      setError(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = async (qData) => {
    const created = await createQuestion(qData);
    setQuestions(prev => [created, ...prev]);
    return created;
  };

  const removeQuestion = async (id) => {
    await deleteQuestion(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return { questions, loading, error, refetch: fetchQuestions, addQuestion, removeQuestion };
}
