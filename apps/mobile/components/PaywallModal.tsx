import { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { planApi } from '@/lib/api';
import { isNativeIapConfigured, purchasePlan } from '@/lib/iap';
import { getIllustration } from '@/lib/illustrations';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fonts, radius, spacing } from '@/constants/theme';

const PaywallIllustration = getIllustration('paywall.svg');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  reason?: 'limit' | 'ocr' | 'general';
  onUpgraded?: () => void;
}

export function PaywallModal({ visible, onClose, reason = 'general', onUpgraded }: PaywallModalProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const message = reason === 'limit'
    ? t('monthlyLimitReached')
    : reason === 'ocr'
      ? t('ocrProOnly')
      : t('upgradeToPro');

  const upgrade = async (plan: 'pro' | 'business') => {
    setLoading(true);
    try {
      if (isNativeIapConfigured()) {
        const iap = await purchasePlan(plan);
        if (iap.ok) {
          Alert.alert(t('success'), t('planUpgraded'));
          onUpgraded?.();
          onClose();
          return;
        }
      }
      const { data } = await planApi.upgrade(plan);
      if (data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
        onClose();
        return;
      }
      if (data.message || data.plan) {
        Alert.alert(t('success'), data.message || t('planUpgraded'));
        onUpgraded?.();
        onClose();
        return;
      }
      Alert.alert(t('error'), t('upgradeFailed'));
    } catch {
      Alert.alert(t('error'), t('upgradeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {PaywallIllustration ? (
            <View style={styles.illustrationWrap}>
              <PaywallIllustration width={160} height={128} />
            </View>
          ) : null}

          <Text variant="heading" style={styles.title}>{t('choosePlan')}</Text>
          <Text variant="body" color="secondary" style={styles.message}>{message}</Text>

          <View style={[styles.planCard, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.planName, { color: colors.primaryDark }]}>{t('proPlan')} — $9.99{t('perMonth')}</Text>
            <Text variant="caption" color="secondary" style={styles.planDesc}>{t('proTierDesc')}</Text>
            <Button label={t('upgradeNow')} onPress={() => upgrade('pro')} loading={loading} fullWidth variant="primary" />
          </View>

          <View style={[styles.planCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.planName, { color: colors.text }]}>{t('businessPlan')} — $19.99{t('perMonth')}</Text>
            <Text variant="caption" color="secondary" style={styles.planDesc}>{t('businessTierDesc')}</Text>
            <Button label={t('upgradeNow')} onPress={() => upgrade('business')} loading={loading} fullWidth variant="secondary" />
          </View>

          <TouchableOpacity onPress={onClose} style={{ marginTop: spacing.sm }}>
            <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  close: { alignSelf: 'flex-end' },
  illustrationWrap: { alignItems: 'center', marginBottom: spacing.md },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  message: { textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  planCard: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  planName: { fontSize: 17, fontFamily: fonts.bold, marginBottom: 4 },
  planDesc: { marginBottom: spacing.md },
});
