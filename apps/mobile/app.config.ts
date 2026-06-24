import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

const bundleId = IS_DEV ? 'com.kh.everything.qr.dev' : 'com.kh.everything.qr';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'InvoiceFlow Dev' : 'InvoiceFlow',
  slug: 'invoiceflow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: IS_DEV ? 'invoiceflow-dev' : 'invoiceflow',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
  },
  android: {
    package: bundleId,
    usesCleartextTraffic: IS_DEV,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#2563EB',
      },
    ],
    'expo-secure-store',
    'expo-sharing',
    [
      'expo-contacts',
      {
        contactsPermission: 'InvoiceFlow needs access to import clients from your contacts.',
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'InvoiceFlow needs camera access to scan receipts.',
      },
    ],
    'expo-notifications',
    'expo-localization',
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    appVariant: IS_DEV ? 'development' : 'production',
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? (IS_DEV ? undefined : 'https://api.invoiceflow.app'),
    portalUrl: process.env.EXPO_PUBLIC_PORTAL_URL ?? (IS_DEV ? undefined : 'https://invoiceflow.app/portal'),
    eas: {
      projectId: '5be40599-752d-4be8-8f57-1895687a4ad1',
    },
  },
  owner: 'khdev4678',
});
