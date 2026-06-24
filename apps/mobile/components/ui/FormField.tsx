import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { radius, spacing } from '@/constants/theme';

interface Props extends TextInputProps {
  label: string;
}

export function FormField({ label, style, ...props }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  input: { borderRadius: radius.md, padding: spacing.md, fontSize: 16, borderWidth: 1 },
});
