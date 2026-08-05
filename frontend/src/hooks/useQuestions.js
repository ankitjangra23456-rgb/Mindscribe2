import { useState, useEffect, useCallback } from 'react';
import { getQuestions, createQuestion, deleteQuestion } from '../services/questionService';
import { MOCK_QUESTIONS } from '../services/mockData';

export function useQuestions(filters = {}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuestions(filters);
      setQuestions(data && data.length > 0 ? data : MOCK_QUESTIONS);
    } catch {
      setQuestions(MOCK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = async (qData) => {
    try {
      const created = await createQuestion(qData);
      setQuestions(prev => [created, ...prev]);
      return created;
    } catch {
      const newQ = { id: Date.now(), ...qData };
      setQuestions(prev => [newQ, ...prev]);
      return newQ;
    }
  };

  const removeQuestion = async (id) => {
    try {
      await deleteQuestion(id);
    } catch {
      // Mock remove
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return { questions, loading, error, refetch: fetchQuestions, addQuestion, removeQuestion };
}
