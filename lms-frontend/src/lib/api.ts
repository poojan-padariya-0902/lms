import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { BASE_API_URL } from '@/constAPI';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    let token: string | undefined;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || Cookies.get('token');
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string | string[]; statusCode?: number }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear token if unauthorized and redirect if not already on login/register
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        Cookies.remove('userRole');
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (Array.isArray(data.error)) {
        return data.error.join(', ');
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.message)) {
        return record.message.join(', ');
      }
    }
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default apiClient;
