import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useRideStore } from '../../src/features/ride';
import {
  LiveOnboardCard,
  RecentTrips,
  TripStatementModal,
  TripsHeader,
  TripsMonthHeader,
  useTrips,
  useTripsFilter,
} from '../../src/features/trips';
import { Screen } from '../../src/ui';

export default function TripsTab() {
  const router = useRouter();
  const { recentTrips } = useTrips();
  const activeRide = useRideStore((s) => s.activeRide);
  const filter = useTripsFilter(recentTrips);

  return (
    <Screen scroll contentPaddingHorizontal={0} contentGap={0}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
        <TripsHeader onNotifications={() => router.push('/notifications')} />
      </View>
      {activeRide && (!activeRide.expiresAtMs || activeRide.expiresAtMs > Date.now()) ? <LiveOnboardCard ride={activeRide} /> : null}
      <TripsMonthHeader
        months={filter.monthOptions}
        selectedMonth={filter.selectedMonth}
        onSelectMonth={filter.setSelectedMonth}
        tripCount={filter.filteredTrips.length}
        totalFareRon={filter.totalFare}
        onOpenStatement={() => filter.setStatementOpen(true)}
      />
      <RecentTrips trips={filter.filteredTrips} onRepeat={() => router.push('/plan')} />
      <TripStatementModal
        visible={filter.statementOpen}
        monthName={filter.selectedMonthName}
        trips={filter.filteredTrips}
        onClose={() => filter.setStatementOpen(false)}
      />
    </Screen>
  );
}
