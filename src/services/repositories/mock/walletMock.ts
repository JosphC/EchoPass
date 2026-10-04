import { seedCharges, seedDailyCap, seedPass, seedPaymentMethod } from './seed';
import type { WalletRepo } from '../types';

export function createWalletMock(): WalletRepo {
  return {
    getPass: async () => seedPass,
    getPaymentMethod: async () => seedPaymentMethod,
    getDailyCap: async () => seedDailyCap,
    getCharges: async () => seedCharges,
  };
}
