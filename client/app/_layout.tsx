import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import LoadingScreen from '../src/components/LoadingScreen';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) return <LoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="listing/[id]"
        options={{ headerShown: true, title: 'Listing Detail', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="listing/new"
        options={{ headerShown: true, title: 'New Listing', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="order/new"
        options={{ headerShown: true, title: 'Place Order', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="trade/[id]"
        options={{ headerShown: true, title: 'Trade Detail', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
