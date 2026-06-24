import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { planApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/constants/theme';

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
      await planApi.upgrade(plan);
      Alert.alert(t('success'), t('planUpgraded'));
      onUpgraded?.();
      onClose();
    } catch {
      Alert.alert(t('error'), t('upgradeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="diamond" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('choosePlan')}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={[styles.planCard, { borderColor: colors.primary, backgroundColor: colors.primary + '08' }]}>
            <Text style={[styles.planName, { color: colors.primary }]}>{t('proPlan')} — $9.99{t('perMonth')}</Text>
            <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{t('proTierDesc')}</Text>
            <Button label={t('upgradeNow')} onPress={() => upgrade('pro')} loading={loading} fullWidth variant="primary" />
          </View>

          <View style={[styles.planCard, { borderColor: colors.border }]}>
            <Text style={[styles.planName, { color: colors.text }]}>{t('businessPlan')} — $19.99{t('perMonth')}</Text>
            <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{t('businessTierDesc')}</Text>
            <Button label={t('upgradeNow')} onPress={() => upgrade('business')} loading={loading} fullWidth variant="secondary" />
          </View>

          <TouchableOpacity onPress={onClose} style={{ marginTop: spacing.sm }}>
            <Text style={{ textAlign: 'center', color: colors.textMuted }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: spacing.xxl },
  close: { alignSelf: 'flex-end' },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  message: { textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  planCard: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  planName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  planDesc: { fontSize: 13, marginBottom: spacing.md },
});
