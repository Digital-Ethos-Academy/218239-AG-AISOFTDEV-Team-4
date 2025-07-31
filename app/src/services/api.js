import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Attach token to every request if available
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==== Auth ====
export const login = async (email, password) => {
  const res = await API.post('/login', { email, password });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user_id', res.data.user_id);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
};

export const getCurrentUser = async () => {
  const res = await API.get('/users/me');
  return res.data;
};

// ==== Mood ====
export const logMood = async (mood, mood_date) => {
  const res = await API.post('/moods/', { mood, mood_date });
  return res.data; // includes prompt
};

export const getMoodHistory = async () => {
  const res = await API.get('/moods/');
  return res.data;
};

// ==== Journal ====
export const submitJournal = async entry => {
  const res = await API.post('/journal/', entry);
  return res.data;
};

export const getJournals = async () => {
  const res = await API.get('/journal/');
  return res.data;
};