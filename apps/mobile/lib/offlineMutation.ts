import { checkOnline, queueOfflineOp } from './offline';

export async function runWithOfflineFallback<T>(opts: {
  online: () => Promise<T>;
  queue: () => Promise<void>;
  onQueued?: () => void;
}): Promise<T | null> {
  const online = await checkOnline();
  if (online) {
    return opts.online();
  }
  await opts.queue();
  opts.onQueued?.();
  return null;
}

export async function queueClientCreate(data: Record<string, unknown>) {
  await queueOfflineOp({ method: 'POST', url: '/clients', body: data });
}

export async function queueClientUpdate(id: string, data: Record<string, unknown>) {
  await queueOfflineOp({ method: 'PUT', url: `/clients/${id}`, body: data });
}

export async function queueInvoiceUpdate(id: string, data: Record<string, unknown>) {
  await queueOfflineOp({ method: 'PUT', url: `/invoices/${id}`, body: data });
}
