const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'adminToken';

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type PeriodStats = {
  newUsers: number;
  invoicesCreated: number;
  invoiceVolume: number;
  estimatesCreated: number;
  paidInvoiceVolume: number;
  paymentsCollected: number;
  newClients: number;
};

export type DashboardData = {
  generatedAt: string;
  totals: {
    userCount: number;
    invoiceCount: number;
    estimateCount: number;
    clientCount: number;
    invoiceVolume: number;
    paidInvoiceVolume: number;
    paymentsCollected: number;
  };
  periods: {
    today: PeriodStats;
    month: PeriodStats;
    year: PeriodStats;
  };
  userGrowthMonthly: { period: string; count: number }[];
  userGrowthDaily: { period: string; count: number }[];
  invoiceGrowthMonthly: { period: string; count: number; volume: number }[];
  planBreakdown: { plan: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  recentUsers: AdminUser[];
  recentInvoices: AdminInvoice[];
  recentPayments: AdminPayment[];
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  businessName?: string | null;
  role: string;
  plan: string;
  createdAt: string;
  _count: { invoices: number; clients: number };
};

export type AdminInvoice = {
  id: string;
  documentNumber: string;
  documentType: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  client: { name: string };
};

export type AdminPayment = {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  invoice: {
    documentNumber: string;
    currency: string;
    user: { name: string };
  };
};

export type UsersPage = {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAdminToken();
    throw new AdminApiError('Session expired. Please sign in again.', 401);
  }
  if (res.status === 403) {
    throw new AdminApiError('Admin access required.', 403);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed';
    throw new AdminApiError(message, res.status);
  }
  return data as T;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new AdminApiError(data.message || 'Login failed', res.status);
  if (data.user?.role !== 'ADMIN') {
    throw new AdminApiError('This account does not have admin access.', 403);
  }
  saveAdminToken(data.token);
  return data;
}

export function fetchDashboard() {
  return apiFetch<DashboardData>('/admin/dashboard');
}

export function fetchUsers(page = 1, search = '') {
  const params = new URLSearchParams({ page: String(page), limit: '15' });
  if (search.trim()) params.set('search', search.trim());
  return apiFetch<UsersPage>(`/admin/users?${params}`);
}

export function updateUserPlan(userId: string, plan: string) {
  return apiFetch(`/admin/users/${userId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ plan }),
  });
}

export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
