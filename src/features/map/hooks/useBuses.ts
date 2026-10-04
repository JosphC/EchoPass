import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../../../services/providers';

const repos = getRepositories();

export function useBuses() {
  const buses = useQuery({ queryKey: ['buses'], queryFn: () => repos.bus.getBuses() });
  const delayed = (buses.data ?? []).filter((b) => b.delayMin > 0);

  return {
    buses: buses.data ?? [],
    delayed,
    isLoading: buses.isLoading,
  };
}
