import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { getApiUrl } from '@/lib/config';
import { devLogAction } from '@/lib/devLog';
import { getIllustration } from '@/lib/illustrations';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fonts, layout, radius, spacing } from '@/constants/theme';

const OnboardingIllustration = getIllustration('onboarding-1.svg');

export default function LoginScreen() {
  const [email, setEmail] = useState(__DEV__ ? 'demo@invoiceflow.app' : '');
  const [password, setPassword] = useState(__DEV__ ? 'demo1234' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const { colors } = useTheme();

  const handleLogin = async () => {
    devLogAction('auth:login');
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      if (!e.response) {
        setError(`Cannot reach the API at ${getApiUrl()}. Check your internet connection and try again.`);
      } else {
        setError(e.response?.data?.message || 'Login failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {OnboardingIllustration ? (
            <View style={styles.illustrationWrap}>
              <OnboardingIllustration width={200} height={160} />
            </View>
          ) : null}
          <Text style={styles.brandTitle}>InvoiceFlow</Text>
          <Text style={styles.brandSubtitle}>Quiet invoicing for work that lasts</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text variant="caption" style={{ color: colors.danger, flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <Text variant="label" style={{ marginBottom: spacing.xs, marginTop: spacing.sm }}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@business.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text variant="label" style={{ marginBottom: spacing.xs, marginTop: spacing.md }}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />

          <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth icon="log-in-outline" style={{ marginTop: spacing.lg }} />
          <Button label="Create free account" onPress={() => router.push('/(auth)/register')} variant="ghost" fullWidth style={{ marginTop: spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
    hero: {
      alignItems: 'center',
      paddingTop: 72,
      paddingBottom: spacing.xl,
      paddingHorizontal: layout.screenPadding,
    },
    illustrationWrap: {
      marginBottom: spacing.lg,
    },
    brandTitle: {
      fontSize: 32,
      fontFamily: fonts.display,
      color: colors.text,
      letterSpacing: -0.5,
    },
    brandSubtitle: {
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    form: {
      marginHorizontal: layout.screenPadding,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
    },
    input: {
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fonts.regular,
      borderWidth: StyleSheet.hairlineWidth,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
    },
  });
}
