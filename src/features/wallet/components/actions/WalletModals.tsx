import { BottomSheet, Toast } from '../../../../ui';
import type { NewCardInput, NewPassInput, WalletItem } from '../../types';
import { AddCardForm } from '../forms/AddCardForm';
import { AddItemSheet } from '../forms/AddItemSheet';
import { AddPassForm } from '../forms/AddPassForm';
import { InspectorGreenModal } from '../InspectorGreenModal';
import { RenewPassSheet } from './RenewPassSheet';
import { TopUpSheet } from './TopUpSheet';

interface WalletModalsProps {
  sheet: 'none' | 'pick' | 'card' | 'pass';
  onCloseSheet: () => void;
  onPickCard: () => void;
  onPickPass: () => void;
  onAddCard: (input: NewCardInput) => Promise<unknown>;
  onAddPass: (input: NewPassInput) => Promise<unknown>;
  toastMsg: string | null;
  topUpOpen: boolean;
  balanceRon: number;
  activeCardName: string;
  onCloseTopUp: () => void;
  onTopUp: (amount: number) => void;
  renewOpen: boolean;
  passItem: Extract<WalletItem, { kind: 'pass' }> | null;
  onCloseRenew: () => void;
  onRenew: (days: number) => void;
  inspectorOpen: boolean;
  onCloseInspector: () => void;
  activeTicketInfo?: {
    line: string;
    passengers: number;
    station: string;
    boardedAt: string;
    token?: string;
  } | null;
}

export function WalletModals(props: WalletModalsProps) {
  return (
    <>
      <AddItemSheet visible={props.sheet === 'pick'} onClose={props.onCloseSheet} onPickCard={props.onPickCard} onPickPass={props.onPickPass} />
      <BottomSheet visible={props.sheet === 'card' || props.sheet === 'pass'} onClose={props.onCloseSheet}>
        {props.sheet === 'card' ? <AddCardForm onSubmit={props.onAddCard} onDone={props.onCloseSheet} /> : <AddPassForm onSubmit={props.onAddPass} onDone={props.onCloseSheet} />}
      </BottomSheet>
      <TopUpSheet visible={props.topUpOpen} balanceRon={props.balanceRon} activeCardName={props.activeCardName} onClose={props.onCloseTopUp} onTopUp={props.onTopUp} />
      <RenewPassSheet visible={props.renewOpen} passItem={props.passItem} onClose={props.onCloseRenew} onRenew={props.onRenew} />
      <InspectorGreenModal
        visible={props.inspectorOpen}
        line={props.activeTicketInfo?.line ?? (props.passItem?.lines === 'all' ? 'Toate' : '15')}
        busNumber="3114"
        station={props.activeTicketInfo?.station ?? 'Piața Mărăști'}
        boardedAt={props.activeTicketInfo?.boardedAt ?? '18:24'}
        passengers={props.activeTicketInfo?.passengers ?? 1}
        token={props.activeTicketInfo?.token}
        onClose={props.onCloseInspector}
      />
      {props.toastMsg ? <Toast message={props.toastMsg} tone="success" /> : null}
    </>
  );
}
