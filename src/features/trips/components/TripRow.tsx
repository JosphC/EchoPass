import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { getLocale, t } from '../../../core/i18n';
import { fontWeights } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { LineBadge, ModeIcon } from '../../../ui';

interface TripRowProps {
  trip: RecentTrip;
  onRepeat?: () => void;
}

function num(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  return getLocale() === 'ro' ? fixed.replace('.', ',') : fixed;
}

export function TripRow({ trip }: TripRowProps) {
  const { colors } = useTheme();
  const route = trip.line ? findRoute(trip.line) : null;
  const meta = `${trip.time ? `${trip.time} · ` : ''}${num(trip.distanceKm, 1)} ${t('trips.km')} · ${trip.durationMin} ${t('trips.mins')}`;

  return (
    <View style={styles.row}>
      <View style={styles.badgeWrap}>
        <ModeIcon mode={route?.mode} size={18} color={colors.text} />
        {trip.line ? (
          <LineBadge
            shortName={trip.line}
            color={route?.color ?? undefined}
            textColor={route?.textColor ?? undefined}
            size="sm"
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: colors.primary }]}>
            <Ionicons name="bus-outline" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.route, { color: colors.text }]}>
          {trip.from} → {trip.to}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{meta}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.price, { color: colors.text }]}>{num(trip.fareRon, 2)} lei</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fallback: {
    width: 28,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  route: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
  },
  meta: {
    fontSize: 12.5,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
  },
});

