import Constants from 'expo-constants';
import { API_URL, PORTAL_BASE } from '@/constants/servers';

type AppExtra = {
  appVariant?: 'development' | 'production';
  apiUrl?: string;
  portalUrl?: string;
};

const extra = (Constants.expoConfig?.extra || {}) as AppExtra;

export const APP_VARIANT = extra.appVariant ?? 'development';
export const IS_DEV = APP_VARIANT === 'development';

export function getApiUrl() {
  return extra.apiUrl || API_URL;
}

export function getPortalBase() {
  return extra.portalUrl || PORTAL_BASE;
}

export function getPortalUrl(invoiceId: string) {
  return `${getPortalBase()}/${invoiceId}`;
}
