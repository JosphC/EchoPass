import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { t } from '../../../core/i18n';
import { Screen, ScreenHeader } from '../../../ui';
import { ActiveRideCard } from './ActiveRideCard';
import { CardStack } from './cards/CardStack';
import { WalletManageCard } from './actions/WalletManageCard';
import { WalletModals } from './actions/WalletModals';
import { useRideStore } from '../../ride';
import { useCharges } from '../hooks/useCharges';
import { useWalletItems } from '../hooks/useWalletItems';
import type { WalletItem } from '../types';

export function WalletScreen() {
  const liveRide = useRideStore((s) => s.activeRide);
  const activeTicket = useRideStore((s) => s.activeTicket);
  const clearRide = useRideStore((s) => s.clearRide);
  const {
    items,
    defaultSourceId,
    balanceRon,
    isLoading,
    addCard,
    addPass,
    setDefault,
    renewPass,
    topUpBalance,
  } = useWalletItems();
  const { cap } = useCharges();

  const [frontId, setFrontId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'none' | 'pick' | 'card' | 'pass'>('none');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeItem = items.find((i) => i.id === (frontId ?? defaultSourceId)) ?? items[0] ?? null;
  const passItem = (items.find((i) => i.kind === 'pass') ?? null) as Extract<WalletItem, { kind: 'pass' }> | null;
  const activeCardName = activeItem?.kind === 'card'
    ? (activeItem.bank ?? `•••• ${activeItem.last4}`)
    : (activeItem?.name ?? 'Card');

  const isRideValid = Boolean(liveRide && (!liveRide.expiresAtMs || liveRide.expiresAtMs > now));
  const isTicketValid = Boolean(activeTicket && activeTicket.expiresAtMs > now);

  useEffect(() => {
    const rideExpired = Boolean(liveRide && liveRide.expiresAtMs && liveRide.expiresAtMs <= now);
    const ticketExpired = Boolean(activeTicket && activeTicket.expiresAtMs <= now);
    if (rideExpired || ticketExpired) {
      clearRide(now);
    }
  }, [liveRide, activeTicket, now, clearRide]);

  const validRide = isRideValid ? liveRide : null;
  const currentTicket = validRide ?? (isTicketValid && activeTicket ? {
    line: activeTicket.currentLine,
    destination: activeTicket.destination ?? 'Toate liniile STPT · Bilet 60 min',
    station: activeTicket.station ?? 'Validat în sistem',
    startedAt: new Date(activeTicket.startedAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: activeTicket.isTransfer ? 0 : 3 * activeTicket.passengers,
    passengers: activeTicket.passengers,
    expiresAtMs: activeTicket.expiresAtMs,
    isTransfer: activeTicket.isTransfer,
    originalLine: activeTicket.originalLine,
    chargeId: activeTicket.chargeId,
    transferStation: activeTicket.transferStation,
    transferAt: activeTicket.transferAt,
  } : null);

  const remainingMin = currentTicket?.expiresAtMs
    ? Math.max(0, Math.ceil((currentTicket.expiresAtMs - now) / 60000))
    : 42;

  if (isLoading) return <Text>{t('common.loading')}</Text>;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTopUp = (amount: number) => {
    topUpBalance(amount);
    showToast(`${t('wallet.topUpSuccess')} (+${amount} Lei)`);
  };

  const handleRenew = async (days: number) => {
    if (!passItem) return;
    await renewPass({ id: passItem.id, days });
    showToast(t('wallet.renewSuccess'));
  };

  const handleSelectCard = (id: string) => {
    setFrontId(id);
    if (id !== defaultSourceId) {
      void setDefault(id);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title={t('wallet.title')} actionLabel={t('wallet.add')} onAction={() => setSheet('pick')} />
      {items.length === 0 ? (
        <Text>{t('wallet.emptyWallet')}</Text>
      ) : (
        <CardStack
          items={items}
          frontId={frontId ?? defaultSourceId}
          defaultSourceId={defaultSourceId}
          onFront={handleSelectCard}
          onSetDefault={handleSelectCard}
        />
      )}

      {/* Călătorie activă (Păstrată pe durata celor 60 min chiar dacă pasagerul a coborât din vehicul) */}
      {currentTicket && remainingMin > 0 ? (
        <ActiveRideCard
          line={currentTicket.line} destination={currentTicket.destination} station={currentTicket.station}
          boardedAt={currentTicket.startedAt} totalMin={60} fareRon={currentTicket.amount}
          expiresInMin={remainingMin}
          passengers={currentTicket.passengers} isTransfer={currentTicket.isTransfer} originalLine={currentTicket.originalLine}
          expiresAtMs={currentTicket.expiresAtMs} transferStation={currentTicket.transferStation} transferAt={currentTicket.transferAt}
          onOpenInspector={() => setInspectorOpen(true)}
        />
      ) : null}

      {/* Gestiune contextuală: Abonament STPT sau Sold & Plafon */}
      <WalletManageCard
        item={activeItem} balanceRon={balanceRon} spentRon={cap?.spentRon ?? 6} limitRon={cap?.limitRon ?? 8}
        onOpenTopUp={() => setTopUpOpen(true)} onQuickTopUp={(amount) => void handleTopUp(amount)} onOpenRenew={() => setRenewOpen(true)}
      />

      <WalletModals
        sheet={sheet} onCloseSheet={() => setSheet('none')} onPickCard={() => setSheet('card')} onPickPass={() => setSheet('pass')}
        onAddCard={addCard} onAddPass={addPass} toastMsg={toastMsg} topUpOpen={topUpOpen} balanceRon={balanceRon}
        activeCardName={activeCardName} onCloseTopUp={() => setTopUpOpen(false)} onTopUp={(amt) => void handleTopUp(amt)}
        renewOpen={renewOpen} passItem={passItem} onCloseRenew={() => setRenewOpen(false)} onRenew={(days) => void handleRenew(days)}
        inspectorOpen={inspectorOpen} onCloseInspector={() => setInspectorOpen(false)}
        activeTicketInfo={currentTicket ? {
          line: currentTicket.line,
          passengers: currentTicket.passengers,
          station: currentTicket.station,
          boardedAt: currentTicket.startedAt,
          token: `STPT-TICKET-${currentTicket.line}-${currentTicket.passengers}P-${currentTicket.chargeId}`,
        } : null}
      />
    </Screen>
  );
}
