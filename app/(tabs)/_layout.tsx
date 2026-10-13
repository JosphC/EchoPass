import { Tabs } from 'expo-router';
import { t } from '../../src/core/i18n';
import { CenteredTabBar } from '../../src/ui';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CenteredTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="wallet" options={{ title: t('tabs.wallet') }} />
      <Tabs.Screen name="trips" options={{ title: t('tabs.trips') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
