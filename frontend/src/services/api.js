import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Prisma Backend Endpoints
export const pesananAPI = {
  getAll: (params) => api.get('/orders/restaurant/orders', { params }),
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getLaporan: (params) => api.get('/admin/reports/sales', { params })
};

export const menuAPI = {
  getAll: (params) => api.get('/menus/my', { params }),
  create: (data) => api.post('/menus', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/menus/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/menus/${id}`),
  toggleTersedia: (id) => api.patch(`/menus/${id}/toggle`)
};

export const kategoriAPI = {
  // Stubbed for now since Category is just a string field in Prisma
  getAll: () => Promise.resolve({ data: { data: [{ id: 'Makanan', nama: 'Makanan' }, { id: 'Minuman', nama: 'Minuman' }, { id: 'Snack', nama: 'Snack' }] } })
};

export const mejaAPI = {
  // TODO: Verify if Prisma has a tables route or just map to an empty array for now
  getAll: () => Promise.resolve({ data: { data: [] } }),
  create: (data) => Promise.resolve(),
  update: (id, data) => Promise.resolve(),
  delete: (id) => Promise.resolve()
};

export const restoranAPI = {
  getProfile: () => api.get('/restaurants/my/profile'),
  updateProfile: (data) => api.put('/restaurants/my/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => api.get('/restaurants/my/dashboard'),
  getAllAdmin: () => api.get('/admin/restaurants')
};

export const userAPI = {
  getAllAdmin: () => api.get('/admin/users')
};

export const reservasiAPI = {
  getAll: (params) => api.get('/reservations/restaurant', { params }),
  updateStatus: (id, data) => api.patch(`/reservations/${id}/status`, data)
};

export const getImageUrl = (path) => path ? `${import.meta.env.VITE_BACKEND_URL || ''}${path}` : '';

export default api;
