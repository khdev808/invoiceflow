import { useFonts } from 'expo-font';
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
import { useAuthStore } from '@/stores/auth';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const modalScreens = [
  { name: 'invoice/create', title: 'New Invoice' },
  { name: 'invoice/edit/[id]', title: 'Edit Invoice' },
  { name: 'client/create', title: 'New Client' },
  { name: 'expense/create', title: 'Add Expense' },
  { name: 'time/create', title: 'Log Time' },
  { name: 'product/create', title: 'New Product' },
  { name: 'mileage/create', title: 'Log Mileage' },
] as const;

const stackScreens = [
  { name: 'invoice/[id]', title: 'Invoice' },
  { name: 'client/[id]', title: 'Client' },
  { name: 'expenses', title: 'Expenses' },
  { name: 'time', title: 'Time Tracking' },
  { name: 'reports', title: 'Reports' },
  { name: 'notifications', title: 'Notifications' },
  { name: 'recurring', title: 'Recurring' },
  { name: 'settings/profile', title: 'Business Profile' },
  { name: 'settings/templates', title: 'Templates' },
  { name: 'settings/payments', title: 'Payments' },
  { name: 'settings/language', title: 'Language' },
  { name: 'settings/reminders', title: 'Reminders & Late Fees' },
  { name: 'settings/plan', title: 'Plan & Usage' },
  { name: 'settings/integrations', title: 'Integrations' },
  { name: 'products', title: 'Products' },
  { name: 'mileage', title: 'Mileage' },
] as const;

function ThemedNavigation() {
  const { colors, isDark } = useTheme();
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
    headerTitleStyle: { color: colors.text, fontWeight: '700' as const, fontSize: 17 },
    headerShadowVisible: false,
    headerBackTitle: 'Back',
  };

  return (
    <>
      <DevNavigationLogger />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        {modalScreens.map((s) => (
          <Stack.Screen
            key={s.name}
            name={s.name}
            options={{ presentation: 'modal', headerShown: true, title: s.title, ...headerOptions }}
          />
        ))}
        {stackScreens.map((s) => (
          <Stack.Screen key={s.name} name={s.name} options={{ headerShown: true, title: s.title, ...headerOptions }} />
        ))}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

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
