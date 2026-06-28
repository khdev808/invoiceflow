import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

type IllustrationComponent = ComponentType<SvgProps>;

// Metro requires static require paths — map filenames to SVG components.
const ILLUSTRATIONS: Record<string, IllustrationComponent> = {
  'onboarding-1.svg': require('@/assets/illustrations/onboarding-1.svg').default,
  'onboarding-2.svg': require('@/assets/illustrations/onboarding-2.svg').default,
  'onboarding-3.svg': require('@/assets/illustrations/onboarding-3.svg').default,
  'onboarding-4.svg': require('@/assets/illustrations/onboarding-4.svg').default,
  'empty-invoices.svg': require('@/assets/illustrations/empty-invoices.svg').default,
  'empty-clients.svg': require('@/assets/illustrations/empty-clients.svg').default,
  'empty-expenses.svg': require('@/assets/illustrations/empty-expenses.svg').default,
  'empty-recurring.svg': require('@/assets/illustrations/empty-recurring.svg').default,
  'empty-time.svg': require('@/assets/illustrations/empty-time.svg').default,
  'offline.svg': require('@/assets/illustrations/offline.svg').default,
  'paywall.svg': require('@/assets/illustrations/paywall.svg').default,
  'success-invoice.svg': require('@/assets/illustrations/success-invoice.svg').default,
  'error-404.svg': require('@/assets/illustrations/error-404.svg').default,
};

export function getIllustration(name: string): IllustrationComponent | undefined {
  return ILLUSTRATIONS[name];
}
