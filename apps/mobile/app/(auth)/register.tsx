import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { colors, radius, spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start invoicing free — no credit card required</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {[
          { label: 'Your Name', value: name, set: setName, placeholder: 'John Smith' },
          { label: 'Business Name', value: businessName, set: setBusinessName, placeholder: 'Acme Services LLC' },
          { label: 'Email', value: email, set: setEmail, placeholder: 'you@business.com', keyboard: 'email-address' as const },
          { label: 'Password', value: password, set: setPassword, placeholder: 'Min 6 characters', secure: true },
        ].map((field) => (
          <View key={field.label}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
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

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Free Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkBtn: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: 15 },
  linkBold: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
