import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const CACHE_KEYS = {
  invoices: 'cache_invoices',
  clients: 'cache_clients',
  pending: 'cache_pending_ops',
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

interface PendingOp {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: unknown;
  createdAt: number;
}

export async function queueOfflineOp(op: Omit<PendingOp, 'id' | 'createdAt'>) {
  const pending = await getPendingOps();
  pending.push({ ...op, id: `${Date.now()}`, createdAt: Date.now() });
  await AsyncStorage.setItem(CACHE_KEYS.pending, JSON.stringify(pending));
}

export async function getPendingOps(): Promise<PendingOp[]> {
  const raw = await AsyncStorage.getItem(CACHE_KEYS.pending);
  return raw ? JSON.parse(raw) : [];
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
  return { synced: pending.length - remaining.length, remaining: remaining.length };
}
