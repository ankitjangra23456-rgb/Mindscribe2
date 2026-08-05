import { useState, useEffect, useCallback } from 'react';
import { getUpcomingExams, getAllExams, getExamById, getExamQuestions } from '../services/examService';
import { MOCK_UPCOMING_EXAMS } from '../services/mockData';

export function useUpcomingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUpcomingExams();
      setExams(data && data.length > 0 ? data : MOCK_UPCOMING_EXAMS);
    } catch {
      setExams(MOCK_UPCOMING_EXAMS);
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

  useEffect(() => {
    if (!examId) return;
    async function load() {
      setLoading(true);
      try {
        const examData = await getExamById(examId);
        const qData = await getExamQuestions(examId);
        setExam(examData);
        setQuestions(qData);
      } catch {
        // Exam details fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  return { exam, questions, loading };
}
