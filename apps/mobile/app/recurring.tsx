import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useCallback, useState } from 'react';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recurringApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { radius, spacing } from '@/constants/theme';

export default function RecurringScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await recurringApi.list();
      setSchedules(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  const toggle = async (id: string, active: boolean) => {
    await recurringApi.toggle(id, active);
    load();
  };

  const remove = (id: string) => {
    Alert.alert('Delete Schedule', 'Stop this recurring invoice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await recurringApi.delete(id);
          load();
        },
      },
    ]);
  };

  const styles = makeStyles(colors);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <>
      <Stack.Screen options={{ title: t('recurring') }} />
      <FlatList
        style={styles.container}
        data={schedules}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No recurring schedules yet. Create an invoice with a recurring rule.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rule}>{item.rule}</Text>
              <Text style={styles.meta}>Next: {new Date(item.nextRunAt).toLocaleDateString()}</Text>
            </View>
            <Switch value={item.active} onValueChange={(v) => toggle(item.id, v)} />
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, padding: spacing.lg },
    card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, marginHorizontal: spacing.md, marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md },
    rule: { fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
    meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    deleteBtn: { padding: spacing.sm },
  });
}
