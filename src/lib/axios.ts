import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor to add the Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  
  // Django's trailing slash handling - only add if not already present
  if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
    config.url += '/';
  } else if (config.url && config.url.includes('?') && !config.url.match(/\/\?/)) {
    // If there are query params, ensure slash before the ?
    config.url = config.url.replace('?', '/?');
  }
  
  return config;
});

// Interceptor to handle session expiry (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;