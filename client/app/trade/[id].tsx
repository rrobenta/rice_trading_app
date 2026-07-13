import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { Trade } from '../../src/types';

export default function TradeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const r = await api.get(`/trades/${id}`);
      setTrade(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatus = (status: 'COMPLETED' | 'DISPUTED') => {
    const label = status === 'COMPLETED' ? 'Mark as Completed' : 'Raise a Dispute';
    const msg = status === 'COMPLETED'
      ? 'Confirm that you have received the goods and the trade is complete?'
      : 'Are you sure you want to raise a dispute for this trade?';
    Alert.alert(label, msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: status === 'DISPUTED' ? 'destructive' : 'default',
        onPress: async () => {
          setUpdating(true);
          try {
            await api.patch(`/trades/${id}/status`, { status });
            load();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error ?? 'Failed');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!trade) return <View style={styles.center}><Text style={styles.notFound}>Trade not found</Text></View>;

  const isBuyer = trade.buyer.id === user?.id;
  const counterparty = isBuyer ? trade.seller : trade.buyer;

  const statusVariant = trade.status === 'COMPLETED' ? 'green' : trade.status === 'DISPUTED' ? 'red' : 'yellow';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Status hero */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={[styles.roleCircle, { backgroundColor: isBuyer ? '#d8f3dc' : '#ffe0e0' }]}>
            <Ionicons
              name={isBuyer ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={32}
              color={isBuyer ? Colors.buyGreen : Colors.sellRed}
            />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroRole}>You {isBuyer ? 'Bought' : 'Sold'}</Text>
            <Text style={styles.heroVariety}>{trade.buyOrder.variety.name}</Text>
          </View>
          <Badge label={trade.status} variant={statusVariant} />
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalValue}>
            ${parseFloat(trade.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </Card>

      {/* Details */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Trade Details</Text>
        <TradeRow label="Quantity" value={`${parseFloat(trade.quantityKg).toLocaleString()} kg`} />
        <TradeRow label="Price per kg" value={`$${parseFloat(trade.pricePerKg).toFixed(4)}`} />
        <TradeRow label="Created" value={new Date(trade.createdAt).toLocaleString()} />
        {trade.completedAt && (
          <TradeRow label="Completed" value={new Date(trade.completedAt).toLocaleString()} />
        )}
      </Card>

      {/* Counterparty */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{isBuyer ? 'Seller' : 'Buyer'}</Text>
        <TradeRow label="Name" value={counterparty.name} />
        {counterparty.company && <TradeRow label="Company" value={counterparty.company} />}
        {(counterparty as any).email && <TradeRow label="Email" value={(counterparty as any).email} />}
      </Card>

      {/* Actions */}
      {trade.status === 'PENDING' && (
        <View style={styles.actions}>
          <Button
            label="Mark Completed"
            onPress={() => handleStatus('COMPLETED')}
            loading={updating}
            fullWidth
            style={{ marginBottom: 10 }}
          />
          <Button
            label="Raise Dispute"
            onPress={() => handleStatus('DISPUTED')}
            variant="outline"
            fullWidth
            style={{ borderColor: Colors.danger }}
            textStyle={{ color: Colors.danger }}
          />
        </View>
      )}
    </ScrollView>
  );
}

function TradeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={tradeRowStyles.row}>
      <Text style={tradeRowStyles.label}>{label}</Text>
      <Text style={tradeRowStyles.value}>{value}</Text>
    </View>
  );
}

const tradeRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: FontSize.sm, color: Colors.textMuted },
  value: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, textAlign: 'right', flex: 1, marginLeft: 16 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: Colors.textMuted, fontSize: FontSize.md },

  heroCard: { marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  roleCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1 },
  heroRole: { fontSize: FontSize.sm, color: Colors.textMuted },
  heroVariety: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },

  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FontSize.md, color: Colors.textMuted },
  totalValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  actions: { marginTop: 8 },
});
