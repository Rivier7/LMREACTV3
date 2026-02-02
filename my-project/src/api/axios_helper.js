import axios from 'axios';
import { logApiError } from '../utils/errorLogger';
import { API_BASE_URL } from '../config/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response Interceptor
 * FAANG Best Practice: Centralized response handling
 */
instance.interceptors.response.use(
  // Success handler - just pass through
  response => response,

  // Error handler - log all API errors
  error => {
    // Log the error with context
    const endpoint = error.config?.url || 'unknown';
    logApiError(error, endpoint);

    // Still reject so calling code can handle it
    return Promise.reject(error);
  }
);

/**
 * Request Interceptor
 * Add authentication token if available
 */
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    logApiError(error, 'request-setup');
    return Promise.reject(error);
  }
);

export default instance;
