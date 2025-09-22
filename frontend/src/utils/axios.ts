import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:5000/api', // Direct backend URL to bypass proxy issues
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
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helpful during local dev to confirm base URL
try {
   
  console.log('axios baseURL:', http.defaults.baseURL);
} catch {}
