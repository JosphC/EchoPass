import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme';
import type { ActiveRideState } from '../../../ride';
import { getLineStops } from '../../data/lineStations';
import { StationTimeline } from './StationTimeline';
import { styles } from './onboardStyles';

interface LiveOnboardCardProps {
  ride?: ActiveRideState | null;
  initiallyExpanded?: boolean;
}

export function LiveOnboardCard({ ride, initiallyExpanded = false }: LiveOnboardCardProps) {
  if (!ride) return null;

  const { colors } = useTheme();
  const line = ride.line;
  const destination = ride.destination;
  const initialStation = ride.station;

  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [showPrev, setShowPrev] = useState(false);

  const stops = getLineStops(line);
  const rawIdx = stops.findIndex((s) => s.name.toLowerCase().includes(initialStation.toLowerCase().slice(0, 5)));
  const boardedStopIndex = rawIdx >= 0 ? rawIdx : 0;
  const boardedStop = stops[boardedStopIndex] ?? stops[0];

  const nextStopIndex = Math.min(stops.length - 1, boardedStopIndex + 1);
  const nextStop = stops[nextStopIndex] ?? boardedStop;

  const hasPrevStops = boardedStopIndex > 0;
  const displayedStops = showPrev ? stops : stops.slice(boardedStopIndex);
  const activeTimelineIdx = showPrev ? nextStopIndex : Math.min(displayedStops.length - 1, 1);
  const activeBoardedIdx = showPrev ? boardedStopIndex : 0;

  return (
    <View testID="live-onboard-card" style={[styles.card, { borderBottomColor: colors.border }]}>
      {/* Header bar: tap to expand or collapse route stops */}
      <Pressable
        testID="live-onboard-header"
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.headerPressable}
      >
        <View style={styles.accentStripe} />
        <View style={styles.headerRow}>
          <View style={styles.lineBadgeWrap}>
            <Text style={styles.lineBadgeText}>{line}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text numberOfLines={1} style={[styles.destinationText, { color: colors.text }]}>
              {destination}
            </Text>
            <View style={styles.subtitleRow}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.laBordText}>La bord</Text>
              </View>
              <Text style={[styles.stationText, { color: colors.textMuted }]}> · </Text>
              <Text numberOfLines={1} style={[styles.nextStopHeader, { color: colors.text }]}>
                Următoarea: {nextStop.name}
              </Text>
            </View>
            <Text numberOfLines={1} style={[styles.stationText, { color: colors.textMuted }]}>
              de la {boardedStop?.name ?? initialStation}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {/* Expanded Stops Timeline */}
      {expanded && (
        <View style={styles.timelineWrap}>
          {hasPrevStops && (
            <Pressable onPress={() => setShowPrev((prev) => !prev)} style={styles.togglePrevBtn}>
              <Ionicons name={showPrev ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textMuted} />
              <Text style={[styles.togglePrevText, { color: colors.textMuted }]}>
                {showPrev ? 'Ascunde stațiile anterioare' : 'Show previous stops'}
              </Text>
            </Pressable>
          )}

          <StationTimeline
            stops={displayedStops}
            currentStopIndex={activeTimelineIdx}
            boardedStopIndex={activeBoardedIdx}
            lineColor="#2E7D5B"
          />
        </View>
      )}
    </View>
  );
}
