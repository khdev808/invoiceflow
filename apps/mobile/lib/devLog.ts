import { Platform } from 'react-native';
import { IS_DEV } from '@/lib/config';

const ENABLED = IS_DEV && __DEV__;

export type DevDeviceLabel = 'iPhone' | 'Android' | 'Web';

export function getDevDeviceLabel(): DevDeviceLabel {
  if (Platform.OS === 'ios') return 'iPhone';
  if (Platform.OS === 'android') return 'Android';
  return 'Web';
}

function devLogPrefix(kind: 'page' | 'action' | 'api-error'): string {
  return `[InvoiceFlow][${getDevDeviceLabel()}][${kind}]`;
}

export function devLogPage(
  pathname: string,
  detail?: { segments?: string[]; params?: Record<string, unknown> },
) {
  if (!ENABLED) return;
  const { segments, params } = detail ?? {};
  const device = getDevDeviceLabel();
  if (segments?.length || params) {
    console.log(`${devLogPrefix('page')} ${pathname}`, { device, segments, params });
    return;
  }
  console.log(`${devLogPrefix('page')} ${pathname}`, { device });
}

export function devLogAction(action: string, detail?: Record<string, unknown>) {
  if (!ENABLED) return;
  const device = getDevDeviceLabel();
  if (detail && Object.keys(detail).length > 0) {
    console.log(`${devLogPrefix('action')} ${action}`, { device, ...detail });
    return;
  }
  console.log(`${devLogPrefix('action')} ${action}`, { device });
}

export function devLogApiError(
  method: string,
  url: string,
  detail: { status?: number; message: string; data?: unknown },
) {
  if (!ENABLED) return;
  const device = getDevDeviceLabel();
  console.warn(`${devLogPrefix('api-error')} ${method} ${url}`, { device, ...detail });
}

/** Wrap a press handler with a dev action label. */
export function devPress(action: string, handler: () => void, detail?: Record<string, unknown>) {
  return () => {
    devLogAction(action, detail);
    handler();
  };
}

/** Wrap an async handler with a dev action label. */
export function devAction<T extends (...args: never[]) => unknown>(action: string, handler: T): T {
  const wrapped = ((...args: Parameters<T>) => {
    devLogAction(action);
    return handler(...args);
  }) as T;
  return wrapped;
}
