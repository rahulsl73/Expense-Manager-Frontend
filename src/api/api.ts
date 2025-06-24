import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use(config => {
  config.headers = config.headers || {};
  if (config.method?.toLowerCase() !== 'options') {
    const token = localStorage.getItem('token');
    const uid   = localStorage.getItem('userId');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (uid) {
      config.headers['User-Id'] = uid;
    }
  }

  
  config.headers['Accept'] = config.url?.endsWith('/export')
    ? 'text/csv'
    : 'application/json';

  return config;
});

api.interceptors.response.use(
  resp => resp,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
