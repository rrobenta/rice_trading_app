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
import { Colors, FontSize, Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
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
          <Text style={styles.title}>RiceMarket</Text>
          <Text style={styles.subtitle}>Sign in to your trading account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="current-password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <Text style={[styles.linkText, styles.link]}>Create one</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Demo Accounts</Text>
          <Text style={styles.demoText}>supplier@example.com</Text>
          <Text style={styles.demoText}>buyer@example.com · trader@example.com</Text>
          <Text style={styles.demoText}>Password: password123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.primaryDark },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 4 },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  error: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  linkText: { fontSize: FontSize.sm, color: Colors.textMuted },
  link: { color: Colors.primary, fontWeight: '600' },
  demo: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  demoTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryDark, marginBottom: 4 },
  demoText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
