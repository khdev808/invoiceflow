import { Platform, StatusBar } from 'react-native';
import { initialWindowMetrics, type EdgeInsets } from 'react-native-safe-area-context';
import { spacing } from '@/constants/theme';

const ANDROID_BOTTOM_NAV_FALLBACK = 48;

export function getTopInset(insets: EdgeInsets): number {
  const measured = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);
  if (Platform.OS === 'android') {
    return Math.max(measured, StatusBar.currentHeight ?? 24);
  }
  return measured;
}

export function getBottomInset(insets: EdgeInsets): number {
  const measured = Math.max(insets.bottom, initialWindowMetrics?.insets.bottom ?? 0);
  if (Platform.OS === 'android' && measured === 0) {
    return ANDROID_BOTTOM_NAV_FALLBACK;
  }
  return measured;
}

/** Extra top margin for tab screen headers on Android (status bar icons, dev overlays). */
export function getAndroidTabHeaderTopMargin(): number {
  return Platform.OS === 'android' ? spacing.lg : 0;
}

/** Base header padding + Android-only top margin for tab screens. */
export function getTabHeaderTopSpacing(): number {
  return spacing.sm + getAndroidTabHeaderTopMargin();
}

/** @deprecated Use getAndroidTabHeaderTopMargin */
export function getAndroidHeaderTopGap(): number {
  return getAndroidTabHeaderTopMargin();
}
