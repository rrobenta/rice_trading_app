import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import Card from '../../src/components/Card';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/users/profile');
      setProfile(r.data);
      setForm({ name: r.data.name, company: r.data.company ?? '', phone: r.data.phone ?? '' });
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put('/users/profile', form);
      setProfile((p: any) => ({ ...p, ...r.data }));
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const ROLE_COLOR: Record<string, string> = {
    SUPPLIER: '#dbeafe',
    BUYER: '#fef9c3',
    TRADER: '#d8f3dc',
    ADMIN: '#fce7f3',
  };
  const ROLE_TEXT: Record<string, string> = {
    SUPPLIER: '#1e40af',
    BUYER: '#854d0e',
    TRADER: '#1b4332',
    ADMIN: '#9d174d',
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Avatar + name */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{profile?.name}</Text>
        {profile?.company && <Text style={styles.heroCompany}>{profile.company}</Text>}
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLOR[profile?.role] ?? '#e9ecef' }]}>
          <Text style={[styles.roleText, { color: ROLE_TEXT[profile?.role] ?? '#495057' }]}>{profile?.role}</Text>
        </View>
      </View>

      {/* Stats */}
      {profile?.stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{profile.stats.totalListings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statNum}>{profile.stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{profile.stats.totalTrades}</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
        </View>
      )}

      {/* Edit form / info */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account Details</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
              <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <>
            <Input label="Name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} autoCapitalize="words" />
            <Input label="Company" value={form.company} onChangeText={v => setForm(f => ({ ...f, company: v }))} />
            <Input label="Phone" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
            <View style={styles.editActions}>
              <Button label="Save Changes" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              <Button label="Cancel" onPress={() => setEditing(false)} variant="ghost" style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <View style={styles.infoRows}>
            <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
            <InfoRow icon="call-outline" label="Phone" value={profile?.phone ?? '—'} />
            <InfoRow icon="calendar-outline" label="Member since" value={new Date(profile?.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })} />
          </View>
        )}
      </Card>

      {/* Quick nav */}
      <Card style={styles.menuCard}>
        <MenuRow icon="list-outline" label="My Listings" onPress={() => router.push('/(tabs)/listings')} />
        <MenuRow icon="swap-horizontal-outline" label="My Orders" onPress={() => router.push('/(tabs)/orders')} border />
        <MenuRow icon="receipt-outline" label="Trade History" onPress={() => { router.push('/(tabs)/orders'); }} border />
      </Card>

      <Button
        label="Sign Out"
        onPress={handleLogout}
        variant="outline"
        fullWidth
        style={{ borderColor: Colors.danger }}
        textStyle={{ color: Colors.danger }}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={Colors.textMuted} />
      <View style={infoStyles.col}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  col: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textMuted },
  value: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500', marginTop: 1 },
});

function MenuRow({ icon, label, onPress, border }: { icon: any; label: string; onPress: () => void; border?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[menuStyles.row, border && menuStyles.border]}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={menuStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.border} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  border: { borderTopWidth: 1, borderTopColor: Colors.border },
  label: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  hero: { alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  heroCompany: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  roleBadge: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 99 },
  roleText: { fontSize: FontSize.sm, fontWeight: '700' },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: 16, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  infoCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  infoRows: { gap: 0 },

  menuCard: { marginBottom: 20 },
});
