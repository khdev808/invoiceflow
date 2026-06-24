import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';

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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start invoicing free — no credit card required</Text>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          {fields.map((field) => (
            <View key={field.label}>
              <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
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

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: 56 },
    back: { marginBottom: spacing.md, alignSelf: 'flex-start' },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3 },
    subtitle: { fontSize: 15, marginBottom: spacing.lg, marginTop: 4 },
    form: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
    input: { borderRadius: radius.md, padding: spacing.md, fontSize: 16, borderWidth: 1 },
    error: { marginBottom: spacing.sm },
  });
}
