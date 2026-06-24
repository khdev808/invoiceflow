import { View, StyleSheet, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { getBottomInset, getTopInset } from '@/lib/safeArea';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  scroll = false,
  padded = false,
  refreshing,
  onRefresh,
  style,
  edges = ['top'],
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const safeStyle = {
    paddingTop: edges.includes('top') ? getTopInset(insets) : 0,
    paddingBottom: edges.includes('bottom') ? getBottomInset(insets) : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const content = scroll ? (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }, style]}
      contentContainerStyle={padded ? styles.padded : undefined}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, { backgroundColor: colors.background }, padded && styles.padded, style]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }, safeStyle]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
