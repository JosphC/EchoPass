import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LatLng } from '../../../../features/map/arrivals';
import type { Station } from '../../../../features/map/stations';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet, EmptyState, ListItem } from '../../../../ui';
import { useStopArrivals, type StopArrivalItem } from '../../hooks/useStopArrivals';
import { useLiveMapReports } from '../../hooks/useLiveMapReports';
import { useFavoriteStations } from '../../stores/favoriteStations';
import { useReportSubmit } from '../../../reports';
import type { ReportKind } from '../../../../services/api/schemas/report';
import { ActionChipRow } from './ActionChipRow';
import { BoardHeader } from './BoardHeader';
import { DepartureRow } from './DepartureRow';
import { LineFilterRow } from './LineFilterRow';
import { StationAlert } from './StationAlert';
import { StationPickerSheet } from './StationPickerSheet';
import { TripSheet } from './TripSheet';

interface ArrivalsBoardProps {
  station: Station;
  coords: LatLng | null;
  onSelectStation: (station: Station) => void;
  onDirections: () => void;
  onOpenMap?: () => void;
  onTrackBus: (busId: string) => void;
  flat?: boolean;
}

const PAGE = 10;
const REPORT_KINDS: ReportKind[] = ['traffic', 'accident', 'breakdown', 'works', 'crowding', 'detour'];
const REPORT_LABELS: Record<ReportKind, string> = {
  traffic: 'live.causeTraffic', accident: 'live.causeAccident', breakdown: 'live.causeBreakdown',
  works: 'live.causeWorks', crowding: 'live.causeCrowding', detour: 'live.causeDetour',
};

export function ArrivalsBoard({ station, coords, onSelectStation, onDirections, onOpenMap, onTrackBus, flat = false }: ArrivalsBoardProps) {
  const { colors } = useTheme();
  const [limit, setLimit] = useState(PAGE);
  const [detail, setDetail] = useState<StopArrivalItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const favoriteIds = useFavoriteStations((s) => s.ids);
  const toggleFavorite = useFavoriteStations((s) => s.toggle);
  const isFavorite = favoriteIds.includes(station.id);
  const { submitReport } = useReportSubmit();

  const { items, routes, lineFilter, toggleLine, clearFilter, isLoading, isError, hasCache, updatedAtMs, refetch } =
    // 2 h: hourly lines (E3, M-lines) must still show, like Google Maps.
    useStopArrivals(station.id, { limit, windowMin: 120 });
  const { alerts } = useLiveMapReports(station);

  useEffect(() => {
    setLimit(PAGE);
  }, [station.id]);

  const agoSec = updatedAtMs > 0 ? Math.max(0, Math.floor((Date.now() - updatedAtMs) / 1000)) : 0;

  async function handleShare(): Promise<void> {
    const topArrivals = items
      .slice(0, 3)
      .map((it) => `${it.arrival.route.shortName} -> ${it.arrival.headsign} (${it.minutesLeft} min)`)
      .join(', ');
    const next = topArrivals ? `${t('home.shareNext')}: ${topArrivals}` : t('home.shareNone');
    const message = `${t('home.shareStop')} ${station.name} (${station.lines.join(', ')}):\n${next}\nEchoPass`;
    try {
      await Share.share({ message });
    } catch {
      // ignore
    }
  }

  async function handleReport(kind: ReportKind): Promise<void> {
    const lineToReport = lineFilter[0] ?? station.lines[0] ?? '17';
    await submitReport({ kind, line: lineToReport });
    setReportSent(true);
    setTimeout(() => {
      setReportOpen(false);
      setReportSent(false);
    }, 1500);
  }

  return (
    <View style={flat ? styles.flatSection : styles.section}>
      <BoardHeader
        stationName={station.name}
        onOpenPicker={() => setPickerOpen(true)}
      />
      <StationPickerSheet
        visible={pickerOpen}
        coords={coords}
        selectedId={station.id}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onPick={onSelectStation}
        onClose={() => setPickerOpen(false)}
      />
      <View style={[flat ? styles.flatCard : styles.card, !flat && { backgroundColor: colors.card }]}>
        <ActionChipRow
          actions={[
            { label: t('home.directions'), icon: 'navigate-outline', onPress: onDirections },
            { label: isFavorite ? t('home.saved') : t('home.save'), icon: isFavorite ? 'bookmark' : 'bookmark-outline', onPress: () => toggleFavorite(station.id), active: isFavorite },
            { label: t('home.share'), icon: 'share-social-outline', onPress: () => void handleShare() },
            { label: t('home.report'), icon: 'alert-circle-outline', onPress: () => setReportOpen(true) },
          ]}
        />
        <LineFilterRow lines={routes} selected={lineFilter} onToggle={toggleLine} onClear={clearFilter} />
        <StationAlert alerts={alerts} />
        {isLoading && items.length === 0 ? (
          <View style={styles.skeleton}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.bone, { backgroundColor: colors.border }]} />
            ))}
          </View>
        ) : null}
        {isError && !hasCache ? (
          <EmptyState title={t('common.error')} message={t('home.noArrivals')} actionLabel={t('common.retry')} onAction={() => void refetch()} />
        ) : null}
        {isError && hasCache ? (
          <Text style={[styles.cached, { color: colors.warning }]}>
            {t('home.cachedData')} · {Math.floor(agoSec / 60)} {t('common.min')}
          </Text>
        ) : null}
        {!isLoading && items.length === 0 && !isError ? (
          <EmptyState title={t('home.stationArrivals')} message={t('home.noArrivals')} actionLabel={t('home.viewSchedule')} onAction={onOpenMap ?? onDirections} />
        ) : null}
        {items.map((item) => (
          <DepartureRow
            key={item.arrival.tripId}
            item={item}
            onPress={() => {
              if (item.arrival.busId) onTrackBus(item.arrival.busId);
              else setDetail(item);
            }}
          />
        ))}
        {items.length >= limit ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.loadMore')}
            onPress={() => setLimit((l) => l + PAGE)}
            style={styles.more}
          >
            <Text style={[styles.moreLabel, { color: colors.primary }]}>{t('home.loadMore')}</Text>
          </Pressable>
        ) : null}
        <BottomSheet visible={detail !== null} onClose={() => setDetail(null)}>
          {detail ? <TripSheet item={detail} /> : null}
        </BottomSheet>
        <BottomSheet visible={reportOpen} onClose={() => { setReportOpen(false); setReportSent(false); }}>
          <View style={styles.reportSheet}>
            <Text style={[styles.reportTitle, { color: colors.text }]}>{t('home.reportStation')}</Text>
            {reportSent ? (
              <View style={styles.reportFeedback}>
                <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
                <Text style={[styles.reportFeedbackText, { color: colors.text }]}>{t('home.reportSent')}</Text>
              </View>
            ) : (
              <View style={styles.reportList}>
                {REPORT_KINDS.map((k) => (
                  <ListItem key={k} title={t(REPORT_LABELS[k] as never)} onPress={() => void handleReport(k)} />
                ))}
              </View>
            )}
          </View>
        </BottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  flatSection: { gap: 6 },
  flatCard: { gap: 8, paddingHorizontal: 0, paddingVertical: 4 },
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  skeleton: { gap: spacing.sm, paddingVertical: spacing.sm },
  bone: { height: 46, borderRadius: radius.md, opacity: 0.6 },
  cached: { fontSize: fontSizes.xs },
  more: { alignItems: 'center', minHeight: 36, justifyContent: 'center' },
  moreLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium },
  reportSheet: { paddingVertical: spacing.sm, gap: spacing.sm },
  reportTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.bold, textAlign: 'center', marginBottom: spacing.xs },
  reportList: { gap: 4 },
  reportFeedback: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  reportFeedbackText: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center' },
});
