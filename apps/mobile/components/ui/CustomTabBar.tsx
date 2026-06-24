import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';
import { getBottomInset } from '@/lib/safeArea';
import { hapticLight } from '@/lib/haptics';
import { Text } from './Text';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  invoices: 'document-text',
  clients: 'people',
  more: 'grid',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = getBottomInset(insets);

  return (
    <View style={[styles.outer, { paddingBottom: bottomInset + layout.tabBarBottomGap }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.tabBar,
            borderColor: colors.tabBarBorder,
          },
          shadows.lg,
          isDark && styles.barDark,
        ]}
      >
        {state.routes.map((route: { key: string; name: string }, index: number) => {
          if (route.name === 'two') return null;

          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const iconName = ICONS[route.name] ?? 'ellipse';
          const outlineIcon = `${iconName}-outline` as keyof typeof Ionicons.glyphMap;

          const onPress = () => {
            hapticLight(`tab:${route.name}`);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <View
                style={[
                  styles.iconPill,
                  isFocused && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name={isFocused ? iconName : outlineIcon}
                  size={22}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
              </View>
              <Text
                variant="micro"
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.primary : colors.textMuted,
                    fontFamily: isFocused ? fonts.semiBold : fonts.medium,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.tabBarHorizontalInset,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: layout.tabBarHeight,
    borderRadius: radius.xxl,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  barDark: {
    ...Platform.select({
      ios: { backgroundColor: 'rgba(20, 27, 40, 0.92)' },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  iconPill: {
    width: 44,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textTransform: 'none',
    letterSpacing: 0,
  },
});

export function getTabBarScrollPadding(insets: { bottom: number; top?: number; left?: number; right?: number }) {
  const bottomInset = getBottomInset(insets as Parameters<typeof getBottomInset>[0]);
  return bottomInset + layout.tabBarHeight + layout.tabBarBottomGap + spacing.lg;
}
