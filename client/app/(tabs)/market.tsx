import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import Card from '../../src/components/Card';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { RiceVariety, PricePoint, MarketSummaryItem } from '../../src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#457b9d'];

export default function MarketScreen() {
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<RiceVariety | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBase = useCallback(async () => {
    const [v, s] = await Promise.all([
      api.get('/market/varieties'),
      api.get('/market/summary'),
    ]);
    setVarieties(v.data);
    setSummary(s.data);
  }, []);

  const loadHistory = useCallback(async () => {
    const params = new URLSearchParams({ days: String(days) });
    if (selectedVariety) params.set('variety', selectedVariety.name);
    const r = await api.get(`/market/prices?${params}`);
    setHistory(r.data);
  }, [selectedVariety, days]);

  useEffect(() => {
    loadBase().finally(() => setLoading(false));
  }, [loadBase]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBase(), loadHistory()]);
    setRefreshing(false);
  };

  // Build chart data for selected variety (or first with data)
  const chartVarietyName = selectedVariety?.name ?? varieties[0]?.name;
  const chartPoints = history
    .filter(p => p.varietyName === chartVarietyName)
    .map(p => ({
      value: parseFloat(p.pricePerKg),
      label: new Date(p.recordedAt).getDate().toString(),
    }));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.pageTitle}>Market Overview</Text>

      {/* Summary cards */}
      {summary.map((item, i) => {
        const change = parseFloat(item.changePct ?? '0');
        const isUp = change >= 0;
        return (
          <Card key={item.variety.id} style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.summaryVariety}>{item.variety.name}</Text>
                {item.variety.origin && <Text style={styles.summaryOrigin}>{item.variety.origin}</Text>}
              </View>
              <View style={styles.summaryRight}>
                <Text style={[styles.summaryPrice, { color: CHART_COLORS[i % CHART_COLORS.length] }]}>
                  {item.currentPrice ? `$${parseFloat(item.currentPrice).toFixed(4)}` : '—'}
                </Text>
                {item.changePct && (
                  <View style={[styles.changeChip, { backgroundColor: isUp ? '#d8f3dc' : '#ffe0e0' }]}>
                    <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={11} color={isUp ? Colors.buyGreen : Colors.sellRed} />
                    <Text style={[styles.changeText, { color: isUp ? Colors.buyGreen : Colors.sellRed }]}>
                      {Math.abs(change).toFixed(2)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.summaryOrders}>{item.openOrders} open orders</Text>
          </Card>
        );
      })}

      {/* Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Price History</Text>

        {/* Variety selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.chip, !selectedVariety && styles.chipActive]}
            onPress={() => setSelectedVariety(null)}
          >
            <Text style={[styles.chipText, !selectedVariety && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {varieties.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.chip, selectedVariety?.id === v.id && styles.chipActive]}
              onPress={() => setSelectedVariety(v)}
            >
              <Text style={[styles.chipText, selectedVariety?.id === v.id && styles.chipTextActive]}>{v.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Days selector */}
        <View style={styles.daysRow}>
          {[7, 14, 30, 90].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dayBtn, days === d && styles.dayBtnActive]}
              onPress={() => setDays(d)}
            >
              <Text style={[styles.dayBtnText, days === d && styles.dayBtnTextActive]}>{d}d</Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartPoints.length > 1 ? (
          <LineChart
            data={chartPoints}
            width={SCREEN_WIDTH - 80}
            height={180}
            color={Colors.primary}
            thickness={2}
            hideDataPoints
            curved
            areaChart
            startFillColor={Colors.primaryLight}
            startOpacity={0.3}
            endOpacity={0.05}
            yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
            noOfSections={4}
            rulesColor={Colors.border}
            yAxisColor="transparent"
            xAxisColor={Colors.border}
            initialSpacing={8}
            spacing={Math.max(8, (SCREEN_WIDTH - 120) / Math.max(chartPoints.length, 1))}
          />
        ) : (
          <View style={styles.noChart}>
            <Text style={styles.noChartText}>Not enough data</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },

  summaryCard: { marginBottom: 12 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryVariety: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  summaryOrigin: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  summaryRight: { alignItems: 'flex-end', gap: 6 },
  summaryPrice: { fontSize: FontSize.xxl, fontWeight: '800' },
  summaryOrders: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 8 },

  changeChip: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  changeText: { fontSize: FontSize.xs, fontWeight: '700' },

  chartCard: { marginBottom: Spacing.md },
  chartTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 12 },

  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: Colors.bg, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  chipText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  daysRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  dayBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayBtnText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  dayBtnTextActive: { color: '#fff' },

  noChart: { height: 120, alignItems: 'center', justifyContent: 'center' },
  noChartText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
