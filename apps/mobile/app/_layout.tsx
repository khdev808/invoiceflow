import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { DevNavigationLogger } from '@/components/DevNavigationLogger';
import { registerForPushNotifications } from '@/lib/pushNotifications';
import { syncPendingOps } from '@/lib/offline';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { fonts } from '@/constants/theme';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const modalScreens = [
  { name: 'invoice/create', titleKey: 'newInvoice' },
  { name: 'invoice/edit/[id]', titleKey: 'editInvoice' },
  { name: 'client/create', titleKey: 'newClient' },
  { name: 'expense/create', titleKey: 'addExpense' },
  { name: 'time/create', titleKey: 'logTimeEntry' },
  { name: 'product/create', titleKey: 'newProduct' },
  { name: 'mileage/create', titleKey: 'logMileage' },
] as const;

const stackScreens = [
  { name: 'invoice/[id]', titleKey: 'invoices' },
  { name: 'client/[id]', titleKey: 'client' },
  { name: 'expenses', titleKey: 'expenses' },
  { name: 'time', titleKey: 'timeTracking' },
  { name: 'reports', titleKey: 'reports' },
  { name: 'notifications', titleKey: 'notifications' },
  { name: 'recurring', titleKey: 'recurring' },
  { name: 'settings/profile', titleKey: 'businessProfile' },
  { name: 'settings/templates', titleKey: 'invoiceTemplates' },
  { name: 'settings/payments', titleKey: 'paymentMethods' },
  { name: 'settings/language', titleKey: 'language' },
  { name: 'settings/reminders', titleKey: 'remindersLateFees' },
  { name: 'settings/plan', titleKey: 'plan' },
  { name: 'settings/integrations', titleKey: 'integrations' },
  { name: 'products', titleKey: 'products' },
  { name: 'mileage', titleKey: 'mileage' },
] as const;

function ThemedNavigation() {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) registerForPushNotifications();
    syncPendingOps();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncPendingOps();
    });
    return () => sub.remove();
  }, [isAuthenticated]);

  const headerOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
    headerShadowVisible: false,
    headerBackTitle: t('back'),
  };

  return (
    <>
      <DevNavigationLogger />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        {modalScreens.map((s) => (
          <Stack.Screen
            key={s.name}
            name={s.name}
            options={{ presentation: 'modal', headerShown: true, title: t(s.titleKey), ...headerOptions }}
          />
        ))}
        {stackScreens.map((s) => (
          <Stack.Screen key={s.name} name={s.name} options={{ headerShown: true, title: t(s.titleKey), ...headerOptions }} />
        ))}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  useEffect(() => { useI18nStore.getState().init(); }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
