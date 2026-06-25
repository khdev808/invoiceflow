import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { getApiUrl } from '@/lib/config';
import { devLogAction } from '@/lib/devLog';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@invoiceflow.app');
  const [password, setPassword] = useState('demo1234');
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
        <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.logo}>
            <Ionicons name="receipt" size={34} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>InvoiceFlow</Text>
          <Text style={styles.brandSubtitle}>Professional invoicing in under 30 seconds</Text>
        </LinearGradient>

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

        <View style={styles.features}>
          {[
            { icon: 'flash', text: 'Create invoices in 30s' },
            { icon: 'eye', text: 'Real-time open tracking' },
            { icon: 'card', text: 'Stripe & PayPal payments' },
            { icon: 'cloud-offline', text: 'Works offline' },
          ].map((f) => (
            <View key={f.text} style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name={f.icon as any} size={16} color={colors.primary} />
              </View>
              <Text variant="caption" color="secondary">{f.text}</Text>
            </View>
          ))}
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
      paddingTop: 80,
      paddingBottom: 48,
      paddingHorizontal: layout.screenPadding,
      borderBottomLeftRadius: radius.xxl,
      borderBottomRightRadius: radius.xxl,
      overflow: 'hidden',
    },
    heroGlow: {
      position: 'absolute',
      top: -60,
      left: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    brandTitle: { fontSize: 34, fontFamily: fonts.extraBold, color: '#fff', letterSpacing: -0.8 },
    brandSubtitle: { fontSize: 16, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.88)', marginTop: spacing.xs, textAlign: 'center' },
    form: {
      marginHorizontal: layout.screenPadding,
      marginTop: -28,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      ...shadows.md,
    },
    input: {
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fonts.regular,
      borderWidth: 1,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
    },
    features: {
      marginTop: spacing.xl,
      paddingHorizontal: layout.screenPadding,
      gap: spacing.sm,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    featureIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
