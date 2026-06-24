import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="invoice/create" options={{ presentation: 'modal', headerShown: true, title: 'New Invoice' }} />
        <Stack.Screen name="invoice/[id]" options={{ headerShown: true, title: 'Invoice' }} />
        <Stack.Screen name="client/create" options={{ presentation: 'modal', headerShown: true, title: 'New Client' }} />
        <Stack.Screen name="client/[id]" options={{ headerShown: true, title: 'Client' }} />
        <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
        <Stack.Screen name="expense/create" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense' }} />
        <Stack.Screen name="time" options={{ headerShown: true, title: 'Time Tracking' }} />
        <Stack.Screen name="time/create" options={{ presentation: 'modal', headerShown: true, title: 'Log Time' }} />
        <Stack.Screen name="reports" options={{ headerShown: true, title: 'Reports' }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
        <Stack.Screen name="settings/profile" options={{ headerShown: true, title: 'Business Profile' }} />
        <Stack.Screen name="settings/templates" options={{ headerShown: true, title: 'Templates' }} />
        <Stack.Screen name="settings/payments" options={{ headerShown: true, title: 'Payments' }} />
        <Stack.Screen name="settings/language" options={{ headerShown: true, title: 'Language' }} />
        <Stack.Screen name="settings/reminders" options={{ headerShown: true, title: 'Reminders & Late Fees' }} />
        <Stack.Screen name="products" options={{ headerShown: true, title: 'Products' }} />
        <Stack.Screen name="product/create" options={{ presentation: 'modal', headerShown: true, title: 'New Product' }} />
        <Stack.Screen name="mileage" options={{ headerShown: true, title: 'Mileage' }} />
        <Stack.Screen name="mileage/create" options={{ presentation: 'modal', headerShown: true, title: 'Log Mileage' }} />
      </Stack>
    </QueryClientProvider>
  );
}
