import type { CreateChargeInput, UpdateChargeInput, WalletRepo } from '../types';
import type { NewCardInput, NewPassInput } from '../../api/schemas/wallet';

function todo(repo: string): never {
  throw new Error(`${repo} real repository not implemented (Phase 10 backend).`);
}

/** Real wallet: PAN tokenization happens server-side; the app sends the PAN once over TLS. */
export function createWalletRepoReal(): WalletRepo {
  return {
    getDailyCap: async () => todo('Wallet'),
    listItems: async () => todo('Wallet'),
    addCard: async (_input: NewCardInput) => todo('Wallet'),
    addPass: async (_input: NewPassInput) => todo('Wallet'),
    removeItem: async () => todo('Wallet'),
    setDefaultSource: async () => todo('Wallet'),
    renewPass: async (_id: string, _days?: number) => todo('Wallet'),
    listCharges: async () => todo('Wallet'),
    createCharge: async (_input: CreateChargeInput) => todo('Wallet'),
    updateCharge: async (_id: string, _patch: UpdateChargeInput) => todo('Wallet'),
  };
}
