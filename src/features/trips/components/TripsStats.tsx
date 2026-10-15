import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { RecentTrip } from '../../../services/api/schemas/trip';

/** Single-ride paper ticket, used as the "with tickets" cost baseline. */
const TICKET_FARE_RON = 4;

interface TripsStatsProps {
  trips: RecentTrip[];
  nowMs?: number;
}

function monthKey(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 7);
}

export function TripsStats({ trips, nowMs = Date.now() }: TripsStatsProps) {
  const { colors } = useTheme();
  const key = monthKey(nowMs);
  const monthTrips = trips.filter((trip) => trip.date.slice(0, 7) === key);
  const count = monthTrips.length;
  const spent = monthTrips.reduce((sum, trip) => sum + trip.fareRon, 0);
  const tickets = count * TICKET_FARE_RON;

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('trips.thisMonth')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{count}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{t('trips.tripsLabel')}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('trips.spent')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{spent} lei</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {t('trips.vsA')} {tickets} {t('trips.vsB')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 2,
  },
  label: {
    fontSize: fontSizes.sm,
  },
  value: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  sub: {
    fontSize: fontSizes.sm,
  },
});
