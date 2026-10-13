import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { NewCardInput, NewPassInput } from '../../../services/api/schemas/wallet';
import { getRepositories } from '../../../services/providers';
import { useWalletStore } from '../walletStore';

const repos = getRepositories();

export function useWalletItems() {
  const client = useQueryClient();
  const items = useQuery({ queryKey: ['wallet', 'items'], queryFn: () => repos.wallet.listItems() });
  const setStored = useWalletStore((s) => s.setItems);
  const defaultSourceId = useWalletStore((s) => s.defaultSourceId);
  const setDefaultSourceId = useWalletStore((s) => s.setDefaultSourceId);
  const removeStored = useWalletStore((s) => s.removeItem);

  useEffect(() => {
    if (items.data) setStored(items.data);
  }, [items.data, setStored]);

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['wallet', 'items'] });
  };

  const addCard = useMutation({
    mutationFn: (input: NewCardInput) => repos.wallet.addCard(input),
    onSuccess: invalidate,
  });
  const addPass = useMutation({
    mutationFn: (input: NewPassInput) => repos.wallet.addPass(input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => repos.wallet.removeItem(id),
    onSuccess: (_, id) => {
      removeStored(id);
      invalidate();
    },
  });
  const setDefault = useMutation({
    mutationFn: (id: string) => repos.wallet.setDefaultSource(id),
    onSuccess: (_, id) => {
      setDefaultSourceId(id);
      invalidate();
    },
  });
  const renewPass = useMutation({
    mutationFn: ({ id, days }: { id: string; days?: number }) => repos.wallet.renewPass(id, days),
    onSuccess: (_, { id, days }) => {
      useWalletStore.getState().renewPass(id, days);
      invalidate();
    },
  });

  return {
    items: useWalletStore((s) => s.items),
    defaultSourceId,
    balanceRon: useWalletStore((s) => s.balanceRon),
    isLoading: items.isLoading,
    addCard: addCard.mutateAsync,
    addPass: addPass.mutateAsync,
    removeItem: remove.mutateAsync,
    setDefault: setDefault.mutateAsync,
    renewPass: renewPass.mutateAsync,
    topUpBalance: useWalletStore((s) => s.topUpBalance),
  };
}
