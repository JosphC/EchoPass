import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../../core/i18n';
import { fontSizes, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { formatRon } from '../../../core/utils/format';
import { Button, Card, CrowdBars, ScreenHeader } from '../../../ui';
import { BusListFallback, LiveMap, MapErrorBoundary, loadStations, useLiveMap, type LatLng, type Station } from '../../map';
import type { RouteFilter } from '../options';
import { useRouteGeometry } from '../routeGeometry';
import { planTransit } from '../transit';
import { RouteFilters } from './RouteFilters';
import { StepsList } from './StepsList';

function parseCoords(lat: string | string[] | undefined, lng: string | string[] | undefined): LatLng | null {
  if (typeof lat !== 'string' || typeof lng !== 'string') return null;
  const point = { lat: Number(lat), lng: Number(lng) };
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) ? point : null;
}

/** Chosen transit option on the map: walk paths, board + alight pins, steps. */
export function PlanView() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    optionId?: string;
    fromId?: string;
    toId?: string;
    olat?: string;
    olng?: string;
    oname?: string;
    dlat?: string;
    dlng?: string;
    dname?: string;
  }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RouteFilter>('fastest');
  const { allMarkers, select } = useLiveMap();
  const stations = useMemo(() => loadStations(), []);
  const from = stations.find((s) => s.id === params.fromId) ?? null;
  const to = stations.find((s) => s.id === params.toId) ?? null;
  const originCoords = useMemo(() => parseCoords(params.olat, params.olng), [params.olat, params.olng]);
  const destCoords = useMemo(() => parseCoords(params.dlat, params.dlng), [params.dlat, params.dlng]);

  const originTarget = useMemo(
    () => ({
      station: from,
      coords: originCoords ?? (from ? { lat: from.lat, lng: from.lng } : null),
      name: (params.oname as string | undefined) ?? from?.name ?? 'Locația ta',
    }),
    [from, originCoords, params.oname],
  );

  const destTarget = useMemo(
    () =>
      to
        ? to
        : destCoords
          ? {
              station: null,
              coords: destCoords,
              name: (params.dname as string | undefined) ?? 'Destinație',
            }
          : null,
    [to, destCoords, params.dname],
  );

  const options = useMemo(
    () => (destTarget ? planTransit(originTarget, destTarget, allMarkers) : []),
    [originTarget, destTarget, allMarkers],
  );

  const sorted = useMemo(() => {
    const list = [...options];
    if (filter === 'cheapest') list.sort((a, b) => a.fareRon - b.fareRon);
    else if (filter === 'roomiest') list.sort((a, b) => a.crowd - b.crowd);
    else list.sort((a, b) => a.totalMin - b.totalMin);
    return list;
  }, [options, filter]);

  const chosen = sorted.find((o) => o.id === params.optionId) ?? sorted[0] ?? null;
  const startPoint = originCoords ?? (from && chosen && from.id !== chosen.boardStation.id ? from : null);
  const endPoint = destCoords ?? (to && chosen && to.id !== chosen.alightStation.id ? to : null);
  const { segments, allCoordinates } = useRouteGeometry(startPoint, chosen, endPoint);

  const extraStations = useMemo(() => {
    if (!chosen) return undefined;
    const list: Station[] = [];
    if (chosen.transferStation && chosen.transferStation.id !== chosen.boardStation.id) {
      list.push(chosen.transferStation);
    }
    if (chosen.alightStation.id !== chosen.boardStation.id) {
      list.push(chosen.alightStation);
    }
    return list.length > 0 ? list : undefined;
  }, [chosen]);

  const originPin = startPoint && params.oname ? { lat: startPoint.lat, lng: startPoint.lng, title: params.oname as string } : null;
  const destPin = endPoint && params.dname ? { lat: endPoint.lat, lng: endPoint.lng, title: params.dname as string } : null;

  const hasEndpoints = (from !== null || originCoords !== null) && (to !== null || destCoords !== null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.map}>
        <MapErrorBoundary fallback={<BusListFallback markers={allMarkers} onSelect={select} />}>
          <LiveMap
            markers={allMarkers}
            station={chosen?.boardStation ?? from}
            extraStations={extraStations}
            routeSegments={segments}
            routeFitCoords={allCoordinates}
            originPin={originPin}
            destPin={destPin}
            selectedId={null}
            followed={null}
            onSelect={select}
          />
        </MapErrorBoundary>
      </View>
      <ScrollView style={styles.sheet}>
        <ScreenHeader title={t('planner.title')} onBack={() => router.back()} />
        {!hasEndpoints ? (
          <Text style={[styles.message, { color: colors.textMuted }]}>{t('home.completeBoth')}</Text>
        ) : !chosen ? (
          <Text style={[styles.message, { color: colors.textMuted }]}>{t('live.empty')}</Text>
        ) : (
          <>
            <RouteFilters value={filter} onChange={setFilter} />
            <Card>
              <StepsList legs={chosen.legs} startMs={Date.now()} />
              <View style={styles.summary}>
                <CrowdBars level={chosen.crowd} />
                <Text style={[styles.total, { color: colors.text }]}>
                  {chosen.totalMin} {t('common.min')} · {formatRon(chosen.fareRon)}
                </Text>
              </View>
            </Card>
            <Button
              title={`${t('plan.startTrip')} · ${chosen.totalMin} ${t('common.min')}`}
              onPress={() => router.push('/(tabs)')}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  sheet: { flex: 1, padding: spacing.lg },
  message: { fontSize: fontSizes.md, paddingVertical: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  total: { fontSize: fontSizes.md, fontWeight: '600' },
});
