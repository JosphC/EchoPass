import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { t } from '../../src/core/i18n';
import { fontSizes } from '../../src/core/theme';
import { useTheme } from '../../src/core/theme/useTheme';
import { RecentTrips, SavedRoutes, TripsHeader, useTrips } from '../../src/features/trips';
import { Screen, Segmented } from '../../src/ui';

export default function TripsTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tab, setTab] = useState(t('trips.recent'));
  const { savedRoutes, recentTrips } = useTrips();
  const showingSaved = tab === t('trips.saved');
  const count = showingSaved ? savedRoutes.length : recentTrips.length;

  return (
    <Screen scroll>
      <TripsHeader onNotifications={() => router.push('/notifications')} />
      <Segmented options={[t('trips.saved'), t('trips.recent')]} value={tab} onChange={setTab} />
      <Text style={[styles.count, { color: colors.text }]}>
        {count} {showingSaved ? t('trips.savedCount') : t('trips.recentCount')}
      </Text>
      {showingSaved ? <SavedRoutes routes={savedRoutes} /> : <RecentTrips trips={recentTrips} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: fontSizes.sm,
  },
});
