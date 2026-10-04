import { request } from './client';

export const productsApi = {
  list: (params) => request('/products', { params, auth: false }),
  get: (id) => request(`/products/${id}`, { auth: false }),
  related: (id) => request(`/products/${id}/related`, { auth: false }),
  reviews: (id, params) => request(`/products/${id}/reviews`, { params, auth: false }),
  addReview: (id, body) => request(`/products/${id}/reviews`, { method: 'POST', body }),
  create: (formData) => request('/products', { method: 'POST', body: formData }),
  update: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData }),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body }),
};

export const cartApi = {
  get: () => request('/cart'),
  add: (body) => request('/cart', { method: 'POST', body }),
  merge: (items) => request('/cart/merge', { method: 'POST', body: { items } }),
  update: (itemId, quantity) => request(`/cart/${itemId}`, { method: 'PUT', body: { quantity } }),
  remove: (itemId) => request(`/cart/${itemId}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' }),
};

export const ordersApi = {
  create: (body) => request('/orders', { method: 'POST', body }),
  mine: () => request('/orders/mine'),
  get: (id) => request(`/orders/${id}`),
  cancel: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),
  all: (params) => request('/orders', { params }),
  setStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
};

export const couponsApi = {
  validate: (code, subtotal) => request('/coupons/validate', { method: 'POST', body: { code, subtotal }, auth: false }),
};

export const metaApi = {
  get: () => request('/meta', { auth: false }),
  testimonials: () => request('/meta/testimonials', { auth: false }),
};

export const adminApi = {
  stats: () => request('/admin/stats'),
  users: () => request('/admin/users'),
  setRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
  removeUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};
