import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nManager } from 'react-native';
import { initI18n, isRTL } from '@tripcraft/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    initI18n('en').then(() => {
      // Set RTL based on language
      const rtl = isRTL('en');
      if (I18nManager.isRTL !== rtl) {
        I18nManager.forceRTL(rtl);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1d4ed8' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'TripCraft' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="search" options={{ title: 'Find Your Trip' }} />
        <Stack.Screen name="destinations" options={{ title: 'Destinations' }} />
      </Stack>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
