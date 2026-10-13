import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocale, t } from '../../../../core/i18n';
import { fontSizes, fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { LineBadge } from '../../../../ui';
import type { TransitLeg, TransitOption } from '../../../../features/planner';

interface RouteOptionRowProps {
  option: TransitOption;
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
 * Google Maps (phone) style itinerary row: large duration, fare on the right,
 * and a compact walk › line › walk timeline underneath. Tapping highlights
 * the route on the map — the app only displays routes, it never navigates.
 */
export function RouteOptionRow({ option, index: _index, selected, onPress }: RouteOptionRowProps) {
  const { colors, isDark } = useTheme();

  const cardBg = selected
    ? (isDark ? '#1E293B' : '#EFF6FF')
    : (isDark ? '#202124' : '#FFFFFF');

  const cardBorder = selected
    ? (isDark ? '#334155' : '#BFDBFE')
    : (isDark ? '#3C4043' : '#E5E7EB');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${option.totalMin} min, ${fare(option.fareRon)}, ${option.legs.map(legText).join(', ')}`}
      onPress={onPress}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: 1,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.duration, { color: colors.text }]}>
          {option.totalMin} {t('common.min')}
        </Text>
        <Text style={[styles.price, { color: colors.textMuted }]}>{fare(option.fareRon)}</Text>
      </View>

      <View style={styles.timelineRow}>
        {option.legs.map((leg, legIdx) => {
          const isWalk = leg.kind === 'walk';
          const isLast = legIdx === option.legs.length - 1;
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
                  <LineBadge shortName={leg.line ?? option.line} size="sm" />
                  <Text style={[styles.rideMinText, { color: colors.text }]}>
                    {leg.minutes} {t('common.min')}
                  </Text>
                  {leg.headsign ? (
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  duration: { fontSize: 20, fontWeight: fontWeights.bold, letterSpacing: -0.4 },
  price: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold },
  timelineRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3 },
  legCluster: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  walkStep: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  walkText: { fontSize: 13, fontWeight: fontWeights.medium },
  rideStep: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  rideMinText: { fontSize: 13, fontWeight: fontWeights.semiBold },
  rideDirText: { fontSize: 12, fontWeight: fontWeights.medium, maxWidth: 100 },
  arrowIcon: { opacity: 0.55 },
});
