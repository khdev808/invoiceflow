const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const TOKEN_KEY = 'appToken';

export class AppApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  businessName?: string | null;
  plan?: string;
  currency?: string;
  settings?: Record<string, unknown>;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAppToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAppToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAppToken();
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.includes('/app/login') && !path.includes('/app/register') && !path.includes('/app/forgot-password') && !path.includes('/app/reset-password')) {
        window.location.href = '/app/login?expired=1';
      }
    }
    throw new AppApiError('Session expired. Please sign in again.', 401);
  }
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed';
    throw new AppApiError(message, res.status);
  }
  return data as T;
}

export const authApi = {
  login: (email: string, password: string, captchaToken?: string) =>
    apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captchaToken }),
    }),
  register: (data: { email: string; password: string; name: string; businessName?: string; captchaToken?: string; referralCode?: string }) =>
    apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => apiFetch<User>('/auth/me'),
  forgotPassword: (email: string, captchaToken?: string) =>
    apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, captchaToken }),
    }),
  resetPassword: (token: string, password: string, captchaToken?: string) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, captchaToken }),
    }),
};

export const clientsApi = {
  list: (search?: string) => apiFetch<Client[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => apiFetch<Client>(`/clients/${id}`),
  create: (data: Partial<Client>) => apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Client>) =>
    apiFetch<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/clients/${id}`, { method: 'DELETE' }),
};

export const invoicesApi = {
  dashboard: () => apiFetch<DashboardStats>('/invoices/dashboard'),
  list: (params?: { status?: string; type?: string; clientId?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.clientId) q.set('clientId', params.clientId);
    const qs = q.toString();
    return apiFetch<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => apiFetch<Invoice>(`/invoices/${id}`),
  create: (data: CreateInvoicePayload) =>
    apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateInvoicePayload> & { status?: string }) =>
    apiFetch<Invoice>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  send: (id: string) => apiFetch<Invoice>(`/invoices/${id}/send`, { method: 'POST' }),
  duplicate: (id: string) => apiFetch<Invoice>(`/invoices/${id}/duplicate`, { method: 'POST' }),
  sendSms: (id: string, phone: string) =>
    apiFetch<{ sent: boolean; dev?: boolean; telLink?: string; error?: string }>(`/invoices/${id}/sms`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  convert: (id: string, dueDate?: string) =>
    apiFetch<Invoice>(`/invoices/${id}/convert`, { method: 'POST', body: JSON.stringify({ dueDate }) }),
  recordPayment: (id: string, data: { amount: number; method: string }) =>
    apiFetch(`/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/invoices/${id}`, { method: 'DELETE' }),
};

export const expensesApi = {
  list: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const qs = q.toString();
    return apiFetch<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`);
  },
  summary: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const qs = q.toString();
    return apiFetch<{ total: number; count: number }>(`/expenses/summary${qs ? `?${qs}` : ''}`);
  },
  create: (data: Partial<Expense>) =>
    apiFetch<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Expense>) =>
    apiFetch<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
};

export const timeApi = {
  list: (billable?: boolean) =>
    apiFetch<TimeEntry[]>(`/time-entries${billable ? '?billable=true' : ''}`),
  create: (data: {
    clientId?: string;
    description: string;
    hours: number;
    rate: number;
    date?: string;
    billable?: boolean;
  }) =>
    apiFetch<TimeEntry>('/time-entries', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/time-entries/${id}`, { method: 'DELETE' }),
  toLineItems: (entryIds: string[]) =>
    apiFetch<LineItem[]>('/time-entries/to-line-items', { method: 'POST', body: JSON.stringify({ entryIds }) }),
};

export const mileageApi = {
  list: (unbilled?: boolean) =>
    apiFetch<MileageEntry[]>(`/mileage${unbilled ? '?unbilled=true' : ''}`),
  summary: () => apiFetch<{ totalMiles: number; totalAmount: number; unbilledMiles: number }>('/mileage/summary'),
  create: (data: { description: string; miles: number; rate?: number; date?: string; purpose?: string }) =>
    apiFetch<MileageEntry>('/mileage', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/mileage/${id}`, { method: 'DELETE' }),
  toLineItems: (entryIds: string[]) =>
    apiFetch<LineItem[]>('/mileage/to-line-items', { method: 'POST', body: JSON.stringify({ entryIds }) }),
};

export const recurringApi = {
  list: () => apiFetch<RecurringSchedule[]>('/invoices/recurring/list'),
  toggle: (id: string, active: boolean) =>
    apiFetch(`/invoices/recurring/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  delete: (id: string) => apiFetch(`/invoices/recurring/${id}`, { method: 'DELETE' }),
};

export const reportsApi = {
  income: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const qs = q.toString();
    return apiFetch<IncomeReport>(`/reports/income${qs ? `?${qs}` : ''}`);
  },
  profitLoss: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const qs = q.toString();
    return apiFetch<ProfitLossReport>(`/reports/profit-loss${qs ? `?${qs}` : ''}`);
  },
  exportQuickBooks: async (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const qs = q.toString();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = getToken();
    const res = await fetch(`${API_URL}/reports/export/quickbooks${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new AppApiError('Export failed', res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickbooks-export-${from || 'all'}-${to || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export const productsApi = {
  list: (search?: string) =>
    apiFetch<Product[]>(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (data: Partial<Product>) =>
    apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  list: () => apiFetch<Notification[]>('/notifications'),
  unreadCount: () => apiFetch<number>('/notifications/unread-count'),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
};

export const integrationsApi = {
  setWebhook: (url: string) =>
    apiFetch('/integrations/webhook', { method: 'PUT', body: JSON.stringify({ url }) }),
  test: () => apiFetch<{ sent: boolean }>('/integrations/test', { method: 'PUT' }),
};

export const uploadsApi = {
  logo: (base64: string, mimeType?: string) =>
    apiFetch<{ url: string }>('/uploads/logo', { method: 'POST', body: JSON.stringify({ base64, mimeType }) }),
};

export const usersApi = {
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updateSettings: (data: Record<string, unknown>) =>
    apiFetch('/users/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

export const ocrApi = {
  parseReceipt: (base64: string, mimeType?: string) =>
    apiFetch<{
      description: string;
      amount: number;
      vendor: string;
      category: string;
      confidence: number;
      requiresManualAmount?: boolean;
    }>('/ocr/receipt', {
      method: 'POST',
      body: JSON.stringify({ imageUri: 'web-upload', base64, mimeType }),
    }),
};

export const referralsApi = {
  me: () =>
    apiFetch<{
      referralCode: string;
      referralCount: number;
      upgradedReferrals: number;
      reward: string;
    }>('/referrals/me'),
};

export const planApi = {
  usage: () =>
    apiFetch<{
      used: number;
      limit: number;
      invoicesUsed: number;
      invoiceLimit: number;
      plan: string;
      stripeConfigured?: boolean;
    }>('/plan/usage'),
  upgrade: (plan: 'pro' | 'business') =>
    apiFetch<{ checkoutUrl?: string; message?: string; plan?: string }>('/plan/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
};

export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  _count?: { invoices: number };
};

export type LineItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
};

export type Invoice = {
  id: string;
  documentNumber: string;
  documentType: string;
  status: string;
  total: number;
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  templateId?: string;
  signature?: string;
  clientSignature?: string;
  depositAmount?: number;
  depositPercent?: number;
  depositPaid?: boolean;
  lateFeeAmount?: number;
  clientId: string;
  client?: Client;
  lineItems?: LineItem[];
  payments?: { id: string; amount: number; method: string; paidAt: string }[];
  activities?: InvoiceActivity[];
  user?: User & { businessLogo?: string; businessEmail?: string; businessPhone?: string };
  sentAt?: string | null;
  viewedAt?: string | null;
  createdAt: string;
};

export type InvoiceActivity = {
  id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type CreateInvoicePayload = {
  clientId: string;
  documentType?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  terms?: string;
  templateId?: string;
  signature?: string;
  depositAmount?: number;
  depositPercent?: number;
  recurringRule?: string;
  linkedInvoiceId?: string;
  lineItems: LineItem[];
};

export type DashboardStats = {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  totalExpenses: number;
  invoiceCount: number;
  paidCount: number;
  outstandingCount: number;
  overdueCount: number;
  clientCount: number;
  estimatesPending: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  taxDeductible: boolean;
};

export type TimeEntry = {
  id: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  billable: boolean;
  invoiced: boolean;
  client?: { id: string; name: string };
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  taxRate: number;
  sku?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type IncomeReport = {
  total: number;
  count: number;
  byMonth: Record<string, number>;
};

export type ProfitLossReport = {
  income: number;
  expenses: number;
  profit: number;
};

export type MileageEntry = {
  id: string;
  description: string;
  miles: number;
  rate: number;
  amount?: number;
  date: string;
  purpose?: string;
  invoiced: boolean;
};

export type RecurringSchedule = {
  id: string;
  frequency: string;
  active: boolean;
  nextRunAt: string;
  clientId: string;
  lineItemsJson: unknown;
};
