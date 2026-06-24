import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { layout, radius, spacing } from '@/constants/theme';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, backgroundColor: colors.surfaceAlt, opacity },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={{ padding: layout.screenPadding, gap: spacing.md, backgroundColor: colors.background, flex: 1 }}>
      <Skeleton height={28} width="55%" borderRadius={radius.md} />
      <Skeleton height={14} width="40%" />
      <Skeleton height={108} borderRadius={radius.xl} style={{ marginTop: spacing.sm }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Skeleton height={96} width="48%" borderRadius={radius.lg} />
        <Skeleton height={96} width="48%" borderRadius={radius.lg} />
        <Skeleton height={96} width="48%" borderRadius={radius.lg} />
        <Skeleton height={96} width="48%" borderRadius={radius.lg} />
      </View>
      <Skeleton height={72} borderRadius={radius.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
