import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const CACHE_KEYS = {
  invoices: 'cache_invoices',
  clients: 'cache_clients',
  expenses: 'cache_expenses',
  timeEntries: 'cache_time_entries',
  mileage: 'cache_mileage',
  dashboard: 'cache_dashboard',
  pending: 'cache_pending_ops',
  lastOnline: 'cache_last_online',
};

export async function cacheData(key: string, data: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify({ data, at: Date.now() }));
}

export async function getCached<T>(key: string, maxAgeMs = 86400000): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const { data, at } = JSON.parse(raw);
  if (Date.now() - at > maxAgeMs) return null;
  return data as T;
}

export async function cacheInvoices(invoices: unknown[]) {
  await cacheData(CACHE_KEYS.invoices, invoices);
}

export async function getCachedInvoices() {
  return getCached(CACHE_KEYS.invoices);
}

export async function cacheClients(clients: unknown[]) {
  await cacheData(CACHE_KEYS.clients, clients);
}

export async function getCachedClients() {
  return getCached(CACHE_KEYS.clients);
}

export async function cacheExpenses(expenses: unknown[]) {
  await cacheData(CACHE_KEYS.expenses, expenses);
}

export async function getCachedExpenses() {
  return getCached(CACHE_KEYS.expenses);
}

export async function cacheTimeEntries(entries: unknown[]) {
  await cacheData(CACHE_KEYS.timeEntries, entries);
}

export async function getCachedTimeEntries() {
  return getCached(CACHE_KEYS.timeEntries);
}

export async function cacheMileage(entries: unknown[]) {
  await cacheData(CACHE_KEYS.mileage, entries);
}

export async function getCachedMileage() {
  return getCached(CACHE_KEYS.mileage);
}

export async function cacheDashboard(stats: unknown) {
  await cacheData(CACHE_KEYS.dashboard, stats);
}

export async function getCachedDashboard() {
  return getCached(CACHE_KEYS.dashboard);
}

interface PendingOp {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: unknown;
  createdAt: number;
}

export async function queueOfflineOp(op: Omit<PendingOp, 'id' | 'createdAt'>) {
  const pending = await getPendingOps();
  pending.push({ ...op, id: `${Date.now()}-${Math.random()}`, createdAt: Date.now() });
  await AsyncStorage.setItem(CACHE_KEYS.pending, JSON.stringify(pending));
}

export async function getPendingOps(): Promise<PendingOp[]> {
  const raw = await AsyncStorage.getItem(CACHE_KEYS.pending);
  return raw ? JSON.parse(raw) : [];
}

export async function getPendingCount(): Promise<number> {
  return (await getPendingOps()).length;
}

export async function syncPendingOps() {
  const pending = await getPendingOps();
  const remaining: PendingOp[] = [];

  for (const op of pending) {
    try {
      await api.request({ method: op.method, url: op.url, data: op.body });
    } catch {
      remaining.push(op);
    }
  }

  await AsyncStorage.setItem(CACHE_KEYS.pending, JSON.stringify(remaining));
  await markOnline();
  return { synced: pending.length - remaining.length, remaining: remaining.length };
}

export async function markOnline() {
  await AsyncStorage.setItem(CACHE_KEYS.lastOnline, String(Date.now()));
}

export async function setOfflineFlag() {
  await AsyncStorage.setItem(CACHE_KEYS.lastOnline, '0');
}

/** Simple connectivity check without extra deps */
export async function checkOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const base = api.defaults.baseURL || 'http://localhost:3001';
    await fetch(`${base}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);
    await markOnline();
    return true;
  } catch {
    await setOfflineFlag();
    return false;
  }
}
