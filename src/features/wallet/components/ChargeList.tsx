import { StyleSheet, Text, View } from 'react-native';
import { formatRon } from '../../../core/utils/format';
import type { Charge } from '../../../services/api/schemas/wallet';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { Button } from '../../../ui';

interface ChargeListProps {
  charges: Charge[];
  onDispute: (id: string) => void;
}

export function ChargeList({ charges, onDispute }: ChargeListProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: colors.text }]}>{t('wallet.history')}</Text>
      {charges.map((c) => (
        <View key={c.id} style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.info}>
            <Text style={[styles.line, { color: colors.text }]}>Linia {c.line}</Text>
            <Text style={[styles.amount, { color: colors.textMuted }]}>
              {formatRon(c.amountRon)}
              {c.capped ? ' · capped' : ''}
            </Text>
          </View>
          <Button title={t('wallet.dispute')} variant="ghost" onPress={() => onDispute(c.id)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
  },
  line: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  amount: {
    fontSize: fontSizes.sm,
  },
});
