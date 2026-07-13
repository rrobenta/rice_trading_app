import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/lib/api';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { RiceVariety } from '../../src/types';

export default function NewListingScreen() {
  const router = useRouter();
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', varietyId: '',
    pricePerKg: '', quantityKg: '', minOrderKg: '',
    grade: '', moisture: '', location: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then(r => {
      setVarieties(r.data);
      if (r.data.length > 0) setForm(f => ({ ...f, varietyId: r.data[0].id }));
    });
  }, []);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title || !form.pricePerKg || !form.quantityKg || !form.varietyId) {
      Alert.alert('Missing Fields', 'Please fill in title, variety, price, and quantity');
      return;
    }
    setLoading(true);
    try {
      const r = await api.post('/listings', form);
      router.replace(`/listing/${r.data.id}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? e.response?.data?.errors?.[0]?.msg ?? 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Input label="Title *" value={form.title} onChangeText={set('title')} placeholder="e.g. Premium Jasmine Rice Grade A" />
        <Input label="Description" value={form.description} onChangeText={set('description')} placeholder="Quality notes, harvest date…" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />

        {/* Variety picker */}
        <Text style={styles.label}>Rice Variety *</Text>
        <View style={styles.varietyRow}>
          {varieties.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.varietyChip, form.varietyId === v.id && styles.varietyChipActive]}
              onPress={() => setForm(f => ({ ...f, varietyId: v.id }))}
            >
              <Text style={[styles.varietyChipText, form.varietyId === v.id && styles.varietyChipTextActive]}>
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <Input label="Price/kg (USD) *" value={form.pricePerKg} onChangeText={set('pricePerKg')} keyboardType="decimal-pad" placeholder="1.8500" containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <Input label="Quantity (kg) *" value={form.quantityKg} onChangeText={set('quantityKg')} keyboardType="decimal-pad" placeholder="50000" containerStyle={{ flex: 1 }} />
        </View>

        <View style={styles.row}>
          <Input label="Min. Order (kg)" value={form.minOrderKg} onChangeText={set('minOrderKg')} keyboardType="decimal-pad" placeholder="1000" containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <Input label="Grade" value={form.grade} onChangeText={set('grade')} placeholder="Grade A" containerStyle={{ flex: 1 }} />
        </View>

        <View style={styles.row}>
          <Input label="Moisture (%)" value={form.moisture} onChangeText={set('moisture')} keyboardType="decimal-pad" placeholder="14.0" containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <Input label="Location" value={form.location} onChangeText={set('location')} placeholder="City, Country" containerStyle={{ flex: 1 }} />
        </View>

        {form.pricePerKg && form.quantityKg ? (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Total listing value</Text>
            <Text style={styles.estimateValue}>
              ${(parseFloat(form.pricePerKg || '0') * parseFloat(form.quantityKg || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}

        <Button label="Create Listing" onPress={handleSubmit} loading={loading} fullWidth style={{ marginTop: 8 }} />
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
  varietyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  varietyChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  varietyChipActive: { borderColor: Colors.primary, backgroundColor: '#e8f5e9' },
  varietyChipText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  varietyChipTextActive: { color: Colors.primary, fontWeight: '700' },
  estimateBox: { backgroundColor: '#e8f5e9', borderRadius: Radius.md, padding: 14, marginBottom: Spacing.md, alignItems: 'center' },
  estimateLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  estimateValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, marginTop: 4 },
});
