import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { Listing } from '../../src/types';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => {
        setListing(r.data);
        navigation.setOptions({ title: r.data.variety.name });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = () => {
    Alert.alert('Deactivate Listing', 'Remove this listing from the marketplace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/listings/${id}`);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error ?? 'Failed');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!listing) return <View style={styles.center}><Text style={styles.notFound}>Listing not found</Text></View>;

  const isOwner = user?.id === listing.seller.id;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header info */}
      <View style={styles.headerRow}>
        <Badge label={listing.variety.name} variant="green" />
        {listing.grade && <Badge label={listing.grade} variant="gray" />}
      </View>

      <Text style={styles.title}>{listing.title}</Text>

      {/* Price + quantity hero */}
      <Card style={styles.priceCard}>
        <View style={styles.priceRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Price per kg</Text>
            <Text style={styles.priceValue}>${parseFloat(listing.pricePerKg).toFixed(4)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Available</Text>
            <Text style={styles.priceValue}>{parseFloat(listing.quantityKg).toLocaleString()} kg</Text>
          </View>
        </View>
        <View style={styles.priceFooter}>
          <Text style={styles.minOrder}>Min. order: {parseFloat(listing.minOrderKg).toLocaleString()} kg</Text>
          {listing.moisture && <Text style={styles.minOrder}>Moisture: {listing.moisture}%</Text>}
        </View>
      </Card>

      {/* Description */}
      {listing.description && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </Card>
      )}

      {/* Details grid */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.grid}>
          <DetailItem icon="leaf-outline" label="Variety" value={listing.variety.name} />
          {listing.variety.origin && <DetailItem icon="earth-outline" label="Origin" value={listing.variety.origin} />}
          {listing.location && <DetailItem icon="location-outline" label="Location" value={listing.location} />}
          <DetailItem icon="calendar-outline" label="Listed" value={new Date(listing.createdAt).toLocaleDateString()} />
        </View>
      </Card>

      {/* Seller */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Seller</Text>
        <DetailItem icon="business-outline" label="Company" value={listing.seller.company ?? listing.seller.name} />
        {(listing.seller as any).phone && (
          <DetailItem icon="call-outline" label="Phone" value={(listing.seller as any).phone} />
        )}
      </Card>

      {/* Action */}
      <View style={styles.actions}>
        {isOwner ? (
          <Button
            label="Deactivate Listing"
            onPress={handleDeactivate}
            loading={deleting}
            variant="danger"
            fullWidth
          />
        ) : (
          <Button
            label="Place Buy Order"
            onPress={() =>
              router.push(`/order/new?varietyId=${listing.variety.id}&pricePerKg=${listing.pricePerKg}&type=BUY`)
            }
            fullWidth
          />
        )}
      </View>
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} />
      <View style={detailStyles.col}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  col: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textMuted },
  value: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500', marginTop: 1 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: Colors.textMuted, fontSize: FontSize.md },

  headerRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md, lineHeight: 30 },

  priceCard: { marginBottom: 16, padding: 0, overflow: 'hidden' },
  priceRow: { flexDirection: 'row' },
  priceBlock: { flex: 1, padding: 20, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: Colors.border },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 6 },
  priceValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primaryDark },
  priceFooter: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bg },
  minOrder: { fontSize: FontSize.xs, color: Colors.textMuted },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  description: { fontSize: FontSize.md, color: Colors.textMuted, lineHeight: 22, marginTop: 8 },
  grid: { marginTop: 4 },

  actions: { marginTop: 8 },
});
