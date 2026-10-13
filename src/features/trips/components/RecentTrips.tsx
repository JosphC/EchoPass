import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../../core/i18n';
import { fontWeights } from '../../../core/theme';
import { formatDayMonth } from '../../../core/utils/format';
import { useTheme } from '../../../core/theme/useTheme';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { TripRow } from './TripRow';

interface RecentTripsProps {
  trips: RecentTrip[];
  onRepeat?: () => void;
  nowMs?: number;
}

function dayKey(nowMs: number, offsetDays: number): string {
  return new Date(nowMs - offsetDays * 86_400_000).toISOString().slice(0, 10);
}

function groupLabel(date: string, nowMs: number): string {
  if (date === dayKey(nowMs, 0)) return t('trips.today');
  if (date === dayKey(nowMs, 1)) return t('trips.yesterday');
  return formatDayMonth(date);
}

interface TripGroup {
  label: string;
  trips: RecentTrip[];
}

/** Recent trips grouped by day: Azi / Ieri / 5 oct. */
export function RecentTrips({ trips, onRepeat, nowMs = Date.now() }: RecentTripsProps) {
  const { colors, isDark } = useTheme();
  const groups: TripGroup[] = useMemo(() => {
    const ordered = [...trips].sort((a, b) => (a.date < b.date ? 1 : -1));
    const out: TripGroup[] = [];
    for (const trip of ordered) {
      const label = groupLabel(trip.date, nowMs);
      const last = out[out.length - 1];
      if (last && last.label === label) last.trips.push(trip);
      else out.push({ label, trips: [trip] });
    }
    return out;
  }, [trips, nowMs]);

  if (trips.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? '#303134' : '#F1F5F9' }]}>
          <Ionicons name="receipt-outline" size={26} color={colors.textMuted} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('trips.empty')}</Text>
        <Text style={[styles.emptySub, { color: colors.textMuted }]}>
          Nu ai călătorii înregistrate în această perioadă.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {groups.map((group) => (
        <View key={group.label} style={styles.groupSection}>
          <View style={styles.dateBanner}>
            <Text style={[styles.heading, { color: colors.textMuted }]}>{group.label}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {group.trips.map((trip, idx) => (
              <View key={trip.id}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <TripRow trip={trip} onRepeat={onRepeat} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 20,
  },
  groupSection: {
    marginBottom: 8,
  },
  dateBanner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 12.5,
    fontWeight: fontWeights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: fontWeights.semiBold,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
});

