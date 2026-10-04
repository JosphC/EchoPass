import { StyleSheet, View } from 'react-native';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { TripRow } from './TripRow';

interface RecentTripsProps {
  trips: RecentTrip[];
}

export function RecentTrips({ trips }: RecentTripsProps) {
  return (
    <View style={styles.root}>
      {trips.map((trip) => (
        <TripRow key={trip.id} trip={trip} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
