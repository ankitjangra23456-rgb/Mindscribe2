import API from './api';

export const getQuestions = async (filters = {}) => {
  const response = await API.get('/questions', { params: filters });
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await API.get(`/questions/${id}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await API.post('/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await API.put(`/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await API.delete(`/questions/${id}`);
  return response.data;
};

export const aiGenerateQuestions = async (params) => {
  const response = await API.post('/ai/generate-questions', params);
  return response.data;
};
