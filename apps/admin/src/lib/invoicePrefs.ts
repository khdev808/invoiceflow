const LAST_CLIENT_KEY = 'invoiceflow_last_client_id';

export function getLastClientId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_CLIENT_KEY);
}

export function saveLastClientId(clientId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_CLIENT_KEY, clientId);
}
