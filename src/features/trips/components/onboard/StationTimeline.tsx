import { Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
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

/** "3:10 PM" (mock data) → "15:10": the app shows 24-hour times everywhere. */
function to24h(raw: string): string {
  const m = raw.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return raw;
  let h = parseInt(m[1] ?? '0', 10);
  if (m[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
  if (m[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

export function StationTimeline({ stops, currentStopIndex, boardedStopIndex = -1, lineColor }: StationTimelineProps) {
  const { colors } = useTheme();
  const rail = lineColor ?? colors.primary;

  return (
    <View style={tlStyles.container}>
      {stops.map((stop, index) => {
        const isNext = index === currentStopIndex;
        const isBoarded = index === boardedStopIndex;
        const isPassed = index < currentStopIndex && !isBoarded;
        const isFirst = index === 0;
        const isLast = index === stops.length - 1;
        const muted = isPassed ? colors.textMuted : colors.text;

        return (
          <View key={stop.id} style={tlStyles.row}>
            <View style={tlStyles.railCol}>
              <View
                style={[
                  tlStyles.railLine,
                  { backgroundColor: rail },
                  isFirst && tlStyles.railLineFirst,
                  isLast && tlStyles.railLineLast,
                ]}
              />
              <View
                style={[
                  isNext || isBoarded ? tlStyles.bigNode : tlStyles.dotNode,
                  { borderColor: isPassed ? colors.border : rail, backgroundColor: colors.card },
                ]}
              />
            </View>

            <View style={tlStyles.infoCol}>
              <View style={tlStyles.mainRow}>
                <Text
                  numberOfLines={1}
                  style={[tlStyles.name, (isNext || isBoarded) && tlStyles.nameStrong, { color: muted }]}
                >
                  {stop.name}
                </Text>
                {stop.scheduledTime ? (
                  <Text style={[tlStyles.timeText, { color: isNext ? colors.text : colors.textMuted }]}>
                    {to24h(stop.scheduledTime)}
                  </Text>
                ) : null}
              </View>

              {isNext ? (
                <Text style={[tlStyles.statusText, { color: colors.text }]}>
                  {t('ride.nextStop')} · {t('ride.nextEta')}
                </Text>
              ) : isBoarded ? (
                <Text style={[tlStyles.statusText, { color: colors.textMuted }]}>
                  {t('ride.boardedHere')} · {t('home.tripScheduled')}
                </Text>
              ) : null}

              {stop.alert && <DetourAlertCard alert={stop.alert} />}
            </View>
          </View>
        );
      })}
    </View>
  );
}
