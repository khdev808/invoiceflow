import { router, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen style={{ backgroundColor: colors.background }}>
        <EmptyState
          illustration="error-404.svg"
          title="Page not found"
          message="This screen is not in your ledger."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
    </>
  );
}
