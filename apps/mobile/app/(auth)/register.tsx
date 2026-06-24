import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { devLogAction } from '@/lib/devLog';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const { colors } = useTheme();

  const handleRegister = async () => {
    devLogAction('auth:register');
    if (!name || !email || password.length < 6) {
      setError('Please fill all fields. Password must be 6+ characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ name, email: email.trim(), password, businessName: businessName || undefined });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);
  const fields = [
    { label: 'Your Name', value: name, set: setName, placeholder: 'John Smith' },
    { label: 'Business Name', value: businessName, set: setBusinessName, placeholder: 'Acme Services LLC' },
    { label: 'Email', value: email, set: setEmail, placeholder: 'you@business.com', keyboard: 'email-address' as const },
    { label: 'Password', value: password, set: setPassword, placeholder: 'Min 6 characters', secure: true },
  ];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text variant="title">Create Account</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 6, marginBottom: spacing.lg }}>
          Start invoicing free — no credit card required
        </Text>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerSoft }]}>
              <Text variant="caption" style={{ color: colors.danger }}>{error}</Text>
            </View>
          ) : null}

          {fields.map((field) => (
            <View key={field.label}>
              <Text variant="label" style={{ marginBottom: spacing.xs, marginTop: spacing.sm }}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                keyboardType={field.keyboard}
                secureTextEntry={field.secure}
              />
            </View>
          ))}

          <Button label="Create Free Account" onPress={handleRegister} loading={loading} fullWidth icon="rocket-outline" style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, padding: layout.screenPadding, paddingTop: 56, paddingBottom: spacing.xxl },
    back: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    form: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, ...shadows.md },
    input: {
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fonts.regular,
      borderWidth: 1,
    },
    errorBox: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  });
}
