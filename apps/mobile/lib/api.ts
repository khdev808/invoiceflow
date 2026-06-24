import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  ios: 'http://localhost:3001',
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
});

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function setAuthToken(token: string | null) {
  if (token) await SecureStore.setItemAsync('token', token);
  else await SecureStore.deleteItemAsync('token');
}

export async function getAuthToken() {
  return SecureStore.getItemAsync('token');
}

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; businessName?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Clients
export const clientsApi = {
  list: (search?: string) => api.get('/clients', { params: { search } }),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Invoices
export const invoicesApi = {
  dashboard: () => api.get('/invoices/dashboard'),
  list: (params?: { status?: string; type?: string; clientId?: string }) =>
    api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  send: (id: string) => api.post(`/invoices/${id}/send`),
  convert: (id: string, dueDate?: string) => api.post(`/invoices/${id}/convert`, { dueDate }),
  recordPayment: (id: string, data: { amount: number; method: string }) =>
    api.post(`/invoices/${id}/payments`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// Expenses
export const expensesApi = {
  list: (from?: string, to?: string) => api.get('/expenses', { params: { from, to } }),
  summary: (from?: string, to?: string) => api.get('/expenses/summary', { params: { from, to } }),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Time entries
export const timeApi = {
  list: (billable?: boolean) => api.get('/time-entries', { params: { billable: billable ? 'true' : undefined } }),
  create: (data: any) => api.post('/time-entries', data),
  toLineItems: (entryIds: string[]) => api.post('/time-entries/to-line-items', { entryIds }),
  delete: (id: string) => api.delete(`/time-entries/${id}`),
};

// Reports
export const reportsApi = {
  income: (from?: string, to?: string) => api.get('/reports/income', { params: { from, to } }),
  profitLoss: (from?: string, to?: string) => api.get('/reports/profit-loss', { params: { from, to } }),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Users
export const usersApi = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateSettings: (data: any) => api.put('/users/settings', data),
};

// Payments
export const paymentsApi = {
  createLink: (invoiceId: string) => api.post(`/payments/link/${invoiceId}`),
};

// Products
export const productsApi = {
  list: (search?: string) => api.get('/products', { params: { search } }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Mileage
export const mileageApi = {
  list: () => api.get('/mileage'),
  summary: () => api.get('/mileage/summary'),
  create: (data: any) => api.post('/mileage', data),
  delete: (id: string) => api.delete(`/mileage/${id}`),
};

// OCR
export const ocrApi = {
  parseReceipt: (imageUri: string) => api.post('/ocr/receipt', { imageUri }),
};

// Recurring
export const recurringApi = {
  list: () => api.get('/invoices/recurring/list'),
};

export const PORTAL_BASE = 'http://localhost:3000/portal';
