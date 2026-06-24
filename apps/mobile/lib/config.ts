import Constants from 'expo-constants';
import { Platform } from 'react-native';

type AppExtra = {
  appVariant?: 'development' | 'production';
  apiUrl?: string;
  portalUrl?: string;
};

const extra = (Constants.expoConfig?.extra || {}) as AppExtra;

export const APP_VARIANT = extra.appVariant ?? 'development';
export const IS_DEV = APP_VARIANT === 'development';

function localApiUrl() {
  return Platform.select({
    ios: 'http://localhost:3001',
    android: 'http://10.0.2.2:3001',
    default: 'http://localhost:3001',
  })!;
}

export function getApiUrl() {
  return extra.apiUrl || localApiUrl();
}

export function getPortalBase() {
  return extra.portalUrl || 'http://localhost:3000/portal';
}
