import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { RiceVariety } from '../../src/types';

type OrderType = 'BUY' | 'SELL';

export default function NewOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ varietyId?: string; pricePerKg?: string; type?: string }>();

  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [orderType, setOrderType] = useState<OrderType>((params.type as OrderType) ?? 'BUY');
  const [varietyId, setVarietyId] = useState(params.varietyId ?? '');
  const [form, setForm] = useState({
    pricePerKg: params.pricePerKg ?? '',
    quantityKg: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then(r => {
      setVarieties(r.data);
      if (!varietyId && r.data.length > 0) setVarietyId(r.data[0].id);
    });
  }, []);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const selectedVariety = varieties.find(v => v.id === varietyId);
  const estimatedTotal =
    form.pricePerKg && form.quantityKg
      ? parseFloat(form.pricePerKg) * parseFloat(form.quantityKg)
      : null;

  const handleSubmit = async () => {
    if (!varietyId || !form.pricePerKg || !form.quantityKg) {
      Alert.alert('Missing Fields', 'Please select a variety and fill in price and quantity');
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', { type: orderType, varietyId, ...form });
      Alert.alert(
        'Order Placed',
        `Your ${orderType} order has been submitted. The system will automatically match it with opposing orders.`,
        [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? e.response?.data?.errors?.[0]?.msg ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Order type toggle */}
        <Text style={styles.label}>Order Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'BUY' && styles.typeBtnBuy]}
            onPress={() => setOrderType('BUY')}
          >
            <Ionicons name="arrow-up-circle-outline" size={20} color={orderType === 'BUY' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.typeBtnText, orderType === 'BUY' && styles.typeBtnTextActive]}>Buy Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, orderType === 'SELL' && styles.typeBtnSell]}
            onPress={() => setOrderType('SELL')}
          >
            <Ionicons name="arrow-down-circle-outline" size={20} color={orderType === 'SELL' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.typeBtnText, orderType === 'SELL' && styles.typeBtnTextActive]}>Sell Order</Text>
          </TouchableOpacity>
        </View>

        {/* Variety selector */}
        <Text style={styles.label}>Rice Variety</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          {varieties.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.chip, varietyId === v.id && styles.chipActive]}
              onPress={() => setVarietyId(v.id)}
            >
              <Text style={[styles.chipText, varietyId === v.id && styles.chipTextActive]}>{v.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selectedVariety?.description && (
          <Text style={styles.varietyDesc}>{selectedVariety.description}</Text>
        )}

        <View style={styles.row}>
          <Input label="Price per kg (USD)" value={form.pricePerKg} onChangeText={set('pricePerKg')} keyboardType="decimal-pad" placeholder="1.8500" containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <Input label="Quantity (kg)" value={form.quantityKg} onChangeText={set('quantityKg')} keyboardType="decimal-pad" placeholder="1000" containerStyle={{ flex: 1 }} />
        </View>

        <Input label="Notes (optional)" value={form.notes} onChangeText={set('notes')} placeholder="Any special requirements…" multiline numberOfLines={2} style={{ height: 70, textAlignVertical: 'top' }} />

        {/* Estimated total */}
        {estimatedTotal !== null && !isNaN(estimatedTotal) && (
          <View style={[styles.estimateBox, { backgroundColor: orderType === 'BUY' ? '#e8f5e9' : '#ffe8e8' }]}>
            <Text style={styles.estimateLabel}>Estimated Total</Text>
            <Text style={[styles.estimateValue, { color: orderType === 'BUY' ? Colors.buyGreen : Colors.sellRed }]}>
              ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.estimateNote}>Actual price determined at match time</Text>
          </View>
        )}

        {/* Matching info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            Orders are matched automatically by price-time priority. Your order will fill against the best available opposing orders.
          </Text>
        </View>

        <Button
          label={`Place ${orderType} Order`}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: 8, backgroundColor: orderType === 'BUY' ? Colors.buyGreen : Colors.sellRed }}
        />
        <Button label="Cancel" onPress={() => router.back()} variant="ghost" fullWidth style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  row: { flexDirection: 'row' },

  typeRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  typeBtnBuy: { backgroundColor: Colors.buyGreen, borderColor: Colors.buyGreen },
  typeBtnSell: { backgroundColor: Colors.sellRed, borderColor: Colors.sellRed },
  typeBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textMuted },
  typeBtnTextActive: { color: '#fff' },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, marginRight: 8 },
  chipActive: { borderColor: Colors.primary, backgroundColor: '#e8f5e9' },
  chipText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },
  varietyDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -8, marginBottom: Spacing.md },

  estimateBox: { borderRadius: Radius.md, padding: 16, marginBottom: Spacing.md, alignItems: 'center', gap: 4 },
  estimateLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  estimateValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  estimateNote: { fontSize: FontSize.xs, color: Colors.textMuted },

  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: '#e8f5e9', borderRadius: Radius.md, padding: 12, marginBottom: Spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
});
