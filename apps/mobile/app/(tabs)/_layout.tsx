import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isOnboardingComplete } from '@/lib/onboarding';
import { CustomTabBar, getTabBarScrollPadding } from '@/components/ui/CustomTabBar';

export default function TabLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (isAuthenticated) {
      isOnboardingComplete().then(setOnboardingDone);
    }
  }, [isAuthenticated]);

  if (isLoading || (isAuthenticated && onboardingDone === null)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  const scenePadding = getTabBarScrollPadding(insets);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background, paddingBottom: scenePadding },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('home') }} />
      <Tabs.Screen name="invoices" options={{ title: t('invoices') }} />
      <Tabs.Screen name="clients" options={{ title: t('clients') }} />
      <Tabs.Screen name="more" options={{ title: t('more') }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
