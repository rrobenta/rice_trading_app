import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { MarketSummaryItem, Order, Trade } from '../../src/types';

function orderStatusVariant(s: string): 'green' | 'yellow' | 'gray' | 'red' {
  switch (s) {
    case 'OPEN': return 'green';
    case 'PARTIALLY_FILLED': return 'yellow';
    case 'FILLED': return 'gray';
    default: return 'red';
  }
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, o, t] = await Promise.all([
        api.get('/market/summary'),
        api.get('/orders?limit=4'),
        api.get('/trades?limit=3'),
      ]);
      setSummary(s.data);
      setRecentOrders(o.data.data);
      setRecentTrades(t.data.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetingName}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.greetingRole}>{user?.company ?? user?.role}</Text>
        </View>
        <TouchableOpacity style={styles.newOrderBtn} onPress={() => router.push('/order/new')}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newOrderText}>Order</Text>
        </TouchableOpacity>
      </View>

      {/* Market Snapshot */}
      <Text style={styles.sectionTitle}>Market Snapshot</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketRow}>
        {summary.filter(s => s.currentPrice).map((item, i) => {
          const change = parseFloat(item.changePct ?? '0');
          const isUp = change >= 0;
          return (
            <Card key={item.variety.id} style={styles.marketCard}>
              <Text style={styles.marketVariety}>{item.variety.name}</Text>
              <Text style={styles.marketPrice}>
                ${parseFloat(item.currentPrice!).toFixed(3)}
                <Text style={styles.marketUnit}>/kg</Text>
              </Text>
              <View style={[styles.changeChip, { backgroundColor: isUp ? '#d8f3dc' : '#ffe0e0' }]}>
                <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={11} color={isUp ? Colors.buyGreen : Colors.sellRed} />
                <Text style={[styles.changeText, { color: isUp ? Colors.buyGreen : Colors.sellRed }]}>
                  {Math.abs(change).toFixed(2)}%
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/listing/new')}>
          <Ionicons name="add-circle-outline" size={26} color={Colors.primary} />
          <Text style={styles.actionLabel}>New Listing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/order/new')}>
          <Ionicons name="swap-horizontal-outline" size={26} color={Colors.primary} />
          <Text style={styles.actionLabel}>Place Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/market')}>
          <Ionicons name="trending-up-outline" size={26} color={Colors.primary} />
          <Text style={styles.actionLabel}>Market</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/listings')}>
          <Ionicons name="search-outline" size={26} color={Colors.primary} />
          <Text style={styles.actionLabel}>Browse</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <Card style={styles.listCard}>
        {recentOrders.length === 0 ? (
          <Text style={styles.empty}>No orders yet</Text>
        ) : (
          recentOrders.map((o, idx) => (
            <View key={o.id} style={[styles.listRow, idx < recentOrders.length - 1 && styles.listRowBorder]}>
              <View style={styles.listLeft}>
                <Badge label={o.type} variant={o.type === 'BUY' ? 'green' : 'red'} />
                <Text style={styles.listVariety}>{o.variety.name}</Text>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.listPrice}>${parseFloat(o.pricePerKg).toFixed(3)}</Text>
                <Badge label={o.status.replace('_', ' ')} variant={orderStatusVariant(o.status)} />
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Recent Trades */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Trades</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <Card style={[styles.listCard, { marginBottom: Spacing.xl }]}>
        {recentTrades.length === 0 ? (
          <Text style={styles.empty}>No trades yet</Text>
        ) : (
          recentTrades.map((t, idx) => {
            const isBuyer = t.buyer.id === user?.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.listRow, idx < recentTrades.length - 1 && styles.listRowBorder]}
                onPress={() => router.push(`/trade/${t.id}`)}
              >
                <View style={styles.listLeft}>
                  <Badge label={isBuyer ? 'Bought' : 'Sold'} variant={isBuyer ? 'green' : 'red'} />
                  <Text style={styles.listVariety}>{t.buyOrder.variety.name}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listPrice}>
                    ${parseFloat(t.totalAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.listSub}>{parseFloat(t.quantityKg).toLocaleString()} kg</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greetingName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  greetingRole: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  newOrderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  newOrderText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  marketRow: { marginBottom: Spacing.lg },
  marketCard: { width: 140, marginRight: 12, padding: 14 },
  marketVariety: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  marketPrice: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  marketUnit: { fontSize: FontSize.xs, fontWeight: '400', color: Colors.textMuted },
  changeChip: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start' },
  changeText: { fontSize: FontSize.xs, fontWeight: '700' },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  actionBtn: { flex: 1, alignItems: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 12, marginHorizontal: 4, gap: 6 },
  actionLabel: { fontSize: FontSize.xs, color: Colors.text, fontWeight: '600' },

  listCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.md },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  listRight: { alignItems: 'flex-end', gap: 4 },
  listVariety: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500', flex: 1 },
  listPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  listSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { padding: 16, color: Colors.textMuted, textAlign: 'center', fontSize: FontSize.sm },
});
