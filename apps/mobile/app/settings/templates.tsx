import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { templates } from '@/constants/theme';
import { usersApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/theme';
import { hapticLight, hapticSuccess } from '@/lib/haptics';

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState('modern');

  const handleSelect = async (id: string) => {
    hapticLight();
    setSelected(id);
    try {
      await usersApi.updateSettings({ templateId: id, primaryColor: templates.find((t) => t.id === id)?.color });
      hapticSuccess();
      Alert.alert('Saved', 'Template updated for PDFs and client portal');
    } catch {
      Alert.alert('Error', 'Failed to save template');
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View style={{ padding: spacing.lg }}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose a professional look for invoices, PDFs, and your client portal.</Text>
        {templates.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: selected === t.id ? colors.primary : colors.border }]}
            onPress={() => handleSelect(t.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.preview, { backgroundColor: t.color }]}>
              <Text style={styles.previewText}>INVOICE</Text>
              <View style={styles.previewLine} />
              <View style={[styles.previewLine, { width: '60%' }]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colors.text }]}>{t.name}</Text>
              {selected === t.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  card: { borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', borderWidth: 2 },
  preview: { height: 100, padding: spacing.md, justifyContent: 'flex-end' },
  previewText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  previewLine: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 4, width: '80%' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  cardName: { fontSize: 16, fontWeight: '700' },
});
