import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@invoiceflow.app');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const { colors } = useTheme();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="receipt" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>InvoiceFlow</Text>
          <Text style={styles.subtitle}>Professional invoicing in under 30 seconds</Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + '12' }]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@business.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
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
            <View key={f.text} style={styles.featureRow}>
              <Ionicons name={f.icon as any} size={16} color={colors.primary} />
              <Text style={[styles.feature, { color: colors.textSecondary }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1 },
    hero: { alignItems: 'center', paddingTop: 72, paddingBottom: 40, paddingHorizontal: spacing.lg, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
    logo: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, textAlign: 'center' },
    form: { marginHorizontal: spacing.lg, marginTop: -24, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
    input: { borderRadius: radius.md, padding: spacing.md, fontSize: 16, borderWidth: 1 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
    error: { flex: 1, fontSize: 14 },
    features: { marginTop: spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xxl },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
    feature: { fontSize: 14 },
  });
}
