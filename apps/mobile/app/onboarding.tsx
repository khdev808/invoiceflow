import { View, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { completeOnboarding } from '@/lib/onboarding';
import { fonts, layout, radius, shadows, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'flash' as const,
    title: 'Invoice in 30 seconds',
    body: 'Create professional invoices, estimates, and credit notes faster than any competitor.',
    tint: '#4F46E5',
  },
  {
    icon: 'card' as const,
    title: 'Get paid your way',
    body: 'Stripe, PayPal, QR codes, and client portal payments — with deposit support built in.',
    tint: '#059669',
  },
  {
    icon: 'notifications' as const,
    title: 'Never chase payments',
    body: 'Automated reminders, late fees, open tracking, and push alerts when clients pay.',
    tint: '#D97706',
  },
  {
    icon: 'globe' as const,
    title: 'Run your business anywhere',
    body: 'Offline mode, 5 languages, mileage, time tracking, and expense OCR in one app.',
    tint: '#7C3AED',
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

  const slide = SLIDES[index];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.brand}>InvoiceFlow</Text>
        <Text style={styles.brandSub}>Built for freelancers & trades</Text>
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.tint + '14' }, shadows.md]}>
              <LinearGradient
                colors={[item.tint, item.tint + 'CC']}
                style={styles.iconGradient}
              >
                <Ionicons name={item.icon} size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text variant="title" style={styles.slideTitle}>{item.title}</Text>
            <Text variant="body" color="secondary" style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? slide.tint : colors.border,
                width: i === index ? 24 : 8,
              },
            ]}
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
              icon="arrow-forward"
            />
          </>
        ) : (
          <Button label="Get Started" onPress={finish} icon="rocket-outline" fullWidth size="lg" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 64,
    paddingBottom: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  brand: { color: '#fff', fontSize: 28, fontFamily: fonts.extraBold, letterSpacing: -0.5 },
  brandSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontFamily: fonts.medium, marginTop: 4 },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: { textAlign: 'center', marginBottom: spacing.md },
  slideBody: { textAlign: 'center', lineHeight: 26, maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: layout.screenPadding, paddingBottom: spacing.xxl },
});
