import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateChargeInput, UpdateChargeInput } from '../../../services/repositories/types';
import { getRepositories } from '../../../services/providers';

const repos = getRepositories();

export function useCharges() {
  const client = useQueryClient();
  const charges = useQuery({ queryKey: ['wallet', 'charges'], queryFn: () => repos.wallet.listCharges() });
  const cap = useQuery({ queryKey: ['wallet', 'cap'], queryFn: () => repos.wallet.getDailyCap() });

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['wallet', 'charges'] });
    void client.invalidateQueries({ queryKey: ['wallet', 'cap'] });
  };

  const create = useMutation({
    mutationFn: (input: CreateChargeInput) => repos.wallet.createCharge(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateChargeInput }) => repos.wallet.updateCharge(id, patch),
    onSuccess: invalidate,
  });

  return {
    charges: charges.data ?? [],
    cap: cap.data,
    isLoading: charges.isLoading || cap.isLoading,
    createCharge: create.mutateAsync,
    updateCharge: update.mutateAsync,
  };
}
