import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../../../services/providers';

const repos = getRepositories();

export function useWallet() {
  const pass = useQuery({ queryKey: ['wallet', 'pass'], queryFn: () => repos.wallet.getPass() });
  const method = useQuery({ queryKey: ['wallet', 'method'], queryFn: () => repos.wallet.getPaymentMethod() });
  const cap = useQuery({ queryKey: ['wallet', 'cap'], queryFn: () => repos.wallet.getDailyCap() });
  const charges = useQuery({ queryKey: ['wallet', 'charges'], queryFn: () => repos.wallet.getCharges() });

  return {
    pass: pass.data,
    paymentMethod: method.data,
    cap: cap.data,
    charges: charges.data ?? [],
    isLoading: pass.isLoading || method.isLoading || cap.isLoading || charges.isLoading,
  };
}
