import { View, Text, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { completeOnboarding } from '@/lib/onboarding';
import { radius, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'flash' as const,
    title: 'Invoice in 30 seconds',
    body: 'Create professional invoices, estimates, and credit notes faster than any competitor.',
  },
  {
    icon: 'card' as const,
    title: 'Get paid your way',
    body: 'Stripe, PayPal, QR codes, and client portal payments — with deposit support built in.',
  },
  {
    icon: 'notifications' as const,
    title: 'Never chase payments',
    body: 'Automated reminders, late fees, open tracking, and push alerts when clients pay.',
  },
  {
    icon: 'globe' as const,
    title: 'Run your business anywhere',
    body: 'Offline mode, 5 languages, mileage, time tracking, and expense OCR in one app.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.topBar} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={item.icon} size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.border }]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {index < SLIDES.length - 1 ? (
          <>
            <Button label="Skip" onPress={finish} variant="ghost" style={{ flex: 1 }} />
            <Button
              label="Next"
              onPress={() => listRef.current?.scrollToIndex({ index: index + 1, animated: true })}
              style={{ flex: 1 }}
            />
          </>
        ) : (
          <Button label="Get Started" onPress={finish} icon="rocket-outline" fullWidth />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { height: 6, width: '100%' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingTop: 40 },
  iconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: spacing.md },
  body: { fontSize: 17, textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.xxl },
});
