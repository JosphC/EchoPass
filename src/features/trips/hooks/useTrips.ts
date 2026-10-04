import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../../../services/providers';

const repos = getRepositories();

export function useTrips() {
  const saved = useQuery({ queryKey: ['trips', 'saved'], queryFn: () => repos.trip.getSavedRoutes() });
  const recent = useQuery({ queryKey: ['trips', 'recent'], queryFn: () => repos.trip.getRecentTrips() });

  return {
    savedRoutes: saved.data ?? [],
    recentTrips: recent.data ?? [],
    isLoading: saved.isLoading || recent.isLoading,
  };
}
