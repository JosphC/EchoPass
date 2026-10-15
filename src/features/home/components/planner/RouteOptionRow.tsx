import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocale, t } from '../../../../core/i18n';
import { fontSizes, fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatTransitTime } from '../../../../core/utils/timezone';
import { findRoute } from '../../../../services/repositories/gtfs/timetable';
import { LineBadge } from '../../../../ui';
import type { TransitLeg, TransitOption } from '../../../../features/planner';

interface RouteOptionRowProps {
  option: TransitOption;
  /** Alternative lines on the same stops, shown as extra badges. */
  altLines?: string[];
  index: number;
  selected: boolean;
  onPress: () => void;
}

function fare(fareRon: number): string {
  const fixed = fareRon.toFixed(2);
  return `${getLocale() === 'ro' ? fixed.replace('.', ',') : fixed} lei`;
}

function legText(leg: TransitLeg): string {
  const min = t('common.min');
  if (leg.kind === 'walk') return `${t('plan.walk')} ${leg.minutes} ${min} (${leg.toName})`;
  const dir = leg.headsign ? ` spre ${leg.headsign}` : '';
  return `${t('plan.line')} ${leg.line}${dir} · ${leg.minutes} ${min}`;
}

/**
 * Google Maps (phone) style itinerary row: "21:05 – 21:32" with the duration
 * on the right, a walk › line › walk timeline in official line colors, and
 * the boarding stop + fare underneath. Tapping highlights the route on the
 * map — the app only displays routes, it never navigates.
 */
export function RouteOptionRow({ option, altLines = [], index: _index, selected, onPress }: RouteOptionRowProps) {
  const { colors } = useTheme();
  // planTransit plans from "now", so the trip spans now → now + total.
  const startMs = Date.now();
  const span = `${formatTransitTime(startMs)} – ${formatTransitTime(startMs + option.totalMin * 60_000)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${span}, ${option.totalMin} min, ${fare(option.fareRon)}, ${option.legs.map(legText).join(', ')}${
        altLines.length > 0 ? `, ${t('plan.alsoLines')} ${altLines.join(', ')}` : ''
      }`}
      onPress={onPress}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.primarySoft : colors.card,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.span, { color: colors.text }]}>{span}</Text>
        <Text style={[styles.duration, { color: colors.text }]}>
          {option.totalMin} {t('common.min')}
        </Text>
      </View>

      <View style={styles.timelineRow}>
        {option.legs.map((leg, legIdx) => {
          const isWalk = leg.kind === 'walk';
          const isLast = legIdx === option.legs.length - 1;
          const route = isWalk ? null : findRoute(leg.line ?? option.line);
          return (
            <View key={legIdx} style={styles.legCluster}>
              {isWalk ? (
                <View style={styles.walkStep}>
                  <Ionicons name="walk" size={14} color={colors.textMuted} />
                  <Text style={[styles.walkText, { color: colors.textMuted }]}>
                    {Math.max(1, leg.minutes)} {t('common.min')}
                  </Text>
                </View>
              ) : (
                <View style={styles.rideStep}>
                  <LineBadge
                    shortName={leg.line ?? option.line}
                    color={route?.color ?? undefined}
                    textColor={route?.textColor ?? undefined}
                    size="sm"
                  />
                  {altLines.map((alt) => {
                    const altRoute = findRoute(alt);
                    return (
                      <LineBadge
                        key={alt}
                        shortName={alt}
                        color={altRoute?.color ?? undefined}
                        textColor={altRoute?.textColor ?? undefined}
                        size="sm"
                      />
                    );
                  })}
                  <Text style={[styles.rideMinText, { color: colors.text }]}>
                    {leg.minutes} {t('common.min')}
                  </Text>
                  {leg.headsign && altLines.length === 0 ? (
                    <Text numberOfLines={1} style={[styles.rideDirText, { color: colors.textMuted }]}>
                      spre {leg.headsign}
                    </Text>
                  ) : null}
                </View>
              )}
              {!isLast && <Ionicons name="chevron-forward" size={11} color={colors.textMuted} style={styles.arrowIcon} />}
            </View>
          );
        })}
      </View>
      <Text numberOfLines={1} style={[styles.footer, { color: colors.textMuted }]}>
        {t('plan.fromStop')} {option.boardStation.name} · {fare(option.fareRon)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  span: { fontSize: 18, fontWeight: fontWeights.bold, letterSpacing: -0.3 },
  duration: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold },
  timelineRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3 },
  legCluster: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  walkStep: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  walkText: { fontSize: 13, fontWeight: fontWeights.medium },
  rideStep: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  rideMinText: { fontSize: 13, fontWeight: fontWeights.semiBold },
  rideDirText: { fontSize: 12, fontWeight: fontWeights.medium, maxWidth: 170 },
  arrowIcon: { opacity: 0.55 },
  footer: { fontSize: 12.5 },
});
