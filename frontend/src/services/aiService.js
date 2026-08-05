import API from './api';

export const getExamFeedback = async (attemptId) => {
  const response = await API.post('/ai/exam-feedback', { attempt_id: attemptId });
  return response.data;
};

export const generateVivaQuestion = async (data) => {
  const response = await API.post('/viva/generate-followup', data);
  return response.data;
};

export const scoreVivaAnswer = async (data) => {
  const response = await API.post('/viva/score-answer', data);
  return response.data;
};

export const sendAIChatMessage = async (message, context = 'general') => {
  const response = await API.post('/ai/chat', { message, context });
  return response.data;
};
