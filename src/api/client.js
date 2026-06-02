import axios from 'axios';

// Token is also kept in localStorage as a fallback to the HTTP-only cookie,
// so the app still works if third-party cookies are blocked.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ---- Separate client for the admin panel (its own token) ----
export const adminApi = axios.create({ baseURL: '/api', withCredentials: true });

export function setAdminToken(token) {
  if (token) localStorage.setItem('adminToken', token);
  else localStorage.removeItem('adminToken');
}

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the admin token is missing/expired, bounce back to the admin login.
adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.endsWith('/admin/login')) {
      setAdminToken(null);
      location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);
