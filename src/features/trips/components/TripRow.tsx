import { Ionicons } from '@expo/vector-icons';
import { formatRon } from '../../../core/utils/format';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { t } from '../../../core/i18n';
import { useTheme } from '../../../core/theme/useTheme';
import { ListItem } from '../../../ui';

interface TripRowProps {
  trip: RecentTrip;
}

export function TripRow({ trip }: TripRowProps) {
  const { colors } = useTheme();

  return (
    <ListItem
      icon={<Ionicons name="bus-outline" size={22} color={colors.primary} />}
      title={`${trip.from} → ${trip.to}`}
      subtitle={`${trip.distanceKm} ${t('trips.km')} · ${trip.durationMin} ${t('trips.mins')} · ${formatRon(trip.fareRon)}`}
      onPress={() => undefined}
    />
  );
}
