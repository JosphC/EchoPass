import { useMemo, useState } from 'react';
import type { RecentTrip } from '../../../services/api/schemas/trip';
import { getMonthName, getRecentMonthOptions } from '../data/monthOptions';

export function useTripsFilter(recentTrips: RecentTrip[]) {
  const monthOptions = useMemo(() => getRecentMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.key ?? '');
  const [statementOpen, setStatementOpen] = useState(false);

  const filteredTrips = useMemo(
    () => recentTrips.filter((trip) => trip.date.startsWith(selectedMonth)),
    [recentTrips, selectedMonth],
  );

  const totalFare = useMemo(
    () => filteredTrips.reduce((sum, trip) => sum + trip.fareRon, 0),
    [filteredTrips],
  );

  const selectedMonthName = useMemo(() => getMonthName(selectedMonth), [selectedMonth]);

  return {
    monthOptions,
    selectedMonth,
    setSelectedMonth,
    statementOpen,
    setStatementOpen,
    filteredTrips,
    totalFare,
    selectedMonthName,
  };
}
