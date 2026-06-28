import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getIllustration } from '@/lib/illustrations';
import { Button } from './Button';
import { radius, spacing } from '@/constants/theme';
import { Text } from './Text';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  illustration?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'document-text-outline', illustration, title, message, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  const Illustration = illustration ? getIllustration(illustration) : undefined;

  return (
    <View style={styles.wrap}>
      {Illustration ? (
        <View style={styles.illustrationWrap}>
          <Illustration width={160} height={128} />
        </View>
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={icon} size={36} color={colors.primary} />
        </View>
      )}
      <Text variant="heading" style={styles.title}>{title}</Text>
      {message ? <Text variant="body" color="secondary" style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg, minWidth: 220 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: spacing.xl },
  illustrationWrap: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
});
