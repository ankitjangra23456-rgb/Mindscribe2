import API from './api';

export const getMySCI = async () => {
  const response = await API.get('/sci/my');
  return response.data;
};

export const getSCIReport = async (userId) => {
  const response = await API.get(`/sci/report/${userId}`);
  return response.data;
};

export const getSCILeaderboard = async () => {
  const response = await API.get('/sci/leaderboard');
  return response.data;
};
