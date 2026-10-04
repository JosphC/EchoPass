import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { formatRon } from '../../../core/utils/format';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface RecentTripsSectionProps {
  trips: RecentTrip[];
}

export function RecentTripsSection({ trips }: RecentTripsSectionProps) {
  const { colors } = useTheme();
  if (trips.length === 0) return null;

  return (
    <View>
      <Text style={[styles.heading, { color: colors.text }]}>{t('home.recentTrips')}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {trips.map((trip, i) => (
          <View
            key={trip.id}
            style={[styles.row, i < trips.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
          >
            <Ionicons name="bus-outline" size={24} color={colors.primary} />
            <View style={styles.info}>
              <Text style={[styles.route, { color: colors.text }]}>
                {trip.from} → {trip.to}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {trip.date} · {formatRon(trip.fareRon)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: spacing.md,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 64,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  route: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  meta: {
    fontSize: fontSizes.sm,
  },
});
