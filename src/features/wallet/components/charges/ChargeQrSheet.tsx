import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { formatLei } from '../../../../core/utils/format';
import type { Charge, WalletItem } from '../../types';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet, Button } from '../../../../ui';

interface ChargeQrSheetProps {
  charge: Charge | null;
  items: WalletItem[];
  onClose: () => void;
  onDispute: (id: string) => void;
}

function sourceLabel(charge: Charge, items: WalletItem[]): string {
  const item = items.find((i) => i.id === charge.paidWith);
  if (!item) return charge.paidWith;
  if (item.kind === 'card') return `Visa •••• ${item.last4}`;
  return item.name;
}

export function ChargeQrSheet({ charge, items, onClose, onDispute }: ChargeQrSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={charge !== null} onClose={onClose}>
      {charge ? (
        <View style={styles.root}>
          <Text style={[styles.title, { color: colors.text }]}>
            Linia {charge.line} · {formatLei(charge.amount)}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {charge.startedAt.slice(0, 16).replace('T', ' ')} · {sourceLabel(charge, items)}
          </Text>
          <View style={styles.qr}>
            <QRCode value={charge.qrToken} size={220} />
          </View>
          <View style={styles.actions}>
            <Button title={t('wallet.disputeCharge')} variant="ghost" onPress={() => onDispute(charge.id)} />
            <Button title={t('common.close')} onPress={onClose} />
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  meta: {
    fontSize: fontSizes.sm,
  },
  qr: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
