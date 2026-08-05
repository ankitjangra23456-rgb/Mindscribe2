import { useState, useEffect, useCallback } from 'react';
import { getUpcomingExams, getAllExams, getExamById, getExamQuestions } from '../services/examService';

export function useUpcomingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch upcoming exams:", err);
      setExams([]);
      setError(err?.message || "Failed to load upcoming exams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error, refetch: fetchExams };
}

export function useExamDetails(examId) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const examData = await getExamById(examId);
        setExam(examData);
        setQuestions(examData?.questions || []);
      } catch (err) {
        console.warn(`Failed to fetch exam ${examId}:`, err);
        setExam(null);
        setQuestions([]);
        setError(err?.message || "Failed to load exam details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  return { exam, questions, loading, error };
}
