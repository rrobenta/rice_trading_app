import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { Listing, RiceVariety, PaginatedResponse } from '../../src/types';

export default function ListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 15;

  useEffect(() => {
    api.get('/market/varieties').then(r => setVarieties(r.data));
  }, []);

  const load = useCallback(async (pageNum = 1, reset = false) => {
    const params = new URLSearchParams({ page: String(pageNum), limit: String(LIMIT) });
    if (search) params.set('search', search);
    if (selectedVariety) params.set('varietyId', selectedVariety);
    const r = await api.get<PaginatedResponse<Listing>>(`/listings?${params}`);
    if (reset || pageNum === 1) {
      setListings(r.data.data);
    } else {
      setListings(prev => [...prev, ...r.data.data]);
    }
    setTotal(r.data.total);
    setPage(pageNum);
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, [search, selectedVariety]);

  useEffect(() => {
    setLoading(true);
    load(1, true);
  }, [search, selectedVariety]);

  const onRefresh = () => { setRefreshing(true); load(1, true); };

  const loadMore = () => {
    if (loadingMore || listings.length >= total) return;
    setLoadingMore(true);
    load(page + 1);
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity onPress={() => router.push(`/listing/${item.id}`)} activeOpacity={0.8}>
      <Card style={styles.listingCard}>
        <View style={styles.cardTop}>
          <Badge label={item.variety.name} variant="green" />
          {item.grade && <Text style={styles.grade}>{item.grade}</Text>}
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${parseFloat(item.pricePerKg).toFixed(3)}</Text>
          <Text style={styles.priceUnit}>/kg</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.meta}>{parseFloat(item.quantityKg).toLocaleString()} kg</Text>
          </View>
          {item.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.meta} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
        </View>
        <Text style={styles.seller}>{item.seller.company ?? item.seller.name}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings…"
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Variety filter chips */}
      <FlatList
        data={[{ id: '', name: 'All' }, ...varieties]}
        keyExtractor={v => v.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedVariety === item.id && styles.chipActive]}
            onPress={() => setSelectedVariety(item.id)}
          >
            <Text style={[styles.chipText, selectedVariety === item.id && styles.chipTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* New listing FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/listing/new')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No listings found</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} /> : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },

  filterRow: { maxHeight: 44, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  chipTextActive: { color: '#fff' },

  list: { padding: Spacing.md, paddingTop: 4, paddingBottom: 80 },

  listingCard: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  grade: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  priceUnit: { fontSize: FontSize.sm, color: Colors.textMuted, marginLeft: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  seller: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
