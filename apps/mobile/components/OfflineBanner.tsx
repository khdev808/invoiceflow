import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { checkOnline, getPendingCount } from '@/lib/offline';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/contexts/ThemeContext';
import { getIllustration } from '@/lib/illustrations';
import { radius, spacing } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

const OfflineIllustration = getIllustration('offline.svg');

export function OfflineBanner() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const poll = async () => {
      const online = await checkOnline();
      setOffline(!online);
      setPending(await getPendingCount());
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);

  if (!offline && pending === 0) return null;

  const syncOnly = !offline && pending > 0;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: syncOnly ? colors.primarySoft : colors.surfaceAlt,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {OfflineIllustration ? (
        <View style={styles.illustrationWrap}>
          <OfflineIllustration width={36} height={28} />
        </View>
      ) : null}
      <View style={styles.textWrap}>
        <Text variant="caption" style={{ color: syncOnly ? colors.primaryDark : colors.text, fontFamily: undefined }}>
          {offline ? t('viewingCachedData') : t('syncPending')}
          {pending > 0 ? ` (${pending})` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  illustrationWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
});
