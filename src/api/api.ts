import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials:true, // allow browser to send cookies wher we have our token
});

api.interceptors.request.use(config => {
  config.headers = config.headers || {};
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
