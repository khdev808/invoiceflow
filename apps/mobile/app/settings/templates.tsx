import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { templates } from '@/constants/theme';
import { usersApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TemplatesScreen() {
  const [selected, setSelected] = useState('modern');

  const handleSelect = async (id: string) => {
    setSelected(id);
    try {
      await usersApi.updateSettings({ templateId: id, primaryColor: templates.find((t) => t.id === id)?.color });
      Alert.alert('Saved', 'Template updated');
    } catch {
      Alert.alert('Error', 'Failed to save template');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Choose a professional template for your invoices</Text>
      {templates.map((t) => (
        <TouchableOpacity key={t.id} style={[styles.card, selected === t.id && styles.cardActive]} onPress={() => handleSelect(t.id)}>
          <View style={[styles.preview, { backgroundColor: t.color }]}>
            <Text style={styles.previewText}>INVOICE</Text>
            <View style={styles.previewLine} />
            <View style={[styles.previewLine, { width: '60%' }]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{t.name}</Text>
            {selected === t.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', ...shadows.sm },
  cardActive: { borderColor: colors.primary },
  preview: { height: 100, padding: spacing.md, justifyContent: 'flex-end' },
  previewText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  previewLine: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 4, width: '80%' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.text },
});
