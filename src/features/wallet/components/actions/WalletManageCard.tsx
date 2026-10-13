import type { WalletItem } from '../../types';
import { PassManageCard } from './PassManageCard';

interface WalletManageCardProps {
  item: WalletItem | null;
  balanceRon?: number;
  spentRon?: number;
  limitRon?: number;
  onOpenTopUp?: () => void;
  onQuickTopUp?: (amount: number) => void;
  onOpenRenew: () => void;
}

/**
 * Renders contextual management card.
 * When the active item is a pass, displays PassManageCard.
 * When paying with a bank card, payments are charged directly to the bank card,
 * so no wallet balance / top-up card is rendered.
 */
export function WalletManageCard({
  item,
  onOpenRenew,
}: WalletManageCardProps) {
  if (item?.kind === 'pass') {
    return <PassManageCard item={item} onOpenRenew={onOpenRenew} />;
  }

  return null;
}
