import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/theme';
import { devLogAction } from '@/lib/devLog';
import { hapticLight } from '@/lib/haptics';
import { getTabHeaderTopSpacing } from '@/lib/safeArea';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  style?: ViewStyle;
  /** Apply extra top spacing on Android tab screens. */
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
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  backBtn: { marginRight: spacing.sm, marginLeft: -4 },
  textWrap: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 2 },
  right: { marginLeft: spacing.sm },
});
