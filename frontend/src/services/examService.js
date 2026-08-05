import API from './api';

export const getUpcomingExams = async () => {
  const response = await API.get('/exams', { params: { status: 'upcoming' } });
  return response.data;
};

export const getAllExams = async (params = {}) => {
  const response = await API.get('/exams', { params });
  return response.data;
};

export const getExamById = async (id) => {
  const response = await API.get(`/exams/${id}`);
  return response.data;
};

export const getExamQuestions = async (examId) => {
  const response = await API.get(`/exams/${examId}/questions`);
  return response.data;
};

export const createExam = async (examData) => {
  const response = await API.post('/exams', examData);
  return response.data;
};

export const submitAttempt = async (attemptData) => {
  const response = await API.post('/attempts', attemptData);
  return response.data;
};

export const getMyAttempts = async () => {
  const response = await API.get('/attempts/my');
  return response.data;
};

export const getAttemptResult = async (attemptId) => {
  const response = await API.get(`/attempts/${attemptId}/result`);
  return response.data;
};
