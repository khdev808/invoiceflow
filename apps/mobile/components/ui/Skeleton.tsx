import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { radius } from '@/constants/theme';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
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
    <View style={{ padding: 20, gap: 16, backgroundColor: colors.background, flex: 1 }}>
      <Skeleton height={32} width="60%" />
      <Skeleton height={100} borderRadius={radius.xl} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Skeleton height={90} width="48%" borderRadius={radius.lg} />
        <Skeleton height={90} width="48%" borderRadius={radius.lg} />
        <Skeleton height={90} width="48%" borderRadius={radius.lg} />
        <Skeleton height={90} width="48%" borderRadius={radius.lg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
