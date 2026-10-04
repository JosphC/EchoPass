import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../src/core/i18n';
import { spacing } from '../src/core/theme';
import { useTheme } from '../src/core/theme/useTheme';
import { LiveMap, useLiveMap } from '../src/features/map';
import { RouteFilters, StepsList, useRouteOptions, type RouteFilter } from '../src/features/planner';
import { Button, Card, CrowdBars, ScreenHeader } from '../src/ui';
import { formatRon } from '../src/core/utils/format';

export default function PlannerRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RouteFilter>('fastest');
  const { markers, select } = useLiveMap();
  const { options } = useRouteOptions(t('home.from'), t('home.to'), filter);
  const best = options[0];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, spacing.lg) }]}>
      <View style={styles.map}>
        <LiveMap markers={markers} station={null} selectedId={null} followed={null} onSelect={select} />
      </View>
      <ScrollView style={styles.sheet}>
        <ScreenHeader title={t('planner.title')} onBack={() => router.back()} />
        <RouteFilters value={filter} onChange={setFilter} />
        {best ? (
          <Card>
            <StepsList steps={best.steps} />
            <View style={styles.summary}>
              <CrowdBars level={best.crowd} />
            </View>
          </Card>
        ) : null}
        <Button
          title={`${t('plan.startTrip')} · ${best ? `${best.durationMin} ${t('common.min')} · ${formatRon(best.fareRon)}` : ''}`}
          onPress={() => router.push('/(tabs)/live')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    padding: spacing.lg,
  },
  summary: {
    marginTop: spacing.md,
  },
});
