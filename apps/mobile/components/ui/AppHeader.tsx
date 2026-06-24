import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { layout, spacing } from '@/constants/theme';
import { devLogAction } from '@/lib/devLog';
import { hapticLight } from '@/lib/haptics';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  style?: ViewStyle;
  isTabScreen?: boolean;
}

export function AppHeader({ title, subtitle, right, onBack, style, isTabScreen }: Props) {
  const { colors } = useTheme();
  const headerTopGap = isTabScreen ? getTabHeaderTopSpacing() : spacing.sm;

  return (
    <View style={[styles.row, { paddingTop: headerTopGap }, style]}>
      {onBack ? (
        <TouchableOpacity
          onPress={() => {
            devLogAction('header:back');
            hapticLight();
            onBack();
          }}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.textWrap}>
        <Text variant="title" style={{ fontSize: 30 }}>{title}</Text>
        {subtitle ? <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textWrap: { flex: 1 },
  right: { marginLeft: spacing.sm },
});
