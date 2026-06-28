import { View, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getIllustration } from '@/lib/illustrations';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { completeOnboarding } from '@/lib/onboarding';
import { fonts, layout, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    illustration: 'onboarding-1.svg',
    title: 'Records that endure',
    body: 'Every invoice becomes part of a clear, permanent ledger for your business — organized and easy to find years from now.',
  },
  {
    illustration: 'onboarding-2.svg',
    title: 'Trusted by your clients',
    body: 'Send polished documents with your branding. Clients pay through a secure portal — no chasing, no confusion.',
  },
  {
    illustration: 'onboarding-3.svg',
    title: 'Gentle reminders',
    body: 'Automated follow-ups and late-fee options keep cash flow steady without awkward conversations.',
  },
  {
    illustration: 'onboarding-4.svg',
    title: 'Your business, anywhere',
    body: 'Works offline when you need it. Time, expenses, and mileage — all in one calm, reliable place.',
  },
] as const;

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
      <View style={styles.header}>
        <Text style={[styles.brand, { color: colors.text }]}>InvoiceFlow</Text>
        <Text style={[styles.brandSub, { color: colors.textSecondary }]}>
          Quiet Ledger for freelancers & trades
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => {
          const Illustration = getIllustration(item.illustration);
          return (
            <View style={[styles.slide, { width }]}>
              {Illustration ? (
                <View style={styles.illustrationWrap}>
                  <Illustration width={220} height={176} />
                </View>
              ) : null}
              <Text variant="title" style={styles.slideTitle}>{item.title}</Text>
              <Text variant="body" color="secondary" style={styles.slideBody}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.primary : colors.border,
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
          <Button label="Get Started" onPress={finish} icon="checkmark-outline" fullWidth size="lg" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 64,
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  brand: { fontSize: 28, fontFamily: fonts.display, letterSpacing: -0.5 },
  brandSub: { fontSize: 15, fontFamily: fonts.regular, marginTop: 4 },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  illustrationWrap: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: { textAlign: 'center', marginBottom: spacing.md },
  slideBody: { textAlign: 'center', lineHeight: 26, maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: layout.screenPadding, paddingBottom: spacing.xxl },
});
