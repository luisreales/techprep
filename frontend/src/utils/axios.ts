import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:5001/api', // Direct backend URL to bypass proxy issues
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// Attempt to read an access token from multiple common locations
const readAccessToken = (): string | null => {
  try {
    const persisted = localStorage.getItem('auth-storage');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      const tokenCandidate =
        parsed?.state?.accessToken ||
        parsed?.accessToken ||
        parsed?.state?.token ||
        parsed?.token;
      if (typeof tokenCandidate === 'string' && tokenCandidate.length > 0) {
        return tokenCandidate;
      }
    }
  } catch (e) {
    console.error('Error parsing auth-storage:', e);
  }

  // Fallbacks: direct keys some flows may set
  const direct = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (direct && typeof direct === 'string' && direct.length > 0) return direct;

  return null;
};

// Request interceptor to add auth token
http.interceptors.request.use(
  (config) => {
    const token = readAccessToken();
    console.log('Axios request interceptor - URL:', config.url, 'Token present:', !!token);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found for API request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
http.interceptors.response.use(
  (response) => {
    console.log('Axios response success - URL:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Axios response error - URL:', error.config?.url, 'Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status, 'Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Helpful during local dev to confirm base URL
try {
   
  console.log('axios baseURL:', http.defaults.baseURL);
} catch {}
