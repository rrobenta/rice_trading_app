import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';

const ROLES = [
  { value: 'TRADER', label: 'Trader / Broker' },
  { value: 'BUYER', label: 'Buyer' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', company: '', role: 'TRADER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, email: form.email.toLowerCase().trim() });
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the rice trading platform</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name *" value={form.name} onChangeText={set('name')} placeholder="Your name" autoCapitalize="words" />
          <Input label="Email *" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password *" value={form.password} onChangeText={set('password')} placeholder="Min. 8 characters" secureTextEntry />
          <Input label="Company (optional)" value={form.company} onChangeText={set('company')} placeholder="Your company name" />

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]}
                onPress={() => setForm(f => ({ ...f, role: r.value }))}
              >
                <Text style={[styles.roleBtnText, form.role === r.value && styles.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Create Account" onPress={handleRegister} loading={loading} fullWidth style={{ marginTop: Spacing.sm }} />

          <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={[styles.linkText, styles.link]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.bg, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primaryDark },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 4 },
  form: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md, flexWrap: 'wrap' },
  roleBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleBtnActive: { borderColor: Colors.primary, backgroundColor: '#e8f5e9' },
  roleBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  roleBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  error: { color: Colors.danger, fontSize: FontSize.sm, marginBottom: Spacing.md, textAlign: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.md },
  linkText: { fontSize: FontSize.sm, color: Colors.textMuted },
  link: { color: Colors.primary, fontWeight: '600' },
});
