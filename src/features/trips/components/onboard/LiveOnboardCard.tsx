import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme';
import { findRoute } from '../../../../services/repositories/gtfs/timetable';
import { LineBadge } from '../../../../ui';
import type { ActiveRideState } from '../../../ride';
import { getLineStops, timeStopsFrom } from '../../data/lineStations';
import { StationTimeline } from './StationTimeline';
import { styles } from './onboardStyles';

interface LiveOnboardCardProps {
  ride?: ActiveRideState | null;
  initiallyExpanded?: boolean;
}

export function LiveOnboardCard({ ride, initiallyExpanded = false }: LiveOnboardCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [showPrev, setShowPrev] = useState(false);
  // Hooks first: an early return before them breaks the rules of hooks.
  if (!ride) return null;

  const line = ride.line;
  const destination = ride.destination;
  const initialStation = ride.station;
  const route = findRoute(line);
  const routeColor = route?.color ?? colors.primary;

  const lineStops = getLineStops(line);
  const rawIdx = lineStops.findIndex((s) => s.name.toLowerCase().includes(initialStation.toLowerCase().slice(0, 5)));
  const boardedStopIndex = rawIdx >= 0 ? rawIdx : 0;
  const stops = timeStopsFrom(lineStops, boardedStopIndex, ride.startedAt);
  const boardedStop = stops[boardedStopIndex] ?? stops[0];

  const nextStopIndex = Math.min(stops.length - 1, boardedStopIndex + 1);
  const nextStop = stops[nextStopIndex] ?? boardedStop;

  const hasPrevStops = boardedStopIndex > 0;
  const displayedStops = showPrev ? stops : stops.slice(boardedStopIndex);
  const activeTimelineIdx = showPrev ? nextStopIndex : Math.min(displayedStops.length - 1, 1);
  const activeBoardedIdx = showPrev ? boardedStopIndex : 0;

  return (
    <View testID="live-onboard-card" style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header bar: tap to expand or collapse route stops */}
      <Pressable
        testID="live-onboard-header"
        accessibilityRole="button"
        accessibilityLabel={`${t('ride.onBoard')}, ${line}, ${destination}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.headerPressable}
      >
        {/* Line + destination, one quiet status line, then the next stop as the one highlight. */}
        <View style={styles.headerRow}>
          <LineBadge shortName={line} color={route?.color ?? undefined} textColor={route?.textColor ?? undefined} size="md" />
          <View style={styles.textBlock}>
            <Text numberOfLines={1} style={[styles.destinationText, { color: colors.text }]}>
              {destination}
            </Text>
            <View style={styles.subtitleRow}>
              <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.stationText, { color: colors.textMuted }]}>{t('ride.onBoard')} · </Text>
              <Text numberOfLines={1} style={[styles.stationText, styles.fromText, { color: colors.textMuted }]}>
                {t('ride.boardedFrom')} {boardedStop?.name ?? initialStation}
              </Text>
            </View>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
        </View>

        <View style={[styles.nextBox, { backgroundColor: colors.fill }]}>
          <View style={[styles.nextRing, { borderColor: routeColor }]} />
          <View style={styles.textBlock}>
            <Text style={[styles.nextLabel, { color: colors.textMuted }]}>{t('ride.nextStop')}</Text>
            <Text numberOfLines={1} style={[styles.nextStopHeader, { color: colors.text }]}>
              {nextStop.name}
            </Text>
          </View>
          <Text style={[styles.nextEta, { color: colors.text }]}>{t('ride.nextEta')}</Text>
        </View>
      </Pressable>

      {/* Expanded Stops Timeline */}
      {expanded && (
        <View style={styles.timelineWrap}>
          {hasPrevStops && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPrev ? t('ride.hidePrev') : t('ride.showPrev')}
              onPress={() => setShowPrev((prev) => !prev)}
              style={styles.togglePrevBtn}
            >
              <Ionicons name={showPrev ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textMuted} />
              <Text style={[styles.togglePrevText, { color: colors.textMuted }]}>
                {showPrev ? t('ride.hidePrev') : t('ride.showPrev')}
              </Text>
            </Pressable>
          )}

          <StationTimeline
            stops={displayedStops}
            currentStopIndex={activeTimelineIdx}
            boardedStopIndex={activeBoardedIdx}
            lineColor={routeColor}
          />
        </View>
      )}
    </View>
  );
}
