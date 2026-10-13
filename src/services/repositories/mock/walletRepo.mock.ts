import { seedCharges, seedDailyCap, seedWalletItems } from './seed';
import type { CreateChargeInput, UpdateChargeInput, WalletRepo } from '../types';
import type { Charge, NewCardInput, NewPassInput, WalletItem } from '../../api/schemas/wallet';

let counter = 100;

function tokenFor(id: string): string {
  return `tok_mock_${id}`;
}

/** In-memory wallet: PANs never enter here, only last4 + processor tokens. */
export function createWalletRepoMock(): WalletRepo {
  const items: WalletItem[] = [...seedWalletItems];
  const charges: Charge[] = [...seedCharges];
  let defaultId: string | null = items[0]?.id ?? null;

  return {
    getDailyCap: async () => seedDailyCap,
    listItems: async () => items,
    addCard: async (input: NewCardInput) => {
      counter += 1;
      const id = `card-${counter}`;
      const item: WalletItem = { kind: 'card', id, ...input, token: tokenFor(id) };
      items.push(item);
      defaultId ??= id;
      return item;
    },
    addPass: async (input: NewPassInput) => {
      counter += 1;
      const id = `pass-${counter}`;
      const item: WalletItem = { kind: 'pass', id, ...input, validFrom: new Date().toISOString().slice(0, 10) };
      items.push(item);
      return item;
    },
    removeItem: async (id: string) => {
      const index = items.findIndex((i) => i.id === id);
      if (index >= 0) items.splice(index, 1);
      if (defaultId === id) defaultId = items.find((i) => i.kind === 'card')?.id ?? null;
    },
    setDefaultSource: async (id: string) => {
      if (!items.some((i) => i.id === id)) throw new Error(`Wallet item ${id} not found`);
      defaultId = id;
    },
    renewPass: async (id: string, days = 30) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.kind !== 'pass') throw new Error(`Pass ${id} not found`);
      const curr = new Date(item.validUntil);
      const base = isNaN(curr.getTime()) || curr < new Date() ? new Date() : curr;
      const next = new Date(base.getTime() + days * 86_400_000);
      item.validUntil = next.toISOString().slice(0, 10);
      return item;
    },
    listCharges: async () => charges,
    createCharge: async (input: CreateChargeInput) => {
      counter += 1;
      const id = `ch-${counter}`;
      const charge: Charge = {
        id,
        ...input,
        currency: 'RON',
        startedAt: new Date().toISOString(),
        qrToken: `qr_mock_${id}`,
      };
      charges.unshift(charge);
      return charge;
    },
    updateCharge: async (id: string, patch: UpdateChargeInput) => {
      const found = charges.find((c) => c.id === id);
      if (!found) throw new Error(`Charge ${id} not found`);
      const updated = { ...found, ...patch };
      charges.splice(charges.indexOf(found), 1, updated);
      return updated;
    },
  };
}
