import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { Order, PaginatedResponse } from '../../src/types';

type Tab = 'orders' | 'trades';

function orderStatusVariant(s: string): 'green' | 'yellow' | 'gray' | 'red' {
  switch (s) {
    case 'OPEN': return 'green';
    case 'PARTIALLY_FILLED': return 'yellow';
    case 'FILLED': return 'gray';
    default: return 'red';
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams({ limit: '30' });
    if (typeFilter) params.set('type', typeFilter);
    const r = await api.get<PaginatedResponse<Order>>(`/orders?${params}`);
    setOrders(r.data.data);
  }, [typeFilter]);

  const loadTrades = useCallback(async () => {
    const r = await api.get('/trades?limit=30');
    setTrades(r.data.data);
  }, []);

  const load = useCallback(async () => {
    try {
      await Promise.all([loadOrders(), loadTrades()]);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [loadOrders, loadTrades]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const cancelOrder = (id: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/orders/${id}/cancel`);
            loadOrders();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error ?? 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const fillPct = (o: Order) => {
    const qty = parseFloat(o.quantityKg);
    if (qty === 0) return 0;
    return parseFloat(o.filledKg) / qty;
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemTop}>
        <Badge label={item.type} variant={item.type === 'BUY' ? 'green' : 'red'} />
        <Badge label={item.status.replace('_', ' ')} variant={orderStatusVariant(item.status)} />
      </View>
      <Text style={styles.itemVariety}>{item.variety.name}</Text>
      <View style={styles.itemMeta}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Price/kg</Text>
          <Text style={styles.metaValue}>${parseFloat(item.pricePerKg).toFixed(4)}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Quantity</Text>
          <Text style={styles.metaValue}>{parseFloat(item.quantityKg).toLocaleString()} kg</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Filled</Text>
          <Text style={styles.metaValue}>{Math.round(fillPct(item) * 100)}%</Text>
        </View>
      </View>
      {/* Fill progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${fillPct(item) * 100}%` }]} />
      </View>
      <View style={styles.itemBottom}>
        <Text style={styles.metaLabel}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        {(item.status === 'OPEN' || item.status === 'PARTIALLY_FILLED') && (
          <TouchableOpacity onPress={() => cancelOrder(item.id)} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const renderTrade = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/trade/${item.id}`)} activeOpacity={0.8}>
      <Card style={styles.itemCard}>
        <View style={styles.itemTop}>
          <Badge label={item.buyOrder?.variety?.name ?? '—'} variant="green" />
          <Badge
            label={item.status}
            variant={item.status === 'COMPLETED' ? 'green' : item.status === 'DISPUTED' ? 'red' : 'yellow'}
          />
        </View>
        <View style={styles.itemMeta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Qty</Text>
            <Text style={styles.metaValue}>{parseFloat(item.quantityKg).toLocaleString()} kg</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Price/kg</Text>
            <Text style={styles.metaValue}>${parseFloat(item.pricePerKg).toFixed(4)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={[styles.metaValue, { color: Colors.primary }]}>
              ${parseFloat(item.totalAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={styles.itemBottom}>
          <Text style={styles.metaLabel}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Segment control */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'orders' && styles.segmentActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.segmentText, activeTab === 'orders' && styles.segmentTextActive]}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'trades' && styles.segmentActive]}
          onPress={() => setActiveTab('trades')}
        >
          <Text style={[styles.segmentText, activeTab === 'trades' && styles.segmentTextActive]}>Trade History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'orders' && (
        <View style={styles.filterRow}>
          {['', 'BUY', 'SELL'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, typeFilter === t && styles.chipActive]}
              onPress={() => setTypeFilter(t)}
            >
              <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>
                {t === '' ? 'All' : t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : activeTab === 'orders' ? (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No orders yet</Text></View>}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={trades}
          keyExtractor={t => t.id}
          renderItem={renderTrade}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No trades yet</Text></View>}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB for placing new order */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/order/new')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  segmentRow: { flexDirection: 'row', margin: Spacing.md, marginBottom: 8, backgroundColor: Colors.surface, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: Colors.border },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: Colors.primaryDark },
  segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  segmentTextActive: { color: '#fff' },

  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  chipTextActive: { color: '#fff' },

  list: { padding: Spacing.md, paddingTop: 4, paddingBottom: 80 },

  itemCard: { marginBottom: 12 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemVariety: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  itemMeta: { flexDirection: 'row', marginBottom: 10 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  metaValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },

  progressBar: { height: 5, backgroundColor: Colors.bg, borderRadius: 99, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },

  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.danger },
  cancelText: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
