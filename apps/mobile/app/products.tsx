import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { productsApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { radius, spacing } from '@/constants/theme';

export default function ProductsScreen() {
  const { colors } = useTheme();
  const currency = useUserCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (q?: string) => {
    try {
      const { data } = await productsApi.list(q || undefined);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(search); }, []));

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <Screen edges={[]}>
      <AppHeader title="Products & Services" subtitle={`${products.length} items`} right={<IconButton action="product:create" onPress={() => router.push('/product/create')} />} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search catalog..." onClear={() => setSearch('')} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(search); }}
          ListEmptyComponent={
            <EmptyState icon="pricetag-outline" title="Empty catalog" message="Save products and services to add them to invoices in one tap." actionLabel="Add Product" onAction={() => router.push('/product/create')} />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                {item.description ? <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text> : null}
                {item.sku ? <Text style={[styles.sku, { color: colors.textMuted }]}>SKU: {item.sku}</Text> : null}
              </View>
              <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.unitPrice, currency)}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2 },
  sku: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 18, fontWeight: '800' },
});
