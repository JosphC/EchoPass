import 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../src/core/theme';
import { queryClient } from '../src/services/api/queryClient';

export default function RootLayout() {
  const { scheme } = useTheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="plan" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="inspector" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
