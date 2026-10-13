import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme';
import type { LineStationStop } from '../../data/lineStations';
import { DetourAlertCard } from './DetourAlertCard';
import { tlStyles } from './timelineStyles';

interface StationTimelineProps {
  stops: LineStationStop[];
  currentStopIndex: number;
  boardedStopIndex?: number;
  lineColor?: string;
}

export function StationTimeline({
  stops,
  currentStopIndex,
  boardedStopIndex = -1,
  lineColor = '#2E7D5B',
}: StationTimelineProps) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === 'dark';

  return (
    <View style={tlStyles.container}>
      {stops.map((stop, index) => {
        const isNext = index === currentStopIndex;
        const isBoarded = index === boardedStopIndex;
        const isPassed = index < currentStopIndex && !isBoarded;
        const isFirst = index === 0;
        const isLast = index === stops.length - 1;

        return (
          <View key={stop.id} style={tlStyles.row}>
            {/* Left Rail Column with continuous track */}
            <View style={tlStyles.railCol}>
              <View
                style={[
                  tlStyles.railLine,
                  { backgroundColor: lineColor },
                  isFirst && tlStyles.railLineFirst,
                  isLast && tlStyles.railLineLast,
                ]}
              />
              {isNext ? (
                <View
                  style={[
                    tlStyles.currentRing,
                    {
                      borderColor: '#16A34A',
                      backgroundColor: isDark ? '#131418' : '#FFFFFF',
                    },
                  ]}
                >
                  <View style={tlStyles.currentInnerDot} />
                </View>
              ) : isBoarded ? (
                <View
                  style={[
                    tlStyles.boardedRing,
                    {
                      borderColor: lineColor,
                      backgroundColor: isDark ? '#131418' : '#FFFFFF',
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    tlStyles.dotNode,
                    !isDark && { borderColor: lineColor, borderWidth: 1 },
                    isPassed && tlStyles.passedDot,
                  ]}
                />
              )}
            </View>

            {/* Right Info Column */}
            <View style={tlStyles.infoCol}>
              <View style={tlStyles.mainRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    tlStyles.name,
                    { color: colors.text },
                    isPassed && { color: colors.textMuted },
                    isNext && { color: isDark ? '#4ADE80' : '#15803D' },
                  ]}
                >
                  {stop.name}
                </Text>
                {stop.scheduledTime && (
                  <Text
                    style={[
                      tlStyles.timeText,
                      { color: colors.text },
                      isPassed && { color: colors.textMuted },
                    ]}
                  >
                    {stop.scheduledTime}
                  </Text>
                )}
              </View>

              <View style={tlStyles.statusRow}>
                {isNext ? (
                  <View style={tlStyles.nextBadgeRow}>
                    <View style={tlStyles.nextBadge}>
                      <Ionicons name="radio" size={11} color="#FFFFFF" />
                      <Text style={tlStyles.nextBadgeText}>Următoarea stație</Text>
                    </View>
                    <Text style={tlStyles.nextEtaText}>în ~2 min</Text>
                  </View>
                ) : isBoarded ? (
                  <View style={tlStyles.boardedBadgeRow}>
                    <View style={tlStyles.boardedBadge}>
                      <Text style={tlStyles.boardedBadgeText}>Urcat aici</Text>
                    </View>
                    <Text style={[tlStyles.statusText, { color: colors.textMuted }]}>Scheduled</Text>
                  </View>
                ) : (
                  <>
                    <Text style={[tlStyles.statusText, { color: colors.textMuted }]}>Scheduled</Text>
                    <Ionicons name="people" size={12} color={colors.textMuted} />
                  </>
                )}
              </View>

              {stop.alert && <DetourAlertCard alert={stop.alert} />}

              {!isLast && <View style={[tlStyles.divider, { backgroundColor: colors.border }]} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}
