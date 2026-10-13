import 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BoardingPromptModal } from '../src/features/ride';
import { useTheme } from '../src/core/theme';
import { queryClient } from '../src/services/api/queryClient';
import { BrandSplashOverlay } from '../src/ui';

export default function RootLayout() {
  const { scheme } = useTheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="plan" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="inspector" />
            <Stack.Screen name="onboarding" />
          </Stack>
          <BrandSplashOverlay />
        </View>
        <BoardingPromptModal />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
