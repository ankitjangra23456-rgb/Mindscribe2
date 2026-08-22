import API from './api';

export const loginAPI = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getMeAPI = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const refreshTokenAPI = async (refreshToken) => {
  const response = await API.post('/auth/refresh', { refresh_token: refreshToken });
  return response.data;
};

export const sendOTPAPI = async (email) => {
  const response = await API.post('/auth/send-otp', { email });
  return response.data;
};

export const verifyOTPAPI = async (email, otpCode) => {
  const response = await API.post('/auth/verify-otp', { email, otp_code: otpCode });
  return response.data;
};

export const loginWithOTPAPI = async (email, otpCode) => {
  const response = await API.post('/auth/login-with-otp', { email, otp_code: otpCode });
  return response.data;
};

export const logoutAPI = async () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return true;
};
