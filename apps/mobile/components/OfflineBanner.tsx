import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { checkOnline, getPendingCount } from '@/lib/offline';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/theme';

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

  return (
    <View style={[styles.bar, { backgroundColor: offline ? colors.warning : colors.primary }]}>
      <Ionicons name={offline ? 'cloud-offline' : 'cloud-upload'} size={16} color="#fff" />
      <Text style={styles.text}>
        {offline
          ? t('viewingCachedData')
          : t('syncPending')}
        {pending > 0 ? ` (${pending})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
});
