import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, spacing } from '../../../core/theme';
import { lineColor } from '../../../core/theme/lineColors';
import { useTheme } from '../../../core/theme/useTheme';
import { formatTransitTime } from '../../../core/utils/timezone';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { LineBadge } from '../../../ui';
import type { TransitLeg } from '../transit';

interface StepsListProps {
  legs: TransitLeg[];
  /** Trip start; ride legs carry their own scheduled boarding time. */
  startMs: number;
}

/** Start/end time of every leg: rides leave at their scheduled time, walks right away. */
export function legTimes(legs: TransitLeg[], startMs: number): { from: number; to: number }[] {
  let cursor = startMs;
  return legs.map((leg) => {
    const from = leg.kind === 'ride' && leg.departMs ? leg.departMs : cursor;
    cursor = from + leg.minutes * 60_000;
    return { from, to: cursor };
  });
}

function Node({ name, timeMs }: { name: string; timeMs: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: colors.text }]}>{formatTransitTime(timeMs)}</Text>
      <View style={styles.rail}>
        <View style={[styles.node, { borderColor: colors.text, backgroundColor: colors.card }]} />
      </View>
      <Text numberOfLines={2} style={[styles.place, { color: colors.text }]}>
        {name}
      </Text>
    </View>
  );
}

function Leg({ leg }: { leg: TransitLeg }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const via = leg.via ?? [];
  const route = leg.line ? findRoute(leg.line) : null;
  const color = route?.color ?? lineColor(leg.line ?? '');
  const isWalk = leg.kind === 'walk';
  return (
    <View style={styles.row}>
      <View style={styles.time} />
      <View style={styles.rail}>
        {isWalk ? (
          [0, 1, 2, 3].map((i) => <View key={i} style={[styles.walkDot, { backgroundColor: colors.textMuted }]} />)
        ) : (
          <View style={[styles.line, { backgroundColor: color }]} />
        )}
      </View>
      <View style={styles.legBody}>
        {isWalk ? (
          <View style={styles.inline}>
            <Ionicons name="walk" size={16} color={colors.textMuted} />
            <Text style={[styles.detail, { color: colors.textMuted }]}>
              {t('plan.walk')} · {Math.max(1, leg.minutes)} {t('common.min')}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.inline}>
              <LineBadge
                shortName={leg.line ?? ''}
                color={route?.color ?? undefined}
                textColor={route?.textColor ?? undefined}
              />
              {leg.headsign ? (
                <Text numberOfLines={1} style={[styles.headsign, { color: colors.text }]}>
                  {t('plan.towards')} {leg.headsign}
                </Text>
              ) : null}
            </View>
            {/* Google Maps: "12 min · 6 stații", tap to unfold the stops passed on the way. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('plan.showStops')}
              accessibilityState={{ expanded: open }}
              disabled={via.length === 0}
              hitSlop={8}
              onPress={() => setOpen((v) => !v)}
              style={styles.inline}
            >
              <Text style={[styles.detail, { color: colors.textMuted }]}>
                {leg.minutes} {t('common.min')} · {via.length + 1} {t('plan.stopsCount')}
              </Text>
              {via.length > 0 ? (
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
              ) : null}
            </Pressable>
            {open
              ? via.map((s) => (
                  <Text key={s.id} numberOfLines={1} style={[styles.viaStop, { color: colors.textMuted }]}>
                    {s.name}
                  </Text>
                ))
              : null}
          </>
        )}
      </View>
    </View>
  );
}

/** Google-Maps-style vertical itinerary: times on the left, colored line rail, stops to unfold. */
export function StepsList({ legs, startMs }: StepsListProps) {
  const times = legTimes(legs, startMs);
  return (
    <View style={styles.root}>
      {legs.map((leg, i) => (
        <View key={`${leg.kind}-${i}`}>
          <Node name={leg.fromName} timeMs={times[i].from} />
          <Leg leg={leg} />
          {i === legs.length - 1 ? <Node name={leg.toName} timeMs={times[i].to} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch', minHeight: 28 },
  time: { width: 48, fontSize: 13, fontWeight: fontWeights.semiBold, paddingTop: 4 },
  rail: { width: 24, alignItems: 'center', justifyContent: 'space-evenly' },
  node: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 6 },
  line: { width: 6, flex: 1, borderRadius: 3 },
  walkDot: { width: 4, height: 4, borderRadius: 2 },
  place: { flex: 1, fontSize: 15, fontWeight: fontWeights.bold, paddingTop: 3 },
  legBody: { flex: 1, gap: 4, paddingVertical: spacing.sm },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headsign: { flex: 1, fontSize: 14, fontWeight: fontWeights.medium },
  detail: { fontSize: 13 },
  viaStop: { fontSize: 13, paddingLeft: 4 },
});
