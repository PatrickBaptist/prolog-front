import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from './types';

export const ACCESS_SESSION_KEY = 'prolog.access-session';
export const PASSWORD_SETUP_KEY = 'prolog.password-setup';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const stored = sessionStorage.getItem(ACCESS_SESSION_KEY);
  if (!stored) return config;
  try {
    const session = JSON.parse(stored) as { token?: string };
    if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
  } catch {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && sessionStorage.getItem(ACCESS_SESSION_KEY)) {
      window.dispatchEvent(new Event('prolog:session-expired'));
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || 'Não foi possível conversar com o servidor.';
  }
  return 'Ocorreu um erro inesperado.';
}
