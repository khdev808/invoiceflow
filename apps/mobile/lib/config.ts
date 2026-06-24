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

function getPackagerHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as { linkingUri?: string }).linkingUri,
  ];

  for (const uri of candidates) {
    if (!uri || typeof uri !== 'string') continue;
    const host = uri.replace(/^[a-z]+:\/\//, '').split(/[:/]/)[0];
    if (host) return host;
  }

  return null;
}

/** Dev API URL for the current runtime (simulator, emulator, or device). */
function localApiUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:3001';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:3001';
  }

  // Android emulator: 10.0.2.2 is the host loopback alias.
  if (!Constants.isDevice) {
    return 'http://10.0.2.2:3001';
  }

  // Physical Android device on the same LAN as Metro.
  const packagerHost = getPackagerHost();
  if (packagerHost && packagerHost !== 'localhost' && packagerHost !== '127.0.0.1') {
    return `http://${packagerHost}:3001`;
  }

  // USB debugging with `adb reverse tcp:3001 tcp:3001`.
  return 'http://localhost:3001';
}

export function getApiUrl() {
  return extra.apiUrl || localApiUrl();
}

export function getPortalBase() {
  if (extra.portalUrl) return extra.portalUrl;

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:3000/portal';
  }

  const packagerHost = getPackagerHost();
  if (Platform.OS === 'android' && packagerHost && packagerHost !== 'localhost') {
    return `http://${packagerHost}:3000/portal`;
  }

  return 'http://localhost:3000/portal';
}
