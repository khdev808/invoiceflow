import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsApi } from '@/lib/api';
import { colors, radius, spacing, shadows } from '@/constants/theme';

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await productsApi.list(search || undefined);
      setProducts(data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products & Services</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/product/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <TextInput style={styles.search} placeholder="Search catalog..." value={search} onChangeText={setSearch} onSubmitEditing={load} placeholderTextColor={colors.textMuted} />
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          ListEmptyComponent={<Text style={styles.empty}>Add items to speed up invoicing</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description && <Text style={styles.desc}>{item.description}</Text>}
                {item.sku && <Text style={styles.sku}>SKU: {item.sku}</Text>}
              </View>
              <Text style={styles.price}>${item.unitPrice.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, color: colors.text },
  card: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { fontSize: 13, color: colors.textSecondary },
  sku: { fontSize: 12, color: colors.textMuted },
  price: { fontSize: 18, fontWeight: '800', color: colors.primary },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
