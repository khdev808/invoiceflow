import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { fonts, radius, spacing } from '@/constants/theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label: string;
}

export function FormField({ label, style, ...props }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text variant="label" style={{ marginBottom: spacing.xs }}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: fonts.regular,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
});
