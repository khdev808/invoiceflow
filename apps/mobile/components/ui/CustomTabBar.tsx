import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { fonts, layout, radius, spacing } from '@/constants/theme';
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
  const { colors } = useTheme();
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
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <View
                style={[
                  styles.iconPill,
                  isFocused && { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons
                  name={isFocused ? iconName : outlineIcon}
                  size={20}
                  color={isFocused ? colors.navy : colors.textMuted}
                />
              </View>
              <Text
                variant="micro"
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.navy : colors.textMuted,
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
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
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
