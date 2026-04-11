import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

// attach JWT from Redux store on every request
api.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) store.dispatch(logout());
    return Promise.reject(err);
  }
);
